package com.decelife.cartadigitalqr.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.QrCode2
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.decelife.cartadigitalqr.data.SupabaseRepository
import com.decelife.cartadigitalqr.models.Configuracion
import com.decelife.cartadigitalqr.ui.theme.AppBorder
import com.decelife.cartadigitalqr.ui.theme.AppMuted
import com.decelife.cartadigitalqr.ui.theme.AppSurface
import com.decelife.cartadigitalqr.ui.theme.AppSurfaceSoft
import com.decelife.cartadigitalqr.ui.theme.AppText
import com.decelife.cartadigitalqr.ui.theme.OrangePrimary
import java.net.URLEncoder

@Composable
fun QrCartaDialog(onClose: () -> Unit) {
    var config by remember { mutableStateOf<Configuracion?>(null) }
    var copied by remember { mutableStateOf(false) }
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        config = runCatching { SupabaseRepository.getConfiguracion() }.getOrNull()
    }

    val publicUrl = publicCartaUrl(config?.dominio)
    val qrUrl = config?.qr_url?.trim().takeIf { !it.isNullOrBlank() }
        ?: "https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=${URLEncoder.encode(publicUrl, "UTF-8")}"

    AlertDialog(
        onDismissRequest = onClose,
        containerColor = AppSurface,
        title = {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Row(Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(40.dp).background(OrangePrimary.copy(alpha = .10f), RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.QrCode2, null, tint = OrangePrimary, modifier = Modifier.size(23.dp))
                    }
                    Spacer(Modifier.width(8.dp))
                    Column {
                        Text("Código QR", color = AppText, fontSize = 18.sp)
                        Text("Comparte la carta con tus clientes.", color = AppMuted, fontSize = 10.sp)
                    }
                }
                IconButton(onClick = onClose, modifier = Modifier.size(36.dp)) { Icon(Icons.Default.Close, "Cerrar", tint = AppMuted) }
            }
        },
        text = {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.fillMaxWidth().background(Color.White, RoundedCornerShape(16.dp)).padding(14.dp), contentAlignment = Alignment.Center) {
                    AsyncImage(model = qrUrl, contentDescription = "Código QR para abrir la carta", modifier = Modifier.size(250.dp))
                }
                Text("Escanea este código para abrir la carta digital.", color = AppMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 10.dp))
                Row(Modifier.fillMaxWidth().padding(top = 10.dp).background(AppSurfaceSoft, RoundedCornerShape(12.dp)).padding(horizontal = 10.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(publicUrl, color = AppText, fontSize = 10.sp, modifier = Modifier.weight(1f))
                    IconButton(onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("Enlace de la carta", publicUrl))
                        copied = true
                    }, modifier = Modifier.size(32.dp)) { Icon(Icons.Default.ContentCopy, if (copied) "Copiado" else "Copiar", tint = AppText, modifier = Modifier.size(15.dp)) }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(publicUrl))) },
                colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary, contentColor = Color(0xFF111111)),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(Icons.Default.OpenInNew, null, modifier = Modifier.size(16.dp)); Spacer(Modifier.width(6.dp)); Text("Abrir carta", fontSize = 12.sp)
            }
        },
        dismissButton = {
            TextButton(onClick = onClose) { Text(if (copied) "Copiado" else "Cerrar", color = AppMuted) }
        }
    )
}

private fun publicCartaUrl(domain: String?): String {
    val raw = domain?.trim().orEmpty()
    if (raw.isBlank()) return "https://cartadigitalqr.com/"
    val normalized = if (raw.startsWith("http://", true) || raw.startsWith("https://", true)) raw else "https://$raw"
    return normalized.trimEnd('/')
}
