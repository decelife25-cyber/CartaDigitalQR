package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.ImageLoader
import coil.compose.AsyncImage
import coil.decode.SvgDecoder
import com.decelife.cartadigitalqr.data.SupabaseRepository
import com.decelife.cartadigitalqr.models.*
import com.decelife.cartadigitalqr.ui.components.AdminHeader
import com.decelife.cartadigitalqr.ui.theme.*
import kotlinx.coroutines.launch
import java.util.Locale

private val IconBg = mapOf(
    "cereal.svg" to Color(0xFFF4D7D7), "crustaceans.svg" to Color(0xFFDCECFf),
    "eggs.svg" to Color(0xFFFFF0C7), "fish.svg" to Color(0xFFCFE9F4),
    "peanuts.svg" to Color(0xFFEAD7C2), "soya.svg" to Color(0xFFD8E9C8),
    "milk.svg" to Color(0xFFE4E8EE), "nuts.svg" to Color(0xFFE8D4C4),
    "celery.svg" to Color(0xFFD6EBC9), "mustard.svg" to Color(0xFFF7E39A),
    "sesame.svg" to Color(0xFFEADFC9), "so2.svg" to Color(0xFFEAD3DF),
    "altramuz.svg" to Color(0xFFE4D8F2), "molluscs.svg" to Color(0xFFD6E2F2)
)

private fun erudus(nombre: String): Pair<String, Color> {
    val k = nombre.lowercase(Locale.ROOT)
        .replace("á", "a").replace("é", "e").replace("í", "i")
        .replace("ó", "o").replace("ú", "u")
    val f = when {
        k.contains("gluten") || k.contains("cereal") -> "cereal.svg"
        k.contains("crustace") -> "crustaceans.svg"
        k.contains("huevo") -> "eggs.svg"
        k.contains("pescado") -> "fish.svg"
        k.contains("cacahuet") -> "peanuts.svg"
        k.contains("soja") -> "soya.svg"
        k.contains("leche") || k.contains("lact") -> "milk.svg"
        k.contains("fruto") && k.contains("cascara") -> "nuts.svg"
        k.contains("apio") -> "celery.svg"
        k.contains("mostaza") -> "mustard.svg"
        k.contains("sesamo") -> "sesame.svg"
        k.contains("sulf") || k.contains("dioxido") || k.contains("azufre") -> "so2.svg"
        k.contains("altram") -> "altramuz.svg"
        k.contains("molusc") -> "molluscs.svg"
        else -> ""
    }
    return f to (IconBg[f] ?: Color(0xFFF3F4F6))
}

