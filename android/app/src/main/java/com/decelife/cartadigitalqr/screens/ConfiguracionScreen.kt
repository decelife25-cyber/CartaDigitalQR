package com.decelife.cartadigitalqr.screens

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Environment
import android.provider.MediaStore
import android.widget.Toast
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
import androidx.compose.ui.platform.LocalContext
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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private const val DEFAULT_CARTA_URL = "https://www.decelife.com/carta-camborio"

@Composable
fun ConfiguracionScreen(onBackClick: () -> Unit, onNavigateToPortadas: () -> Unit) {
    var config by remember { mutableStateOf<Configuracion?>(null) }
    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var showSaveConfirmation by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        try { config = SupabaseRepository.getConfiguracion() }
        catch (e: Exception) { message = e.message ?: "No se ha podido cargar la configuración." }
        finally { loading = false }
    }

    if (loading) { Box(Modifier.fillMaxSize().background(AppBg), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = OrangePrimary) }; return }
    if (config == null) { Column(Modifier.fillMaxSize().background(AppBg)) { AdminHeader(showHome = true, onHome = onBackClick); ScreenBar("Configuración", onBackClick, false, saving, false) {}; Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(message ?: "No hay una configuración activa.", color = AppMuted, fontSize = 13.sp) } }; return }

    var draft by remember(config!!.id) { mutableStateOf(config!!) }
    val hasChanges = draft != config

    fun saveNow() {
        if (saving || !hasChanges) return
        saving = true
        scope.launch { try { SupabaseRepository.saveConfiguracion(draft); config = draft; message = "Cambios guardados correctamente." } catch (e: Exception) { message = e.message ?: "No se pudieron guardar los cambios." } finally { saving = false } }
    }

    Column(Modifier.fillMaxSize().background(AppBg)) {
        AdminHeader(showHome = true, onHome = onBackClick)
        ScreenBar("Configuración", onBackClick, true, saving, hasChanges) { if (hasChanges && !saving) showSaveConfirmation = true }
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
                    Column(Modifier.weight(1f)) { Text("Portadas de la carta", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText); Text("Guarda hasta 10 portadas, activa la que quieras y programa cambios por fecha y hora.", color = AppMuted, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp)) }
                    Icon(Icons.Default.Image, null, tint = OrangePrimary, modifier = Modifier.size(18.dp))
                }
                Button(onClick = onNavigateToPortadas, modifier = Modifier.fillMaxWidth().padding(top = 8.dp).height(36.dp), shape = RoundedCornerShape(8.dp), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary, contentColor = Color.White)) { Icon(Icons.Default.CalendarMonth, null, modifier = Modifier.size(16.dp)); Spacer(Modifier.width(6.dp)); Text("Gestionar portadas", fontSize = 13.sp, fontWeight = FontWeight.ExtraBold) }
            }
            SectionCard {
                Text("Código QR de la carta", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText)
                Text("El QR se genera con el enlace de la carta que indiques abajo.", color = AppMuted, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp, bottom = 8.dp))
                val qrUrl = qrImageUrl(draft.dominio, draft.qr_url)
                BoxWithConstraints(Modifier.fillMaxWidth()) {
                    if (maxWidth < 600.dp) Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) { QrPreview(qrUrl); Spacer(Modifier.height(8.dp)); TextButton(onClick = { downloadQrPng(context, qrUrl, scope) }, enabled = qrUrl != null, contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)) { Text("Descargar QR en PNG", color = OrangePrimary, fontSize = 11.sp, fontWeight = FontWeight.ExtraBold) }; Spacer(Modifier.height(2.dp)); QrFields(draft, onDraftChange = { draft = it }) }
                    else Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) { Column(horizontalAlignment = Alignment.CenterHorizontally) { QrPreview(qrUrl); TextButton(onClick = { downloadQrPng(context, qrUrl, scope) }, enabled = qrUrl != null, contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)) { Text("Descargar QR en PNG", color = OrangePrimary, fontSize = 11.sp, fontWeight = FontWeight.ExtraBold) } }; Spacer(Modifier.width(14.dp)); QrFields(draft, onDraftChange = { draft = it }, Modifier.weight(1f)) }
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
    if (showSaveConfirmation) AlertDialog(onDismissRequest = { if (!saving) showSaveConfirmation = false }, title = { Text("Guardar cambios") }, text = { Text("¿Quieres guardar los cambios realizados?") }, confirmButton = { TextButton(onClick = { showSaveConfirmation = false; saveNow() }, enabled = !saving) { Text("Guardar", color = OrangePrimary, fontWeight = FontWeight.ExtraBold) } }, dismissButton = { TextButton(onClick = { showSaveConfirmation = false }, enabled = !saving) { Text("Cancelar", color = AppMuted, fontWeight = FontWeight.ExtraBold) } })
    if (message != null) AlertDialog(onDismissRequest = { message = null }, title = { Text("Configuración") }, text = { Text(message.orEmpty()) }, confirmButton = { TextButton(onClick = { message = null }) { Text("Aceptar", color = OrangePrimary) } })
}

