package com.decelife.cartadigitalqr.screens

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.decelife.cartadigitalqr.data.PortadaAndroid
import com.decelife.cartadigitalqr.data.PortadasRepository
import com.decelife.cartadigitalqr.data.SupabaseRepository
import com.decelife.cartadigitalqr.ui.components.AdminHeader
import com.decelife.cartadigitalqr.ui.theme.AppBg
import com.decelife.cartadigitalqr.ui.theme.AppBorder
import com.decelife.cartadigitalqr.ui.theme.AppMuted
import com.decelife.cartadigitalqr.ui.theme.AppSurface
import com.decelife.cartadigitalqr.ui.theme.AppSurfaceSoft
import com.decelife.cartadigitalqr.ui.theme.AppText
import com.decelife.cartadigitalqr.ui.theme.OrangePrimary
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.Calendar

private const val MAX_PORTADAS = 10

private fun displayName(item: PortadaAndroid): String = if (item.nombre.trim().equals("Portada actual", ignoreCase = true)) "Habitual" else item.nombre

private fun parseInstant(value: String?): Instant? = value?.takeIf { it.isNotBlank() }?.let { runCatching { Instant.parse(it) }.getOrNull() }

private fun formatDateTime(value: String?): String {
    val instant = parseInstant(value) ?: return ""
    val date = instant.atZone(ZoneId.systemDefault())
    return "%02d/%02d/%04d  %02d:%02d".format(date.dayOfMonth, date.monthValue, date.year, date.hour, date.minute)
}

private fun formatSchedule(item: PortadaAndroid): String? {
    if (item.desde == null && item.hasta == null) return null
    val desde = item.desde?.let(::formatDateTime) ?: "sin fecha inicial"
    val hasta = item.hasta?.let(::formatDateTime) ?: "sin fecha final"
    return "Se activará de $desde a $hasta"
}

private fun instantFor(year: Int, month: Int, day: Int, hour: Int, minute: Int): Instant =
    ZonedDateTime.of(year, month, day, hour, minute, 0, 0, ZoneId.systemDefault()).toInstant()

