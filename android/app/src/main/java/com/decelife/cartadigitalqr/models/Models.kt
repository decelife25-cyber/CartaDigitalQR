package com.decelife.cartadigitalqr.models

data class Familia(
    val id: String,
    val nombre: String,
    val orden: Int,
    val activo: Boolean,
    val foto_url: String?
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
    val foto_url: String?
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
    val url_reservas_mesa: String?
)

// Mock Data
object MockData {
    val familias = listOf(
        Familia("1", "Familia de ejemplo 1", 0, true, null),
        Familia("2", "Familia de ejemplo 2", 1, true, null),
        Familia("3", "Familia de ejemplo 3", 2, true, null),
        Familia("4", "Familia oculta de prueba", 3, false, null)
    )

    val productos = listOf(
        Producto("1", "1", "Producto de ejemplo destacado", "Descripción breve de prueba.", 12.5, 0, true, false, true, false, null),
        Producto("2", "1", "Producto normal de prueba", "Otra descripción de ejemplo.", 8.0, 1, true, false, false, false, null),
        Producto("3", "2", "Producto agotado", "Descripción de producto sin stock.", 15.0, 0, true, true, false, false, null),
        Producto("4", "2", "Producto sugerido", "Este producto está sugerido.", 22.5, 1, true, false, false, true, null),
        Producto("5", "3", "Producto oculto", "Este producto no es visible.", 10.0, 0, false, false, false, false, null)
    )

    val configuracion = Configuracion(
        id = "1",
        nombre = "Restaurante de Ejemplo",
        telefono = "+34 000 000 000",
        direccion = "Calle de Prueba, 1, Ciudad",
        descripcion = "Descripción genérica del restaurante para pruebas del panel.",
        horario = "L-D: 10:00 - 23:00",
        logo_url = null,
        color_principal = "#f97316",
        qr_url = null,
        dominio = "https://ejemplo.com/carta",
        url_reservas_mesa = "https://reservas.ejemplo.com"
    )
}
