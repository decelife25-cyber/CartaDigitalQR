package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.QrCode2
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.decelife.cartadigitalqr.BuildConfig
import com.decelife.cartadigitalqr.data.SupabaseRepository
import com.decelife.cartadigitalqr.models.Configuracion
import com.decelife.cartadigitalqr.ui.components.AdminHeader
import com.decelife.cartadigitalqr.ui.theme.AppBg
import com.decelife.cartadigitalqr.ui.theme.AppBorder
import com.decelife.cartadigitalqr.ui.theme.AppMuted
import com.decelife.cartadigitalqr.ui.theme.AppSurface
import com.decelife.cartadigitalqr.ui.theme.AppSurfaceSoft
import com.decelife.cartadigitalqr.ui.theme.AppText
import com.decelife.cartadigitalqr.ui.theme.OrangePrimary
import kotlinx.coroutines.launch

private const val DEFAULT_CARTA_URL = "https://www.decelife.com/carta-camborio"

@Composable
fun ConfiguracionScreen(onBackClick: () -> Unit, onNavigateToPortadas: () -> Unit) {
    var config by remember { mutableStateOf<Configuracion?>(null) }
    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        try { config = SupabaseRepository.getConfiguracion() }
        catch (e: Exception) { message = e.message ?: "No se ha podido cargar la configuración." }
        finally { loading = false }
    }

    if (loading) { Box(Modifier.fillMaxSize().background(AppBg), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = OrangePrimary) }; return }
    if (config == null) { Column(Modifier.fillMaxSize().background(AppBg)) { AdminHeader(showHome = true, onHome = onBackClick); ScreenBar("Configuración", onBackClick, false, saving) {}; Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(message ?: "No hay una configuración activa.", color = AppMuted, fontSize = 13.sp) } }; return }

    var draft by remember(config!!.id) { mutableStateOf(config!!) }

    fun save() {
        if (saving) return
        saving = true
        scope.launch { try { SupabaseRepository.saveConfiguracion(draft); message = "Cambios guardados correctamente." } catch (e: Exception) { message = e.message ?: "No se pudieron guardar los cambios." } finally { saving = false } }
    }

    Column(Modifier.fillMaxSize().background(AppBg)) {
        AdminHeader(showHome = true, onHome = onBackClick)
        ScreenBar("Configuración", onBackClick, true, saving, ::save)
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 8.dp, vertical = 8.dp).padding(bottom = 70.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SectionCard {
                Text("Restaurante", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText)
                Text("Información que verá el cliente en la carta.", color = AppMuted, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp, bottom = 8.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(7.dp)) { Field("NOMBRE", draft.nombre, { draft = draft.copy(nombre = it) }, Modifier.weight(1f)); Field("TELÉFONO", draft.telefono.orEmpty(), { draft = draft.copy(telefono = it) }, Modifier.weight(1f)) }
                Field("DIRECCIÓN", draft.direccion.orEmpty(), { draft = draft.copy(direccion = it) })
                MultiField("DESCRIPCIÓN", draft.descripcion.orEmpty(), { draft = draft.copy(descripcion = it) }, 58.dp)
                MultiField("HORARIO", draft.horario.orEmpty(), { draft = draft.copy(horario = it) }, 58.dp)
            }

            SectionCard {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.Top) {
                    Column(Modifier.weight(1f)) { Text("Portadas de la carta", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText); Text("Guarda hasta 10 portadas, activa la que quieras y programa cambios por fecha.", color = AppMuted, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp)) }
                    Icon(Icons.Default.Image, null, tint = OrangePrimary, modifier = Modifier.size(18.dp))
                }
                Button(onClick = onNavigateToPortadas, modifier = Modifier.fillMaxWidth().padding(top = 8.dp).height(36.dp), shape = RoundedCornerShape(8.dp), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary, contentColor = Color.White)) { Icon(Icons.Default.CalendarMonth, null, modifier = Modifier.size(16.dp)); Spacer(Modifier.width(6.dp)); Text("Gestionar portadas", fontSize = 13.sp, fontWeight = FontWeight.ExtraBold) }
            }

            SectionCard {
                Text("Código QR de la carta", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText)
                Text("El QR se genera automáticamente con el enlace de la carta. Si usas un dominio propio, el QR puede mantenerse fijo aunque cambie dónde apunta ese dominio.", color = AppMuted, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp, bottom = 8.dp))
                val qrUrl = qrImageUrl(draft.dominio, draft.qr_url)
                BoxWithConstraints(Modifier.fillMaxWidth()) {
                    if (maxWidth < 600.dp) Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) { QrPreview(qrUrl); Spacer(Modifier.height(10.dp)); QrFields(draft, onDraftChange = { draft = it }) }
                    else Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) { QrPreview(qrUrl); Spacer(Modifier.width(14.dp)); QrFields(draft, onDraftChange = { draft = it }, Modifier.weight(1f)) }
                }
            }

            SectionCard { Text("Reserva de mesa", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText); Text("Aplicación externa que se abrirá al pulsar 'Reservar mesa'.", color = AppMuted, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp, bottom = 8.dp)); Field("PROGRAMA DE RESERVAS DE MESA", draft.url_reservas_mesa.orEmpty(), { draft = draft.copy(url_reservas_mesa = it) }) }

            SectionCard {
                Text("Identidad visual", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText); Text("Logo y color principal de la carta.", color = AppMuted, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp, bottom = 8.dp))
                Field("URL DEL LOGOTIPO", draft.logo_url.orEmpty(), { draft = draft.copy(logo_url = it) })
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) { val colorValue = draft.color_principal?.trim().orEmpty().ifBlank { "#c8a96e" }; val previewColor = runCatching { Color(android.graphics.Color.parseColor(colorValue)) }.getOrElse { Color(0xFFC8A96E) }; Box(Modifier.size(38.dp).clip(RoundedCornerShape(8.dp)).background(previewColor).border(1.dp, AppBorder, RoundedCornerShape(8.dp))); Field("COLOR PRINCIPAL", draft.color_principal.orEmpty(), { draft = draft.copy(color_principal = it) }, Modifier.weight(1f)) }
            }

            SectionCard {
                Text("Redes sociales", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText); Text("Enlaces opcionales que puede mostrar la carta.", color = AppMuted, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp, bottom = 8.dp))
                Field("INSTAGRAM", draft.redes_sociales["instagram"].orEmpty(), { draft = draft.withSocial("instagram", it) }); Field("FACEBOOK", draft.redes_sociales["facebook"].orEmpty(), { draft = draft.withSocial("facebook", it) }); Field("WEB", draft.redes_sociales["web"].orEmpty(), { draft = draft.withSocial("web", it) })
            }

            SectionCard { Text("Versión instalada", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText); Text("Información técnica de esta instalación. No es editable.", color = AppMuted, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp, bottom = 8.dp)); InfoRow("Versión", BuildConfig.VERSION_NAME); InfoRow("VersionCode", BuildConfig.VERSION_CODE.toString()); InfoRow("Compilación GitHub", BuildConfig.GITHUB_RUN_NUMBER) }
        }
    }
    if (message != null) AlertDialog(onDismissRequest = { message = null }, title = { Text("Configuración") }, text = { Text(message.orEmpty()) }, confirmButton = { TextButton(onClick = { message = null }) { Text("Aceptar", color = OrangePrimary) } })
}

