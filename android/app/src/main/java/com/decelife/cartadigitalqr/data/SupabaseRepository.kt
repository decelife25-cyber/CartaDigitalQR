package com.decelife.cartadigitalqr.data

import com.decelife.cartadigitalqr.BuildConfig
import com.decelife.cartadigitalqr.models.Alergeno
import com.decelife.cartadigitalqr.models.Configuracion
import com.decelife.cartadigitalqr.models.Familia
import com.decelife.cartadigitalqr.models.Producto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

object SupabaseRepository {
    private const val TIMEOUT_MS = 15_000
    private val baseUrl get() = BuildConfig.SUPABASE_URL.trimEnd('/')
    private val apiKey get() = BuildConfig.SUPABASE_ANON_KEY

    private suspend fun request(method: String, pathAndQuery: String, body: String? = null): String = withContext(Dispatchers.IO) {
        require(baseUrl.isNotBlank()) { "Falta la URL de Supabase en la compilación de Android." }
        require(apiKey.isNotBlank()) { "Falta la clave pública de Supabase en la compilación de Android." }
        val connection = (URL("$baseUrl/rest/v1/$pathAndQuery").openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = TIMEOUT_MS
            readTimeout = TIMEOUT_MS
            doInput = true
            setRequestProperty("apikey", apiKey)
            setRequestProperty("Authorization", "Bearer $apiKey")
            setRequestProperty("Accept", "application/json")
            if (body != null) {
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Prefer", "return=representation")
            }
        }
        try {
            if (body != null) connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.use { input -> BufferedReader(InputStreamReader(input, Charsets.UTF_8)).use { it.readText() } }.orEmpty()
            if (code !in 200..299) throw IllegalStateException("Supabase HTTP $code: $response")
            response
        } finally { connection.disconnect() }
    }

    private suspend fun get(pathAndQuery: String) = request("GET", pathAndQuery)

    suspend fun getFamilias(): List<Familia> {
        val json = JSONArray(get("familias?select=*&activo=eq.true&order=orden.asc"))
        return buildList(json.length()) {
            for (i in 0 until json.length()) {
                val item = json.getJSONObject(i)
                add(Familia(item.getString("id"), item.optString("nombre"), item.optInt("orden", 0), item.optBoolean("activo", true), item.optString("foto_url").takeIf { it.isNotBlank() && it != "null" }))
            }
        }
    }

    suspend fun getAlergenos(): List<Alergeno> {
        val json = JSONArray(get("alergenos?select=id,nombre,orden&order=orden.asc"))
        return buildList(json.length()) {
            for (i in 0 until json.length()) {
                val item = json.getJSONObject(i)
                add(Alergeno(item.getString("id"), item.optString("nombre"), item.optInt("orden", 0)))
            }
        }
    }

    suspend fun getProductos(): List<Producto> {
        val json = JSONArray(get("productos?select=*&activo=eq.true&order=orden.asc"))
        return buildList(json.length()) {
            for (i in 0 until json.length()) {
                val item = json.getJSONObject(i)
                add(Producto(item.getString("id"), item.optString("familia_id"), item.optString("nombre"), item.optString("descripcion").takeIf { it.isNotBlank() && it != "null" }, item.optDouble("precio", 0.0), item.optInt("orden", 0), item.optBoolean("activo", true), item.optBoolean("agotado", false), item.optBoolean("destacado", false), item.optBoolean("sugerido", false), item.optString("foto_url").takeIf { it.isNotBlank() && it != "null" }))
            }
        }
    }

    suspend fun getProductoAlergenos(productId: String): List<String> {
        val json = JSONArray(get("producto_alergeno?select=alergeno_id&producto_id=eq.$productId"))
        return buildList(json.length()) {
            for (i in 0 until json.length()) add(json.getJSONObject(i).optString("alergeno_id"))
        }
    }

    suspend fun replaceProductoAlergenos(productId: String, alergenoIds: List<String>) {
        request("DELETE", "producto_alergeno?producto_id=eq.$productId")
        if (alergenoIds.isEmpty()) return
        val body = JSONArray(alergenoIds.map { JSONObject().apply { put("producto_id", productId); put("alergeno_id", it) } }).toString()
        request("POST", "producto_alergeno", body)
    }

    suspend fun saveProducto(id: String?, nombre: String, descripcion: String?, precio: Double, familiaId: String, fotoUrl: String?, activo: Boolean, agotado: Boolean, destacado: Boolean, sugerido: Boolean, alergenoIds: List<String>) {
        val payload = JSONObject().apply {
            put("nombre", nombre)
            put("descripcion", descripcion ?: JSONObject.NULL)
            put("precio", precio)
            put("familia_id", familiaId)
            put("foto_url", fotoUrl?.takeIf { it.isNotBlank() } ?: JSONObject.NULL)
            put("activo", activo)
            put("agotado", agotado)
            put("destacado", destacado)
            put("sugerido", sugerido)
        }
        if (id == null) {
            val response = request("POST", "productos", payload.toString())
            val created = JSONArray(response).optJSONObject(0) ?: throw IllegalStateException("No se pudo crear el producto.")
            replaceProductoAlergenos(created.getString("id"), alergenoIds)
        } else {
            request("PATCH", "productos?id=eq.$id", payload.toString())
            replaceProductoAlergenos(id, alergenoIds)
        }
    }

    suspend fun getConfiguracion(): Configuracion? {
        val json = JSONArray(get("configuracion_restaurante?select=*&activo=eq.true&limit=1"))
        if (json.length() == 0) return null
        val item = json.getJSONObject(0)
        return Configuracion(item.getString("id"), item.optString("nombre"), item.optString("telefono").takeIf { it.isNotBlank() && it != "null" }, item.optString("direccion").takeIf { it.isNotBlank() && it != "null" }, item.optString("descripcion").takeIf { it.isNotBlank() && it != "null" }, item.optString("horario").takeIf { it.isNotBlank() && it != "null" }, item.optString("logo_url").takeIf { it.isNotBlank() && it != "null" }, item.optString("color_principal").takeIf { it.isNotBlank() && it != "null" }, item.optString("qr_url").takeIf { it.isNotBlank() && it != "null" }, item.optString("dominio").takeIf { it.isNotBlank() && it != "null" }, item.optString("url_reservas_mesa").takeIf { it.isNotBlank() && it != "null" }, item.optString("portada_url").takeIf { it.isNotBlank() && it != "null" })
    }

    suspend fun getCatalogo(): Pair<List<Familia>, List<Producto>> = getFamilias() to getProductos()
}
