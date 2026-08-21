package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGesturesAfterLongPress
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.decelife.cartadigitalqr.data.SupabaseRepository
import com.decelife.cartadigitalqr.models.Familia
import com.decelife.cartadigitalqr.models.Producto
import com.decelife.cartadigitalqr.ui.components.AdminHeader
import com.decelife.cartadigitalqr.ui.components.ScreenHeader
import com.decelife.cartadigitalqr.ui.theme.AppBorder
import com.decelife.cartadigitalqr.ui.theme.AppMuted
import com.decelife.cartadigitalqr.ui.theme.SuccessBg
import com.decelife.cartadigitalqr.ui.theme.SuccessText
import kotlinx.coroutines.launch
import java.util.Locale

private val SpecialColor = Color(0xFFF59E0B)
private val SpecialBackground = Color(0xFFFFF8E8)
private val SuggestedColor = Color(0xFF10B981)
private val SuggestedBackground = Color(0xFFECFBF5)
private enum class StatusFilter(val label: String) { TODOS("Estado: Todos"), VISIBLES("Visibles"), OCULTOS("Ocultos"), DISPONIBLES("Disponibles"), AGOTADOS("Agotados"), DESTACADOS("Especialidades") }
private enum class SortMode(val label: String) { ORDEN("Orden: Carta"), NOMBRE("Nombre A-Z"), PRECIO_ASC("Precio ↑"), PRECIO_DESC("Precio ↓") }

