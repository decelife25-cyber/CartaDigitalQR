package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.scrollBy
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.decelife.cartadigitalqr.data.SupabaseRepository
import com.decelife.cartadigitalqr.models.Familia
import com.decelife.cartadigitalqr.ui.components.AdminHeader
import com.decelife.cartadigitalqr.ui.components.ScreenHeader
import com.decelife.cartadigitalqr.ui.theme.AppBorder
import com.decelife.cartadigitalqr.ui.theme.AppMuted
import com.decelife.cartadigitalqr.ui.theme.SuccessBg
import com.decelife.cartadigitalqr.ui.theme.SuccessText
import kotlinx.coroutines.launch
import androidx.compose.runtime.withFrameNanos

private val fallbackIcons = mapOf("Tapas" to Icons.Default.RestaurantMenu, "Entrantes fríos" to Icons.Default.Restaurant, "Entrantes calientes" to Icons.Default.DinnerDining, "Pescados" to Icons.Default.Restaurant, "Arroces" to Icons.Default.RestaurantMenu, "Con dos huevos" to Icons.Default.Egg, "Carnes y guisos" to Icons.Default.DinnerDining, "Vinos" to Icons.Default.WineBar, "Postres" to Icons.Default.Cake)

@Composable
fun FamiliasScreen(onBackClick: () -> Unit, onNewFamily: () -> Unit, onFamilyClick: (String) -> Unit) {
    var familias by remember { mutableStateOf<List<Familia>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var draggedId by remember { mutableStateOf<String?>(null) }
    var dragVisualX by remember { mutableFloatStateOf(0f) }
    var dragVisualY by remember { mutableFloatStateOf(0f) }
    var autoScrollSpeed by remember { mutableFloatStateOf(0f) }
    var savingOrder by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val listState = remember { LazyListState() }

    suspend fun reload() { error = null; try { familias = SupabaseRepository.getFamiliasAdmin() } catch (e: Exception) { error = e.message ?: "No se han podido cargar las familias." } }
    LaunchedEffect(Unit) { reload() }

    LaunchedEffect(Unit) {
        while (true) {
            val speed = autoScrollSpeed
            if (draggedId != null && speed != 0f) listState.scrollBy(speed)
            withFrameNanos { }
        }
    }

    fun persistOrder(ordered: List<Familia>) {
        if (ordered.isEmpty()) return
        savingOrder = true
        scope.launch {
            try { ordered.forEachIndexed { index, familia -> SupabaseRepository.updateFamiliaFields(familia.id, mapOf("orden" to index)) } }
            catch (e: Exception) { error = e.message ?: "No se pudo guardar el orden de las familias."; reload() }
            finally { savingOrder = false }
        }
    }

    fun finishDrag(id: String, pointerY: Float) {
        autoScrollSpeed = 0f
        val current = familias.orEmpty().sortedBy { it.orden }
        val sourceIndex = current.indexOfFirst { it.id == id }
        if (sourceIndex < 0) { draggedId = null; dragVisualX = 0f; dragVisualY = 0f; return }
        val visible = listState.layoutInfo.visibleItemsInfo
        val targetInfo = visible.firstOrNull { info -> pointerY >= info.offset && pointerY < info.offset + info.size }
            ?: visible.minByOrNull { info -> kotlin.math.abs(pointerY - (info.offset + info.size / 2f)) }
        val targetId = targetInfo?.key as? String
        val targetIndex = current.indexOfFirst { it.id == targetId }
        if (targetIndex >= 0 && targetIndex != sourceIndex) {
            val mutable = current.toMutableList()
            val moved = mutable.removeAt(sourceIndex)
            mutable.add(targetIndex.coerceIn(0, mutable.size), moved)
            val ordered = mutable.mapIndexed { index, item -> item.copy(orden = index) }
            familias = ordered
            persistOrder(ordered)
        }
        draggedId = null
        dragVisualX = 0f
        dragVisualY = 0f
    }

    fun pointerYFor(id: String, localY: Float): Float {
        val info = listState.layoutInfo.visibleItemsInfo.firstOrNull { it.key == id }
        return if (info != null) info.offset + info.size / 2f + localY else localY
    }

    fun updateAutoScroll(pointerY: Float) {
        val start = listState.layoutInfo.viewportStartOffset.toFloat()
        val end = listState.layoutInfo.viewportEndOffset.toFloat()
        val edge = 110f
        autoScrollSpeed = when {
            pointerY < start + edge -> -((start + edge - pointerY).coerceAtMost(edge) / edge) * 22f
            pointerY > end - edge -> ((pointerY - (end - edge)).coerceAtMost(edge) / edge) * 22f
            else -> 0f
        }
    }

    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        AdminHeader(showHome = true, onHome = onBackClick)
        ScreenHeader(title = "Familias", count = familias?.size ?: 0, actionText = "+ Añadir", onBack = onBackClick, onAction = onNewFamily)
        when {
            familias == null && error == null -> LoadingState()
            error != null -> ErrorState(error!!)
            else -> LazyColumn(state = listState, modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(1.dp)) {
                items(familias.orEmpty().sortedBy { it.orden }, key = { it.id }) { familia ->
                    val isDragging = draggedId == familia.id
                    FamiliaRow(
                        familia = familia,
                        isDragging = isDragging,
                        dragVisualX = if (isDragging) dragVisualX else 0f,
                        dragVisualY = if (isDragging) dragVisualY else 0f,
                        onClick = { if (draggedId == null) onFamilyClick(familia.id) },
                        onDragStart = { if (!savingOrder) { draggedId = familia.id; dragVisualX = 0f; dragVisualY = 0f } },
                        onDrag = { amountX, amountY, localY ->
                            if (draggedId == familia.id) {
                                dragVisualX += amountX
                                dragVisualY += amountY
                                updateAutoScroll(pointerYFor(familia.id, localY))
                            }
                        },
                        onDragEnd = { if (draggedId == familia.id) finishDrag(familia.id, pointerYFor(familia.id, 0f) + dragVisualY) }
                    )
                }
            }
        }
    }
}

