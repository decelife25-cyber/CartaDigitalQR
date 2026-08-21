package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGesturesAfterLongPress
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.animateItemPlacement
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

private val fallbackIcons = mapOf("Tapas" to Icons.Default.RestaurantMenu, "Entrantes fríos" to Icons.Default.Restaurant, "Entrantes calientes" to Icons.Default.DinnerDining, "Pescados" to Icons.Default.Restaurant, "Arroces" to Icons.Default.RestaurantMenu, "Con dos huevos" to Icons.Default.Egg, "Carnes y guisos" to Icons.Default.DinnerDining, "Vinos" to Icons.Default.WineBar, "Postres" to Icons.Default.Cake)

@Composable
fun FamiliasScreen(onBackClick: () -> Unit, onNewFamily: () -> Unit, onFamilyClick: (String) -> Unit) {
    var familias by remember { mutableStateOf<List<Familia>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var draggedId by remember { mutableStateOf<String?>(null) }
    var dragAccumulated by remember { mutableStateOf(0f) }
    var dragVisualOffset by remember { mutableStateOf(0f) }
    var dragPointerY by remember { mutableStateOf(0f) }
    var savingOrder by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val listState = remember { LazyListState() }

    suspend fun reload() {
        error = null
        try { familias = SupabaseRepository.getFamiliasAdmin() }
        catch (e: Exception) { error = e.message ?: "No se han podido cargar las familias." }
    }
    LaunchedEffect(Unit) { reload() }

    fun moveLocal(id: String, direction: Int) {
        familias = familias?.let { current ->
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
        val ordered = familias.orEmpty().sortedBy { it.orden }
        if (ordered.isEmpty() || savingOrder) return
        // Liberar inmediatamente el elemento arrastrado: al soltar ya no debe quedar seleccionado.
        draggedId = null
        dragVisualOffset = 0f
        dragAccumulated = 0f
        savingOrder = true
        scope.launch {
            try {
                ordered.forEachIndexed { index, familia ->
                    SupabaseRepository.updateFamiliaFields(familia.id, mapOf("orden" to index))
                }
            } catch (e: Exception) {
                error = e.message ?: "No se pudo guardar el orden de las familias."
                reload()
            } finally { savingOrder = false }
        }
    }

    fun handleDrag(amount: Float, threshold: Float, pointerY: Float, id: String) {
        if (savingOrder || draggedId != id) return
        dragAccumulated += amount
        dragVisualOffset += amount
        dragPointerY = pointerY
        while (dragAccumulated >= threshold) {
            moveLocal(id, 1)
            dragAccumulated -= threshold
            dragVisualOffset -= threshold
        }
        while (dragAccumulated <= -threshold) {
            moveLocal(id, -1)
            dragAccumulated += threshold
            dragVisualOffset += threshold
        }
        val viewportEnd = listState.layoutInfo.viewportEndOffset.toFloat()
        val edge = 110f
        val scrollAmount = when {
            pointerY < edge -> -18f
            viewportEnd > 0f && pointerY > viewportEnd - edge -> 18f
            else -> 0f
        }
        if (scrollAmount != 0f) scope.launch { listState.scrollBy(scrollAmount) }
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
                        dragVisualOffset = if (isDragging) dragVisualOffset else 0f,
                        onClick = { if (draggedId == null && !savingOrder) onFamilyClick(familia.id) },
                        onDragStart = {
                            if (!savingOrder) {
                                draggedId = familia.id
                                dragAccumulated = 0f
                                dragVisualOffset = 0f
                            }
                        },
                        onDrag = { amount, threshold, pointerY -> handleDrag(amount, threshold, pointerY, familia.id) },
                        onDragEnd = { if (draggedId == familia.id) persistOrder() }
                    )
                }
            }
        }
    }
}

@Composable
private fun FamiliaRow(familia: Familia, isDragging: Boolean, dragVisualOffset: Float, onClick: () -> Unit, onDragStart: () -> Unit, onDrag: (Float, Float, Float) -> Unit, onDragEnd: () -> Unit) {
    Row(
        Modifier.fillMaxWidth()
            .animateItemPlacement()
            .graphicsLayer { translationY = dragVisualOffset; shadowElevation = if (isDragging) 18f else 0f; alpha = if (isDragging) 0.98f else 1f }
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
            Box(Modifier.clip(RoundedCornerShape(16.dp)).background(if (familia.activo) SuccessBg else Color(0x149CA3AF)).padding(horizontal = 8.dp, vertical = 4.dp)) {
                Text(if (familia.activo) "Visible" else "Oculta", color = if (familia.activo) SuccessText else AppMuted, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold)
            }
        }
        Icon(
            Icons.Default.DragIndicator, "Reordenar", tint = if (isDragging) MaterialTheme.colorScheme.primary else AppMuted,
            modifier = Modifier.padding(start = 6.dp).size(22.dp).pointerInput(familia.id, isDragging) {
                detectDragGesturesAfterLongPress(
                    onDragStart = { onDragStart() },
                    onDragCancel = onDragEnd,
                    onDragEnd = onDragEnd
                ) { change, dragAmount ->
                    onDrag(dragAmount.y, 76.dp.toPx(), change.position.y)
                }
            }
        )
    }
}

@Composable private fun LoadingState() { Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() } }
@Composable private fun ErrorState(message: String) { Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) { Text(message, color = MaterialTheme.colorScheme.error, textAlign = TextAlign.Center) } }
