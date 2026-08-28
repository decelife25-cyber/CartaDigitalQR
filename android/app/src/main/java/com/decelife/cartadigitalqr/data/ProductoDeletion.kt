package com.decelife.cartadigitalqr.data

import com.decelife.cartadigitalqr.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

suspend fun SupabaseRepository.deleteProducto(id: String): Unit = withContext(Dispatchers.IO) {
    require(id.isNotBlank()) { "Producto no válido." }
    val baseUrl = BuildConfig.SUPABASE_URL.trimEnd('/')
    val apiKey = BuildConfig.SUPABASE_ANON_KEY
    require(baseUrl.isNotBlank()) { "Falta la URL de Supabase en la compilación de Android." }
    require(apiKey.isNotBlank()) { "Falta la clave pública de Supabase en la compilación de Android." }
    if (!SupabaseAuth.ensureValidSession()) throw IllegalStateException("Sesión no válida. Vuelve a iniciar sesión.")

    fun request(method: String, path: String, preferRepresentation: Boolean = false): String {
        val token = SupabaseAuth.bearerToken() ?: apiKey
        val connection = (URL("$baseUrl/rest/v1/$path").openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 15_000
            readTimeout = 15_000
            doInput = true
            setRequestProperty("apikey", apiKey)
            setRequestProperty("Authorization", "Bearer $token")
            setRequestProperty("Accept", "application/json")
            if (preferRepresentation) setRequestProperty("Prefer", "return=representation")
        }
        try {
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.use { BufferedReader(InputStreamReader(it, Charsets.UTF_8)).use { reader -> reader.readText() } }.orEmpty()
            if (code !in 200..299) throw IllegalStateException("Supabase HTTP $code: $response")
            return response
        } finally { connection.disconnect() }
    }

    val productoResponse = request("GET", "productos?select=id,foto_url&id=eq.$id")
    val productos = JSONArray(productoResponse)
    if (productos.length() == 0) throw IllegalStateException("El producto ya no existe.")
    val fotoUrl = productos.getJSONObject(0).optString("foto_url").takeIf { it.isNotBlank() && it != "null" }

    request("DELETE", "producto_alergeno?producto_id=eq.$id")
    val deleted = JSONArray(request("DELETE", "productos?id=eq.$id&select=id", preferRepresentation = true))
    if (deleted.length() == 0) throw IllegalStateException("No se ha podido eliminar el producto. Comprueba los permisos de la sesión.")

    if (!fotoUrl.isNullOrBlank()) {
        try {
            val marker = "/storage/v1/object/public/productos/"
            val index = fotoUrl.indexOf(marker)
            if (index >= 0) {
                val path = fotoUrl.substring(index + marker.length)
                val token = SupabaseAuth.bearerToken() ?: apiKey
                val connection = (URL("$baseUrl/storage/v1/object/productos/$path").openConnection() as HttpURLConnection).apply {
                    requestMethod = "DELETE"
                    connectTimeout = 15_000
                    readTimeout = 15_000
                    setRequestProperty("apikey", apiKey)
                    setRequestProperty("Authorization", "Bearer $token")
                }
                try { connection.responseCode } finally { connection.disconnect() }
            }
        } catch (_: Exception) {
            // La fila ya se ha eliminado; un fallo al limpiar la foto no debe deshacerlo.
        }
    }
}