@Composable
fun ProductoEditorScreen(productId: String?, onBack: () -> Unit) {
    var product by remember { mutableStateOf<Producto?>(null) }
    var familias by remember { mutableStateOf<List<Familia>>(emptyList()) }
    var alergenos by remember { mutableStateOf<List<Alergeno>>(emptyList()) }
    var selected by remember { mutableStateOf<Set<String>>(emptySet()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(productId) {
        try {
            val catalogo = SupabaseRepository.getCatalogo()
            familias = catalogo.first
            alergenos = SupabaseRepository.getAlergenos()
            product = productId?.let { id -> catalogo.second.firstOrNull { it.id == id } }
            if (productId != null) selected = SupabaseRepository.getProductoAlergenos(productId).toSet()
        } catch (e: Exception) {
            error = e.message ?: "No se ha podido cargar el artículo."
        } finally {
            loading = false
        }
    }

    if (loading) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        return
    }
    if (error != null) {
        Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center) {
            Text(error!!, color = ErrorText)
            Spacer(Modifier.height(12.dp))
            Button(onClick = onBack) { Text("Volver") }
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
    var familyOpen by remember { mutableStateOf(false) }
    var saving by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val context = androidx.compose.ui.platform.LocalContext.current
    val loader = remember(context) { ImageLoader.Builder(context).components { add(SvgDecoder.Factory()) }.build() }
    val familiaNombre = familias.firstOrNull { it.id == familiaId }?.nombre ?: "Selecciona una familia"

    Column(Modifier.fillMaxSize().background(AppBg)) {
        AdminHeader(showHome = true, onHome = onBack)
        Row(
            Modifier.fillMaxWidth().height(44.dp).border(1.dp, AppBorder),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack, modifier = Modifier.size(36.dp)) {
                Icon(Icons.Default.ArrowBack, "Volver", modifier = Modifier.size(20.dp))
            }
            Text(
                if (productId == null) "Nuevo artículo" else "Editar artículo",
                modifier = Modifier.weight(1f), fontSize = 18.sp, fontWeight = FontWeight.ExtraBold,
                color = AppText, maxLines = 1, overflow = TextOverflow.Ellipsis
            )
            if (productId != null) {
                IconButton(onClick = { message = "La eliminación requiere confirmación." }, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Default.DeleteOutline, "Eliminar", tint = ErrorText, modifier = Modifier.size(20.dp))
                }
            }
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(1.dp),
                modifier = Modifier.padding(horizontal = 6.dp)
            ) {
                Text("VISIBLE", fontSize = 8.sp, fontWeight = FontWeight.ExtraBold, color = AppMuted)
                Toggle(visible) { visible = it }
            }
        }

        Box(Modifier.fillMaxSize()) {
            Column(
                Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = 60.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SectionCard {
                    Column(Modifier.padding(10.dp)) {
                        Row(
                            Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Column(Modifier.weight(0.31f)) {
                                Box(
                                    Modifier.fillMaxWidth().aspectRatio(1f)
                                        .clip(RoundedCornerShape(10.dp)).background(AppSurfaceSoft)
                                        .border(1.dp, AppBorder, RoundedCornerShape(10.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (fotoUrl.isNotBlank()) {
                                        AsyncImage(model = fotoUrl, contentDescription = nombre, modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(10.dp)))
                                    } else {
                                        Icon(Icons.Default.Image, null, tint = AppMuted, modifier = Modifier.size(30.dp))
                                    }
                                }
                                Spacer(Modifier.height(4.dp))
                                Button(
                                    onClick = { message = "La selección de fotografía se conecta en la siguiente iteración." },
                                    modifier = Modifier.fillMaxWidth().height(42.dp),
                                    shape = RoundedCornerShape(10.dp),
                                    contentPadding = PaddingValues(horizontal = 4.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary, contentColor = Color.White)
                                ) {
                                    Icon(Icons.Default.CameraAlt, null, modifier = Modifier.size(16.dp))
                                    Spacer(Modifier.width(5.dp))
                                    Text("Cambiar foto", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                }
                                if (fotoUrl.isNotBlank()) {
                                    Spacer(Modifier.height(2.dp))
                                    Button(
                                        onClick = { fotoUrl = "" },
                                        modifier = Modifier.fillMaxWidth().height(32.dp),
                                        shape = RoundedCornerShape(8.dp),
                                        contentPadding = PaddingValues(0.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent, contentColor = ErrorText)
                                    ) {
                                        Text("Eliminar foto", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }

                            Column(Modifier.weight(0.69f), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                                Label("NOMBRE DEL ARTÍCULO *")
                                BasicTextField(
                                    value = nombre, onValueChange = { nombre = it },
                                    modifier = Modifier.fillMaxWidth().height(50.dp)
                                        .border(1.dp, AppBorder, RoundedCornerShape(10.dp)).padding(horizontal = 10.dp, vertical = 8.dp),
                                    singleLine = true,
                                    textStyle = TextStyle(color = AppText, fontSize = 14.sp, fontWeight = FontWeight.SemiBold),
                                    cursorBrush = SolidColor(OrangePrimary)
                                )
                                Label("DESCRIPCIÓN")
                                BasicTextField(
                                    value = descripcion, onValueChange = { descripcion = it },
                                    modifier = Modifier.fillMaxWidth().height(96.dp)
                                        .border(1.dp, AppBorder, RoundedCornerShape(10.dp)).padding(10.dp),
                                    textStyle = TextStyle(color = AppText, fontSize = 11.sp, lineHeight = 15.sp),
                                    cursorBrush = SolidColor(OrangePrimary)
                                )
                            }
                        }

                        Row(
                            Modifier.fillMaxWidth().padding(top = 7.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Column(Modifier.weight(1.25f)) {
                                Label("CATEGORÍA (FAMILIA) *")
                                Box {
                                    Row(
                                        modifier = Modifier.fillMaxWidth().height(50.dp)
                                            .clip(RoundedCornerShape(10.dp))
                                            .border(1.dp, if (familyOpen) SuccessText else AppBorder, RoundedCornerShape(10.dp))
                                            .clickable { familyOpen = !familyOpen }
                                            .padding(horizontal = 12.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(familiaNombre, fontSize = 14.sp, color = AppText, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                        Text(if (familyOpen) "⌃" else "⌄", fontSize = 18.sp, color = if (familyOpen) SuccessText else AppText)
                                    }
                                    if (familyOpen) {
                                        Column(
                                            Modifier.fillMaxWidth().heightIn(max = 340.dp)
                                                .clip(RoundedCornerShape(10.dp)).background(AppSurfaceSoft)
                                                .border(1.dp, AppBorder, RoundedCornerShape(10.dp)).padding(vertical = 2.dp)
                                        ) {
                                            FamilyOption("Selecciona una familia", familiaId.isBlank(), 40.dp) { familiaId = ""; familyOpen = false }
                                            familias.forEach { f ->
                                                FamilyOption(f.nombre, f.id == familiaId, 40.dp) { familiaId = f.id; familyOpen = false }
                                            }
                                        }
                                    }
                                }
                            }
                            Column(Modifier.weight(0.75f)) {
                                Label("PRECIO *")
                                BasicTextField(
                                    value = precio, onValueChange = { precio = it },
                                    modifier = Modifier.fillMaxWidth().height(50.dp)
                                        .border(1.dp, AppBorder, RoundedCornerShape(10.dp))
                                        .padding(start = 10.dp, end = 24.dp, top = 8.dp, bottom = 8.dp),
                                    singleLine = true,
                                    textStyle = TextStyle(color = AppText, fontSize = 14.sp, fontWeight = FontWeight.SemiBold),
                                    cursorBrush = SolidColor(OrangePrimary),
                                    decorationBox = { inner ->
                                        Box(Modifier.fillMaxSize()) {
                                            inner()
                                            Text("€", modifier = Modifier.align(Alignment.CenterEnd), color = AppMuted, fontSize = 11.sp)
                                        }
                                    }
                                )
                            }
                        }

                        Row(
                            Modifier.fillMaxWidth().padding(top = 7.dp).border(1.dp, AppBorder),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            Status("Disponible", !agotado, null) { agotado = !it }
                            Status("Especialidad", especialidad, "👨‍🍳") { especialidad = it }
                            Status("Sugerencia", sugerencia, null) { sugerencia = it }
                        }
                    }
                }

                SectionCard {
                    Column(Modifier.padding(10.dp)) {
                        Row(
                            Modifier.fillMaxWidth(), verticalAlignment = Alignment.Bottom,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Alérgenos", fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = AppText)
                                Text("Selecciona los alérgenos que contiene este artículo.", fontSize = 11.sp, color = AppMuted)
                            }
                            Box(Modifier.size(34.dp).clip(RoundedCornerShape(17.dp)).background(AppSurfaceSoft), contentAlignment = Alignment.Center) {
                                Text(selected.size.toString(), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = OrangePrimary)
                            }
                        }
                        Spacer(Modifier.height(6.dp))
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            alergenos.chunked(2).forEach { pair ->
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    pair.forEach { a ->
                                        AlergenoChip(a, selected.contains(a.id), loader, Modifier.weight(1f)) {
                                            selected = if (selected.contains(a.id)) selected - a.id else selected + a.id
                                        }
                                    }
                                    if (pair.size == 1) Spacer(Modifier.weight(1f))
                                }
                            }
                        }
                    }
                }
                message?.let { Text(it, Modifier.padding(horizontal = 12.dp), color = AppMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold) }
            }

            Row(
                Modifier.align(Alignment.BottomCenter).fillMaxWidth().background(AppBg).padding(horizontal = 8.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onBack, modifier = Modifier.weight(1f).height(44.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AppSurface, contentColor = AppMuted),
                    border = BorderStroke(1.dp, AppBorder)
                ) { Text("Cancelar", fontSize = 13.sp, fontWeight = FontWeight.Bold) }
                Button(
                    onClick = {
                        val n = nombre.trim()
                        val p = precio.replace(',', '.').toDoubleOrNull()
                        if (n.isBlank()) { message = "El producto necesita un nombre."; return@Button }
                        if (familiaId.isBlank()) { message = "Selecciona una familia."; return@Button }
                        if (p == null || p < 0) { message = "Introduce un precio válido."; return@Button }
                        saving = true
                        message = null
                        scope.launch {
                            try {
                                SupabaseRepository.saveProducto(
                                    productId, n, descripcion.trim().ifBlank { null }, p, familiaId,
                                    fotoUrl.trim().ifBlank { null }, visible, agotado, especialidad, sugerencia,
                                    selected.toList()
                                )
                                onBack()
                            } catch (e: Exception) {
                                message = e.message ?: "No se pudo guardar."
                            } finally { saving = false }
                        }
                    },
                    enabled = !saving, modifier = Modifier.weight(1.7f).height(44.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary, contentColor = Color.White)
                ) {
                    Icon(Icons.Default.Save, null, modifier = Modifier.size(17.dp))
                    Spacer(Modifier.width(5.dp))
                    Text(if (saving) "Guardando…" else "Guardar cambios", fontSize = 11.sp, fontWeight = FontWeight.ExtraBold)
                }
            }
        }
    }
}

@Composable
private fun SectionCard(content: @Composable () -> Unit) {
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(AppSurface)
            .border(1.dp, AppBorder, RoundedCornerShape(12.dp))
    ) { content() }
}

@Composable
private fun Label(text: String) {
    Text(text, color = AppMuted, fontSize = 9.sp, fontWeight = FontWeight.SemiBold)
}

@Composable
private fun FamilyOption(text: String, selected: Boolean, height: androidx.compose.ui.unit.Dp, onClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().height(height)
            .clip(RoundedCornerShape(7.dp))
            .background(if (selected) Color(0x1A10B981) else Color.Transparent)
            .clickable(onClick = onClick).padding(horizontal = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text, fontSize = 13.sp, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal, color = if (selected) SuccessText else AppText)
        if (selected) Icon(Icons.Default.Check, null, tint = SuccessText, modifier = Modifier.size(17.dp))
    }
}

@Composable
private fun Status(label: String, checked: Boolean, icon: String?, onChange: (Boolean) -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(3.dp),
        modifier = Modifier.padding(vertical = 7.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(3.dp)) {
            if (icon != null) Text(icon, fontSize = 11.sp)
            if (label == "Sugerencia") Icon(Icons.Default.Lightbulb, null, tint = SuccessText, modifier = Modifier.size(11.dp))
            Text(label.uppercase(Locale.ROOT), fontSize = 9.sp, fontWeight = FontWeight.ExtraBold, color = if (checked) SuccessText else AppMuted)
        }
        Toggle(checked, onChange)
    }
}

@Composable
private fun Toggle(checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.width(36.dp).height(20.dp).clip(RoundedCornerShape(10.dp))
            .background(if (checked) SuccessText else Color(0xFFD1D5DB)).clickable { onChange(!checked) }
            .padding(2.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = if (checked) Arrangement.End else Arrangement.Start
    ) {
        Box(Modifier.size(16.dp).clip(RoundedCornerShape(8.dp)).background(Color.White))
    }
}

@Composable
private fun AlergenoChip(a: Alergeno, selected: Boolean, loader: ImageLoader, modifier: Modifier, onClick: () -> Unit) {
    val assetAndBg = erudus(a.nombre)
    Row(
        modifier = modifier.heightIn(min = 48.dp).clip(RoundedCornerShape(12.dp))
            .border(1.dp, if (selected) Color(0xFFF97316) else AppBorder, RoundedCornerShape(12.dp))
            .background(if (selected) Color(0x1AF97316) else AppSurfaceSoft)
            .clickable(onClick = onClick).padding(horizontal = 6.dp, vertical = 3.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            Modifier.size(16.dp).clip(RoundedCornerShape(2.dp))
                .background(if (selected) Color(0x1AF97316) else Color.Transparent)
                .border(1.dp, if (selected) Color(0xFFF97316) else AppMuted, RoundedCornerShape(2.dp)),
            contentAlignment = Alignment.Center
        ) {
            if (selected) Icon(Icons.Default.Check, null, tint = SuccessText, modifier = Modifier.size(11.dp))
        }
        Spacer(Modifier.width(6.dp))
        Box(Modifier.size(30.dp).clip(RoundedCornerShape(15.dp)).background(assetAndBg.second), contentAlignment = Alignment.Center) {
            if (assetAndBg.first.isNotBlank()) {
                AsyncImage(
                    model = "file:///android_asset/erudus/${assetAndBg.first}", imageLoader = loader,
                    contentDescription = null, modifier = Modifier.size(28.dp)
                )
            }
        }
        Spacer(Modifier.width(6.dp))
        Text(a.nombre, modifier = Modifier.weight(1f), color = AppText, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, lineHeight = 11.sp)
    }
}
