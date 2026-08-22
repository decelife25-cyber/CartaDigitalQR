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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.decelife.cartadigitalqr.BuildConfig
import com.decelife.cartadigitalqr.data.SupabaseRepository
import com.decelife.cartadigitalqr.models.Configuracion
import com.decelife.cartadigitalqr.ui.components.AdminHeader
import com.decelife.cartadigitalqr.ui.components.ScreenHeader
import com.decelife.cartadigitalqr.ui.theme.AppBorder
import com.decelife.cartadigitalqr.ui.theme.AppMuted
import com.decelife.cartadigitalqr.ui.theme.AppSurfaceSoft

private val Orange = Color(0xFFFF7A00)

@Composable
fun ConfiguracionScreen(onBackClick: () -> Unit) {
    var config by remember { mutableStateOf<Configuracion?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        try {
            config = SupabaseRepository.getConfiguracion()
        } catch (e: Exception) {
            error = e.message ?: "No se ha podido cargar la configuración."
        } finally {
            loading = false
        }
    }

    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        AdminHeader(showHome = true, onHome = onBackClick)
        ScreenHeader(title = "Configuración", actionText = "Guardar", onBack = onBackClick)

        when {
            loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            error != null -> Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                Text(error!!, color = MaterialTheme.colorScheme.error)
            }
            config == null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No hay una configuración activa.", color = AppMuted)
            }
            else -> ConfigContent(config!!)
        }
    }
}

@Composable
private fun ConfigContent(config: Configuracion) {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        SectionCard {
            Text("Restaurante", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
            Text("Información que verá el cliente en la carta.", color = AppMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 2.dp, bottom = 10.dp))
            Field("NOMBRE", config.nombre)
            Field("TELÉFONO", config.telefono.orEmpty())
            Field("DIRECCIÓN", config.direccion.orEmpty())
            Field("DESCRIPCIÓN", config.descripcion.orEmpty())
            Field("HORARIO", config.horario.orEmpty())
        }
        SectionCard {
            Text("Portada de la carta", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
            Text("Cambia la imagen cuando quieras.", color = AppMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 2.dp))
            Box(
                Modifier.fillMaxWidth().padding(top = 8.dp).height(180.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFF2E382F)),
                contentAlignment = Alignment.Center
            ) {
                if (!config.portada_url.isNullOrBlank()) {
                    AsyncImage(
                        model = config.portada_url,
                        contentDescription = "Portada actual",
                        modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(10.dp))
                    )
                } else {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Image, null, tint = Color(0xFFE8D8B8), modifier = Modifier.size(30.dp))
                        Text("Portada actual", color = Color(0xFFE8D8B8), fontWeight = FontWeight.Bold, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
            Button(onClick = {}, Modifier.fillMaxWidth().padding(top = 8.dp).height(36.dp), colors = ButtonDefaults.buttonColors(containerColor = Orange, contentColor = Color(0xFF111111)), shape = RoundedCornerShape(8.dp), contentPadding = PaddingValues(horizontal = 10.dp)) {
                Text("Sustituir portada", fontSize = 13.sp, fontWeight = FontWeight.ExtraBold)
            }
        }
        SectionCard {
            Text("Reserva de mesa", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
            Text("Aplicación externa que se abrirá al pulsar 'Reservar mesa'.", color = AppMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 2.dp, bottom = 10.dp))
            Field("PROGRAMA DE RESERVAS DE MESA", config.url_reservas_mesa.orEmpty())
        }
        SectionCard {
            Text("Código QR de la carta", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
            Spacer(Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(120.dp).clip(RoundedCornerShape(10.dp)).background(Color.White).border(1.dp, AppBorder, RoundedCornerShape(10.dp)), contentAlignment = Alignment.Center) {
                    if (!config.qr_url.isNullOrBlank()) {
                        AsyncImage(model = config.qr_url, contentDescription = "Código QR", modifier = Modifier.fillMaxSize().padding(8.dp))
                    } else {
                        Text("QR", fontSize = 32.sp, fontWeight = FontWeight.Black, color = Color.Black)
                    }
                }
                Text(config.dominio.orEmpty(), Modifier.padding(start = 12.dp), color = AppMuted, fontSize = 12.sp)
            }
        }
        SectionCard {
            Text("Identidad visual", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
            Text("Logo y color principal de la carta.", color = AppMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 2.dp, bottom = 10.dp))
            Field("URL DEL LOGOTIPO", config.logo_url.orEmpty())
            Field("COLOR PRINCIPAL", config.color_principal.orEmpty())
        }
        SectionCard {
            Text("Información de la aplicación", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
            Text("Datos técnicos de esta instalación. No son editables.", color = AppMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 2.dp, bottom = 10.dp))
            Field("VERSIÓN INSTALADA", BuildConfig.VERSION_NAME)
            Field("CÓDIGO ANDROID", BuildConfig.VERSION_CODE.toString())
            Field("BUILD GITHUB", BuildConfig.GITHUB_BUILD_NUMBER)
        }
        Spacer(Modifier.height(8.dp))
    }
}

@Composable
private fun SectionCard(content: @Composable ColumnScope.() -> Unit) {
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).border(1.dp, AppBorder, RoundedCornerShape(12.dp)).background(MaterialTheme.colorScheme.surface).padding(10.dp),
        content = content
    )
}

// Release-build verification marker; layout remains identical to main.
@Composable
private fun Field(label: String, value: String) {
    Column(Modifier.fillMaxWidth().padding(bottom = 8.dp)) {
        Text(label, color = AppMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 4.dp))
        Box(
            Modifier.fillMaxWidth().height(32.dp).clip(RoundedCornerShape(8.dp)).border(1.dp, AppBorder, RoundedCornerShape(8.dp)).background(AppSurfaceSoft).padding(horizontal = 12.dp),
            contentAlignment = Alignment.CenterStart
        ) {
            Text(
                value.ifEmpty { "..." },
                fontSize = 14.sp,
                lineHeight = 18.sp,
                color = if (value.isEmpty()) AppMuted else MaterialTheme.colorScheme.onBackground,
                maxLines = 1
            )
        }
    }
}
