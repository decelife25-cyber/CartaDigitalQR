package com.decelife.cartadigitalqr.data

import com.decelife.cartadigitalqr.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

object SupabaseStorage {
    private const val TIMEOUT_MS = 30_000

    suspend fun uploadProductoFoto(bytes: ByteArray, contentType: String, extension: String): String = withContext(Dispatchers.IO) {
        require(bytes.isNotEmpty()) { "La imagen seleccionada está vacía." }
        require(BuildConfig.SUPABASE_URL.isNotBlank()) { "Falta la URL de Supabase en la compilación de Android." }
        require(BuildConfig.SUPABASE_ANON_KEY.isNotBlank()) { "Falta la clave pública de Supabase en la compilación de Android." }
        SupabaseAuth.ensureValidSession()

        val safeExtension = extension.lowercase().replace(Regex("[^a-z0-9]"), "").ifBlank { "jpg" }
        val path = "productos/${System.currentTimeMillis()}-${(100000..999999).random()}.$safeExtension"
        val baseUrl = BuildConfig.SUPABASE_URL.trimEnd('/')
        val token = SupabaseAuth.bearerToken() ?: BuildConfig.SUPABASE_ANON_KEY
        val connection = (URL("$baseUrl/storage/v1/object/$path").openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = TIMEOUT_MS
            readTimeout = TIMEOUT_MS
            doInput = true
            doOutput = true
            setRequestProperty("apikey", BuildConfig.SUPABASE_ANON_KEY)
            setRequestProperty("Authorization", "Bearer $token")
            setRequestProperty("Content-Type", contentType.ifBlank { "image/jpeg" })
            setRequestProperty("x-upsert", "false")
        }
        try {
            connection.outputStream.use { it.write(bytes) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.use { input -> BufferedReader(InputStreamReader(input, Charsets.UTF_8)).use { it.readText() } }.orEmpty()
            if (code !in 200..299) throw IllegalStateException("Supabase Storage HTTP $code: $response")
            "$baseUrl/storage/v1/object/public/$path"
        } finally {
            connection.disconnect()
        }
    }
}
