package com.decelife.cartadigitalqr.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.decelife.cartadigitalqr.data.SupabaseRepository
import com.decelife.cartadigitalqr.models.Familia
import com.decelife.cartadigitalqr.ui.components.AdminHeader
import com.decelife.cartadigitalqr.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun FamiliaEditorScreen(familiaId: String?, onBack: () -> Unit) {
    var familia by remember { mutableStateOf<Familia?>(null) }
    var nombre by remember { mutableStateOf("") }
    var descripcion by remember { mutableStateOf("") }
    var fotoUrl by remember { mutableStateOf("") }
    var activo by remember { mutableStateOf(true) }
    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var uploading by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var confirmDelete by remember { mutableStateOf(false) }
    var confirmDeleteFoto by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    LaunchedEffect(familiaId) {
        try {
            if (familiaId != null) {
                val item = SupabaseRepository.getFamiliasAdmin().firstOrNull { it.id == familiaId }
                    ?: throw IllegalStateException("No se ha encontrado la familia.")
                familia = item
                nombre = item.nombre
                descripcion = item.descripcion.orEmpty()
                fotoUrl = item.foto_url.orEmpty()
                activo = item.activo
            }
        } catch (e: Exception) {
            message = e.message ?: "No se ha podido cargar la familia."
        } finally {
            loading = false
        }
    }

    val picker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri == null) return@rememberLauncherForActivityResult
        uploading = true
        scope.launch {
            try {
                val mime = context.contentResolver.getType(uri) ?: "image/jpeg"
                val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
                    ?: throw IllegalStateException("No se pudo leer la imagen.")
                val extension = mime.substringAfter('/', "jpg").lowercase().let { if (it == "jpeg") "jpg" else it }
                fotoUrl = SupabaseRepository.uploadFamiliaFoto(bytes, mime, extension)
            } catch (e: Exception) {
                message = e.message ?: "No se pudo subir la imagen."
            } finally {
                uploading = false
            }
        }
    }

    if (loading) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        return
    }

    Column(Modifier.fillMaxSize().background(AppBg)) {
        AdminHeader(showHome = true, onHome = onBack)
        Row(
            Modifier.fillMaxWidth().height(44.dp)
                .drawBehind { drawLine(AppBorder, Offset(0f, size.height - 0.5f), Offset(size.width, size.height - 0.5f), 1.dp.toPx()) },
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack, modifier = Modifier.size(36.dp)) {
                Icon(Icons.Default.ArrowBack, "Volver", modifier = Modifier.size(20.dp))
            }
            Text(
                if (familiaId == null) "Nueva familia" else "Editar familia",
                modifier = Modifier.weight(1f), fontSize = 18.sp, fontWeight = FontWeight.ExtraBold,
                color = AppText, maxLines = 1, overflow = TextOverflow.Ellipsis
            )
            if (familiaId != null) {
                IconButton(onClick = { confirmDelete = true }, enabled = !saving && !uploading, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Default.DeleteOutline, "Eliminar", tint = ErrorText, modifier = Modifier.size(20.dp))
                }
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(1.dp), modifier = Modifier.padding(horizontal = 6.dp)) {
                Text(if (activo) "VISIBLE" else "OCULTA", fontSize = 8.sp, fontWeight = FontWeight.ExtraBold, color = AppMuted)
                Toggle(activo) { activo = it }
            }
        }

        Box(Modifier.fillMaxSize()) {
            Column(
                Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(top = 20.dp, bottom = 76.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                SectionCard {
                    Column(Modifier.padding(10.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(7.dp), verticalAlignment = Alignment.Top) {
                            Column(Modifier.weight(0.34f)) {
                                Box(Modifier.fillMaxWidth().aspectRatio(1f).clip(RoundedCornerShape(9.dp)).background(AppSurfaceSoft).border(1.dp, AppBorder, RoundedCornerShape(9.dp)), contentAlignment = Alignment.Center) {
                                    if (fotoUrl.isNotBlank()) AsyncImage(model = fotoUrl, contentDescription = nombre, modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(9.dp)))
                                    else Icon(Icons.Default.Image, null, tint = AppMuted, modifier = Modifier.size(30.dp))
                                    if (uploading) Box(Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.45f)), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Color.White, modifier = Modifier.size(22.dp)) }
                                }
                                Spacer(Modifier.height(2.dp))
                                Button(onClick = { picker.launch("image/*") }, enabled = !uploading && !saving, modifier = Modifier.fillMaxWidth().height(28.dp), shape = RoundedCornerShape(8.dp), contentPadding = PaddingValues(horizontal = 3.dp), colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary, contentColor = Color.White)) {
                                    Icon(Icons.Default.CameraAlt, null, modifier = Modifier.size(13.dp)); Spacer(Modifier.width(3.dp)); Text(if (fotoUrl.isBlank()) "Añadir foto" else "Cambiar foto", fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                }
                                if (fotoUrl.isNotBlank()) {
                                    Spacer(Modifier.height(1.dp))
                                    Button(onClick = { confirmDeleteFoto = true }, enabled = !uploading && !saving, modifier = Modifier.fillMaxWidth().height(28.dp), shape = RoundedCornerShape(8.dp), contentPadding = PaddingValues(0.dp), colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent, contentColor = ErrorText), border = BorderStroke(1.dp, AppBorder)) {
                                        Text("Eliminar foto", fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                            Column(Modifier.weight(0.66f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                Label("NOMBRE DE LA FAMILIA *")
                                BasicTextField(value = nombre, onValueChange = { nombre = it }, modifier = Modifier.fillMaxWidth().height(36.dp).border(1.dp, AppBorder, RoundedCornerShape(9.dp)).padding(horizontal = 9.dp, vertical = 5.dp), singleLine = true, textStyle = TextStyle(color = AppText, fontSize = 14.sp, lineHeight = 16.sp, fontWeight = FontWeight.SemiBold), cursorBrush = SolidColor(OrangePrimary))
                                Label("DESCRIPCIÓN")
                                BasicTextField(value = descripcion, onValueChange = { descripcion = it }, modifier = Modifier.fillMaxWidth().height(76.dp).border(1.dp, AppBorder, RoundedCornerShape(9.dp)).padding(horizontal = 9.dp, vertical = 5.dp), maxLines = 4, textStyle = TextStyle(color = AppText, fontSize = 11.sp, lineHeight = 16.sp), cursorBrush = SolidColor(OrangePrimary))
                            }
                        }
                    }
                }
            }

            Button(
                onClick = {
                    val cleanName = nombre.trim()
                    if (cleanName.isBlank()) { message = "La familia necesita un nombre."; return@Button }
                    saving = true
                    scope.launch {
                        try {
                            SupabaseRepository.saveFamilia(familiaId, cleanName, descripcion.trim().ifBlank { null }, fotoUrl.trim().ifBlank { null }, activo)
                            onBack()
                        } catch (e: Exception) { message = e.message ?: "No se pudo guardar la familia." } finally { saving = false }
                    }
                },
                enabled = !saving && !uploading,
                modifier = Modifier.align(Alignment.BottomCenter).fillMaxWidth().padding(horizontal = 15.dp, vertical = 8.dp).height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary, contentColor = Color.White)
            ) {
                Icon(Icons.Default.Save, null, modifier = Modifier.size(17.dp)); Spacer(Modifier.width(7.dp)); Text(if (familiaId == null) "Crear familia" else "Guardar cambios", fontSize = 14.sp, fontWeight = FontWeight.ExtraBold)
            }
        }
    }

    if (message != null) {
        AlertDialog(onDismissRequest = { message = null }, title = { Text("Aviso") }, text = { Text(message.orEmpty()) }, confirmButton = { TextButton(onClick = { message = null }) { Text("Aceptar") } })
    }
    if (confirmDeleteFoto) {
        AlertDialog(onDismissRequest = { confirmDeleteFoto = false }, title = { Text("¿Eliminar foto?") }, text = { Text("La foto se eliminará del almacenamiento y la familia quedará sin imagen.") }, confirmButton = { TextButton(onClick = {
            confirmDeleteFoto = false; saving = true; scope.launch {
                try { SupabaseRepository.deleteFamiliaFoto(fotoUrl); fotoUrl = "" } catch (e: Exception) { message = e.message ?: "No se pudo eliminar la foto." } finally { saving = false }
            }
        }) { Text("Eliminar", color = ErrorText) } }, dismissButton = { TextButton(onClick = { confirmDeleteFoto = false }) { Text("Cancelar") } })
    }
    if (confirmDelete) {
        AlertDialog(onDismissRequest = { confirmDelete = false }, title = { Text("¿Eliminar familia?") }, text = { Text("Se eliminará «${nombre.trim()}». Esta acción no se puede deshacer.") }, confirmButton = { TextButton(onClick = {
            confirmDelete = false; saving = true; scope.launch {
                try { if (familiaId != null) SupabaseRepository.deleteFamilia(familiaId); onBack() } catch (e: Exception) { message = e.message ?: "No se pudo eliminar la familia." } finally { saving = false }
            }
        }) { Text("Eliminar", color = ErrorText) } }, dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("Cancelar") } })
    }
}

@Composable
private fun SectionCard(content: @Composable () -> Unit) {
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(AppSurface).border(1.dp, AppBorder, RoundedCornerShape(12.dp))) { content() }
}

@Composable
private fun Label(text: String) { Text(text, color = AppMuted, fontSize = 9.sp, fontWeight = FontWeight.SemiBold) }

@Composable
private fun Toggle(checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(modifier = Modifier.width(36.dp).height(20.dp).clip(RoundedCornerShape(10.dp)).background(if (checked) SuccessText else Color(0xFFD1D5DB)).clickable { onChange(!checked) }.padding(2.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = if (checked) Arrangement.End else Arrangement.Start) {
        Box(Modifier.size(16.dp).clip(RoundedCornerShape(8.dp)).background(Color.White))
    }
}
