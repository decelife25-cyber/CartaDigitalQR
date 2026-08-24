package com.decelife.cartadigitalqr.screens

import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
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
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.decelife.cartadigitalqr.BuildConfig
import com.decelife.cartadigitalqr.data.SupabaseRepository
import com.decelife.cartadigitalqr.models.Configuracion
import com.decelife.cartadigitalqr.ui.components.AdminHeader
import com.decelife.cartadigitalqr.ui.theme.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

@Composable
fun ConfiguracionScreen(onBackClick: () -> Unit, onOpenPortadas: () -> Unit) {
    var config by remember { mutableStateOf<Configuracion?>(null) }
    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var downloading by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var confirmSave by remember { mutableStateOf(false) }
    var confirmDownload by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        try { config = SupabaseRepository.getConfiguracion() }
        catch (e: Exception) { message = e.message ?: "No se ha podido cargar la configuración." }
        finally { loading = false }
    }

    if (loading) { Box(Modifier.fillMaxSize().background(AppBg), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = OrangePrimary) }; return }
    val loaded = config ?: run {
        Column(Modifier.fillMaxSize().background(AppBg)) { AdminHeader(showHome = true, onHome = onBackClick); ScreenBar("Configuración", onBackClick, false, false, false) {}; Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(message ?: "No hay una configuración activa.", color = AppMuted, fontSize = 13.sp) } }
        return
    }

    var draft by remember(loaded.id) { mutableStateOf(loaded) }
    fun normalized(c: Configuracion) = c.copy(
        nombre = c.nombre.trim(), telefono = c.telefono?.trim()?.ifBlank { null }, direccion = c.direccion?.trim()?.ifBlank { null },
        descripcion = c.descripcion?.trim()?.ifBlank { null }, horario = c.horario?.trim()?.ifBlank { null }, logo_url = c.logo_url?.trim()?.ifBlank { null },
        color_principal = c.color_principal?.trim()?.ifBlank { null }, qr_url = c.qr_url?.trim()?.ifBlank { null }, dominio = c.dominio?.trim()?.ifBlank { null },
        url_reservas_mesa = c.url_reservas_mesa?.trim()?.ifBlank { null }, portada_url = c.portada_url?.trim()?.ifBlank { null }, redes_sociales = c.redes_sociales.mapValues { it.value.trim() }
    )
    val dirty = normalized(draft) != normalized(loaded)
    val qrLinkValid = !draft.dominio?.trim().isNullOrEmpty()

    fun save() {
        if (!dirty || saving || !qrLinkValid) { if (!qrLinkValid) message = "El enlace QR para abrir la carta es obligatorio. Sin ese enlace no se puede generar un QR válido."; return }
        saving = true; message = null
        scope.launch {
            try { val next = normalized(draft); SupabaseRepository.saveConfiguracion(next); config = next; draft = next; message = "Cambios guardados correctamente." }
            catch (e: Exception) { message = e.message ?: "No se pudieron guardar los cambios." }
            finally { saving = false; confirmSave = false }
        }
    }

    val qrUrl = qrImageUrl(draft.dominio, draft.qr_url)
    val createQrFile = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("image/png")) { uri: Uri? ->
        if (uri == null) { downloading = false; return@rememberLauncherForActivityResult }
        scope.launch {
            try {
                val bytes = downloadBytes(qrUrl ?: error("Configura primero el enlace QR obligatorio."))
                writeFile(context, uri, bytes)
                message = "QR descargado correctamente."
            } catch (e: Exception) {
                message = e.message ?: "No se pudo descargar el QR."
            } finally { downloading = false }
        }
    }

    Column(Modifier.fillMaxSize().background(AppBg)) {
        AdminHeader(showHome = true, onHome = onBackClick)
        ScreenBar("Configuración", onBackClick, true, saving || downloading, dirty && qrLinkValid && !saving && !downloading) { confirmSave = true }
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 8.dp, vertical = 8.dp).padding(bottom = 70.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SectionCard {
                Text("Restaurante", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText)
                Text("Información que verá el cliente en la carta.", color = AppMuted, fontSize = 9.sp)
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(7.dp)) { Field("NOMBRE", draft.nombre, { draft = draft.copy(nombre = it) }, Modifier.weight(1f)); Field("TELÉFONO", draft.telefono.orEmpty(), { draft = draft.copy(telefono = it) }, Modifier.weight(1f)) }
                Field("DIRECCIÓN", draft.direccion.orEmpty(), { draft = draft.copy(direccion = it) })
                MultiField("DESCRIPCIÓN", draft.descripcion.orEmpty(), { draft = draft.copy(descripcion = it) }, 58.dp)
                MultiField("HORARIO", draft.horario.orEmpty(), { draft = draft.copy(horario = it) }, 58.dp)
            }

            SectionCard {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.Top) { Column(Modifier.weight(1f)) { Text("Portada de la carta", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText); Text("Gestiona la biblioteca de portadas y su programación.", color = AppMuted, fontSize = 9.sp) }; Icon(Icons.Default.Image, null, tint = OrangePrimary, modifier = Modifier.size(18.dp)) }
                Box(Modifier.fillMaxWidth().padding(top = 8.dp).aspectRatio(16f / 9f).clip(RoundedCornerShape(10.dp)).background(AppSurfaceSoft).border(1.dp, AppBorder, RoundedCornerShape(10.dp)), contentAlignment = Alignment.Center) { if (!draft.portada_url.isNullOrBlank()) AsyncImage(model = draft.portada_url, contentDescription = "Portada actual", modifier = Modifier.fillMaxSize(), contentScale = androidx.compose.ui.layout.ContentScale.Fit) else Icon(Icons.Default.Image, null, tint = AppMuted, modifier = Modifier.size(30.dp)) }
                Button(onClick = onOpenPortadas, enabled = !saving, modifier = Modifier.fillMaxWidth().padding(top = 8.dp).height(36.dp), shape = RoundedCornerShape(8.dp), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary, contentColor = Color.White)) { Icon(Icons.Default.Collections, null, modifier = Modifier.size(16.dp)); Spacer(Modifier.width(6.dp)); Text("Gestor de portadas", fontSize = 13.sp, fontWeight = FontWeight.ExtraBold) }
            }

            SectionCard {
                Text("Código QR de la carta", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText)
                Text("El QR se genera con el enlace que introduzcas. Ese enlace es obligatorio.", color = AppMuted, fontSize = 9.sp)
                Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) { QrPreview(qrUrl); QrDownloadButton(!downloading && qrUrl != null) { confirmDownload = true }; QrFields(draft) { draft = it } }
            }

            SectionCard { Text("Reserva de mesa", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText); Text("Aplicación externa que se abrirá al pulsar 'Reservar mesa'.", color = AppMuted, fontSize = 9.sp); Field("PROGRAMA DE RESERVAS DE MESA", draft.url_reservas_mesa.orEmpty(), { draft = draft.copy(url_reservas_mesa = it) }) }
            SectionCard { Text("Identidad visual", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText); Text("Logo y color principal de la carta.", color = AppMuted, fontSize = 9.sp); Field("URL DEL LOGOTIPO", draft.logo_url.orEmpty(), { draft = draft.copy(logo_url = it) }); Field("COLOR PRINCIPAL", draft.color_principal.orEmpty(), { draft = draft.copy(color_principal = it) }) }
            SectionCard { Text("Redes sociales", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText); Text("Enlaces opcionales que puede mostrar la carta.", color = AppMuted, fontSize = 9.sp); Field("INSTAGRAM", draft.redes_sociales["instagram"].orEmpty(), { draft = draft.withSocial("instagram", it) }); Field("FACEBOOK", draft.redes_sociales["facebook"].orEmpty(), { draft = draft.withSocial("facebook", it) }); Field("WEB", draft.redes_sociales["web"].orEmpty(), { draft = draft.withSocial("web", it) }) }
            SectionCard { Text("Versión instalada", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText); Text("Información técnica de esta instalación. No es editable.", color = AppMuted, fontSize = 9.sp); InfoRow("Versión", BuildConfig.VERSION_NAME); InfoRow("VersionCode", BuildConfig.VERSION_CODE.toString()); InfoRow("Compilación GitHub", BuildConfig.GITHUB_RUN_NUMBER) }
        }
    }

    if (confirmSave) AlertDialog(onDismissRequest = { confirmSave = false }, title = { Text("Guardar cambios") }, text = { Text("¿Quieres guardar los cambios realizados en la configuración?") }, dismissButton = { TextButton(onClick = { confirmSave = false }) { Text("Cancelar") } }, confirmButton = { TextButton(onClick = { save() }) { Text("Guardar", color = OrangePrimary) } })
    if (confirmDownload) AlertDialog(onDismissRequest = { confirmDownload = false }, title = { Text("Descargar QR") }, text = { Text("Se va a descargar el código QR de la carta. ¿Quieres continuar?") }, dismissButton = { TextButton(onClick = { confirmDownload = false }) { Text("Cancelar") } }, confirmButton = { TextButton(onClick = { confirmDownload = false; downloading = true; createQrFile.launch("carta-qr.png") }) { Text("Descargar", color = OrangePrimary) } })
    if (message != null) AlertDialog(onDismissRequest = { message = null }, title = { Text("Configuración") }, text = { Text(message.orEmpty()) }, confirmButton = { TextButton(onClick = { message = null }) { Text("Aceptar", color = OrangePrimary) } })
}

