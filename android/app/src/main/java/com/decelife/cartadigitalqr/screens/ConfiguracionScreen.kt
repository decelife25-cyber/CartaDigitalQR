package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Image
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.decelife.cartadigitalqr.BuildConfig
import com.decelife.cartadigitalqr.data.ConfiguracionAdminRepository
import com.decelife.cartadigitalqr.data.SupabaseRepository
import com.decelife.cartadigitalqr.models.Configuracion
import com.decelife.cartadigitalqr.ui.components.AdminHeader
import com.decelife.cartadigitalqr.ui.components.ScreenHeader
import com.decelife.cartadigitalqr.ui.theme.AppBorder
import com.decelife.cartadigitalqr.ui.theme.AppMuted
import com.decelife.cartadigitalqr.ui.theme.AppSurfaceSoft
import kotlinx.coroutines.launch

@Composable
fun ConfiguracionScreen(onBackClick: () -> Unit) {
    var config by remember { mutableStateOf<Configuracion?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var saved by remember { mutableStateOf(false) }
    var saving by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        try { config = SupabaseRepository.getConfiguracion() }
        catch (e: Exception) { error = e.message ?: "No se ha podido cargar la configuración." }
        finally { loading = false }
    }

    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        AdminHeader(showHome = true, onHome = onBackClick)
        when {
            loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            error != null && config == null -> Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) { Text(error!!, color = MaterialTheme.colorScheme.error) }
            config == null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("No hay una configuración activa.", color = AppMuted) }
            else -> {
                ScreenHeader(
                    title = "Configuración",
                    actionText = if (saving) "Guardando…" else "Guardar",
                    onBack = onBackClick,
                    onAction = {
                        if (!saving) scope.launch {
                            saving = true; saved = false; error = null
                            try {
                                ConfiguracionAdminRepository.save(ConfiguracionForm.current)
                                config = ConfiguracionForm.current
                                saved = true
                            } catch (e: Exception) {
                                error = e.message ?: "No se ha podido guardar la configuración."
                            } finally { saving = false }
                        }
                    }
                )
                ConfigContent(config!!, onFormChanged = { ConfiguracionForm.current = it }, saved = saved, error = error)
            }
        }
    }
}

private object ConfiguracionForm {
    var current: Configuracion = Configuracion("", "", null, null, null, null, null, null, null, null, null, null)
}

