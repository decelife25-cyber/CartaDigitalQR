package com.decelife.cartadigitalqr.data

import com.decelife.cartadigitalqr.BuildConfig
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.time.Instant

data class PortadaAndroid(
    val id: String,
    val nombre: String,
    val imageUrl: String,
    val storagePath: String?,
    val activa: Boolean,
    val desde: String?,
    val hasta: String?,
)

object PortadasRepository {
    private const val TIMEOUT_MS = 15_000
    private val baseUrl get() = BuildConfig.SUPABASE_URL.trimEnd('/')
    private val apiKey get() = BuildConfig.SUPABASE_ANON_KEY
    private val authHeader get() = SupabaseAuth.bearerToken()?.let { "Bearer $it" } ?: "Bearer $apiKey"

    private fun request(method: String, path: String, body: String? = null): String {
        val connection = (URL("$baseUrl/rest/v1/$path").openConnection() as HttpURLConnection).apply {
            requestMethod = method; connectTimeout = TIMEOUT_MS; readTimeout = TIMEOUT_MS; doInput = true
            setRequestProperty("apikey", apiKey); setRequestProperty("Authorization", authHeader); setRequestProperty("Accept", "application/json")
            if (body != null) { doOutput = true; setRequestProperty("Content-Type", "application/json"); setRequestProperty("Prefer", "return=representation") }
        }
        try {
            if (body != null) connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.use { input -> BufferedReader(InputStreamReader(input, Charsets.UTF_8)).use { it.readText() } }.orEmpty()
            if (code !in 200..299) throw IllegalStateException("Supabase HTTP $code: $response")
            return response
        } finally { connection.disconnect() }
    }

    private fun storageRequest(method: String, path: String, bytes: ByteArray? = null, contentType: String? = null): String {
        val connection = (URL("$baseUrl/storage/v1/object/$path").openConnection() as HttpURLConnection).apply {
            requestMethod = method; connectTimeout = TIMEOUT_MS; readTimeout = TIMEOUT_MS; doInput = true
            setRequestProperty("apikey", apiKey); setRequestProperty("Authorization", authHeader)
            if (contentType != null) setRequestProperty("Content-Type", contentType)
            setRequestProperty("x-upsert", "false")
            if (bytes != null) doOutput = true
        }
        try {
            if (bytes != null) connection.outputStream.use { it.write(bytes) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.use { input -> BufferedReader(InputStreamReader(input, Charsets.UTF_8)).use { it.readText() } }.orEmpty()
            if (code !in 200..299) throw IllegalStateException("Supabase Storage HTTP $code: $response")
            return response
        } finally { connection.disconnect() }
    }

    private fun effectiveId(items: List<PortadaAndroid>, now: Instant = Instant.now()): String? {
        val scheduled = items.filter { item ->
            val from = item.desde?.let { runCatching { Instant.parse(it) }.getOrNull() }
            val until = item.hasta?.let { runCatching { Instant.parse(it) }.getOrNull() }
            (from != null || until != null) && (from == null || !now.isBefore(from)) && (until == null || !now.isAfter(until))
        }.maxByOrNull { item -> item.desde?.let { runCatching { Instant.parse(it) }.getOrNull() } ?: Instant.MIN }
        return scheduled?.id ?: items.firstOrNull { it.activa }?.id
    }

    fun list(configId: String): List<PortadaAndroid> {
        val json = JSONArray(request("GET", "portadas_carta?select=id,nombre,image_url,storage_path,activa,programada_desde,programada_hasta&configuracion_id=eq.$configId&order=created_at.asc"))
        val items = buildList(json.length()) {
            for (i in 0 until json.length()) {
                val item = json.getJSONObject(i)
                add(PortadaAndroid(item.getString("id"), item.optString("nombre"), item.optString("image_url"), item.optString("storage_path").takeIf { it.isNotBlank() && it != "null" }, item.optBoolean("activa", false), item.optString("programada_desde").takeIf { it.isNotBlank() && it != "null" }, item.optString("programada_hasta").takeIf { it.isNotBlank() && it != "null" }))
            }
        }
        val activeId = effectiveId(items)
        return items.map { it.copy(activa = it.id == activeId) }
    }

    fun upload(bytes: ByteArray, mime: String, extension: String): Pair<String, String> {
        val safe = extension.lowercase().replace(Regex("[^a-z0-9]"), "").ifBlank { "jpg" }
        val path = "portadas/${System.currentTimeMillis()}-${(100000..999999).random()}.$safe"
        storageRequest("POST", "productos/$path", bytes, mime)
        return "$baseUrl/storage/v1/object/public/productos/$path" to path
    }

    fun insert(configId: String, name: String, imageUrl: String, storagePath: String, active: Boolean) {
        val body = JSONObject().apply { put("configuracion_id", configId); put("nombre", name); put("image_url", imageUrl); put("storage_path", storagePath); put("activa", active) }
        request("POST", "portadas_carta", body.toString())
    }

    fun activate(configId: String, id: String, imageUrl: String) {
        request("PATCH", "portadas_carta?configuracion_id=eq.$configId", JSONObject().apply { put("activa", false) }.toString())
        request("PATCH", "portadas_carta?id=eq.$id", JSONObject().apply { put("activa", true) }.toString())
        request("PATCH", "configuracion_restaurante?id=eq.$configId", JSONObject().apply { put("portada_url", imageUrl) }.toString())
    }

    fun update(id: String, name: String, desde: String?, hasta: String?) {
        val body = JSONObject().apply { put("nombre", name); put("programada_desde", desde ?: JSONObject.NULL); put("programada_hasta", hasta ?: JSONObject.NULL) }
        request("PATCH", "portadas_carta?id=eq.$id", body.toString())
    }

    fun delete(item: PortadaAndroid) {
        request("DELETE", "portadas_carta?id=eq.${item.id}")
        item.storagePath?.let { runCatching { storageRequest("DELETE", "productos/$it") } }
    }
}
