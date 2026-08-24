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
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.decelife.cartadigitalqr.data.PortadaAndroid
import com.decelife.cartadigitalqr.data.PortadasRepository
import com.decelife.cartadigitalqr.data.SupabaseRepository
import com.decelife.cartadigitalqr.ui.components.AdminHeader
import com.decelife.cartadigitalqr.ui.theme.*
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter

private const val MAX_PORTADAS = 10
private val dateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")

@Composable
fun PortadasScreen(onBackClick: () -> Unit) {
    var config by remember { mutableStateOf<com.decelife.cartadigitalqr.models.Configuracion?>(null) }
    var portadas by remember { mutableStateOf<List<PortadaAndroid>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var busy by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var addName by remember { mutableStateOf("") }
    var showAddName by remember { mutableStateOf(false) }
    var pendingName by remember { mutableStateOf("") }
    var editing by remember { mutableStateOf<PortadaAndroid?>(null) }
    var editName by remember { mutableStateOf("") }
    var editFrom by remember { mutableStateOf<String?>(null) }
    var editUntil by remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    suspend fun reload() {
        config = SupabaseRepository.getConfiguracion()
        val id = config?.id
        if (id.isNullOrBlank()) throw IllegalStateException("No hay una configuración activa.")
        portadas = PortadasRepository.getPortadas(id)
    }

    LaunchedEffect(Unit) {
        try { reload() } catch (e: Exception) { message = e.message ?: "No se pudieron cargar las portadas." } finally { loading = false }
    }

    val picker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri == null) return@rememberLauncherForActivityResult
        val name = pendingName.trim()
        if (name.isBlank()) { message = "El nombre de la portada es obligatorio."; return@rememberLauncherForActivityResult }
        busy = true
        scope.launch {
            try {
                val mime = context.contentResolver.getType(uri) ?: "image/jpeg"
                require(mime in setOf("image/jpeg", "image/png", "image/webp")) { "La portada debe ser JPG, PNG o WebP." }
                val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: error("No se pudo leer la imagen.")
                require(bytes.size <= 10 * 1024 * 1024) { "La portada no puede superar los 10 MB." }
                val cfgId = config?.id ?: error("No hay una configuración activa.")
                require(portadas.size < MAX_PORTADAS) { "Has alcanzado el límite de 10 portadas." }
                val extension = when (mime) { "image/png" -> "png"; "image/webp" -> "webp"; else -> "jpg" }
                PortadasRepository.addPortada(cfgId, name, bytes, mime, extension, portadas.isEmpty())
                pendingName = ""
                reload()
            } catch (e: Exception) { message = e.message ?: "No se pudo guardar la portada." }
            finally { busy = false }
        }
    }

    fun chooseDateTime(current: String?, onSelected: (String) -> Unit) {
        val initial = current?.let { runCatching { LocalDateTime.parse(it) }.getOrNull() } ?: LocalDateTime.now()
        val datePicker = DatePickerDialog(context, { _, year, month, day ->
            val timePicker = TimePickerDialog(context, { _, hour, minute ->
                val value = LocalDateTime.of(year, month + 1, day, hour, minute)
                onSelected(value.toString())
            }, initial.hour, initial.minute, true)
            timePicker.show()
        }, initial.year, initial.monthValue - 1, initial.dayOfMonth)
        datePicker.show()
    }

    fun formatDate(value: String?): String = value?.let { runCatching { LocalDateTime.parse(it).format(dateTimeFormatter) }.getOrNull() ?: it } ?: "Sin definir"

    if (loading) { Box(Modifier.fillMaxSize().background(AppBg), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = OrangePrimary) }; return }

    Column(Modifier.fillMaxSize().background(AppBg)) {
        AdminHeader(showHome = true, onHome = onBackClick)
        Row(Modifier.fillMaxWidth().height(44.dp).padding(horizontal = 2.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBackClick, modifier = Modifier.size(36.dp)) { Icon(Icons.Default.ArrowBack, "Volver", tint = AppText) }
            Text("Gestor de portadas", modifier = Modifier.weight(1f), fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = AppText)
            Text("${portadas.size}/$MAX_PORTADAS", color = AppMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 8.dp, vertical = 8.dp).padding(bottom = 70.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SectionCard {
                Text("Biblioteca de portadas", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText)
                Text("Guarda hasta 10 portadas. Solo una queda como habitual; las programadas pueden tomar el control automáticamente.", color = AppMuted, fontSize = 9.sp, lineHeight = 13.sp)
            }
            portadas.forEach { item ->
                val scheduledNow = item.programadaDesde != null && (item.programadaDesde == null || Instant.parse(item.programadaDesde).toEpochMilli() <= System.currentTimeMillis()) && (item.programadaHasta == null || System.currentTimeMillis() <= Instant.parse(item.programadaHasta).toEpochMilli())
                SectionCard {
                    Box(Modifier.fillMaxWidth().height(250.dp).clip(RoundedCornerShape(12.dp)).background(AppSurfaceSoft).border(1.dp, AppBorder, RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) {
                        AsyncImage(model = item.imageUrl, contentDescription = item.nombre, modifier = Modifier.fillMaxHeight().fillMaxWidth(), contentScale = androidx.compose.ui.layout.ContentScale.Fit)
                        if (item.activa || scheduledNow) Surface(Modifier.align(Alignment.TopStart).padding(8.dp), shape = RoundedCornerShape(12.dp), color = Color(0xFF22C55E)) { Text(if (scheduledNow && !item.activa) "ACTUAL POR FECHA" else "ACTUAL", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)) }
                    }
                    Row(Modifier.fillMaxWidth().padding(top = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(item.nombre, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText)
                            Text(if (item.activa) "Habitual" else if (item.programadaDesde != null || item.programadaHasta != null) "Programada" else "Disponible", color = AppMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            if (item.programadaDesde != null || item.programadaHasta != null) Text("${formatDate(item.programadaDesde)} → ${formatDate(item.programadaHasta)}", color = AppMuted, fontSize = 9.sp)
                        }
                        IconButton(onClick = { editing = item; editName = item.nombre; editFrom = item.programadaDesde?.let { runCatching { LocalDateTime.ofInstant(Instant.parse(it), ZoneId.systemDefault()).toString() }.getOrNull() }; editUntil = item.programadaHasta?.let { runCatching { LocalDateTime.ofInstant(Instant.parse(it), ZoneId.systemDefault()).toString() }.getOrNull() } }) { Icon(Icons.Default.Edit, "Editar", tint = AppMuted) }
                        IconButton(onClick = { if (item.id == portadas.firstOrNull { it.activa }?.id) message = "Activa otra portada antes de eliminar esta." else { busy = true; scope.launch { try { PortadasRepository.deletePortada(item); reload() } catch (e: Exception) { message = e.message ?: "No se pudo eliminar la portada." } finally { busy = false } } } }, enabled = !busy) { Icon(Icons.Default.Delete, "Eliminar", tint = Color(0xFFDC2626)) }
                    }
                    Button(onClick = { if (item.activa) Unit else { busy = true; scope.launch { try { PortadasRepository.activatePortada(config!!.id, item); reload() } catch (e: Exception) { message = e.message ?: "No se pudo activar la portada." } finally { busy = false } } } }, enabled = !busy && !item.activa, modifier = Modifier.fillMaxWidth().height(38.dp), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary, disabledContainerColor = AppSurfaceSoft, disabledContentColor = AppMuted), shape = RoundedCornerShape(20.dp)) { Text(if (item.activa) "Habitual" else "Usar como habitual", fontSize = 11.sp, fontWeight = FontWeight.ExtraBold) }
                }
            }
            Button(onClick = { if (portadas.size >= MAX_PORTADAS) message = "Has alcanzado el límite de 10 portadas." else { addName = ""; showAddName = true } }, enabled = !busy, modifier = Modifier.fillMaxWidth().height(42.dp), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary), shape = RoundedCornerShape(22.dp)) { Icon(Icons.Default.Add, null, modifier = Modifier.size(17.dp)); Spacer(Modifier.width(6.dp)); Text("Añadir portada", fontWeight = FontWeight.ExtraBold) }
            Text("JPG, PNG o WebP · máximo 10 MB", Modifier.fillMaxWidth(), textAlign = TextAlign.Center, color = AppMuted, fontSize = 9.sp)
        }
    }

    if (showAddName) AlertDialog(onDismissRequest = { showAddName = false }, title = { Text("Nueva portada") }, text = { Column { Text("Ponle un nombre para identificarla después.", color = AppMuted, fontSize = 12.sp); Spacer(Modifier.height(8.dp)); OutlinedTextField(value = addName, onValueChange = { addName = it }, label = { Text("Nombre") }, singleLine = true) } }, dismissButton = { TextButton(onClick = { showAddName = false }) { Text("Cancelar") } }, confirmButton = { TextButton(onClick = { val clean = addName.trim(); if (clean.isBlank()) message = "El nombre de la portada es obligatorio." else { pendingName = clean; showAddName = false; picker.launch("image/*") } }) { Text("Continuar", color = OrangePrimary) } })

    editing?.let { item ->
        AlertDialog(onDismissRequest = { editing = null }, title = { Text("Editar portada") }, text = { Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(value = editName, onValueChange = { editName = it }, label = { Text("Nombre") }, singleLine = true)
            Text("Desde", color = AppMuted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            OutlinedButton(onClick = { chooseDateTime(editFrom) { editFrom = it } }, modifier = Modifier.fillMaxWidth()) { Text(formatDate(editFrom)) }
            Text("Hasta", color = AppMuted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            OutlinedButton(onClick = { chooseDateTime(editUntil) { editUntil = it } }, modifier = Modifier.fillMaxWidth()) { Text(formatDate(editUntil)) }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { OutlinedButton(onClick = { editFrom = null }, modifier = Modifier.weight(1f)) { Text("Borrar desde") }; OutlinedButton(onClick = { editUntil = null }, modifier = Modifier.weight(1f)) { Text("Borrar hasta") } }
        } }, dismissButton = { TextButton(onClick = { editing = null }) { Text("Cancelar") } }, confirmButton = { TextButton(onClick = { val from = editFrom?.let { runCatching { LocalDateTime.parse(it).atZone(ZoneId.systemDefault()).toInstant().toString() }.getOrNull() }; val until = editUntil?.let { runCatching { LocalDateTime.parse(it).atZone(ZoneId.systemDefault()).toInstant().toString() }.getOrNull() }; if (from != null && until != null && Instant.parse(until) <= Instant.parse(from)) message = "La fecha de fin debe ser posterior a la fecha de inicio." else { busy = true; scope.launch { try { PortadasRepository.updatePortada(item.id, editName.trim(), from, until); editing = null; reload() } catch (e: Exception) { message = e.message ?: "No se pudo guardar la portada." } finally { busy = false } } } }) { Text("Guardar", color = OrangePrimary) } })
    }

    if (message != null) AlertDialog(onDismissRequest = { message = null }, title = { Text("Portadas") }, text = { Text(message.orEmpty()) }, confirmButton = { TextButton(onClick = { message = null }) { Text("Aceptar", color = OrangePrimary) } })
}

@Composable
private fun SectionCard(content: @Composable ColumnScope.() -> Unit) { Surface(Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp), color = AppSurface, tonalElevation = 0.dp) { Column(Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp), content = content) } }
