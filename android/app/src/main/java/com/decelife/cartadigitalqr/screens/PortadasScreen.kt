package com.decelife.cartadigitalqr.screens

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
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
fun PortadasScreen(configuracionId: String, onBackClick: () -> Unit) {
    var portadas by remember { mutableStateOf<List<PortadaAndroid>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var busy by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var editing by remember { mutableStateOf<String?>(null) }
    var editName by remember { mutableStateOf("") }
    var editFrom by remember { mutableStateOf("") }
    var editUntil by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    fun reload() {
        scope.launch {
            loading = true
            try { portadas = withContext(Dispatchers.IO) { PortadasRepository.list(configuracionId) } }
            catch (e: Exception) { message = e.message ?: "No se pudieron cargar las portadas." }
            finally { loading = false }
        }
    }

    LaunchedEffect(configuracionId) { reload() }

    val picker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri == null || busy) return@rememberLauncherForActivityResult
        busy = true
        scope.launch {
            try {
                if (portadas.size >= 10) throw IllegalStateException("Has alcanzado el límite de 10 portadas.")
                val mime = context.contentResolver.getType(uri) ?: "image/jpeg"
                if (mime !in setOf("image/jpeg", "image/png", "image/webp")) throw IllegalStateException("La portada debe ser JPG, PNG o WebP.")
                val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: throw IllegalStateException("No se pudo leer la imagen.")
                if (bytes.size > 10 * 1024 * 1024) throw IllegalStateException("La portada no puede superar los 10 MB.")
                val extension = mime.substringAfter('/', "jpg").lowercase().let { if (it == "jpeg") "jpg" else it }
                val (url, path) = withContext(Dispatchers.IO) { PortadasRepository.upload(bytes, mime, extension) }
                val name = uri.lastPathSegment?.substringAfterLast('/')?.substringBeforeLast('.')?.ifBlank { "Nueva portada" } ?: "Nueva portada"
                withContext(Dispatchers.IO) { PortadasRepository.insert(configuracionId, name, url, path, portadas.isEmpty()) }
                if (portadas.isEmpty()) withContext(Dispatchers.IO) { SupabaseRepository.saveConfiguracion(SupabaseRepository.getConfiguracion()!!.copy(portada_url = url)) }
                reload()
            } catch (e: Exception) { message = e.message ?: "No se pudo guardar la portada." }
            finally { busy = false }
        }
    }

    fun activate(item: PortadaAndroid) {
        busy = true
        scope.launch {
            try { withContext(Dispatchers.IO) { PortadasRepository.activate(configuracionId, item.id, item.imageUrl) }; reload() }
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

    Column(Modifier.fillMaxSize().background(AppBg)) {
        AdminHeader(showHome = true, onHome = onBackClick)
        Row(Modifier.fillMaxWidth().height(44.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBackClick, modifier = Modifier.size(36.dp)) { Icon(Icons.Default.ArrowBack, "Volver", tint = AppText, modifier = Modifier.size(20.dp)) }
            Text("Portadas", Modifier.weight(1f), fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = AppText)
            Text("${portadas.size}/10", color = AppMuted, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(end = 10.dp))
        }

        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SectionCard {
                Text("Biblioteca de portadas", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = AppText)
                Text("Guarda hasta 10 portadas. Solo una queda como predeterminada; las programadas pueden tomar el control automáticamente.", color = AppMuted, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp))
            }

            if (loading) Box(Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = OrangePrimary, modifier = Modifier.size(24.dp)) }
            else portadas.forEach { item ->
                SectionCard {
                    Box(Modifier.fillMaxWidth().aspectRatio(16f / 9f).clip(RoundedCornerShape(9.dp)).background(AppSurfaceSoft).border(1.dp, AppBorder, RoundedCornerShape(9.dp))) {
                        AsyncImage(model = item.imageUrl, contentDescription = item.nombre, modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(9.dp)))
                        if (item.activa) Surface(color = Color(0xFF22C55E), shape = RoundedCornerShape(bottomEnd = 9.dp)) { Row(Modifier.padding(horizontal = 8.dp, vertical = 5.dp), verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Default.CheckCircle, null, tint = Color.White, modifier = Modifier.size(13.dp)); Spacer(Modifier.width(4.dp)); Text("PREDETERMINADA", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.ExtraBold) } }
                    }
                    if (editing == item.id) {
                        BasicField("Nombre", editName, { editName = it })
                        BasicField("Desde (ISO, opcional)", editFrom, { editFrom = it })
                        BasicField("Hasta (ISO, opcional)", editUntil, { editUntil = it })
                        Row(horizontalArrangement = Arrangement.spacedBy(7.dp), modifier = Modifier.fillMaxWidth()) {
                            Button(onClick = { busy = true; scope.launch { try { withContext(Dispatchers.IO) { PortadasRepository.update(item.id, editName.trim(), editFrom.trim().ifBlank { null }, editUntil.trim().ifBlank { null }) }; editing = null; reload() } catch (e: Exception) { message = e.message ?: "No se pudo guardar." } finally { busy = false } } }, enabled = !busy, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)) { Icon(Icons.Default.Save, null, modifier = Modifier.size(14.dp)); Spacer(Modifier.width(4.dp)); Text("Guardar", fontSize = 11.sp, fontWeight = FontWeight.ExtraBold) }
                            OutlinedButton(onClick = { editing = null }, modifier = Modifier.weight(1f)) { Text("Cancelar", fontSize = 11.sp) }
                        }
                    } else {
                        Text(item.nombre, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = AppText, modifier = Modifier.padding(top = 7.dp))
                        if (item.desde != null || item.hasta != null) Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 2.dp)) { Icon(Icons.Default.CalendarMonth, null, tint = AppMuted, modifier = Modifier.size(13.dp)); Spacer(Modifier.width(4.dp)); Text("${item.desde ?: "sin inicio"} → ${item.hasta ?: "sin fin"}", color = AppMuted, fontSize = 9.sp) }
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth().padding(top = 7.dp)) {
                            Button(onClick = { activate(item) }, enabled = !busy && !item.activa, modifier = Modifier.weight(1f).height(34.dp), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)) { Text(if (item.activa) "Predeterminada" else "Activar ahora", fontSize = 10.sp, fontWeight = FontWeight.ExtraBold) }
                            IconButton(onClick = { editing = item.id; editName = item.nombre; editFrom = item.desde.orEmpty(); editUntil = item.hasta.orEmpty() }, enabled = !busy, modifier = Modifier.size(34.dp)) { Icon(Icons.Default.Edit, "Editar", tint = AppMuted, modifier = Modifier.size(17.dp)) }
                            IconButton(onClick = { delete(item) }, enabled = !busy && !item.activa, modifier = Modifier.size(34.dp)) { Icon(Icons.Default.Delete, "Eliminar", tint = Color(0xFFDC2626), modifier = Modifier.size(17.dp)) }
                        }
                    }
                }
            }

            Button(onClick = { picker.launch("image/*") }, enabled = !busy && portadas.size < 10, modifier = Modifier.fillMaxWidth().height(38.dp), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary), shape = RoundedCornerShape(8.dp)) { Icon(Icons.Default.Image, null, modifier = Modifier.size(16.dp)); Spacer(Modifier.width(5.dp)); Text("Añadir portada", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold) }
            Text("La fecha se guarda en ISO (por ejemplo 2026-12-15T00:00:00+01:00). En la siguiente iteración podemos sustituir estos campos por selectores de fecha y hora.", color = AppMuted, fontSize = 8.sp)
        }
    }

    if (message != null) AlertDialog(onDismissRequest = { message = null }, title = { Text("Portadas") }, text = { Text(message.orEmpty()) }, confirmButton = { TextButton(onClick = { message = null }) { Text("Aceptar", color = OrangePrimary) } })
}

@Composable private fun SectionCard(content: @Composable ColumnScope.() -> Unit) { Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).border(1.dp, AppBorder, RoundedCornerShape(12.dp)).background(AppSurface).padding(10.dp), content = content) }
@Composable private fun BasicField(label: String, value: String, onChange: (String) -> Unit) { Column(Modifier.fillMaxWidth().padding(top = 6.dp)) { Text(label, color = AppMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold); OutlinedTextField(value = value, onValueChange = onChange, modifier = Modifier.fillMaxWidth().height(52.dp), singleLine = true, textStyle = LocalTextStyle.current.copy(fontSize = 11.sp), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = OrangePrimary, unfocusedBorderColor = AppBorder)) } }
