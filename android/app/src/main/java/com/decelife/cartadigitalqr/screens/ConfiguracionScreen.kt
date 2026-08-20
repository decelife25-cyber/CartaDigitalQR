package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Image
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.decelife.cartadigitalqr.ui.components.AdminHeader
import com.decelife.cartadigitalqr.ui.components.ScreenHeader
import com.decelife.cartadigitalqr.ui.theme.AppBorder
import com.decelife.cartadigitalqr.ui.theme.AppMuted
import com.decelife.cartadigitalqr.ui.theme.AppSurfaceSoft

private val Orange = Color(0xFFFF7A00)

@Composable
fun ConfiguracionScreen(onBackClick: () -> Unit) {
    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        AdminHeader(showHome = true, onHome = onBackClick)
        ScreenHeader(title = "Configuración", actionText = "Guardar", onBack = onBackClick)
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 16.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            SectionCard {
                Text("Restaurante", fontSize = 25.sp, fontWeight = FontWeight.ExtraBold)
                Text("Información que verá el cliente en la carta.", color = AppMuted, fontSize = 16.sp, modifier = Modifier.padding(top = 4.dp, bottom = 20.dp))
                Field("NOMBRE", "Taberna Camborio")
                Field("TELÉFONO", "+34 956254532")
                Field("DIRECCIÓN", "Calle Real, 184 - San Fernando (Cádiz)")
                Field("DESCRIPCIÓN", "")
                Field("HORARIO", "Lunes a Jueves: 9:00-00:00 | Viernes y Sábado: 9:00-02:00 | Domingo: 9:00-00:00")
            }
            SectionCard {
                Text("Portada de la carta", fontSize = 25.sp, fontWeight = FontWeight.ExtraBold)
                Text("Cambia la imagen cuando quieras. La nueva portada queda activa inmediatamente.", color = AppMuted, fontSize = 16.sp, lineHeight = 21.sp, modifier = Modifier.padding(top = 4.dp))
                Box(Modifier.fillMaxWidth().padding(top = 14.dp).height(190.dp).clip(RoundedCornerShape(16.dp)).background(Color(0xFF2E382F)), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Image, null, tint = Color(0xFFE8D8B8), modifier = Modifier.size(48.dp))
                        Text("Portada actual", color = Color(0xFFE8D8B8), fontWeight = FontWeight.Bold, fontSize = 17.sp, modifier = Modifier.padding(top = 8.dp))
                    }
                }
                Button(onClick = {}, Modifier.fillMaxWidth().padding(top = 12.dp).height(48.dp), colors = ButtonDefaults.buttonColors(containerColor = Orange, contentColor = Color(0xFF111111)), shape = RoundedCornerShape(10.dp)) { Text("Sustituir portada", fontWeight = FontWeight.ExtraBold) }
            }
            SectionCard {
                Text("Reserva de mesa", fontSize = 25.sp, fontWeight = FontWeight.ExtraBold)
                Text("Aplicación externa que se abrirá al pulsar 'Reservar mesa'.", color = AppMuted, fontSize = 16.sp, modifier = Modifier.padding(top = 4.dp, bottom = 18.dp))
                Field("PROGRAMA DE RESERVAS DE MESA", "")
            }
            SectionCard {
                Text("Código QR de la carta", fontSize = 25.sp, fontWeight = FontWeight.ExtraBold)
                Text("El QR se genera automáticamente con el enlace de la carta.", color = AppMuted, fontSize = 16.sp, lineHeight = 21.sp, modifier = Modifier.padding(top = 4.dp, bottom = 16.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(132.dp).clip(RoundedCornerShape(14.dp)).background(Color.White).border(1.dp, AppBorder, RoundedCornerShape(14.dp)), contentAlignment = Alignment.Center) { Text("QR", fontSize = 38.sp, fontWeight = FontWeight.Black, color = Color.Black) }
                    Text("https://decelife.com/carta", Modifier.padding(start = 18.dp), color = AppMuted, fontSize = 14.sp)
                }
            }
            SectionCard {
                Text("Identidad visual", fontSize = 25.sp, fontWeight = FontWeight.ExtraBold)
                Text("Logo y color principal de la carta.", color = AppMuted, fontSize = 16.sp, modifier = Modifier.padding(top = 4.dp, bottom = 18.dp))
                Field("URL DEL LOGOTIPO", "")
                Field("COLOR PRINCIPAL", "#c8a96e")
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun SectionCard(content: @Composable ColumnScope.() -> Unit) {
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).border(1.dp, AppBorder, RoundedCornerShape(20.dp)).background(MaterialTheme.colorScheme.surface).padding(18.dp), content = content)
}

@Composable
private fun Field(label: String, value: String) {
    Column(Modifier.fillMaxWidth().padding(bottom = 16.dp)) {
        Text(label, color = AppMuted, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(bottom = 7.dp))
        Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).border(1.dp, AppBorder, RoundedCornerShape(12.dp)).background(AppSurfaceSoft).padding(horizontal = 16.dp, vertical = 14.dp), contentAlignment = Alignment.CenterStart) {
            Text(value, fontSize = 17.sp, color = MaterialTheme.colorScheme.onBackground, lineHeight = 23.sp)
        }
    }
}