private fun Configuracion.withSocial(key: String, value: String): Configuracion = copy(redes_sociales = redes_sociales.toMutableMap().apply { this[key] = value })
@Composable private fun QrPreview(qrUrl: String?) { Box(Modifier.size(150.dp).clip(RoundedCornerShape(10.dp)).background(Color.White).border(1.dp, AppBorder, RoundedCornerShape(10.dp)), contentAlignment = Alignment.Center) { if (qrUrl != null) AsyncImage(model = qrUrl, contentDescription = "Código QR de la carta", modifier = Modifier.fillMaxSize().padding(8.dp)) else Icon(Icons.Default.QrCode2, null, tint = Color.Black, modifier = Modifier.size(74.dp)) } }
@Composable private fun QrFields(draft: Configuracion, onDraftChange: (Configuracion) -> Unit, modifier: Modifier = Modifier) { Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(2.dp)) { Field("DOMINIO ESTABLE DE LA CARTA (OPCIONAL)", draft.dominio.orEmpty(), { onDraftChange(draft.copy(dominio = it)) }); Text("Enlace que abre el QR", color = AppMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold); Text(publicCartaUrl(draft.dominio), color = AppText, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.fillMaxWidth(), softWrap = true); Field("IMAGEN QR PERSONALIZADA (OPCIONAL)", draft.qr_url.orEmpty(), { onDraftChange(draft.copy(qr_url = it)) }) } }
@Composable private fun InfoRow(label: String, value: String) { Row(Modifier.fillMaxWidth().padding(vertical = 3.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { Text(label, color = AppMuted, fontSize = 10.sp, fontWeight = FontWeight.Bold); Text(value, color = AppText, fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, textAlign = TextAlign.End, modifier = Modifier.padding(start = 12.dp)) } }
@Composable private fun ScreenBar(title: String, onBack: () -> Unit, showSave: Boolean, saving: Boolean, onSave: () -> Unit = {}) { Row(Modifier.fillMaxWidth().height(44.dp), verticalAlignment = Alignment.CenterVertically) { IconButton(onClick = onBack, modifier = Modifier.size(36.dp)) { Icon(Icons.Default.ArrowBack, "Volver", tint = AppText, modifier = Modifier.size(20.dp)) }; Text(title, Modifier.weight(1f), fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = AppText, maxLines = 1, overflow = TextOverflow.Ellipsis); if (showSave) Button(onClick = onSave, enabled = !saving, modifier = Modifier.height(32.dp), shape = RoundedCornerShape(8.dp), contentPadding = PaddingValues(horizontal = 10.dp), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary, contentColor = Color.White)) { Icon(Icons.Default.Save, null, modifier = Modifier.size(14.dp)); Spacer(Modifier.width(4.dp)); Text(if (saving) "Guardando…" else "Guardar", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold) } } }
@Composable private fun SectionCard(content: @Composable ColumnScope.() -> Unit) { Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).border(1.dp, AppBorder, RoundedCornerShape(12.dp)).background(AppSurface).padding(10.dp), content = content) }
@Composable private fun Field(label: String, value: String, onChange: (String) -> Unit, modifier: Modifier = Modifier) { Column(modifier.padding(bottom = 7.dp)) { Text(label, color = AppMuted, fontSize = 9.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 3.dp)); BasicTextField(value = value, onValueChange = onChange, modifier = Modifier.fillMaxWidth().height(36.dp).border(1.dp, AppBorder, RoundedCornerShape(9.dp)).background(AppSurfaceSoft, RoundedCornerShape(9.dp)).padding(horizontal = 9.dp), singleLine = true, textStyle = TextStyle(color = AppText, fontSize = 12.sp, lineHeight = 16.sp), cursorBrush = SolidColor(OrangePrimary), decorationBox = { inner -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.CenterStart) { if (value.isEmpty()) Text("...", color = AppMuted, fontSize = 12.sp); inner() } }) } }
@Composable private fun MultiField(label: String, value: String, onChange: (String) -> Unit, height: androidx.compose.ui.unit.Dp) { Column(Modifier.fillMaxWidth().padding(bottom = 7.dp)) { Text(label, color = AppMuted, fontSize = 9.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 3.dp)); BasicTextField(value = value, onValueChange = onChange, modifier = Modifier.fillMaxWidth().height(height).border(1.dp, AppBorder, RoundedCornerShape(9.dp)).background(AppSurfaceSoft, RoundedCornerShape(9.dp)).padding(horizontal = 9.dp, vertical = 6.dp), maxLines = 4, textStyle = TextStyle(color = AppText, fontSize = 11.sp, lineHeight = 15.sp), cursorBrush = SolidColor(OrangePrimary)) } }
private fun publicCartaUrl(domain: String?): String { val raw = domain?.trim().orEmpty(); if (raw.isBlank()) return DEFAULT_CARTA_URL; val normalized = if (raw.startsWith("http://", true) || raw.startsWith("https://")) raw else "https://$raw"; return normalized.trimEnd('/') }
private fun qrImageUrl(domain: String?, configuredQr: String?): String? { configuredQr?.trim()?.takeIf { it.isNotBlank() }?.let { return it }; return "https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=${java.net.URLEncoder.encode(publicCartaUrl(domain), "UTF-8")}" }
