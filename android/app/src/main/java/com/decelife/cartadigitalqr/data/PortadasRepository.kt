package com.decelife.cartadigitalqr.data

import com.decelife.cartadigitalqr.BuildConfig
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

data class PortadaAndroid(
    val id: String,
    val configuracionId: String,
    val nombre: String,
    val imageUrl: String,
    val storagePath: String?,
    val activa: Boolean,
    val programadaDesde: String?,
    val programadaHasta: String?,
)

object PortadasRepository {
    private const val TIMEOUT_MS = 15_000
    private const val BUCKET = "productos"
    private val baseUrl get() = BuildConfig.SUPABASE_URL.trimEnd('/')
    private val apiKey get() = BuildConfig.SUPABASE_ANON_KEY
    private val authHeader get() = SupabaseAuth.bearerToken()?.let { "Bearer $it" } ?: "Bearer $apiKey"

    private suspend fun rest(method: String, path: String, body: String? = null): String = withContext(Dispatchers.IO) {
        val connection = (URL("$baseUrl/rest/v1/$path").openConnection() as HttpURLConnection).apply {
            requestMethod = method; connectTimeout = TIMEOUT_MS; readTimeout = TIMEOUT_MS; doInput = true
            setRequestProperty("apikey", apiKey); setRequestProperty("Authorization", authHeader); setRequestProperty("Accept", "application/json")
            if (body != null) { doOutput = true; setRequestProperty("Content-Type", "application/json"); setRequestProperty("Prefer", "return=representation") }
        }
        try {
            if (body != null) connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.use { BufferedReader(InputStreamReader(it, Charsets.UTF_8)).use { reader -> reader.readText() } }.orEmpty()
            if (code !in 200..299) error("Supabase HTTP $code: $response")
            response
        } finally { connection.disconnect() }
    }

    private suspend fun storage(method: String, path: String, bytes: ByteArray? = null, contentType: String? = null) = withContext(Dispatchers.IO) {
        val connection = (URL("$baseUrl/storage/v1/object/$BUCKET/$path").openConnection() as HttpURLConnection).apply {
            requestMethod = method; connectTimeout = TIMEOUT_MS; readTimeout = TIMEOUT_MS; doInput = true
            setRequestProperty("apikey", apiKey); setRequestProperty("Authorization", authHeader); setRequestProperty("x-upsert", "false")
            if (contentType != null) setRequestProperty("Content-Type", contentType)
            if (bytes != null) doOutput = true
        }
        try {
            if (bytes != null) connection.outputStream.use { it.write(bytes) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.use { BufferedReader(InputStreamReader(it, Charsets.UTF_8)).use { reader -> reader.readText() } }.orEmpty()
            if (code !in 200..299) error("Supabase Storage HTTP $code: $response")
            response
        } finally { connection.disconnect() }
    }

    suspend fun getPortadas(configuracionId: String): List<PortadaAndroid> {
        val json = JSONArray(rest("GET", "portadas_carta?select=*&configuracion_id=eq.$configuracionId&order=created_at.asc"))
        return buildList(json.length()) {
            for (i in 0 until json.length()) {
                val item = json.getJSONObject(i)
                add(PortadaAndroid(item.getString("id"), item.getString("configuracion_id"), item.optString("nombre"), item.optString("image_url"), item.optString("storage_path").takeIf { it.isNotBlank() && it != "null" }, item.optBoolean("activa"), item.optString("programada_desde").takeIf { it.isNotBlank() && it != "null" }, item.optString("programada_hasta").takeIf { it.isNotBlank() && it != "null" }))
            }
        }
    }

    suspend fun addPortada(configuracionId: String, nombre: String, bytes: ByteArray, contentType: String, extension: String, activa: Boolean): PortadaAndroid {
        val path = "portadas/${UUID.randomUUID()}.$extension"
        storage("POST", path, bytes, contentType)
        val imageUrl = "$baseUrl/storage/v1/object/public/$BUCKET/$path"
        return try {
            val payload = JSONObject().apply { put("configuracion_id", configuracionId); put("nombre", nombre); put("image_url", imageUrl); put("storage_path", path); put("activa", activa) }
            val created = JSONArray(rest("POST", "portadas_carta", payload.toString())).getJSONObject(0)
            if (activa) rest("PATCH", "configuracion_restaurante?id=eq.$configuracionId", JSONObject().put("portada_url", imageUrl).toString())
            PortadaAndroid(created.getString("id"), configuracionId, created.optString("nombre"), created.optString("image_url"), created.optString("storage_path"), created.optBoolean("activa"), null, null)
        } catch (e: Exception) {
            runCatching { storage("DELETE", path) }
            throw e
        }
    }

    suspend fun activatePortada(configuracionId: String, portada: PortadaAndroid) {
        val timestamp = java.time.Instant.now().toString()
        rest("PATCH", "portadas_carta?configuracion_id=eq.$configuracionId", JSONObject().apply { put("activa", false); put("updated_at", timestamp) }.toString())
        rest("PATCH", "portadas_carta?id=eq.${portada.id}", JSONObject().apply { put("activa", true); put("updated_at", timestamp) }.toString())
        rest("PATCH", "configuracion_restaurante?id=eq.$configuracionId", JSONObject().apply { put("portada_url", portada.imageUrl); put("updated_at", timestamp) }.toString())
    }

    suspend fun updatePortada(id: String, nombre: String, desde: String?, hasta: String?) {
        val payload = JSONObject().apply { put("nombre", nombre); put("programada_desde", desde ?: JSONObject.NULL); put("programada_hasta", hasta ?: JSONObject.NULL); put("updated_at", java.time.Instant.now().toString()) }
        rest("PATCH", "portadas_carta?id=eq.$id", payload.toString())
    }

    suspend fun deletePortada(portada: PortadaAndroid) {
        rest("DELETE", "portadas_carta?id=eq.${portada.id}")
        portada.storagePath?.let { runCatching { storage("DELETE", it) } }
    }
}