@Composable
private fun ConfigContent(config: Configuracion, onFormChanged: (Configuracion) -> Unit, saved: Boolean, error: String?) {
    var nombre by remember(config.id) { mutableStateOf(config.nombre) }
    var telefono by remember(config.id) { mutableStateOf(config.telefono.orEmpty()) }
    var direccion by remember(config.id) { mutableStateOf(config.direccion.orEmpty()) }
    var descripcion by remember(config.id) { mutableStateOf(config.descripcion.orEmpty()) }
    var horario by remember(config.id) { mutableStateOf(config.horario.orEmpty()) }
    var logoUrl by remember(config.id) { mutableStateOf(config.logo_url.orEmpty()) }
    var colorPrincipal by remember(config.id) { mutableStateOf(config.color_principal.orEmpty()) }
    var qrUrl by remember(config.id) { mutableStateOf(config.qr_url.orEmpty()) }
    var dominio by remember(config.id) { mutableStateOf(config.dominio.orEmpty()) }
    var reservasUrl by remember(config.id) { mutableStateOf(config.url_reservas_mesa.orEmpty()) }
    var portadaUrl by remember(config.id) { mutableStateOf(config.portada_url.orEmpty()) }

    fun form() = Configuracion(config.id, nombre, telefono, direccion, descripcion, horario, logoUrl, colorPrincipal, qrUrl, dominio, reservasUrl, portadaUrl)
    LaunchedEffect(nombre, telefono, direccion, descripcion, horario, logoUrl, colorPrincipal, qrUrl, dominio, reservasUrl, portadaUrl) { onFormChanged(form()) }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (saved) StatusMessage("✓ Configuración guardada", Color(0xFF2E8B57))
        if (!error.isNullOrBlank()) StatusMessage(error, MaterialTheme.colorScheme.error)

        SectionCard {
            Text("Restaurante", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
            Text("Información que verá el cliente en la carta.", color = AppMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 2.dp, bottom = 10.dp))
            EditableField("NOMBRE", nombre) { nombre = it }
            EditableField("TELÉFONO", telefono) { telefono = it }
            EditableField("DIRECCIÓN", direccion) { direccion = it }
            EditableField("DESCRIPCIÓN", descripcion, minLines = 2) { descripcion = it }
            EditableField("HORARIO", horario, minLines = 2) { horario = it }
        }

        SectionCard {
            Text("Portada de la carta", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
            Text("La portada actual se conserva; su sustitución se mantiene pendiente de conectar al selector nativo.", color = AppMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp))
            Box(Modifier.fillMaxWidth().padding(top = 8.dp).height(180.dp).clip(RoundedCornerShape(10.dp)).background(Color(0xFF2E382F)), contentAlignment = Alignment.Center) {
                if (portadaUrl.isNotBlank()) AsyncImage(model = portadaUrl, contentDescription = "Portada actual", modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(10.dp)))
                else Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.Image, null, tint = Color(0xFFE8D8B8), modifier = Modifier.size(30.dp))
                    Text("Portada actual", color = Color(0xFFE8D8B8), fontWeight = FontWeight.Bold, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
                }
            }
            EditableField("URL DE LA PORTADA", portadaUrl) { portadaUrl = it }
        }

        SectionCard {
            Text("Reserva de mesa", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
            Text("Aplicación externa que se abrirá al pulsar 'Reservar mesa'.", color = AppMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 2.dp, bottom = 10.dp))
            EditableField("PROGRAMA DE RESERVAS DE MESA", reservasUrl) { reservasUrl = it }
        }

        SectionCard {
            Text("Código QR de la carta", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
            Spacer(Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(120.dp).clip(RoundedCornerShape(10.dp)).background(Color.White).border(1.dp, AppBorder, RoundedCornerShape(10.dp)), contentAlignment = Alignment.Center) {
                    if (qrUrl.isNotBlank()) AsyncImage(model = qrUrl, contentDescription = "Código QR", modifier = Modifier.fillMaxSize().padding(8.dp)) else Text("QR", fontSize = 32.sp, fontWeight = FontWeight.Black, color = Color.Black)
                }
                Column(Modifier.weight(1f).padding(start = 12.dp)) {
                    EditableField("DOMINIO ESTABLE DE LA CARTA", dominio) { dominio = it }
                    EditableField("IMAGEN QR PERSONALIZADA", qrUrl) { qrUrl = it }
                }
            }
        }

        SectionCard {
            Text("Identidad visual", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
            Text("Logo y color principal de la carta.", color = AppMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 2.dp, bottom = 10.dp))
            EditableField("URL DEL LOGOTIPO", logoUrl) { logoUrl = it }
            EditableField("COLOR PRINCIPAL", colorPrincipal) { colorPrincipal = it }
        }
        VersionFooter()
    }
}

@Composable
private fun EditableField(label: String, value: String, minLines: Int = 1, onChange: (String) -> Unit) {
    Column(Modifier.fillMaxWidth().padding(bottom = 8.dp)) {
        Text(label, color = AppMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 4.dp))
        BasicTextField(value = value, onValueChange = onChange, singleLine = minLines == 1, minLines = minLines, textStyle = LocalTextStyle.current.copy(fontSize = 14.sp, lineHeight = 18.sp, color = MaterialTheme.colorScheme.onBackground), modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).border(1.dp, AppBorder, RoundedCornerShape(8.dp)).background(AppSurfaceSoft).padding(horizontal = 12.dp, vertical = if (minLines == 1) 7.dp else 8.dp))
    }
}

@Composable
private fun StatusMessage(text: String, color: Color) { Text(text, color = color, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 2.dp)) }

@Composable
private fun VersionFooter() {
    Column(Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text("Versión instalada", color = AppMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        Text(BuildConfig.VERSION_NAME, color = AppMuted, fontSize = 12.sp)
    }
}

@Composable
private fun SectionCard(content: @Composable ColumnScope.() -> Unit) {
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).border(1.dp, AppBorder, RoundedCornerShape(12.dp)).background(MaterialTheme.colorScheme.surface).padding(10.dp), content = content)
}
