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
        Familia("1", "Entrantes", 0, true, null),
        Familia("2", "Carnes", 1, true, null),
        Familia("3", "Pescados", 2, true, null),
        Familia("4", "Postres", 3, true, null),
        Familia("5", "Bebidas", 4, false, null)
    )

    val productos = listOf(
        Producto("1", "1", "Croquetas de Jamón", "Deliciosas croquetas caseras.", 8.5, 0, true, false, true, false, null),
        Producto("2", "1", "Ensalada Mixta", "Lechuga, tomate, cebolla, atún.", 7.0, 1, true, false, false, false, null),
        Producto("3", "2", "Chuletón de Vaca", "1kg de chuletón a la brasa.", 45.0, 0, true, false, true, true, null),
        Producto("4", "2", "Secreto Ibérico", "Con patatas fritas.", 14.5, 1, true, true, false, false, null),
        Producto("5", "3", "Lubina a la Espalda", "Lubina fresca al horno.", 18.0, 0, true, false, false, true, null),
        Producto("6", "4", "Tarta de Queso", "Tarta casera al horno.", 6.5, 0, true, false, true, false, null),
        Producto("7", "5", "Vino Tinto Rioja", "Crianza.", 16.0, 0, false, false, false, false, null)
    )

    val configuracion = Configuracion(
        id = "1",
        nombre = "Restaurante Camborio",
        telefono = "+34 912 345 678",
        direccion = "Calle Principal, 123, Madrid",
        descripcion = "La mejor comida tradicional con un toque moderno.",
        horario = "L-D: 13:00 - 16:00 / 20:00 - 23:30",
        logo_url = null,
        color_principal = "#c8a96e",
        qr_url = null,
        dominio = "https://camborio.com/carta",
        url_reservas_mesa = "https://reservas.camborio.com"
    )
}
