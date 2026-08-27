package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FolderCopy
import androidx.compose.material.icons.filled.RestaurantMenu
import androidx.compose.material.icons.filled.SettingsSuggest
import androidx.compose.material.icons.automirrored.filled.ArrowForward
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
fun HomeScreen(onNavigateToFamilias: () -> Unit, onNavigateToProductos: () -> Unit, onNavigateToConfiguracion: () -> Unit) {
    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        AdminHeader()
        Column(Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 8.dp)) {
            Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).border(1.dp, AppBorder, RoundedCornerShape(24.dp)).background(MaterialTheme.colorScheme.surface).padding(horizontal = 20.dp, vertical = 12.dp)) {
                Text("CARTA DIGITAL", style = MaterialTheme.typography.labelSmall, color = AppMuted, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                Text("Panel Privado", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.onBackground, modifier = Modifier.padding(top = 4.dp))
            }
            Spacer(Modifier.height(12.dp))
            Column(Modifier.padding(horizontal = 4.dp)) {
                Text("¿Qué quieres gestionar?", fontSize = 20.sp, lineHeight = 24.sp, fontWeight = FontWeight.ExtraBold)
                Text("Accede directamente a cada parte de la carta.", color = AppMuted, fontSize = 14.sp, lineHeight = 18.sp, modifier = Modifier.padding(top = 4.dp))
            }
            Spacer(Modifier.height(12.dp))
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                HomeSectionItem("Familias", "Organiza las categorías de la carta.", Icons.Filled.FolderCopy, AccentPurple, onNavigateToFamilias)
                HomeSectionItem("Productos", "Crea, edita y ordena los platos.", Icons.Filled.RestaurantMenu, AccentOrange, onNavigateToProductos)
                HomeSectionItem("Configuración", "Ajustes generales de la carta.", Icons.Filled.SettingsSuggest, AccentSlate, onNavigateToConfiguracion)
            }
        }
    }
}

@Composable
private fun HomeSectionItem(title: String, description: String, icon: ImageVector, accentColor: Color, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).border(1.dp, AppBorder, RoundedCornerShape(24.dp)).background(MaterialTheme.colorScheme.surface).clickable(onClick = onClick).padding(horizontal = 16.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(56.dp).clip(RoundedCornerShape(16.dp)).background(accentColor.copy(alpha = 0.10f)), contentAlignment = Alignment.Center) {
            Icon(icon, contentDescription = null, tint = accentColor, modifier = Modifier.size(31.dp))
        }
        Column(Modifier.weight(1f).padding(start = 15.dp)) {
            Text(title, fontSize = 20.sp, lineHeight = 24.sp, fontWeight = FontWeight.ExtraBold)
            Text(description, color = AppMuted, fontSize = 14.sp, lineHeight = 18.sp, modifier = Modifier.padding(top = 3.dp))
        }
        Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = AppMuted, modifier = Modifier.size(22.dp))
    }
}
