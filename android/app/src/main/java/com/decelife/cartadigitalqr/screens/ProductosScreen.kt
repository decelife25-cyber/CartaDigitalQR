package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.DragIndicator
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
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
import java.util.Locale

private val SpecialColor = Color(0xFFF59E0B)
private val SpecialBackground = Color(0xFFFFF8E8)
private val SuggestedColor = Color(0xFF10B981)
private val SuggestedBackground = Color(0xFFECFBF5)

@Composable
fun ProductosScreen(onBackClick: () -> Unit) {
    var search by remember { mutableStateOf("") }
    var familias by remember { mutableStateOf<List<Familia>?>(null) }
    var products by remember { mutableStateOf<List<Producto>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        try {
            val (loadedFamilies, loadedProducts) = SupabaseRepository.getCatalogo()
            familias = loadedFamilies
            products = loadedProducts
        } catch (e: Exception) {
            error = e.message ?: "No se han podido cargar los productos."
        }
    }

    val familyById = remember(familias) { familias.orEmpty().associateBy { it.id } }
    val filtered = products.orEmpty().filter { it.nombre.contains(search, ignoreCase = true) }

    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        AdminHeader(showHome = true, onHome = onBackClick)
        ScreenHeader(title = "Productos", actionText = "+ Nuevo producto", onBack = onBackClick)

        Column(Modifier.padding(horizontal = 8.dp, vertical = 8.dp)) {
            Row(
                Modifier.fillMaxWidth().height(40.dp).clip(RoundedCornerShape(12.dp)).border(1.dp, AppBorder, RoundedCornerShape(12.dp)).padding(horizontal = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.Search, contentDescription = null, tint = AppMuted, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                BasicTextField(
                    value = search,
                    onValueChange = { search = it },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    textStyle = MaterialTheme.typography.bodyMedium.copy(color = MaterialTheme.colorScheme.onBackground, fontSize = 14.sp),
                    cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                    decorationBox = { inner ->
                        if (search.isEmpty()) Text("Buscar artículos...", color = AppMuted, fontSize = 14.sp)
                        inner()
                    }
                )
                if (search.isNotEmpty()) IconButton(onClick = { search = "" }, modifier = Modifier.size(24.dp)) {
                    Icon(Icons.Default.Clear, contentDescription = "Limpiar", tint = AppMuted, modifier = Modifier.size(16.dp))
                }
            }
            Spacer(Modifier.height(8.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip("Familia: Todas", Modifier.weight(1f))
                FilterChip("Estado: Todos", Modifier.weight(1f))
                Box(Modifier.size(36.dp).clip(RoundedCornerShape(12.dp)).border(1.dp, AppBorder, RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.FilterList, contentDescription = "Filtrar", tint = AppMuted, modifier = Modifier.size(18.dp))
                }
            }
        }

        when {
            products == null && error == null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            error != null -> Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                Text(error!!, color = MaterialTheme.colorScheme.error)
            }
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 16.dp),
                verticalArrangement = Arrangement.spacedBy(1.dp)
            ) {
                items(filtered, key = { it.id }) { product ->
                    ProductRow(product, familyById[product.familia_id]?.nombre ?: "")
                }
            }
        }
    }
}

@Composable
private fun FilterChip(text: String, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier.height(36.dp).clip(RoundedCornerShape(12.dp)).border(1.dp, AppBorder, RoundedCornerShape(12.dp)).padding(horizontal = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text("⌄", color = AppMuted, fontSize = 14.sp)
    }
}

@Composable
private fun ProductRow(product: Producto, family: String) {
    Row(
        Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surface).border(1.dp, AppBorder).padding(horizontal = 12.dp, vertical = 7.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(Modifier.size(50.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFFFAF5EE)), contentAlignment = Alignment.Center) {
            if (!product.foto_url.isNullOrBlank()) {
                AsyncImage(
                    model = product.foto_url,
                    contentDescription = product.nombre,
                    modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(10.dp))
                )
            } else {
                Icon(Icons.Default.Image, contentDescription = null, tint = Color(0xFF8C6A48), modifier = Modifier.size(24.dp))
            }
        }
        Column(Modifier.weight(1f).padding(horizontal = 10.dp)) {
            Text(
                product.nombre,
                fontSize = 15.sp,
                lineHeight = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                maxLines = 3
            )
            if (family.isNotBlank()) {
                Text(family, color = AppMuted, fontSize = 12.sp, fontWeight = FontWeight.Medium, modifier = Modifier.padding(top = 2.dp), maxLines = 1)
            }
            if (product.destacado || product.sugerido) {
                Column(
                    modifier = Modifier.padding(top = 5.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    if (product.destacado) FeatureBadge("ESPECIALIDAD", Icons.Default.Star, SpecialColor, SpecialBackground)
                    if (product.sugerido) FeatureBadge("SUGERENCIA", Icons.Default.Lightbulb, SuggestedColor, SuggestedBackground)
                }
            }
        }
        Column(horizontalAlignment = Alignment.End) {
            Text(String.format(Locale.US, "%.2f €", product.precio), fontSize = 14.sp, fontWeight = FontWeight.ExtraBold)
            Spacer(Modifier.height(4.dp))
            StatusPill(
                if (product.agotado) "Agotado" else "Visible",
                if (product.agotado) Color(0xFFFFE8E8) else SuccessBg,
                if (product.agotado) Color(0xFFDC2626) else SuccessText
            )
        }
        Icon(
            Icons.Default.DragIndicator,
            contentDescription = "Reordenar",
            tint = AppMuted,
            modifier = Modifier.padding(start = 6.dp).size(22.dp)
        )
    }
}

@Composable
private fun FeatureBadge(text: String, icon: ImageVector, color: Color, background: Color) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(14.dp))
            .background(background)
            .border(1.dp, color, RoundedCornerShape(14.dp))
            .padding(horizontal = 7.dp, vertical = 3.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(3.dp)
    ) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(12.dp))
        Text(text, color = color, fontSize = 9.sp, fontWeight = FontWeight.ExtraBold, maxLines = 1, softWrap = false)
    }
}

@Composable
private fun StatusPill(text: String, background: Color, foreground: Color) {
    Box(Modifier.clip(RoundedCornerShape(16.dp)).background(background).padding(horizontal = 8.dp, vertical = 4.dp)) {
        Text(text, color = foreground, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold)
    }
}
