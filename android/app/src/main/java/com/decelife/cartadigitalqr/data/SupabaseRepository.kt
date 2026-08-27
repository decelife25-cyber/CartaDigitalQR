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
    private val authHeader get() = SupabaseAuth.bearerToken()?.let { "Bearer $it" } ?: "Bearer $apiKey"

    private suspend fun request(method: String, pathAndQuery: String, body: String? = null): String = withContext(Dispatchers.IO) {
        require(baseUrl.isNotBlank()) { "Falta la URL de Supabase en la compilación de Android." }
        require(apiKey.isNotBlank()) { "Falta la clave pública de Supabase en la compilación de Android." }
        SupabaseAuth.ensureValidSession()
        val connection = (URL("$baseUrl/rest/v1/$pathAndQuery").openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = TIMEOUT_MS
            readTimeout = TIMEOUT_MS
            doInput = true
            setRequestProperty("apikey", apiKey)
            setRequestProperty("Authorization", authHeader)
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

    private suspend fun storageRequest(method: String, path: String, bytes: ByteArray? = null, contentType: String? = null): String = withContext(Dispatchers.IO) {
        require(baseUrl.isNotBlank()) { "Falta la URL de Supabase en la compilación de Android." }
        require(apiKey.isNotBlank()) { "Falta la clave pública de Supabase en la compilación de Android." }
        SupabaseAuth.ensureValidSession()
        val connection = (URL("$baseUrl/storage/v1/object/$path").openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = TIMEOUT_MS
            readTimeout = TIMEOUT_MS
            doInput = true
            setRequestProperty("apikey", apiKey)
            setRequestProperty("Authorization", authHeader)
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
            response
        } finally { connection.disconnect() }
    }

    private suspend fun get(pathAndQuery: String) = request("GET", pathAndQuery)

    suspend fun getFamilias(): List<Familia> {
        val json = JSONArray(get("familias?select=*&activo=eq.true&order=orden.asc"))
        return parseFamilias(json)
    }

    suspend fun getFamiliasAdmin(): List<Familia> {
        val json = JSONArray(get("familias?select=*&order=orden.asc"))
        return parseFamilias(json)
    }

    private fun parseFamilias(json: JSONArray): List<Familia> = buildList(json.length()) {
        for (i in 0 until json.length()) {
            val item = json.getJSONObject(i)
            add(Familia(item.getString("id"), item.optString("nombre"), item.optInt("orden", 0), item.optBoolean("activo", true), item.optString("foto_url").takeIf { it.isNotBlank() && it != "null" }, item.optString("descripcion").takeIf { it.isNotBlank() && it != "null" }, item.optString("configuracion_restaurante_id").takeIf { it.isNotBlank() && it != "null" }))
        }
    }

    suspend fun getAlergenos(): List<Alergeno> {
        val json = JSONArray(get("alergenos?select=id,nombre,orden&order=orden.asc"))
        return buildList(json.length()) { for (i in 0 until json.length()) { val item = json.getJSONObject(i); add(Alergeno(item.getString("id"), item.optString("nombre"), item.optInt("orden", 0))) } }
    }

    suspend fun getProductos(): List<Producto> {
        val json = JSONArray(get("productos?select=*&activo=eq.true&order=orden.asc"))
        return buildList(json.length()) { for (i in 0 until json.length()) { val item = json.getJSONObject(i); add(Producto(item.getString("id"), item.optString("familia_id"), item.optString("nombre"), item.optString("descripcion").takeIf { it.isNotBlank() && it != "null" }, item.optDouble("precio", 0.0), item.optInt("orden", 0), item.optBoolean("activo", true), item.optBoolean("agotado", false), item.optBoolean("destacado", false), item.optBoolean("sugerido", false), item.optString("foto_url").takeIf { it.isNotBlank() && it != "null" })) } }
    }

    suspend fun getProductoAlergenos(productId: String): List<String> {
        val json = JSONArray(get("producto_alergeno?select=alergeno_id&producto_id=eq.$productId"))
        return buildList(json.length()) { for (i in 0 until json.length()) add(json.getJSONObject(i).optString("alergeno_id")) }
    }

    suspend fun replaceProductoAlergenos(productId: String, alergenoIds: List<String>) {
        request("DELETE", "producto_alergeno?producto_id=eq.$productId")
        if (alergenoIds.isEmpty()) return
        val body = JSONArray(alergenoIds.map { JSONObject().apply { put("producto_id", productId); put("alergeno_id", it) } }).toString()
        request("POST", "producto_alergeno", body)
    }

    suspend fun saveProducto(id: String?, nombre: String, descripcion: String?, precio: Double, familiaId: String, fotoUrl: String?, activo: Boolean, agotado: Boolean, destacado: Boolean, sugerido: Boolean, alergenoIds: List<String>) {
        val payload = JSONObject().apply { put("nombre", nombre); put("descripcion", descripcion ?: JSONObject.NULL); put("precio", precio); put("familia_id", familiaId); put("foto_url", fotoUrl?.takeIf { it.isNotBlank() } ?: JSONObject.NULL); put("activo", activo); put("agotado", agotado); put("destacado", destacado); put("sugerido", sugerido) }
        if (id == null) { val response = request("POST", "productos", payload.toString()); val created = JSONArray(response).optJSONObject(0) ?: throw IllegalStateException("No se pudo crear el producto."); replaceProductoAlergenos(created.getString("id"), alergenoIds) } else { request("PATCH", "productos?id=eq.$id", payload.toString()); replaceProductoAlergenos(id, alergenoIds) }
    }

    suspend fun updateProductoFields(id: String, fields: Map<String, Any?>) {
        val payload = JSONObject().apply { fields.forEach { (key, value) -> put(key, value ?: JSONObject.NULL) } }
        request("PATCH", "productos?id=eq.$id", payload.toString())
    }

    suspend fun deleteProducto(id: String): String? {
        val existing = JSONArray(get("productos?select=id,foto_url&id=eq.$id")).optJSONObject(0)
            ?: throw IllegalStateException("El producto ya no existe.")
        val fotoUrl = existing.optString("foto_url").takeIf { it.isNotBlank() && it != "null" }

        // Igual que el panel web: eliminar primero las relaciones para no depender de ON DELETE CASCADE.
        request("DELETE", "producto_alergeno?producto_id=eq.$id")
        request("DELETE", "productos?id=eq.$id")

        // DELETE sin body no devuelve representación en esta capa HTTP, por lo que verificamos explícitamente que la fila haya desaparecido.
        val remaining = JSONArray(get("productos?select=id&id=eq.$id"))
        if (remaining.length() != 0) {
            throw IllegalStateException("No se ha podido eliminar el producto. Comprueba los permisos de la sesión.")
        }

        if (fotoUrl != null) {
            runCatching { deleteProductoFoto(fotoUrl) }
                .onFailure { /* La fila ya está eliminada; la imagen no bloquea el borrado. */ }
        }
        return fotoUrl
    }

    suspend fun deleteProductoFoto(fotoUrl: String) {
        if (fotoUrl.isBlank()) return
        val marker = "/storage/v1/object/public/productos/"
        val index = fotoUrl.indexOf(marker)
        if (index == -1) return
        val path = fotoUrl.substring(index + marker.length)
        if (path.isBlank()) return
        storageRequest("DELETE", "productos/$path")
    }

    suspend fun saveFamilia(id: String?, nombre: String, descripcion: String?, fotoUrl: String?, activo: Boolean) {
        val payload = JSONObject().apply { put("nombre", nombre); put("descripcion", descripcion ?: JSONObject.NULL); put("foto_url", fotoUrl?.takeIf { it.isNotBlank() } ?: JSONObject.NULL); put("activo", activo) }
        if (id == null) { val configJson = JSONArray(get("familias?select=configuracion_restaurante_id&configuracion_restaurante_id=not.is.null&limit=1")); val configId = configJson.optJSONObject(0)?.optString("configuracion_restaurante_id").orEmpty(); if (configId.isBlank()) throw IllegalStateException("No se pudo determinar el restaurante de la familia."); payload.put("configuracion_restaurante_id", configId); payload.put("orden", 0); request("POST", "familias", payload.toString()) } else request("PATCH", "familias?id=eq.$id", payload.toString())
    }

    suspend fun updateFamiliaFields(id: String, fields: Map<String, Any?>) {
        val payload = JSONObject().apply { fields.forEach { (key, value) -> put(key, value ?: JSONObject.NULL) } }
        request("PATCH", "familias?id=eq.$id", payload.toString())
    }

    suspend fun deleteFamilia(id: String) { request("DELETE", "familias?id=eq.$id") }

    suspend fun uploadFamiliaFoto(bytes: ByteArray, contentType: String, extension: String): String {
        val safeExtension = extension.lowercase().replace(Regex("[^a-z0-9]"), "").ifBlank { "jpg" }
        val path = "productos/familias/${System.currentTimeMillis()}-${(100000..999999).random()}.$safeExtension"
        storageRequest("POST", path, bytes, contentType)
        return "$baseUrl/storage/v1/object/public/$path"
    }

    suspend fun deleteFamiliaFoto(fotoUrl: String) {
        if (fotoUrl.isBlank()) return
        val marker = "/storage/v1/object/public/productos/"
        val index = fotoUrl.indexOf(marker)
        if (index == -1) return
        val path = fotoUrl.substring(index + marker.length)
        if (!path.startsWith("familias/")) return
        storageRequest("DELETE", "productos/$path")
    }

    suspend fun saveConfiguracion(config: Configuracion) {
        val payload = JSONObject().apply {
            put("nombre", config.nombre.trim())
            put("telefono", config.telefono?.trim()?.ifBlank { null } ?: JSONObject.NULL)
            put("direccion", config.direccion?.trim()?.ifBlank { null } ?: JSONObject.NULL)
            put("descripcion", config.descripcion?.trim()?.ifBlank { null } ?: JSONObject.NULL)
            put("horario", config.horario?.trim()?.ifBlank { null } ?: JSONObject.NULL)
            put("logo_url", config.logo_url?.trim()?.ifBlank { null } ?: JSONObject.NULL)
            put("color_principal", config.color_principal?.trim()?.ifBlank { null } ?: JSONObject.NULL)
            put("qr_url", config.qr_url?.trim()?.ifBlank { null } ?: JSONObject.NULL)
            put("dominio", config.dominio?.trim()?.ifBlank { null } ?: JSONObject.NULL)
            put("url_reservas_mesa", config.url_reservas_mesa?.trim()?.ifBlank { null } ?: JSONObject.NULL)
            put("portada_url", config.portada_url?.trim()?.ifBlank { null } ?: JSONObject.NULL)
            val social = JSONObject()
            config.redes_sociales.forEach { (key, value) -> social.put(key, value.trim()) }
            put("redes_sociales", social)
            put("updated_at", java.time.Instant.now().toString())
        }
        request("PATCH", "configuracion_restaurante?id=eq.${config.id}", payload.toString())
    }

    suspend fun uploadConfiguracionPortada(bytes: ByteArray, contentType: String, extension: String): String {
        val safeExtension = extension.lowercase().replace(Regex("[^a-z0-9]"), "").ifBlank { "jpg" }
        val path = "publico/portada-${System.currentTimeMillis()}-${(100000..999999).random()}.$safeExtension"
        storageRequest("POST", path, bytes, contentType)
        return "$baseUrl/storage/v1/object/public/$path"
    }

    suspend fun deleteConfiguracionPortada(fotoUrl: String) {
        if (fotoUrl.isBlank()) return
        val marker = "/storage/v1/object/public/productos/"
        val index = fotoUrl.indexOf(marker)
        if (index == -1) return
        val path = fotoUrl.substring(index + marker.length)
        if (!path.startsWith("publico/")) return
        storageRequest("DELETE", "productos/$path")
    }

    suspend fun getConfiguracion(): Configuracion? {
        val json = JSONArray(get("configuracion_restaurante?select=*&activo=eq.true&limit=1"))
        if (json.length() == 0) return null
        val item = json.getJSONObject(0)
        val socialObject = item.optJSONObject("redes_sociales")
        val social = mutableMapOf<String, String>()
        if (socialObject != null) {
            for (key in listOf("instagram", "facebook", "web")) {
                socialObject.optString(key).takeIf { it.isNotBlank() && it != "null" }?.let { social[key] = it }
            }
        }
        return Configuracion(
            item.getString("id"),
            item.optString("nombre"),
            item.optString("telefono").takeIf { it.isNotBlank() && it != "null" },
            item.optString("direccion").takeIf { it.isNotBlank() && it != "null" },
            item.optString("descripcion").takeIf { it.isNotBlank() && it != "null" },
            item.optString("horario").takeIf { it.isNotBlank() && it != "null" },
            item.optString("logo_url").takeIf { it.isNotBlank() && it != "null" },
            item.optString("color_principal").takeIf { it.isNotBlank() && it != "null" },
            item.optString("qr_url").takeIf { it.isNotBlank() && it != "null" },
            item.optString("dominio").takeIf { it.isNotBlank() && it != "null" },
            item.optString("url_reservas_mesa").takeIf { it.isNotBlank() && it != "null" },
            item.optString("portada_url").takeIf { it.isNotBlank() && it != "null" },
            social
        )
    }

    suspend fun getCatalogo(): Pair<List<Familia>, List<Producto>> = getFamilias() to getProductos()
}