@Composable private fun FamiliaRow(familia: Familia, isDragging: Boolean, dragVisualX: Float, dragVisualY: Float, onClick: () -> Unit, onDragStart: () -> Unit, onDrag: (Float, Float, Float) -> Unit, onDragEnd: () -> Unit) {
    Row(
        Modifier.fillMaxWidth()
            .graphicsLayer { translationX = dragVisualX; translationY = dragVisualY; shadowElevation = if (isDragging) 18f else 0f; alpha = if (isDragging) 0.98f else 1f }
            .background(if (isDragging) MaterialTheme.colorScheme.surfaceContainerHighest else MaterialTheme.colorScheme.surface)
            .border(if (isDragging) 2.dp else 1.dp, if (isDragging) MaterialTheme.colorScheme.primary else AppBorder)
            .padding(horizontal = 16.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(Modifier.weight(1f).clickable(onClick = onClick), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(50.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFFFAF5EE)), contentAlignment = Alignment.Center) {
                if (!familia.foto_url.isNullOrBlank()) AsyncImage(model = familia.foto_url, contentDescription = familia.nombre, modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(10.dp)))
                else Icon(fallbackIcons[familia.nombre] ?: Icons.Default.Image, null, tint = Color(0xFF8C6A48), modifier = Modifier.size(24.dp))
            }
            Text(familia.nombre, Modifier.weight(1f).padding(horizontal = 12.dp), fontSize = 15.sp, lineHeight = 18.sp, fontWeight = FontWeight.ExtraBold, maxLines = 1)
            Box(Modifier.clip(RoundedCornerShape(16.dp)).background(if (familia.activo) SuccessBg else Color(0x149CA3AF)).padding(horizontal = 8.dp, vertical = 4.dp)) { Text(if (familia.activo) "Visible" else "Oculta", color = if (familia.activo) SuccessText else AppMuted, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold) }
        }
        Icon(
            Icons.Default.DragIndicator,
            "Reordenar",
            tint = if (isDragging) MaterialTheme.colorScheme.primary else AppMuted,
            modifier = Modifier.padding(start = 6.dp).size(22.dp).pointerInput(familia.id) {
                detectDragGestures(
                    onDragStart = { onDragStart() },
                    onDragCancel = onDragEnd,
                    onDragEnd = onDragEnd
                ) { change, dragAmount ->
                    change.consume()
                    onDrag(dragAmount.x, dragAmount.y, change.position.y)
                }
            }
        )
    }
}

@Composable private fun LoadingState() { Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() } }
@Composable private fun ErrorState(message: String) { Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) { Text(message, color = MaterialTheme.colorScheme.error, textAlign = TextAlign.Center) } }
