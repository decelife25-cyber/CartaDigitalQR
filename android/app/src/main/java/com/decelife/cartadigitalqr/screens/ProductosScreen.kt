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
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.decelife.cartadigitalqr.ui.components.AdminHeader
import com.decelife.cartadigitalqr.ui.components.ScreenHeader
import com.decelife.cartadigitalqr.ui.theme.AppBorder
import com.decelife.cartadigitalqr.ui.theme.AppMuted
import com.decelife.cartadigitalqr.ui.theme.SuccessBg
import com.decelife.cartadigitalqr.ui.theme.SuccessText

private data class ProductVisual(
    val name: String,
    val family: String,
    val price: String,
    val visible: Boolean = true,
    val soldOut: Boolean = false,
    val special: Boolean = false,
    val suggested: Boolean = false
)

private val products = listOf(
    ProductVisual("Revuelto de bacalao dorado", "Con dos huevos", "11.40 €"),
    ProductVisual("Ensalada de aguacate, gambones y salsa tártara", "Entrantes fríos", "14.00 €", special = true, suggested = true),
    ProductVisual("Lagriñitas de pollo", "Tapas", "4.00 €"),
    ProductVisual("Croquetas de rabo de toro", "Entrantes calientes", "10.00 €"),
    ProductVisual("Hamburguesa de retinto", "Carnes y guisos", "11.40 €"),
    ProductVisual("Ventresca de atún a la plancha", "Pescados", "24.00 €"),
    ProductVisual("Boquerones fritos", "Pescados", "12.00 €")
)

@Composable
fun ProductosScreen(onBackClick: () -> Unit) {
    var search by remember { mutableStateOf("") }
    val filtered = products.filter { it.name.contains(search, ignoreCase = true) }

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

        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(bottom = 16.dp), verticalArrangement = Arrangement.spacedBy(1.dp)) {
            items(filtered) { product -> ProductRow(product) }
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
private fun ProductRow(product: ProductVisual) {
    Row(
        Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surface).border(1.dp, AppBorder).padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(Modifier.size(40.dp).clip(RoundedCornerShape(8.dp)).background(Color(0xFFFAF5EE)), contentAlignment = Alignment.Center) {
            Icon(Icons.Default.Inventory2, contentDescription = null, tint = Color(0xFF8C6A48), modifier = Modifier.size(20.dp))
        }
        Column(Modifier.weight(1f).padding(horizontal = 12.dp)) {
            Text(product.name, fontSize = 15.sp, lineHeight = 19.sp, fontWeight = FontWeight.ExtraBold)
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 2.dp)) {
                Text(product.family, color = AppMuted, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                if (product.special) {
                    Spacer(Modifier.width(4.dp))
                    Icon(Icons.Default.Star, contentDescription = "Especialidad", tint = Color(0xFFF59E0B), modifier = Modifier.size(12.dp))
                }
                if (product.suggested) {
                    Spacer(Modifier.width(4.dp))
                    Icon(Icons.Default.Lightbulb, contentDescription = "Sugerencia", tint = Color(0xFF10B981), modifier = Modifier.size(12.dp))
                }
            }
        }
        Column(horizontalAlignment = Alignment.End) {
            Text(product.price, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold)
            Spacer(Modifier.height(4.dp))
            StatusPill("Visible", SuccessBg, SuccessText)
        }
        Icon(Icons.Default.MoreVert, contentDescription = "Reordenar", tint = AppMuted, modifier = Modifier.padding(start = 8.dp).size(24.dp))
    }
}

@Composable
private fun StatusPill(text: String, background: Color, foreground: Color) {
    Box(Modifier.clip(RoundedCornerShape(16.dp)).background(background).padding(horizontal = 8.dp, vertical = 4.dp)) {
        Text(text, color = foreground, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold)
    }
}