private fun Configuracion.withSocial(key: String, value: String): Configuracion = copy(redes_sociales = redes_sociales.toMutableMap().apply { this[key] = value })
@Composable private fun QrPreview(qrUrl: String?) { Box(Modifier.size(150.dp).clip(RoundedCornerShape(10.dp)).background(Color.White).border(1.dp, AppBorder, RoundedCornerShape(10.dp)), contentAlignment = Alignment.Center) { if (qrUrl != null) AsyncImage(model = qrUrl, contentDescription = "Código QR de la carta", modifier = Modifier.fillMaxSize().padding(8.dp)) else Icon(Icons.Default.QrCode2, null, tint = Color.Black, modifier = Modifier.size(74.dp)) } }
@Composable private fun QrFields(draft: Configuracion, onDraftChange: (Configuracion) -> Unit, modifier: Modifier = Modifier) { Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(2.dp)) { Field("ENLACE DE LA CARTA (QR)", draft.dominio.orEmpty(), { onDraftChange(draft.copy(dominio = it)) }); Text("Este es el enlace que abre el QR.", color = AppMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold); Field("IMAGEN QR PERSONALIZADA (OPCIONAL)", draft.qr_url.orEmpty(), { onDraftChange(draft.copy(qr_url = it)) }) } }
@Composable private fun InfoRow(label: String, value: String) { Row(Modifier.fillMaxWidth().padding(vertical = 3.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { Text(label, color = AppMuted, fontSize = 10.sp, fontWeight = FontWeight.Bold); Text(value, color = AppText, fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, textAlign = TextAlign.End, modifier = Modifier.padding(start = 12.dp)) } }
@Composable private fun ScreenBar(title: String, onBack: () -> Unit, showSave: Boolean, saving: Boolean, enabled: Boolean = true, onSave: () -> Unit = {}) { Row(Modifier.fillMaxWidth().height(44.dp), verticalAlignment = Alignment.CenterVertically) { IconButton(onClick = onBack, modifier = Modifier.size(36.dp)) { Icon(Icons.Default.ArrowBack, "Volver", tint = AppText, modifier = Modifier.size(20.dp)) }; Text(title, Modifier.weight(1f), fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = AppText, maxLines = 1, overflow = TextOverflow.Ellipsis); if (showSave) Button(onClick = onSave, enabled = enabled && !saving, modifier = Modifier.height(32.dp), shape = RoundedCornerShape(8.dp), contentPadding = PaddingValues(horizontal = 10.dp), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary, contentColor = Color.White, disabledContainerColor = AppSurfaceSoft, disabledContentColor = AppMuted)) { Icon(Icons.Default.Save, null, modifier = Modifier.size(14.dp)); Spacer(Modifier.width(4.dp)); Text(if (saving) "Guardando…" else "Guardar", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold) } } }
@Composable private fun SectionCard(content: @Composable ColumnScope.() -> Unit) { Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).border(1.dp, AppBorder, RoundedCornerShape(12.dp)).background(AppSurface).padding(10.dp), content = content) }
@Composable private fun Field(label: String, value: String, onChange: (String) -> Unit, modifier: Modifier = Modifier) { Column(modifier.padding(bottom = 7.dp)) { Text(label, color = AppMuted, fontSize = 9.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 3.dp)); BasicTextField(value = value, onValueChange = onChange, modifier = Modifier.fillMaxWidth().height(36.dp).border(1.dp, AppBorder, RoundedCornerShape(9.dp)).background(AppSurfaceSoft, RoundedCornerShape(9.dp)).padding(horizontal = 9.dp), singleLine = true, textStyle = TextStyle(color = AppText, fontSize = 12.sp, lineHeight = 16.sp), cursorBrush = SolidColor(OrangePrimary), decorationBox = { inner -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.CenterStart) { if (value.isEmpty()) Text("...", color = AppMuted, fontSize = 12.sp); inner() } }) } }
@Composable private fun MultiField(label: String, value: String, onChange: (String) -> Unit, height: androidx.compose.ui.unit.Dp) { Column(Modifier.fillMaxWidth().padding(bottom = 7.dp)) { Text(label, color = AppMuted, fontSize = 9.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 3.dp)); BasicTextField(value = value, onValueChange = onChange, modifier = Modifier.fillMaxWidth().height(height).border(1.dp, AppBorder, RoundedCornerShape(9.dp)).background(AppSurfaceSoft, RoundedCornerShape(9.dp)).padding(horizontal = 9.dp, vertical = 6.dp), maxLines = 4, textStyle = TextStyle(color = AppText, fontSize = 11.sp, lineHeight = 15.sp), cursorBrush = SolidColor(OrangePrimary)) } }
private fun publicCartaUrl(domain: String?): String { val raw = domain?.trim().orEmpty(); if (raw.isBlank()) return DEFAULT_CARTA_URL; val normalized = if (raw.startsWith("http://", true) || raw.startsWith("https://")) raw else "https://$raw"; return normalized.trimEnd('/') }
private fun qrImageUrl(domain: String?, configuredQr: String?): String? { configuredQr?.trim()?.takeIf { it.isNotBlank() }?.let { return it }; return "https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=${java.net.URLEncoder.encode(publicCartaUrl(domain), "UTF-8")}" }
private fun downloadQrPng(context: Context, qrUrl: String?, scope: kotlinx.coroutines.CoroutineScope) {
    if (qrUrl.isNullOrBlank()) return
    scope.launch(Dispatchers.IO) {
        var outputUri: Uri? = null
        try {
            val connection = (URL(qrUrl).openConnection() as HttpURLConnection).apply { connectTimeout = 15000; readTimeout = 15000; requestMethod = "GET"; connect() }
            if (connection.responseCode !in 200..299) throw IllegalStateException("No se pudo descargar el QR (HTTP ${connection.responseCode}).")
            val bytes = connection.inputStream.use { it.readBytes() }
            connection.disconnect()
            if (bytes.isEmpty()) throw IllegalStateException("El archivo QR está vacío.")
            val fileName = "carta_qr_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())}.png"
            val values = ContentValues().apply { put(MediaStore.Downloads.DISPLAY_NAME, fileName); put(MediaStore.Downloads.MIME_TYPE, "image/png"); put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS); put(MediaStore.Downloads.IS_PENDING, 1) }
            val resolver = context.contentResolver
            outputUri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values) ?: throw IllegalStateException("No se pudo crear el archivo en Descargas.")
            resolver.openOutputStream(outputUri!!)?.use { it.write(bytes) } ?: throw IllegalStateException("No se pudo escribir el archivo QR.")
            resolver.update(outputUri!!, ContentValues().apply { put(MediaStore.Downloads.IS_PENDING, 0) }, null, null)
            withContext(Dispatchers.Main) { Toast.makeText(context, "QR descargado en Descargas", Toast.LENGTH_LONG).show() }
        } catch (e: Exception) {
            outputUri?.let { runCatching { context.contentResolver.delete(it, null, null) } }
            withContext(Dispatchers.Main) { Toast.makeText(context, "No se pudo descargar el QR: ${e.message ?: "error desconocido"}", Toast.LENGTH_LONG).show() }
        }
    }
}