private fun Configuracion.withSocial(key: String, value: String): Configuracion = copy(redes_sociales = redes_sociales.toMutableMap().apply { this[key] = value })

private fun qrImageUrl(domain: String?, custom: String?): String? { val target = publicCartaUrl(domain); if (target.isBlank()) return null; return custom?.trim()?.takeIf { it.isNotBlank() } ?: "https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=${Uri.encode(target)}" }
private fun publicCartaUrl(domain: String?): String { val raw = domain?.trim().orEmpty(); if (raw.isBlank()) return ""; val normalized = if (raw.startsWith("http://", true) || raw.startsWith("https://", true)) raw else "https://$raw"; return normalized.trimEnd('/') }
private suspend fun downloadBytes(url: String): ByteArray = withContext(Dispatchers.IO) { val connection = (URL(url).openConnection() as HttpURLConnection).apply { connectTimeout = 15000; readTimeout = 15000; requestMethod = "GET" }; try { if (connection.responseCode !in 200..299) error("No se pudo descargar el QR."); val contentType = connection.contentType?.lowercase().orEmpty(); if (!contentType.startsWith("image/")) error("El servidor no ha devuelto una imagen válida para el QR."); connection.inputStream.use { it.readBytes() }.also { bytes -> if (bytes.isEmpty()) error("El archivo QR recibido está vacío.") } } finally { connection.disconnect() } }
private suspend fun writeFile(context: Context, uri: Uri, bytes: ByteArray) = withContext(Dispatchers.IO) { context.contentResolver.openOutputStream(uri)?.use { output -> output.write(bytes); output.flush() } ?: error("No se pudo crear el archivo gráfico del QR.") }

