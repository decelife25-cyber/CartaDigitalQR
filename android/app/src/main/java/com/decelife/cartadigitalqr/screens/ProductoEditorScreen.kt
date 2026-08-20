package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.ImageLoader
import coil.compose.AsyncImage
import coil.decode.SvgDecoder
import com.decelife.cartadigitalqr.data.SupabaseRepository
import com.decelife.cartadigitalqr.models.Alergeno
import com.decelife.cartadigitalqr.models.Familia
import com.decelife.cartadigitalqr.models.Producto
import kotlinx.coroutines.launch
import java.util.Locale

private val Orange = Color(0xFFFF7A00)
private val Border = Color(0xFFE1E1E1)
private val Muted = Color(0xFF747474)
private val Success = Color(0xFF10B981)
private val SuccessSoft = Color(0xFFE8F8F3)
private val Soft = Color(0xFFFAF5EE)

private fun erudusAsset(nombre: String): String {
    val key = nombre.lowercase(Locale.ROOT).replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")
    val file = when {
        key.contains("gluten") || key.contains("cereal") -> "cereal.svg"
        key.contains("crustace") -> "crustaceans.svg"
        key.contains("huevo") -> "eggs.svg"
        key.contains("pescado") -> "fish.svg"
        key.contains("cacahuet") -> "peanuts.svg"
        key.contains("soja") -> "soya.svg"
        key.contains("leche") || key.contains("lact") -> "milk.svg"
        key.contains("fruto") && key.contains("cascara") -> "nuts.svg"
        key.contains("apio") -> "celery.svg"
        key.contains("mostaza") -> "mustard.svg"
        key.contains("sesamo") -> "sesame.svg"
        key.contains("sulf") || key.contains("dioxido") || key.contains("azufre") -> "so2.svg"
        key.contains("altram") -> "lupin.svg"
        key.contains("molusc") -> "molluscs.svg"
        else -> ""
    }
    return if (file.isBlank()) "" else "file:///android_asset/erudus/$file"
}

