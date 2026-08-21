package com.decelife.cartadigitalqr.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.DarkMode
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Logout
import androidx.compose.material.icons.outlined.QrCode2
import androidx.compose.material.icons.outlined.WbSunny
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Orange = Color(0xFFFF7A00)

@Composable
fun AdminHeader(showHome: Boolean = false, onHome: (() -> Unit)? = null, onQr: () -> Unit = {}, onTheme: () -> Unit = {}, onLogout: () -> Unit = {}) {
    val shared = LocalAdminActions.current
    val homeAction = { shared.goHome() }
    val qrAction = if (onQr === {}) shared.showQr else onQr
    val themeAction = if (onTheme === {}) shared.toggleTheme else onTheme
    val logoutAction = if (onLogout === {}) shared.logout else onLogout

    Surface(color = MaterialTheme.colorScheme.surface) {
        Row(
            Modifier.fillMaxWidth().height(64.dp).padding(horizontal = 16.dp),
            Arrangement.SpaceBetween,
            Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (showHome) IconButton(onClick = homeAction, Modifier.size(40.dp)) { Icon(Icons.Outlined.Home, "Panel privado", modifier = Modifier.size(22.dp)) }
                Text("Panel Privado", fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = qrAction, Modifier.size(40.dp)) { Icon(Icons.Outlined.QrCode2, "Código QR", modifier = Modifier.size(22.dp)) }
                IconButton(onClick = themeAction, Modifier.size(40.dp)) {
                    Icon(if (shared.isNight) Icons.Outlined.WbSunny else Icons.Outlined.DarkMode, if (shared.isNight) "Modo día" else "Modo noche", modifier = Modifier.size(22.dp))
                }
                IconButton(onClick = logoutAction, Modifier.size(40.dp)) { Icon(Icons.Outlined.Logout, "Cerrar sesión", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(22.dp)) }
            }
        }
    }
}

@Composable
fun ScreenHeader(title: String, count: Int? = null, actionText: String? = null, onBack: () -> Unit, onAction: () -> Unit = {}) {
    Surface(color = MaterialTheme.colorScheme.background) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack, Modifier.size(48.dp)) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Volver") }
            Text(title, Modifier.weight(1f), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
            if (count != null) Text("($count)", color = MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.ExtraBold, modifier = Modifier.width(42.dp))
            if (actionText != null) {
                Button(onClick = onAction, contentPadding = PaddingValues(horizontal = 14.dp), shape = androidx.compose.foundation.shape.RoundedCornerShape(14.dp), colors = ButtonDefaults.buttonColors(containerColor = Orange, contentColor = Color(0xFF111111))) { Text(actionText, fontWeight = FontWeight.ExtraBold) }
                Spacer(Modifier.width(8.dp))
            }
        }
    }
}