@Composable private fun QrPreview(qrUrl: String?) { Box(Modifier.size(150.dp).clip(RoundedCornerShape(10.dp)).background(Color.White).border(1.dp, AppBorder, RoundedCornerShape(10.dp)), contentAlignment = Alignment.Center) { if (qrUrl != null) AsyncImage(model = qrUrl, contentDescription = "Código QR de la carta", modifier = Modifier.fillMaxSize().padding(8.dp)) else Text("Falta el enlace QR obligatorio", color = AppMuted, fontSize = 10.sp, textAlign = TextAlign.Center, modifier = Modifier.padding(12.dp)) } }
@Composable private fun QrDownloadButton(enabled: Boolean, onClick: () -> Unit) { TextButton(onClick = onClick, enabled = enabled) { Icon(Icons.Default.Download, null, modifier = Modifier.size(16.dp)); Spacer(Modifier.width(5.dp)); Text("Descargar QR", fontSize = 11.sp, fontWeight = FontWeight.Bold) } }
@Composable private fun QrFields(draft: Configuracion, onChange: (Configuracion) -> Unit) { Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(2.dp)) { Field("ENLACE QR PARA ABRIR LA CARTA (OBLIGATORIO)", draft.dominio.orEmpty(), { onChange(draft.copy(dominio = it)) }); Text("Este enlace es el destino que codifica el QR.", color = if (draft.dominio?.trim().isNullOrEmpty()) Color(0xFFDC2626) else AppMuted, fontSize = 9.sp); Field("IMAGEN QR PERSONALIZADA (OPCIONAL)", draft.qr_url.orEmpty(), { onChange(draft.copy(qr_url = it)) }) } }
@Composable private fun InfoRow(label: String, value: String) { Row(Modifier.fillMaxWidth().padding(vertical = 3.dp), horizontalArrangement = Arrangement.SpaceBetween) { Text(label, color = AppMuted, fontSize = 10.sp, fontWeight = FontWeight.Bold); Text(value, color = AppText, fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, textAlign = TextAlign.End) } }
@Composable private fun ScreenBar(title: String, onBack: () -> Unit, showSave: Boolean, busy: Boolean, enabled: Boolean, onSave: () -> Unit) { Row(Modifier.fillMaxWidth().height(44.dp), verticalAlignment = Alignment.CenterVertically) { IconButton(onClick = onBack, modifier = Modifier.size(36.dp)) { Icon(Icons.Default.ArrowBack, "Volver", tint = AppText, modifier = Modifier.size(20.dp)) }; Text(title, Modifier.weight(1f), fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = AppText, maxLines = 1, overflow = TextOverflow.Ellipsis); if (showSave) Button(onClick = onSave, enabled = enabled, modifier = Modifier.height(34.dp), contentPadding = PaddingValues(horizontal = 10.dp), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary, disabledContainerColor = Color(0xFFE0E0E0), disabledContentColor = AppMuted)) { Icon(Icons.Default.Save, null, modifier = Modifier.size(15.dp)); Spacer(Modifier.width(4.dp)); Text(if (busy) "Guardando…" else "Guardar", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold) } } }
@Composable private fun SectionCard(content: @Composable ColumnScope.() -> Unit) { Surface(Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp), color = AppSurface, tonalElevation = 0.dp) { Column(Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp), content = content) } }
@Composable private fun Field(label: String, value: String, onChange: (String) -> Unit, modifier: Modifier = Modifier) { Column(modifier.fillMaxWidth()) { Text(label, color = AppMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 3.dp)); BasicTextField(value = value, onValueChange = onChange, modifier = Modifier.fillMaxWidth().height(40.dp).border(1.dp, AppBorder, RoundedCornerShape(8.dp)).background(AppSurfaceSoft, RoundedCornerShape(8.dp)).padding(horizontal = 9.dp), singleLine = true, textStyle = TextStyle(color = AppText, fontSize = 12.sp, lineHeight = 16.sp), cursorBrush = SolidColor(OrangePrimary), decorationBox = { inner -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.CenterStart) { if (value.isEmpty()) Text("...", color = AppMuted, fontSize = 12.sp); inner() } }) } }
@Composable private fun MultiField(label: String, value: String, onChange: (String) -> Unit, height: Dp) { Column(Modifier.fillMaxWidth()) { Text(label, color = AppMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 3.dp)); BasicTextField(value = value, onValueChange = onChange, modifier = Modifier.fillMaxWidth().height(height).border(1.dp, AppBorder, RoundedCornerShape(8.dp)).background(AppSurfaceSoft, RoundedCornerShape(8.dp)).padding(horizontal = 9.dp, vertical = 6.dp), maxLines = 4, textStyle = TextStyle(color = AppText, fontSize = 11.sp, lineHeight = 15.sp), cursorBrush = SolidColor(OrangePrimary)) } }
