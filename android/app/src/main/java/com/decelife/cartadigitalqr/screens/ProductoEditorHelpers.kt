package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.ImageLoader
import coil.compose.AsyncImage
import com.decelife.cartadigitalqr.models.Alergeno
import com.decelife.cartadigitalqr.ui.theme.AppBorder
import com.decelife.cartadigitalqr.ui.theme.AppMuted
import com.decelife.cartadigitalqr.ui.theme.AppSurfaceSoft
import com.decelife.cartadigitalqr.ui.theme.AppText
import com.decelife.cartadigitalqr.ui.theme.SuccessText
import java.util.Locale

private val EditorIconBg = mapOf(
    "cereal.svg" to Color(0xFFF4D7D7), "crustaceans.svg" to Color(0xFFDCECFF),
    "eggs.svg" to Color(0xFFFFF0C7), "fish.svg" to Color(0xFFCFE9F4),
    "peanuts.svg" to Color(0xFFEAD7C2), "soya.svg" to Color(0xFFD8E9C8),
    "milk.svg" to Color(0xFFE4E8EE), "nuts.svg" to Color(0xFFE8D4C4),
    "celery.svg" to Color(0xFFD6EBC9), "mustard.svg" to Color(0xFFF7E39A),
    "sesame.svg" to Color(0xFFEADFC9), "so2.svg" to Color(0xFFEAD3DF),
    "altramuz.svg" to Color(0xFFE4D8F2), "molluscs.svg" to Color(0xFFD6E2F2)
)

private fun editorErudus(nombre: String): Pair<String, Color> {
    val k = nombre.lowercase(Locale.ROOT)
        .replace("á", "a").replace("é", "e").replace("í", "i")
        .replace("ó", "o").replace("ú", "u")
    val f = when {
        k.contains("gluten") || k.contains("cereal") -> "cereal.svg"
        k.contains("crustace") -> "crustaceans.svg"
        k.contains("huevo") -> "eggs.svg"
        k.contains("pescado") -> "fish.svg"
        k.contains("cacahuet") -> "peanuts.svg"
        k.contains("soja") -> "soya.svg"
        k.contains("leche") || k.contains("lact") -> "milk.svg"
        k.contains("fruto") && k.contains("cascara") -> "nuts.svg"
        k.contains("apio") -> "celery.svg"
        k.contains("mostaza") -> "mustard.svg"
        k.contains("sesamo") -> "sesame.svg"
        k.contains("sulf") || k.contains("dioxido") || k.contains("azufre") -> "so2.svg"
        k.contains("altram") -> "altramuz.svg"
        k.contains("molusc") -> "molluscs.svg"
        else -> ""
    }
    return f to (EditorIconBg[f] ?: Color(0xFFF3F4F6))
}

@Composable
fun FamilyOption(text: String, selected: Boolean, height: Dp, onClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().height(height).clip(RoundedCornerShape(6.dp))
            .background(if (selected) Color(0x1A10B981) else Color.Transparent)
            .clickable(onClick = onClick).padding(horizontal = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text, fontSize = 11.sp, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
            color = if (selected) SuccessText else AppText, maxLines = 1, overflow = TextOverflow.Ellipsis)
        if (selected) Icon(Icons.Default.Check, null, tint = SuccessText, modifier = Modifier.size(15.dp))
    }
}

@Composable
fun Status(label: String, checked: Boolean, icon: String?, onChange: (Boolean) -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(1.dp), modifier = Modifier.offset(y = (-1).dp).padding(vertical = 1.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(2.dp)) {
            if (icon != null) Text(icon, fontSize = 10.sp)
            if (label == "Sugerencia") Icon(Icons.Default.Lightbulb, null, tint = SuccessText, modifier = Modifier.size(11.dp))
            Text(label.uppercase(Locale.ROOT), fontSize = 9.sp, fontWeight = FontWeight.ExtraBold, color = if (checked) SuccessText else AppMuted)
        }
        EditorToggle(checked, onChange)
    }
}

@Composable
private fun EditorToggle(checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(modifier = Modifier.width(36.dp).height(20.dp).clip(RoundedCornerShape(10.dp))
        .background(if (checked) SuccessText else Color(0xFFD1D5DB)).clickable { onChange(!checked) }.padding(2.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = if (checked) Arrangement.End else Arrangement.Start) {
        Box(Modifier.size(16.dp).clip(RoundedCornerShape(8.dp)).background(Color.White))
    }
}

@Composable
fun AlergenoChip(a: Alergeno, selected: Boolean, loader: ImageLoader, modifier: Modifier, onClick: () -> Unit) {
    val assetAndBg = editorErudus(a.nombre)
    Row(modifier = modifier.heightIn(min = 48.dp).clip(RoundedCornerShape(9.dp))
        .border(1.dp, if (selected) Color(0xFFF97316) else AppBorder, RoundedCornerShape(9.dp))
        .background(if (selected) Color(0x1AF97316) else AppSurfaceSoft)
        .clickable(onClick = onClick).padding(horizontal = 6.dp, vertical = 3.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(16.dp).clip(RoundedCornerShape(2.dp)).border(1.dp, if (selected) Color(0xFFF97316) else AppMuted, RoundedCornerShape(2.dp))
            .background(if (selected) Color(0xFFF97316) else Color.Transparent), contentAlignment = Alignment.Center) {
            if (selected) Icon(Icons.Default.Check, null, tint = Color.White, modifier = Modifier.size(11.dp))
        }
        Spacer(Modifier.width(5.dp))
        Box(Modifier.size(30.dp).clip(RoundedCornerShape(15.dp)).background(assetAndBg.second), contentAlignment = Alignment.Center) {
            if (assetAndBg.first.isNotBlank()) {
                AsyncImage(model = "file:///android_asset/erudus/${assetAndBg.first}", imageLoader = loader, contentDescription = null, modifier = Modifier.size(28.dp))
            }
        }
        Spacer(Modifier.width(5.dp))
        Text(a.nombre, modifier = Modifier.weight(1f), color = AppText, fontSize = 10.sp, fontWeight = FontWeight.SemiBold,
            lineHeight = 11.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
    }
}
