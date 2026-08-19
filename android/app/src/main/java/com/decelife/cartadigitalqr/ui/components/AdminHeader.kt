package com.decelife.cartadigitalqr.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Moon
import androidx.compose.material.icons.filled.QrCode2
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
fun AdminHeader(
    showHome: Boolean = false,
    onHome: (() -> Unit)? = null,
    onQr: () -> Unit = {},
    onTheme: () -> Unit = {},
    onLogout: () -> Unit = {}
) {
    Surface(color = MaterialTheme.colorScheme.surface) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (showHome && onHome != null) {
                    IconButton(onClick = onHome, modifier = Modifier.size(48.dp)) {
                        Icon(Icons.Default.Home, contentDescription = "Panel privado")
                    }
                }
                Text(
                    text = "Panel Privado",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 22.sp
                )
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onQr, modifier = Modifier.size(48.dp)) {
                    Icon(Icons.Default.QrCode2, contentDescription = "Código QR")
                }
                IconButton(onClick = onTheme, modifier = Modifier.size(48.dp)) {
                    Icon(Icons.Default.Moon, contentDescription = "Modo noche")
                }
                IconButton(onClick = onLogout, modifier = Modifier.size(48.dp)) {
                    Icon(Icons.Default.Logout, contentDescription = "Cerrar sesión", tint = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}

@Composable
fun ScreenHeader(
    title: String,
    count: Int? = null,
    actionText: String? = null,
    onBack: () -> Unit,
    onAction: () -> Unit = {}
) {
    Surface(color = MaterialTheme.colorScheme.background) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack, modifier = Modifier.size(48.dp)) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
            }
            Text(
                text = title,
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.ExtraBold
            )
            if (count != null) {
                Text(
                    text = "($count)",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.ExtraBold,
                    modifier = Modifier.width(42.dp)
                )
            }
            if (actionText != null) {
                Button(
                    onClick = onAction,
                    contentPadding = PaddingValues(horizontal = 14.dp),
                    shape = androidx.compose.foundation.shape.RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Orange, contentColor = Color(0xFF111111))
                ) {
                    Text(actionText, fontWeight = FontWeight.ExtraBold)
                }
                Spacer(Modifier.width(8.dp))
            }
        }
    }
}
