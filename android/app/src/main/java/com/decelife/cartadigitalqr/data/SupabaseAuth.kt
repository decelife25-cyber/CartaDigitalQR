package com.decelife.cartadigitalqr.data

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.decelife.cartadigitalqr.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

object SupabaseAuth {
    private const val PREFS = "supabase_session"
    private const val ACCESS = "access_token"
    private const val REFRESH = "refresh_token"
    private const val EXPIRES_AT = "expires_at"

    private var prefs: android.content.SharedPreferences? = null
    @Volatile private var accessToken: String? = null
    @Volatile private var refreshToken: String? = null
    @Volatile private var expiresAt: Long = 0L

    private fun initPrefs(context: Context): android.content.SharedPreferences? {
        if (prefs != null) return prefs
        return runCatching {
            val masterKey = MasterKey.Builder(context.applicationContext)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()
            EncryptedSharedPreferences.create(
                context.applicationContext,
                PREFS,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
            ).also { prefs = it }
        }.getOrElse {
            prefs = null
            null
        }
    }

    suspend fun restoreSession(context: Context): Boolean {
        return try {
            val storage = initPrefs(context) ?: return false
            accessToken = storage.getString(ACCESS, null)
            refreshToken = storage.getString(REFRESH, null)
            expiresAt = storage.getLong(EXPIRES_AT, 0L)
            if (accessToken != null && expiresAt > System.currentTimeMillis() + 30_000) return true
            refresh()
        } catch (_: Exception) {
            clearSession()
            false
        }
    }

    fun bearerToken(): String? = accessToken

    suspend fun ensureValidSession(): Boolean {
        if (accessToken == null) return false
        if (expiresAt > System.currentTimeMillis() + 30_000) return true
        return runCatching { refresh() }.getOrDefault(false)
    }

    suspend fun signIn(email: String, password: String): String? = withContext(Dispatchers.IO) {
        val baseUrl = BuildConfig.SUPABASE_URL.trimEnd('/')
        val apiKey = BuildConfig.SUPABASE_ANON_KEY
        val connection = (URL("$baseUrl/auth/v1/token?grant_type=password").openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 15_000
            readTimeout = 15_000
            doInput = true
            doOutput = true
            setRequestProperty("apikey", apiKey)
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Accept", "application/json")
        }
        try {
            val body = JSONObject().apply { put("email", email.trim()); put("password", password) }.toString()
            connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.use { BufferedReader(InputStreamReader(it, Charsets.UTF_8)).use { reader -> reader.readText() } }.orEmpty()
            if (code !in 200..299) throw IllegalStateException(parseAuthError(response))
            saveSession(JSONObject(response))
            null
        } finally { connection.disconnect() }
    }

    suspend fun refresh(): Boolean = withContext(Dispatchers.IO) {
        val token = refreshToken ?: return@withContext false
        val baseUrl = BuildConfig.SUPABASE_URL.trimEnd('/')
        val apiKey = BuildConfig.SUPABASE_ANON_KEY
        val connection = (URL("$baseUrl/auth/v1/token?grant_type=refresh_token").openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 15_000
            readTimeout = 15_000
            doInput = true
            doOutput = true
            setRequestProperty("apikey", apiKey)
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Accept", "application/json")
        }
        try {
            val body = JSONObject().apply { put("refresh_token", token) }.toString()
            connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.use { BufferedReader(InputStreamReader(it, Charsets.UTF_8)).use { reader -> reader.readText() } }.orEmpty()
            if (code !in 200..299) { clearSession(); return@withContext false }
            saveSession(JSONObject(response))
            true
        } finally { connection.disconnect() }
    }

    fun signOut() {
        clearSession()
    }

    private fun saveSession(json: JSONObject) {
        accessToken = json.optString("access_token").takeIf { it.isNotBlank() }
        refreshToken = json.optString("refresh_token").takeIf { it.isNotBlank() } ?: refreshToken
        val expiresIn = json.optLong("expires_in", 3600L)
        expiresAt = System.currentTimeMillis() + expiresIn * 1000L
        prefs?.edit()?.putString(ACCESS, accessToken)?.putString(REFRESH, refreshToken)?.putLong(EXPIRES_AT, expiresAt)?.apply()
    }

    private fun clearSession() {
        accessToken = null
        refreshToken = null
        expiresAt = 0L
        prefs?.edit()?.clear()?.apply()
    }

    private fun parseAuthError(raw: String): String {
        return runCatching {
            val json = JSONObject(raw)
            json.optString("msg").ifBlank { json.optString("error_description") }.ifBlank { json.optString("message") }
        }.getOrNull()?.takeIf { it.isNotBlank() } ?: "No se ha podido iniciar sesión."
    }
}
