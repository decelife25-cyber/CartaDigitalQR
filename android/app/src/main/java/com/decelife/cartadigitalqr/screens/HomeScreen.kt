package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.Settings
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
import com.decelife.cartadigitalqr.ui.theme.AccentOrange
import com.decelife.cartadigitalqr.ui.theme.AccentPurple
import com.decelife.cartadigitalqr.ui.theme.AccentSlate
import com.decelife.cartadigitalqr.ui.theme.AppBorder
import com.decelife.cartadigitalqr.ui.theme.AppMuted

@Composable
fun HomeScreen(
    onNavigateToFamilias: () -> Unit,
    onNavigateToProductos: () -> Unit,
    onNavigateToConfiguracion: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        AdminHeader()
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(28.dp))
                    .border(1.dp, AppBorder, RoundedCornerShape(28.dp))
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(horizontal = 20.dp, vertical = 20.dp)
            ) {
                Text(
                    text = "CARTA DIGITAL",
                    color = AppMuted,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.4.sp,
                    fontSize = 12.sp
                )
                Text(
                    text = "Panel Privado",
                    fontSize = 34.sp,
                    lineHeight = 38.sp,
                    fontWeight = FontWeight.ExtraBold,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            Spacer(Modifier.height(28.dp))

            Column(modifier = Modifier.padding(horizontal = 4.dp)) {
                Text(
                    text = "¿Qué quieres gestionar?",
                    fontSize = 28.sp,
                    lineHeight = 32.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Text(
                    text = "Accede directamente a cada parte de la carta.",
                    color = AppMuted,
                    fontSize = 18.sp,
                    lineHeight = 24.sp,
                    modifier = Modifier.padding(top = 6.dp)
                )
            }

            Spacer(Modifier.height(28.dp))

            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                HomeSectionItem("Familias", "Organiza las categorías de la carta.", Icons.Filled.FolderOpen, AccentPurple, onNavigateToFamilias)
                HomeSectionItem("Productos", "Crea, edita y ordena los platos.", Icons.Filled.Inventory2, AccentOrange, onNavigateToProductos)
                HomeSectionItem("Configuración", "Ajustes generales de la carta.", Icons.Filled.Settings, AccentSlate, onNavigateToConfiguracion)
            }
        }
    }
}

@Composable
private fun HomeSectionItem(
    title: String,
    description: String,
    icon: ImageVector,
    accentColor: Color,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(28.dp))
            .border(1.dp, AppBorder, RoundedCornerShape(28.dp))
            .background(MaterialTheme.colorScheme.surface)
            .clickable(onClick = onClick)
            .padding(24.dp),
        verticalAlignment = Alignment.Top
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(accentColor.copy(alpha = 0.10f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = accentColor, modifier = Modifier.size(30.dp))
            }
            Spacer(Modifier.height(24.dp))
            Text(title, fontSize = 25.sp, lineHeight = 30.sp, fontWeight = FontWeight.ExtraBold)
            Text(description, color = AppMuted, fontSize = 17.sp, lineHeight = 22.sp, modifier = Modifier.padding(top = 6.dp))
        }
        Icon(
            Icons.AutoMirrored.Filled.ArrowForward,
            contentDescription = null,
            tint = AppMuted,
            modifier = Modifier.size(28.dp)
        )
    }
}
