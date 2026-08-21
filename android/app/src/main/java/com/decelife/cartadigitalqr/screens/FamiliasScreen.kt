package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGesturesAfterLongPress
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cake
import androidx.compose.material.icons.filled.DinnerDining
import androidx.compose.material.icons.filled.DragIndicator
import androidx.compose.material.icons.filled.Egg
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.RestaurantMenu
import androidx.compose.material.icons.filled.WineBar
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.input.pointer.consume
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

private val fallbackIcons = mapOf(
    "Tapas" to Icons.Default.RestaurantMenu,
    "Entrantes fríos" to Icons.Default.Restaurant,
    "Entrantes calientes" to Icons.Default.DinnerDining,
    "Pescados" to Icons.Default.Restaurant,
    "Arroces" to Icons.Default.RestaurantMenu,
    "Con dos huevos" to Icons.Default.Egg,
    "Carnes y guisos" to Icons.Default.DinnerDining,
    "Vinos" to Icons.Default.WineBar,
    "Postres" to Icons.Default.Cake
)

@Composable
fun FamiliasScreen(onBackClick: () -> Unit, onNewFamily: () -> Unit, onFamilyClick: (String) -> Unit) {
    var familias by remember { mutableStateOf<List<Familia>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var draggedId by remember { mutableStateOf<String?>(null) }
    var dragAccumulated by remember { mutableStateOf(0f) }
    var savingOrder by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

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
        if (ordered.isEmpty()) return
        savingOrder = true
        scope.launch {
            try { ordered.forEachIndexed { index, familia -> SupabaseRepository.updateFamiliaFields(familia.id, mapOf("orden" to index)) } }
            catch (e: Exception) { error = e.message ?: "No se pudo guardar el orden de las familias."; reload() }
            finally { savingOrder = false; draggedId = null }
        }
    }

    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        AdminHeader(showHome = true, onHome = onBackClick)
        ScreenHeader(title = "Familias", count = familias?.size ?: 0, actionText = "+ Añadir", onBack = onBackClick, onAction = onNewFamily)
        when {
            familias == null && error == null -> LoadingState()
            error != null -> ErrorState(error!!)
            else -> LazyColumn(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(1.dp)) {
                items(familias.orEmpty().sortedBy { it.orden }, key = { it.id }) { familia ->
                    FamiliaRow(
                        familia = familia,
                        onClick = { onFamilyClick(familia.id) },
                        dragging = draggedId == familia.id,
                        onDragStart = { if (!savingOrder) { draggedId = familia.id; dragAccumulated = 0f } },
                        onDrag = { amount, threshold ->
                            if (!savingOrder) {
                                dragAccumulated += amount
                                while (dragAccumulated >= threshold) { moveLocal(familia.id, 1); dragAccumulated -= threshold }
                                while (dragAccumulated <= -threshold) { moveLocal(familia.id, -1); dragAccumulated += threshold }
                            }
                        },
                        onDragEnd = { if (draggedId != null && !savingOrder) persistOrder() }
                    )
                }
            }
        }
    }
}

@Composable
private fun FamiliaRow(familia: Familia, onClick: () -> Unit, dragging: Boolean, onDragStart: () -> Unit, onDrag: (Float, Float) -> Unit, onDragEnd: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surface).border(1.dp, AppBorder).padding(horizontal = 16.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
        Row(Modifier.weight(1f).clickable(onClick = onClick), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(50.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFFFAF5EE)), contentAlignment = Alignment.Center) {
                if (!familia.foto_url.isNullOrBlank()) AsyncImage(model = familia.foto_url, contentDescription = familia.nombre, modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(10.dp)))
                else Icon(fallbackIcons[familia.nombre] ?: Icons.Default.Image, contentDescription = null, tint = Color(0xFF8C6A48), modifier = Modifier.size(24.dp))
            }
            Text(familia.nombre, modifier = Modifier.weight(1f).padding(horizontal = 12.dp), fontSize = 15.sp, lineHeight = 18.sp, fontWeight = FontWeight.ExtraBold, maxLines = 1)
            Box(Modifier.clip(RoundedCornerShape(16.dp)).background(if (familia.activo) SuccessBg else Color(0x149CA3AF)).padding(horizontal = 8.dp, vertical = 4.dp), contentAlignment = Alignment.Center) {
                Text(if (familia.activo) "Visible" else "Oculta", color = if (familia.activo) SuccessText else AppMuted, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold)
            }
        }
        Icon(Icons.Default.DragIndicator, "Reordenar", tint = AppMuted, modifier = Modifier.padding(start = 6.dp).size(22.dp).pointerInput(familia.id) {
            detectDragGesturesAfterLongPress(onDragStart = onDragStart, onDragCancel = onDragEnd, onDragEnd = onDragEnd) { change, dragAmount ->
                change.consume(); onDrag(dragAmount.y, 30.dp.toPx())
            }
        })
    }
}

@Composable private fun LoadingState() { Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() } }

@Composable private fun ErrorState(message: String) { Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) { Text(message, color = MaterialTheme.colorScheme.error, textAlign = TextAlign.Center) } }