@Composable
fun ProductosScreen(onBackClick: () -> Unit, onNewProduct: () -> Unit, onProductClick: (String) -> Unit) {
    var search by remember { mutableStateOf("") }
    var familias by remember { mutableStateOf<List<Familia>?>(null) }
    var products by remember { mutableStateOf<List<Producto>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var familiaId by remember { mutableStateOf("todas") }
    var status by remember { mutableStateOf(StatusFilter.TODOS) }
    var sort by remember { mutableStateOf(SortMode.ORDEN) }
    var dialog by remember { mutableStateOf<String?>(null) }
    var draggedId by remember { mutableStateOf<String?>(null) }
    var dragAccumulated by remember { mutableStateOf(0f) }
    var savingOrder by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    suspend fun reload() {
        error = null
        try {
            val (loadedFamilies, loadedProducts) = SupabaseRepository.getCatalogo()
            familias = loadedFamilies
            products = loadedProducts
        } catch (e: Exception) { error = e.message ?: "No se han podido cargar los productos." }
    }
    LaunchedEffect(Unit) { reload() }

    val familyById = remember(familias) { familias.orEmpty().associateBy { it.id } }
    val filtered = products.orEmpty().filter { product ->
        val family = familyById[product.familia_id]?.nombre.orEmpty()
        val query = search.trim()
        val matchesSearch = query.isBlank() || "${product.nombre} $family".contains(query, ignoreCase = true)
        val matchesFamily = familiaId == "todas" || product.familia_id == familiaId
        val matchesStatus = when (status) {
            StatusFilter.TODOS -> true
            StatusFilter.VISIBLES -> product.activo
            StatusFilter.OCULTOS -> !product.activo
            StatusFilter.DISPONIBLES -> !product.agotado
            StatusFilter.AGOTADOS -> product.agotado
            StatusFilter.DESTACADOS -> product.destacado
        }
        matchesSearch && matchesFamily && matchesStatus
    }.let { list ->
        when (sort) {
            SortMode.ORDEN -> list.sortedBy { it.orden }
            SortMode.NOMBRE -> list.sortedBy { it.nombre.lowercase(Locale.ROOT) }
            SortMode.PRECIO_ASC -> list.sortedBy { it.precio }
            SortMode.PRECIO_DESC -> list.sortedByDescending { it.precio }
        }
    }

    val canReorder = search.isBlank() && familiaId == "todas" && status == StatusFilter.TODOS && sort == SortMode.ORDEN && !savingOrder

    fun moveLocal(id: String, direction: Int) {
        products = products?.let { current ->
            val ordered = current.sortedBy { it.orden }.toMutableList()
            val index = ordered.indexOfFirst { it.id == id }
            val target = index + direction
            if (index < 0 || target !in ordered.indices) return@let current
            val moved = ordered.removeAt(index)
            ordered.add(target, moved)
            ordered.mapIndexed { i, item -> item.copy(orden = i) }
        }
    }

    fun persistOrder() {
        val ordered = products.orEmpty().sortedBy { it.orden }
        if (ordered.isEmpty()) return
        savingOrder = true
        scope.launch {
            try { ordered.forEachIndexed { index, product -> SupabaseRepository.updateProductoFields(product.id, mapOf("orden" to index)) } }
            catch (e: Exception) { error = e.message ?: "No se pudo guardar el orden de los productos."; reload() }
            finally { savingOrder = false; draggedId = null }
        }
    }

    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        AdminHeader(showHome = true, onHome = onBackClick)
        ScreenHeader(title = "Productos", actionText = "+ Nuevo producto", onBack = onBackClick, onAction = onNewProduct)
        Column(Modifier.padding(horizontal = 8.dp, vertical = 8.dp)) {
            Row(Modifier.fillMaxWidth().height(40.dp).clip(RoundedCornerShape(12.dp)).border(1.dp, AppBorder, RoundedCornerShape(12.dp)).padding(horizontal = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Search, null, tint = AppMuted, modifier = Modifier.size(18.dp)); Spacer(Modifier.width(8.dp))
                BasicTextField(value = search, onValueChange = { search = it }, modifier = Modifier.weight(1f), singleLine = true, textStyle = MaterialTheme.typography.bodyMedium.copy(color = MaterialTheme.colorScheme.onBackground, fontSize = 14.sp), cursorBrush = SolidColor(MaterialTheme.colorScheme.primary), decorationBox = { inner -> if (search.isEmpty()) Text("Buscar artículos...", color = AppMuted, fontSize = 14.sp); inner() })
                if (search.isNotEmpty()) IconButton(onClick = { search = "" }, modifier = Modifier.size(24.dp)) { Icon(Icons.Default.Clear, "Limpiar", tint = AppMuted, modifier = Modifier.size(16.dp)) }
            }
            Spacer(Modifier.height(8.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AdminFilterChip(if (familiaId == "todas") "Familia: Todas" else "Familia: ${familyById[familiaId]?.nombre ?: "Todas"}", Modifier.weight(1f)) { dialog = "familia" }
                AdminFilterChip(status.label, Modifier.weight(1f)) { dialog = "estado" }
                Box(Modifier.size(36.dp).clip(RoundedCornerShape(12.dp)).border(1.dp, if (sort != SortMode.ORDEN) Color(0xFFF97316) else AppBorder, RoundedCornerShape(12.dp)).clickable { dialog = "orden" }, contentAlignment = Alignment.Center) { Icon(Icons.Default.FilterList, "Filtrar y ordenar", tint = if (sort != SortMode.ORDEN) Color(0xFFF97316) else AppMuted, modifier = Modifier.size(18.dp)) }
            }
        }
        when {
            products == null && error == null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            error != null -> Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) { Text(error!!, color = MaterialTheme.colorScheme.error) }
            else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(bottom = 16.dp), verticalArrangement = Arrangement.spacedBy(1.dp)) {
                items(filtered, key = { it.id }) { product ->
                    ProductRow(product, familyById[product.familia_id]?.nombre ?: "", { onProductClick(product.id) }, canReorder, { if (canReorder) { draggedId = product.id; dragAccumulated = 0f } }, { amount, threshold -> if (canReorder) { dragAccumulated += amount; while (dragAccumulated >= threshold) { moveLocal(product.id, 1); dragAccumulated -= threshold }; while (dragAccumulated <= -threshold) { moveLocal(product.id, -1); dragAccumulated += threshold } } }, { if (draggedId != null) persistOrder() })
                }
            }
        }
    }
    when (dialog) {
        "familia" -> SelectionDialog("Selecciona una familia", listOf("todas" to "Familia: Todas") + familias.orEmpty().filter { it.activo }.map { it.id to it.nombre }, familiaId, { familiaId = it; dialog = null }, { dialog = null })
        "estado" -> SelectionDialog("Filtrar por estado", StatusFilter.entries.map { it.name to it.label }, status.name, { status = StatusFilter.valueOf(it); dialog = null }, { dialog = null })
        "orden" -> SelectionDialog("Ordenar productos", SortMode.entries.map { it.name to it.label }, sort.name, { sort = SortMode.valueOf(it); dialog = null }, { dialog = null })
    }
}