@Composable
fun ProductoEditorScreen(productId: String?, onBack: () -> Unit) {
    var product by remember { mutableStateOf<Producto?>(null) }
    var familias by remember { mutableStateOf<List<Familia>>(emptyList()) }
    var alergenos by remember { mutableStateOf<List<Alergeno>>(emptyList()) }
    var selectedAlergenos by remember { mutableStateOf<Set<String>>(emptySet()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(productId) {
        loading = true; error = null
        try {
            val (loadedFamilies, loadedProducts) = SupabaseRepository.getCatalogo()
            familias = loadedFamilies
            alergenos = SupabaseRepository.getAlergenos()
            product = productId?.let { id -> loadedProducts.firstOrNull { it.id == id } }
            if (productId != null) selectedAlergenos = SupabaseRepository.getProductoAlergenos(productId).toSet()
        } catch (e: Exception) { error = e.message ?: "No se ha podido cargar el artículo." }
        finally { loading = false }
    }

    if (loading) { Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }; return }
    if (error != null) {
        Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center) { Text(error!!, color = MaterialTheme.colorScheme.error); Spacer(Modifier.height(12.dp)); Button(onClick = onBack) { Text("Volver") } }
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
    var familyOpen by remember { mutableStateOf(false) }
    var saving by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val svgLoader = remember(context) { ImageLoader.Builder(context).components { add(SvgDecoder.Factory()) }.build() }
    val familiaNombre = familias.firstOrNull { it.id == familiaId }?.nombre ?: "Selecciona una familia"

    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        Row(Modifier.fillMaxWidth().height(52.dp).border(1.dp, Border), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Volver") }
            Text(if (productId == null) "Nuevo artículo" else "Editar artículo", Modifier.weight(1f), fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
            if (productId != null) IconButton(onClick = { message = "La eliminación requiere confirmación." }) { Icon(Icons.Default.DeleteOutline, "Eliminar", tint = Color(0xFFDC2626)) }
            HeaderSwitch("Visible", visible) { visible = it }
        }

        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(top = 8.dp, bottom = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SectionCard {
                Row(Modifier.fillMaxWidth().padding(10.dp), horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.Top) {
                    Column(Modifier.weight(0.45f)) {
                        Box(Modifier.fillMaxWidth().aspectRatio(1f).clip(RoundedCornerShape(12.dp)).background(Soft).border(1.dp, Border, RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) {
                            if (fotoUrl.isNotBlank()) AsyncImage(model = fotoUrl, contentDescription = nombre, modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(12.dp))) else Icon(Icons.Default.Image, null, tint = Muted, modifier = Modifier.size(34.dp))
                        }
                        Spacer(Modifier.height(8.dp))
                        Button(onClick = { message = "La selección de fotografía se conecta en la siguiente iteración." }, modifier = Modifier.fillMaxWidth().height(40.dp), shape = RoundedCornerShape(10.dp), contentPadding = PaddingValues(horizontal = 6.dp), colors = ButtonDefaults.buttonColors(containerColor = Orange)) { Text(if (fotoUrl.isBlank()) "Añadir foto" else "Cambiar foto", fontSize = 11.sp, fontWeight = FontWeight.Bold) }
                    }
                    Column(Modifier.weight(0.55f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(nombre, { nombre = it }, Modifier.fillMaxWidth(), label = { Text("Nombre") }, singleLine = true)
                        OutlinedTextField(descripcion, { descripcion = it }, Modifier.fillMaxWidth().height(112.dp), label = { Text("Descripción") }, maxLines = 5)
                    }
                }
                Row(Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 4.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Box(Modifier.weight(1.3f)) {
                        Text("Categoría (familia) *", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Muted)
                        Spacer(Modifier.height(4.dp))
                        Box {
                            Row(Modifier.fillMaxWidth().height(48.dp).clip(RoundedCornerShape(10.dp)).border(1.dp, if (familyOpen) Success else Border, RoundedCornerShape(10.dp)).clickable { familyOpen = !familyOpen }.padding(horizontal = 14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) { Text(familiaNombre, fontSize = 13.sp); Text(if (familyOpen) "⌃" else "⌄", fontSize = 20.sp, color = if (familyOpen) Success else Muted) }
                            if (familyOpen) {
                                Column(Modifier.width(320.dp).heightIn(max = 360.dp).clip(RoundedCornerShape(12.dp)).background(Color.White).border(1.dp, Border, RoundedCornerShape(12.dp)).padding(vertical = 4.dp)) {
                                    familias.forEach { familia ->
                                        Row(Modifier.fillMaxWidth().height(42.dp).clip(RoundedCornerShape(8.dp)).background(if (familia.id == familiaId) SuccessSoft else Color.Transparent).clickable { familiaId = familia.id; familyOpen = false }.padding(horizontal = 14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) { Text(familia.nombre, fontSize = 13.sp, fontWeight = if (familia.id == familiaId) FontWeight.Bold else FontWeight.Normal, color = if (familia.id == familiaId) Success else MaterialTheme.colorScheme.onBackground); if (familia.id == familiaId) Text("✓", color = Success, fontSize = 18.sp, fontWeight = FontWeight.Bold) }
                                    }
                                }
                            }
                        }
                    }
                    Column(Modifier.weight(0.7f)) {
                        Text("Precio *", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Muted)
                        Spacer(Modifier.height(4.dp))
                        OutlinedTextField(precio, { precio = it }, Modifier.fillMaxWidth(), singleLine = true, suffix = { Text("€") })
                    }
                }
                Row(Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 8.dp), horizontalArrangement = Arrangement.SpaceEvenly) {
                    CompactSwitch("Disponible", !agotado) { agotado = !it }
                    CompactSwitch("Especialidad", especialidad, "👨‍🍳") { especialidad = it }
                    CompactSwitch("Sugerencia", sugerencia) { sugerencia = it }
                }
            }

            SectionCard {
                Row(Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 8.dp), verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.SpaceBetween) {
                    Column { Text("Alérgenos", fontSize = 20.sp, fontWeight = FontWeight.ExtraBold); Text("Selecciona los alérgenos que contiene este artículo.", fontSize = 11.sp, color = Muted) }
                    Box(Modifier.size(32.dp).clip(RoundedCornerShape(16.dp)).background(Soft), contentAlignment = Alignment.Center) { Text(selectedAlergenos.size.toString(), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Orange) }
                }
                Column(Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 4.dp)) {
                    alergenos.chunked(2).forEach { pair ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            pair.forEach { alergeno -> AlergenoChip(alergeno, selectedAlergenos.contains(alergeno.id), svgLoader, Modifier.weight(1f)) { selectedAlergenos = if (selectedAlergenos.contains(alergeno.id)) selectedAlergenos - alergeno.id else selectedAlergenos + alergeno.id } }
                            if (pair.size == 1) Spacer(Modifier.weight(1f))
                        }
                        Spacer(Modifier.height(6.dp))
                    }
                }
            }

            if (message != null) Text(message!!, Modifier.padding(horizontal = 12.dp), color = Muted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            Row(Modifier.fillMaxWidth().padding(horizontal = 8.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(onClick = onBack, modifier = Modifier.weight(0.8f).height(52.dp), shape = RoundedCornerShape(12.dp), colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Muted)) { Text("Cancelar", fontWeight = FontWeight.Bold) }
                Button(onClick = {
                    val cleanName = nombre.trim(); val cleanPrice = precio.replace(',', '.').toDoubleOrNull()
                    if (cleanName.isBlank()) { message = "El producto necesita un nombre."; return@Button }
                    if (familiaId.isBlank()) { message = "Selecciona una familia."; return@Button }
                    if (cleanPrice == null || cleanPrice < 0) { message = "Introduce un precio válido."; return@Button }
                    saving = true; message = null
                    scope.launch { try { SupabaseRepository.saveProducto(productId, cleanName, descripcion.trim().ifBlank { null }, cleanPrice, familiaId, fotoUrl.trim().ifBlank { null }, visible, agotado, especialidad, sugerencia, selectedAlergenos.toList()); onBack() } catch (e: Exception) { message = e.message ?: "No se pudo guardar." } finally { saving = false } }
                }, enabled = !saving, modifier = Modifier.weight(1.2f).height(52.dp), shape = RoundedCornerShape(12.dp), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF334155))) { Icon(Icons.Default.Save, null, Modifier.size(20.dp)); Spacer(Modifier.width(7.dp)); Text(if (saving) "Guardando…" else "Guardar cambios", fontWeight = FontWeight.ExtraBold) }
            }
        }
    }
}