@Composable
private fun DateTimeSelector(
    label: String,
    value: String?,
    minimum: Instant?,
    onChange: (String?) -> Unit,
    onError: (String) -> Unit
) {
    val context = LocalContext.current
    val current = parseInstant(value)?.atZone(ZoneId.systemDefault()) ?: ZonedDateTime.now()
    Column(Modifier.fillMaxWidth().padding(top = 6.dp)) {
        Text(label, color = AppMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
        Row(Modifier.fillMaxWidth().padding(top = 3.dp), horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
            OutlinedButton(
                onClick = {
                    val picker = DatePickerDialog(context, { _, year, month, day ->
                        val existing = parseInstant(value)?.atZone(ZoneId.systemDefault())
                        val defaultHour = existing?.hour ?: ZonedDateTime.now().hour
                        val defaultMinute = existing?.minute ?: ZonedDateTime.now().minute
                        TimePickerDialog(context, { _, hour, minute ->
                            val selected = instantFor(year, month + 1, day, hour, minute)
                            val now = Instant.now()
                            val min = minimum ?: now
                            if (selected.isBefore(min)) {
                                onError(if (minimum != null && minimum.isAfter(now)) "La fecha y hora debe ser posterior a la fecha y hora de inicio." else "No puedes programar una fecha y hora anteriores a la actual.")
                            } else {
                                onChange(selected.toString())
                            }
                        }, defaultHour, defaultMinute, true).show()
                    }, current.year, current.monthValue - 1, current.dayOfMonth)
                    val minInstant = minimum ?: Instant.now()
                    picker.datePicker.minDate = minInstant.toEpochMilli()
                    picker.show()
                },
                modifier = Modifier.weight(1f).height(38.dp),
                contentPadding = PaddingValues(horizontal = 8.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = AppText),
                border = androidx.compose.foundation.BorderStroke(1.dp, AppBorder)
            ) {
                Icon(Icons.Default.CalendarMonth, null, modifier = Modifier.size(15.dp))
                Spacer(Modifier.width(5.dp))
                Text(if (value.isNullOrBlank()) "Seleccionar fecha y hora" else formatDateTime(value), fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }
            if (!value.isNullOrBlank()) TextButton(onClick = { onChange(null) }, contentPadding = PaddingValues(horizontal = 6.dp)) { Text("Borrar", color = AppMuted, fontSize = 10.sp) }
        }
    }
}

@Composable
fun PortadasScreen(onBackClick: () -> Unit) {
    var configuracionId by remember { mutableStateOf<String?>(null) }
    var portadas by remember { mutableStateOf<List<PortadaAndroid>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var busy by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var editing by remember { mutableStateOf<String?>(null) }
    var editName by remember { mutableStateOf("") }
    var editFrom by remember { mutableStateOf<String?>(null) }
    var editUntil by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    fun reload() {
        scope.launch {
            loading = true
            try {
                val id = configuracionId ?: withContext(Dispatchers.IO) { SupabaseRepository.getConfiguracion()?.id }
                if (id == null) throw IllegalStateException("No se ha encontrado la configuración del restaurante.")
                configuracionId = id
                portadas = withContext(Dispatchers.IO) { PortadasRepository.list(id) }
            } catch (e: Exception) {
                message = e.message ?: "No se pudieron cargar las portadas."
            } finally { loading = false }
        }
    }

    LaunchedEffect(Unit) { reload() }

    LaunchedEffect(configuracionId) {
        val id = configuracionId ?: return@LaunchedEffect
        while (true) {
            delay(30_000)
            runCatching {
                withContext(Dispatchers.IO) { PortadasRepository.list(id) }
            }.onSuccess { latest -> portadas = latest }
        }
    }

    val picker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri == null || busy || configuracionId == null) return@rememberLauncherForActivityResult
        busy = true
        scope.launch {
            try {
                if (portadas.size >= MAX_PORTADAS) throw IllegalStateException("No puedes añadir otra portada. Elimina una para liberar espacio.")
                val mime = context.contentResolver.getType(uri) ?: "image/jpeg"
                if (mime !in setOf("image/jpeg", "image/png", "image/webp")) throw IllegalStateException("La portada debe ser JPG, PNG o WebP.")
                val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: throw IllegalStateException("No se pudo leer la imagen.")
                if (bytes.size > 10 * 1024 * 1024) throw IllegalStateException("La portada no puede superar los 10 MB.")
                val extension = mime.substringAfter('/', "jpg").lowercase().let { if (it == "jpeg") "jpg" else it }
                val (url, path) = withContext(Dispatchers.IO) { PortadasRepository.upload(bytes, mime, extension) }
                val name = uri.lastPathSegment?.substringAfterLast('/')?.substringBeforeLast('.')?.ifBlank { "Nueva portada" } ?: "Nueva portada"
                val id = configuracionId!!
                withContext(Dispatchers.IO) { PortadasRepository.insert(id, name, url, path, portadas.isEmpty()) }
                if (portadas.isEmpty()) withContext(Dispatchers.IO) { SupabaseRepository.getConfiguracion()?.let { SupabaseRepository.saveConfiguracion(it.copy(portada_url = url)) } }
                reload()
            } catch (e: Exception) { message = e.message ?: "No se pudo guardar la portada." }
            finally { busy = false }
        }
    }

    fun activate(item: PortadaAndroid) {
        val id = configuracionId ?: return
        busy = true
        scope.launch {
            try { withContext(Dispatchers.IO) { PortadasRepository.activate(id, item.id, item.imageUrl) }; reload() }
            catch (e: Exception) { message = e.message ?: "No se pudo activar la portada." }
            finally { busy = false }
        }
    }

    fun delete(item: PortadaAndroid) {
        if (item.activa) { message = "Activa otra portada antes de eliminar esta."; return }
        busy = true
        scope.launch {
            try { withContext(Dispatchers.IO) { PortadasRepository.delete(item) }; reload() }
            catch (e: Exception) { message = e.message ?: "No se pudo eliminar la portada." }
            finally { busy = false }
        }
    }

    fun saveEdit(item: PortadaAndroid) {
        val from = parseInstant(editFrom)
        val until = parseInstant(editUntil)
        val now = Instant.now()
        if (from != null && from.isBefore(now)) { message = "La fecha y hora inicial no puede ser anterior a la actual."; return }
        if (until != null && until.isBefore(now)) { message = "La fecha y hora final no puede ser anterior a la actual."; return }
        if (from != null && until != null && !until.isAfter(from)) { message = "La fecha y hora final debe ser posterior a la inicial."; return }
        busy = true
        scope.launch {
            try { withContext(Dispatchers.IO) { PortadasRepository.update(item.id, editName.trim(), editFrom, editUntil) }; editing = null; reload() }
            catch (e: Exception) { message = e.message ?: "No se pudo guardar." }
            finally { busy = false }
        }
    }

    Column(Modifier.fillMaxSize().background(AppBg)) {
        AdminHeader(showHome = true, onHome = onBackClick)
        Row(Modifier.fillMaxWidth().height(44.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBackClick, modifier = Modifier.size(36.dp)) { Icon(Icons.Default.ArrowBack, "Volver", tint = AppText, modifier = Modifier.size(20.dp)) }
            Text("Portadas", Modifier.weight(1f), fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = AppText)
            Text("${portadas.size}/$MAX_PORTADAS", color = AppMuted, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(end = 10.dp))
        }
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SectionCard {
                Text("Biblioteca de portadas", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText)
                Text("Guarda hasta 10 portadas. Solo una queda como habitual; las programadas pueden tomar el control automáticamente.", color = AppMuted, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp))
            }
            if (loading) Box(Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = OrangePrimary, modifier = Modifier.size(24.dp)) }
            else portadas.forEach { item ->
                val shownName = displayName(item)
                val scheduledText = formatSchedule(item)
                SectionCard {
                    Box(Modifier.fillMaxWidth().aspectRatio(16f / 9f).clip(RoundedCornerShape(9.dp)).background(AppSurfaceSoft).border(1.dp, AppBorder, RoundedCornerShape(9.dp))) {
                        AsyncImage(model = item.imageUrl, contentDescription = shownName, modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(9.dp)))
                        if (item.activa) Surface(color = Color(0xFF22C55E), shape = RoundedCornerShape(bottomEnd = 9.dp)) { Row(Modifier.padding(horizontal = 8.dp, vertical = 5.dp), verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Default.CheckCircle, null, tint = Color.White, modifier = Modifier.size(13.dp)); Spacer(Modifier.width(4.dp)); Text("ACTUAL", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.ExtraBold) } }
                    }
                    if (editing == item.id) {
                        BasicField("Nombre", editName, { editName = it })
                        DateTimeSelector("Desde", editFrom, null, { editFrom = it }, { message = it })
                        DateTimeSelector("Hasta", editUntil, parseInstant(editFrom), { editUntil = it }, { message = it })
                        Row(horizontalArrangement = Arrangement.spacedBy(7.dp), modifier = Modifier.fillMaxWidth().padding(top = 7.dp)) {
                            Button(onClick = { saveEdit(item) }, enabled = !busy && editName.trim().isNotEmpty(), modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)) { Icon(Icons.Default.Save, null, modifier = Modifier.size(14.dp)); Spacer(Modifier.width(4.dp)); Text("Guardar", fontSize = 11.sp, fontWeight = FontWeight.ExtraBold) }
                            OutlinedButton(onClick = { editing = null }, modifier = Modifier.weight(1f)) { Text("Cancelar", fontSize = 11.sp) }
                        }
                    } else {
                        Text(shownName, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = AppText, modifier = Modifier.padding(top = 7.dp))
                        if (scheduledText != null) Surface(modifier = Modifier.fillMaxWidth().padding(top = 5.dp), color = AppSurfaceSoft, shape = RoundedCornerShape(7.dp)) { Row(Modifier.padding(horizontal = 8.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Default.CalendarMonth, null, tint = OrangePrimary, modifier = Modifier.size(14.dp)); Spacer(Modifier.width(5.dp)); Text(scheduledText, color = AppText, fontSize = 10.sp, fontWeight = FontWeight.Bold) } }
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth().padding(top = 7.dp)) {
                            Button(onClick = { activate(item) }, enabled = !busy && !item.activa, modifier = Modifier.weight(1f).height(34.dp), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)) { Text(if (item.activa) "Actual" else "Activar ahora", fontSize = 10.sp, fontWeight = FontWeight.ExtraBold) }
                            IconButton(onClick = { editing = item.id; editName = shownName; editFrom = item.desde; editUntil = item.hasta }, enabled = !busy, modifier = Modifier.size(34.dp)) { Icon(Icons.Default.Edit, "Editar", tint = AppMuted, modifier = Modifier.size(17.dp)) }
                            IconButton(onClick = { delete(item) }, enabled = !busy && !item.activa, modifier = Modifier.size(34.dp)) { Icon(Icons.Default.Delete, "Eliminar", tint = Color(0xFFDC2626), modifier = Modifier.size(17.dp)) }
                        }
                    }
                }
            }
            Button(onClick = { picker.launch("image/*") }, enabled = !busy && portadas.size < MAX_PORTADAS, modifier = Modifier.fillMaxWidth().height(38.dp), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary), shape = RoundedCornerShape(8.dp)) { Icon(Icons.Default.Image, null, modifier = Modifier.size(16.dp)); Spacer(Modifier.width(5.dp)); Text(if (portadas.size >= MAX_PORTADAS) "Límite de 10 portadas alcanzado" else "Añadir portada", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold) }
            if (portadas.size >= MAX_PORTADAS) Text("No puedes añadir otra portada. Elimina una para liberar espacio.", color = AppMuted, fontSize = 8.sp)
        }
    }
    if (message != null) AlertDialog(onDismissRequest = { message = null }, title = { Text("Portadas") }, text = { Text(message.orEmpty()) }, confirmButton = { TextButton(onClick = { message = null }) { Text("Aceptar", color = OrangePrimary) } })
}

@Composable private fun SectionCard(content: @Composable ColumnScope.() -> Unit) { Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).border(1.dp, AppBorder, RoundedCornerShape(12.dp)).background(AppSurface).padding(10.dp), content = content) }
@Composable private fun BasicField(label: String, value: String, onChange: (String) -> Unit) { Column(Modifier.fillMaxWidth().padding(top = 6.dp)) { Text(label, color = AppMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold); OutlinedTextField(value = value, onValueChange = onChange, modifier = Modifier.fillMaxWidth().height(52.dp), singleLine = true, textStyle = LocalTextStyle.current.copy(fontSize = 11.sp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = OrangePrimary, unfocusedBorderColor = AppBorder)) } }