@Composable private fun SelectionDialog(title: String, options: List<Pair<String, String>>, selected: String, onSelect: (String) -> Unit, onDismiss: () -> Unit) {
    AlertDialog(onDismissRequest = onDismiss, title = { Text(title, fontWeight = FontWeight.ExtraBold) }, text = { Column(verticalArrangement = Arrangement.spacedBy(2.dp)) { options.forEach { (value, label) -> Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(9.dp)).background(if (value == selected) Color(0x1A10B981) else Color.Transparent).clickable { onSelect(value) }.padding(horizontal = 10.dp, vertical = 9.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) { Text(label, fontWeight = if (value == selected) FontWeight.Bold else FontWeight.Normal, color = if (value == selected) SuccessText else MaterialTheme.colorScheme.onSurface); if (value == selected) Text("✓", color = SuccessText, fontWeight = FontWeight.ExtraBold) } } } }, confirmButton = { TextButton(onClick = onDismiss) { Text("Cerrar") } })
}

@Composable private fun AdminFilterChip(text: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Row(modifier.height(36.dp).clip(RoundedCornerShape(12.dp)).border(1.dp, AppBorder, RoundedCornerShape(12.dp)).clickable(onClick = onClick).padding(horizontal = 8.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) { Text(text, fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1); Text("⌄", color = AppMuted, fontSize = 14.sp) }
}

@Composable private fun ProductRow(product: Producto, family: String, onClick: () -> Unit, canReorder: Boolean, onDragStart: () -> Unit, onDrag: (Float, Float) -> Unit, onDragEnd: () -> Unit) {
    Row(Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surface).border(1.dp, AppBorder).padding(horizontal = 12.dp, vertical = 7.dp), verticalAlignment = Alignment.CenterVertically) {
        Row(Modifier.weight(1f).clickable(onClick = onClick), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(50.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFFFAF5EE)), contentAlignment = Alignment.Center) { if (!product.foto_url.isNullOrBlank()) AsyncImage(model = product.foto_url, contentDescription = product.nombre, modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(10.dp))) else Icon(Icons.Default.Image, null, tint = Color(0xFF8C6A48), modifier = Modifier.size(24.dp)) }
            Column(Modifier.weight(1f).padding(horizontal = 10.dp)) { Text(product.nombre, fontSize = 15.sp, lineHeight = 18.sp, fontWeight = FontWeight.ExtraBold, maxLines = 3); if (family.isNotBlank()) Text(family, color = AppMuted, fontSize = 12.sp, fontWeight = FontWeight.Medium, modifier = Modifier.padding(top = 2.dp), maxLines = 1); if (product.destacado || product.sugerido) Column(Modifier.padding(top = 4.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) { if (product.destacado) FeatureBadge("ESPECIALIDAD", SpecialColor, SpecialBackground, true); if (product.sugerido) FeatureBadge("SUGERENCIA", SuggestedColor, SuggestedBackground) } }
            Column(horizontalAlignment = Alignment.End) { Text(String.format(Locale.US, "%.2f €", product.precio), fontSize = 14.sp, fontWeight = FontWeight.ExtraBold); Spacer(Modifier.height(4.dp)); StatusPill(if (product.agotado) "Agotado" else "Visible", if (product.agotado) Color(0xFFFFE8E8) else SuccessBg, if (product.agotado) Color(0xFFDC2626) else SuccessText) }
        }
        Icon(Icons.Default.DragIndicator, "Reordenar", tint = AppMuted, modifier = Modifier.padding(start = 6.dp).size(22.dp).pointerInput(canReorder, product.id) { detectDragGesturesAfterLongPress(onDragStart = { _ -> if (canReorder) onDragStart() }, onDragCancel = onDragEnd, onDragEnd = onDragEnd) { _, dragAmount -> onDrag(dragAmount.y, 30.dp.toPx()) } })
    }
}

@Composable private fun FeatureBadge(text: String, color: Color, background: Color, chefIcon: Boolean = false) { Row(Modifier.height(22.dp).clip(RoundedCornerShape(11.dp)).background(background).border(1.dp, color, RoundedCornerShape(11.dp)).padding(horizontal = 7.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(3.dp)) { if (chefIcon) Text("👨‍🍳", fontSize = 9.sp, lineHeight = 10.sp, maxLines = 1) else Icon(Icons.Default.Lightbulb, null, tint = color, modifier = Modifier.size(11.dp)); Text(text, color = color, fontSize = 9.sp, fontWeight = FontWeight.ExtraBold, maxLines = 1, softWrap = false) } }
@Composable private fun StatusPill(text: String, background: Color, foreground: Color) { Box(Modifier.clip(RoundedCornerShape(16.dp)).background(background).padding(horizontal = 8.dp, vertical = 4.dp)) { Text(text, color = foreground, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold) } }
