package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.decelife.cartadigitalqr.data.SupabaseRepository
import com.decelife.cartadigitalqr.models.Familia
import com.decelife.cartadigitalqr.models.Producto
import java.util.Locale

private val Orange = Color(0xFFFF7A00)
private val Border = Color(0xFFE2E2E2)
private val Muted = Color(0xFF737373)
private val Success = Color(0xFF10B981)

@Composable
fun ProductoEditorScreen(productId: String?, onBack: () -> Unit) {
    var product by remember { mutableStateOf<Producto?>(null) }
    var familias by remember { mutableStateOf<List<Familia>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(productId) {
        loading = true
        error = null
        try {
            val (loadedFamilies, loadedProducts) = SupabaseRepository.getCatalogo()
            familias = loadedFamilies
            product = productId?.let { id -> loadedProducts.firstOrNull { it.id == id } }
        } catch (e: Exception) {
            error = e.message ?: "No se ha podido cargar el producto."
        } finally { loading = false }
    }

    if (loading) { Box(Modifier.fillMaxSize(), Alignment.Center) { CircularProgressIndicator() }; return }
    if (error != null) {
        Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center) {
            Text(error!!, color = MaterialTheme.colorScheme.error); Spacer(Modifier.height(12.dp)); Button(onClick = onBack) { Text("Volver") }
        }
        return
    }

    var nombre by remember(product) { mutableStateOf(product?.nombre ?: "") }
    var descripcion by remember(product) { mutableStateOf(product?.descripcion ?: "") }
    var precio by remember(product) { mutableStateOf(product?.let { String.format(Locale.US, "%.2f", it.precio) } ?: "0.00") }
    var familiaId by remember(product) { mutableStateOf(product?.familia_id ?: familias.firstOrNull()?.id.orEmpty()) }
    var fotoUrl by remember(product) { mutableStateOf(product?.foto_url ?: "") }
    var visible by remember(product) { mutableStateOf(product?.activo ?: true) }
    var agotado by remember(product) { mutableStateOf(product?.agotado ?: false) }
    var especialidad by remember(product) { mutableStateOf(product?.destacado ?: false) }
    var sugerencia by remember(product) { mutableStateOf(product?.sugerido ?: false) }
    var saving by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }

    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        Row(Modifier.fillMaxWidth().height(52.dp).border(1.dp, Border), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Volver") }
            Text(if (productId == null) "Nuevo artículo" else "Editar artículo", Modifier.weight(1f), fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
            CompactSwitch("Visible", visible) { visible = it }
        }
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 8.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SectionCard {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Column(Modifier.weight(0.34f)) {
                        Box(Modifier.fillMaxWidth().aspectRatio(1f).clip(RoundedCornerShape(10.dp)).background(Color(0xFFFAF5EE)).border(1.dp, Border, RoundedCornerShape(10.dp)), Alignment.Center) {
                            if (fotoUrl.isNotBlank()) AsyncImage(model = fotoUrl, contentDescription = product?.nombre, modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(10.dp))) else Icon(Icons.Default.Image, null, tint = Muted, modifier = Modifier.size(34.dp))
                        }
                        Spacer(Modifier.height(6.dp))
                        Button(onClick = {}, Modifier.fillMaxWidth().height(32.dp), shape = RoundedCornerShape(9.dp), contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 4.dp), colors = ButtonDefaults.buttonColors(containerColor = Orange)) { Text(if (fotoUrl.isBlank()) "Añadir foto" else "Cambiar foto", fontSize = 10.sp, fontWeight = FontWeight.Bold) }
                    }
                    Column(Modifier.weight(0.66f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        OutlinedTextField(nombre, { nombre = it }, Modifier.fillMaxWidth(), label = { Text("Nombre") }, singleLine = true)
                        OutlinedTextField(descripcion, { descripcion = it }, Modifier.fillMaxWidth(), label = { Text("Descripción") }, minLines = 3, maxLines = 5)
                        OutlinedTextField(precio, { precio = it }, Modifier.width(130.dp), label = { Text("Precio") }, singleLine = true)
                    }
                }
            }
            SectionCard {
                Text("Familia", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, color = Muted); Spacer(Modifier.height(5.dp))
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    familias.forEach { familia ->
                        val selected = familia.id == familiaId
                        Button(onClick = { familiaId = familia.id }, Modifier.fillMaxWidth().height(38.dp), shape = RoundedCornerShape(10.dp), colors = ButtonDefaults.buttonColors(containerColor = if (selected) Color(0xFFFFF1E6) else Color.Transparent, contentColor = if (selected) Color(0xFFEA580C) else MaterialTheme.colorScheme.onSurface)) { Text(familia.nombre, fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                    }
                }
            }
            SectionCard {
                Text("Estado", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, color = Muted); Spacer(Modifier.height(4.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                    CompactSwitch("Visible", visible) { visible = it }; CompactSwitch("Agotado", agotado) { agotado = it }; CompactSwitch("Especialidad", especialidad) { especialidad = it }; CompactSwitch("Sugerencia", sugerencia) { sugerencia = it }
                }
            }
            if (message != null) Text(message!!, color = Success, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            Button(
                onClick = {
                    val cleanName = nombre.trim()
                    val cleanPrice = precio.replace(',', '.').toDoubleOrNull()
                    if (cleanName.isBlank()) { message = "El producto necesita un nombre."; return@Button }
                    if (familiaId.isBlank()) { message = "Selecciona una familia."; return@Button }
                    if (cleanPrice == null || cleanPrice < 0) { message = "Introduce un precio válido."; return@Button }
                    saving = true
                    message = null
                    kotlinx.coroutines.MainScope().launch {
                        try {
                            SupabaseRepository.saveProducto(productId, cleanName, descripcion.trim().ifBlank { null }, cleanPrice, familiaId, fotoUrl.trim().ifBlank { null }, visible, agotado, especialidad, sugerencia)
                            message = "Guardado correctamente"
                            onBack()
                        } catch (e: Exception) { message = e.message ?: "No se pudo guardar." } finally { saving = false }
                    }
                },
                enabled = !saving,
                Modifier.fillMaxWidth().height(46.dp), shape = RoundedCornerShape(12.dp), colors = ButtonDefaults.buttonColors(containerColor = Orange)
            ) { Icon(Icons.Default.Save, null, Modifier.size(18.dp)); Spacer(Modifier.width(7.dp)); Text(if (saving) "GUARDANDO..." else "GUARDAR", fontWeight = FontWeight.ExtraBold) }
            Button(onClick = onBack, Modifier.fillMaxWidth().height(42.dp), shape = RoundedCornerShape(12.dp), colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent, contentColor = MaterialTheme.colorScheme.onSurface)) { Text("Cancelar", fontWeight = FontWeight.Bold) }
        }
    }
}

@Composable private fun SectionCard(content: @Composable () -> Unit) { Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(MaterialTheme.colorScheme.surface).border(1.dp, Border, RoundedCornerShape(12.dp)).padding(10.dp), content = content) }

@Composable private fun CompactSwitch(label: String, checked: Boolean, onChange: (Boolean) -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(label, fontSize = 9.sp, fontWeight = FontWeight.ExtraBold, color = if (checked) Success else Muted)
        Button(onClick = { onChange(!checked) }, Modifier.height(24.dp), shape = RoundedCornerShape(12.dp), contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 9.dp), colors = ButtonDefaults.buttonColors(containerColor = if (checked) Color(0xFFE8FAF3) else Color(0xFFEDEDED), contentColor = if (checked) Success else Muted)) { Text(if (checked) "ON" else "OFF", fontSize = 8.sp, fontWeight = FontWeight.ExtraBold) }
    }
}
