package com.decelife.cartadigitalqr.models

data class Familia(
    val id: String,
    val nombre: String,
    val orden: Int,
    val activo: Boolean,
    val foto_url: String?
)

data class Alergeno(
    val id: String,
    val nombre: String,
    val orden: Int = 0,
    val activo: Boolean = true
)

data class Producto(
    val id: String,
    val familia_id: String,
    val nombre: String,
    val descripcion: String?,
    val precio: Double,
    val orden: Int,
    val activo: Boolean,
    val agotado: Boolean,
    val destacado: Boolean,
    val sugerido: Boolean,
    val foto_url: String?,
    val alergeno_ids: List<String> = emptyList()
)

data class Configuracion(
    val id: String,
    val nombre: String,
    val telefono: String?,
    val direccion: String?,
    val descripcion: String?,
    val horario: String?,
    val logo_url: String?,
    val color_principal: String?,
    val qr_url: String?,
    val dominio: String?,
    val url_reservas_mesa: String?,
    val portada_url: String?
)
