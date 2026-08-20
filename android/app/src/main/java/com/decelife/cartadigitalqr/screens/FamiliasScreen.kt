package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cake
import androidx.compose.material.icons.filled.DinnerDining
import androidx.compose.material.icons.filled.Egg
import androidx.compose.material.icons.filled.LocalBar
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.RestaurantMenu
import androidx.compose.material.icons.filled.WineBar
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.decelife.cartadigitalqr.ui.components.AdminHeader
import com.decelife.cartadigitalqr.ui.components.ScreenHeader
import com.decelife.cartadigitalqr.ui.theme.AppBorder
import com.decelife.cartadigitalqr.ui.theme.AppMuted
import com.decelife.cartadigitalqr.ui.theme.SuccessBg
import com.decelife.cartadigitalqr.ui.theme.SuccessText

private data class FamiliaVisual(val nombre: String, val icon: ImageVector)

private val familias = listOf(
    FamiliaVisual("Tapas", Icons.Default.RestaurantMenu),
    FamiliaVisual("Entrantes fríos", Icons.Default.Restaurant),
    FamiliaVisual("Entrantes calientes", Icons.Default.DinnerDining),
    FamiliaVisual("Pescados", Icons.Default.Restaurant),
    FamiliaVisual("Arroces", Icons.Default.RestaurantMenu),
    FamiliaVisual("Con dos huevos", Icons.Default.Egg),
    FamiliaVisual("Carnes y guisos", Icons.Default.DinnerDining),
    FamiliaVisual("Vinos", Icons.Default.WineBar),
    FamiliaVisual("Postres", Icons.Default.Cake)
)

@Composable
fun FamiliasScreen(onBackClick: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)
    ) {
        AdminHeader(showHome = true, onHome = onBackClick)
        ScreenHeader(title = "Familias", count = familias.size, actionText = "+ Añadir", onBack = onBackClick)

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(1.dp)
        ) {
            itemsIndexed(familias) { _, familia -> FamiliaRow(familia) }
        }
    }
}

@Composable
private fun FamiliaRow(familia: FamiliaVisual) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface)
            .border(1.dp, AppBorder)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(Color(0xFFFAF5EE)),
            contentAlignment = Alignment.Center
        ) {
            Icon(familia.icon, contentDescription = null, tint = Color(0xFF8C6A48), modifier = Modifier.size(34.dp))
        }
        Text(
            familia.nombre,
            modifier = Modifier.weight(1f).padding(horizontal = 18.dp),
            fontSize = 22.sp,
            lineHeight = 26.sp,
            fontWeight = FontWeight.ExtraBold
        )
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(22.dp))
                .background(SuccessBg)
                .padding(horizontal = 14.dp, vertical = 9.dp),
            contentAlignment = Alignment.Center
        ) {
            Text("Visible", color = SuccessText, fontSize = 13.sp, fontWeight = FontWeight.ExtraBold)
        }
        Icon(
            Icons.Default.MoreVert,
            contentDescription = "Reordenar",
            tint = AppMuted,
            modifier = Modifier.size(30.dp).padding(start = 8.dp)
        )
    }
}