@Composable private fun SectionCard(content: @Composable () -> Unit) { Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Color.White).border(1.dp, Border, RoundedCornerShape(18.dp))) { content() } }

@Composable private fun AlergenoChip(alergeno: Alergeno, selected: Boolean, loader: ImageLoader, modifier: Modifier = Modifier, onClick: () -> Unit) {
    val asset = erudusAsset(alergeno.nombre)
    Row(modifier.height(58.dp).clip(RoundedCornerShape(12.dp)).border(1.dp, if (selected) Orange else Border, RoundedCornerShape(12.dp)).background(if (selected) Color(0xFFFFF7ED) else Color(0xFFFCFCFC)).clickable(onClick = onClick).padding(horizontal = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        Checkbox(checked = selected, onCheckedChange = { onClick() }, modifier = Modifier.size(34.dp))
        Box(Modifier.size(34.dp).clip(RoundedCornerShape(17.dp)).background(Soft), contentAlignment = Alignment.Center) { if (asset.isNotBlank()) AsyncImage(model = asset, imageLoader = loader, contentDescription = null, modifier = Modifier.size(28.dp)) else Icon(Icons.Default.Image, null, tint = Muted, modifier = Modifier.size(20.dp)) }
        Spacer(Modifier.width(6.dp)); Text(alergeno.nombre, Modifier.weight(1f), fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 2)
    }
}

@Composable private fun HeaderSwitch(label: String, checked: Boolean, onChange: (Boolean) -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(1.dp), modifier = Modifier.padding(horizontal = 6.dp)) { Text(label, fontSize = 8.sp, fontWeight = FontWeight.ExtraBold, color = Muted); Toggle(checked, onChange) }
}

@Composable private fun CompactSwitch(label: String, checked: Boolean, icon: String? = null, onChange: (Boolean) -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(3.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(3.dp)) { if (icon != null) Text(icon, fontSize = 11.sp); if (label == "Sugerencia") Icon(Icons.Default.Lightbulb, null, tint = Success, modifier = Modifier.size(12.dp)); Text(label, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = if (checked) Success else Muted) }
        Toggle(checked, onChange)
    }
}

@Composable private fun Toggle(checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(Modifier.width(38.dp).height(22.dp).clip(RoundedCornerShape(11.dp)).background(if (checked) Success else Color(0xFFD1D5DB)).clickable { onChange(!checked) }.padding(2.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = if (checked) Arrangement.End else Arrangement.Start) { Box(Modifier.size(18.dp).clip(RoundedCornerShape(9.dp)).background(Color.White)) }
}
