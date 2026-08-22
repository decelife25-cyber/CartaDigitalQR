package com.decelife.cartadigitalqr.data

import com.decelife.cartadigitalqr.BuildConfig
import com.decelife.cartadigitalqr.models.Configuracion
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

/** Admin-only configuration persistence. Mirrors the PWA's update of configuracion_restaurante. */
object ConfiguracionAdminRepository {
    private const val TIMEOUT_MS = 15_000
    private val baseUrl get() = BuildConfig.SUPABASE_URL.trimEnd('/')
    private val apiKey get() = BuildConfig.SUPABASE_ANON_KEY

    suspend fun save(config: Configuracion) = withContext(Dispatchers.IO) {
        require(baseUrl.isNotBlank()) { "Falta la URL de Supabase en la compilación de Android." }
        require(apiKey.isNotBlank()) { "Falta la clave pública de Supabase en la compilación de Android." }

        val payload = JSONObject().apply {
            put("nombre", config.nombre.trim())
            put("telefono", config.telefono?.trim()?.takeIf { it.isNotEmpty() } ?: JSONObject.NULL)
            put("direccion", config.direccion?.trim()?.takeIf { it.isNotEmpty() } ?: JSONObject.NULL)
            put("descripcion", config.descripcion?.trim()?.takeIf { it.isNotEmpty() } ?: JSONObject.NULL)
            put("horario", config.horario?.trim()?.takeIf { it.isNotEmpty() } ?: JSONObject.NULL)
            put("logo_url", config.logo_url?.trim()?.takeIf { it.isNotEmpty() } ?: JSONObject.NULL)
            put("color_principal", config.color_principal?.trim()?.takeIf { it.isNotEmpty() } ?: JSONObject.NULL)
            put("qr_url", config.qr_url?.trim()?.takeIf { it.isNotEmpty() } ?: JSONObject.NULL)
            put("dominio", config.dominio?.trim()?.takeIf { it.isNotEmpty() } ?: JSONObject.NULL)
            put("url_reservas_mesa", config.url_reservas_mesa?.trim()?.takeIf { it.isNotEmpty() } ?: JSONObject.NULL)
            put("portada_url", config.portada_url?.trim()?.takeIf { it.isNotEmpty() } ?: JSONObject.NULL)
            put("updated_at", java.time.Instant.now().toString())
        }

        val connection = (URL("$baseUrl/rest/v1/configuracion_restaurante?id=eq.${config.id}").openConnection() as HttpURLConnection).apply {
            requestMethod = "PATCH"
            connectTimeout = TIMEOUT_MS
            readTimeout = TIMEOUT_MS
            doInput = true
            doOutput = true
            setRequestProperty("apikey", apiKey)
            setRequestProperty("Authorization", "Bearer $apiKey")
            setRequestProperty("Accept", "application/json")
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Prefer", "return=representation")
        }
        try {
            connection.outputStream.use { it.write(payload.toString().toByteArray(Charsets.UTF_8)) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.use { input -> BufferedReader(InputStreamReader(input, Charsets.UTF_8)).use { it.readText() } }.orEmpty()
            if (code !in 200..299) throw IllegalStateException("Supabase HTTP $code: $response")
        } finally {
            connection.disconnect()
        }
    }
}
