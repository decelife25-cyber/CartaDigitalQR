package com.decelife.cartadigitalqr.data

import com.decelife.cartadigitalqr.BuildConfig
import com.decelife.cartadigitalqr.models.Configuracion
import com.decelife.cartadigitalqr.models.Familia
import com.decelife.cartadigitalqr.models.Producto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

/**
 * Public read-only client for the same Supabase project used by the PWA.
 * It intentionally uses only the publishable/anon key; no service-role secret
 * is ever bundled into the APK.
 */
object SupabaseRepository {
    private const val TIMEOUT_MS = 15_000

    private val baseUrl: String
        get() = BuildConfig.SUPABASE_URL.trimEnd('/')

    private val apiKey: String
        get() = BuildConfig.SUPABASE_ANON_KEY

    private suspend fun get(pathAndQuery: String): String = withContext(Dispatchers.IO) {
        require(baseUrl.isNotBlank()) { "Falta la URL de Supabase en la compilación de Android." }
        require(apiKey.isNotBlank()) { "Falta la clave pública de Supabase en la compilación de Android." }

        val connection = (URL("$baseUrl/rest/v1/$pathAndQuery").openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = TIMEOUT_MS
            readTimeout = TIMEOUT_MS
            setRequestProperty("apikey", apiKey)
            setRequestProperty("Authorization", "Bearer $apiKey")
            setRequestProperty("Accept", "application/json")
        }

        try {
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val body = stream?.use { input ->
                BufferedReader(InputStreamReader(input, Charsets.UTF_8)).use { it.readText() }
            }.orEmpty()
            if (code !in 200..299) {
                throw IllegalStateException("Supabase HTTP $code: $body")
            }
            body
        } finally {
            connection.disconnect()
        }
    }

    suspend fun getFamilias(): List<Familia> {
        val json = JSONArray(get("familias?select=*&activo=eq.true&order=orden.asc"))
        return buildList(json.length()) {
            for (i in 0 until json.length()) {
                val item = json.getJSONObject(i)
                add(
                    Familia(
                        id = item.getString("id"),
                        nombre = item.optString("nombre"),
                        orden = item.optInt("orden", 0),
                        activo = item.optBoolean("activo", true),
                        foto_url = item.optString("foto_url").takeIf { it.isNotBlank() && it != "null" }
                    )
                )
            }
        }
    }

    suspend fun getProductos(): List<Producto> {
        val json = JSONArray(get("productos?select=*&activo=eq.true&order=orden.asc"))
        return buildList(json.length()) {
            for (i in 0 until json.length()) {
                val item = json.getJSONObject(i)
                add(
                    Producto(
                        id = item.getString("id"),
                        familia_id = item.optString("familia_id"),
                        nombre = item.optString("nombre"),
                        descripcion = item.optString("descripcion").takeIf { it.isNotBlank() && it != "null" },
                        precio = item.optDouble("precio", 0.0),
                        orden = item.optInt("orden", 0),
                        activo = item.optBoolean("activo", true),
                        agotado = item.optBoolean("agotado", false),
                        destacado = item.optBoolean("destacado", false),
                        sugerido = item.optBoolean("sugerido", false),
                        foto_url = item.optString("foto_url").takeIf { it.isNotBlank() && it != "null" }
                    )
                )
            }
        }
    }

    suspend fun getConfiguracion(): Configuracion? {
        val json = JSONArray(get("configuracion_restaurante?select=*&activo=eq.true&limit=1"))
        if (json.length() == 0) return null
        val item = json.getJSONObject(0)
        return Configuracion(
            id = item.getString("id"),
            nombre = item.optString("nombre"),
            telefono = item.optString("telefono").takeIf { it.isNotBlank() && it != "null" },
            direccion = item.optString("direccion").takeIf { it.isNotBlank() && it != "null" },
            descripcion = item.optString("descripcion").takeIf { it.isNotBlank() && it != "null" },
            horario = item.optString("horario").takeIf { it.isNotBlank() && it != "null" },
            logo_url = item.optString("logo_url").takeIf { it.isNotBlank() && it != "null" },
            color_principal = item.optString("color_principal").takeIf { it.isNotBlank() && it != "null" },
            qr_url = item.optString("qr_url").takeIf { it.isNotBlank() && it != "null" },
            dominio = item.optString("dominio").takeIf { it.isNotBlank() && it != "null" },
            url_reservas_mesa = item.optString("url_reservas_mesa").takeIf { it.isNotBlank() && it != "null" },
            portada_url = item.optString("portada_url").takeIf { it.isNotBlank() && it != "null" }
        )
    }

    suspend fun getCatalogo(): Pair<List<Familia>, List<Producto>> {
        val familias = getFamilias()
        val productos = getProductos()
        return familias to productos
    }
}
