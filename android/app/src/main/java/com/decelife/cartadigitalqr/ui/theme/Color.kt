package com.decelife.cartadigitalqr.ui.theme

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color

val AppBgDark = Color(0xFF0F0F0F)
val AppSurfaceDark = Color(0xFF171717)
val AppSurfaceSoftDark = Color(0xFF202020)
val AppTextDark = Color(0xFFFAFAFA)
val AppMutedDark = Color(0xFFA1A1AA)
val AppBorderDark = Color(0x1AFFFFFF)

val OrangePrimary = Color(0xFFF97316)
val OrangePrimaryDark = Color(0xFFF97316)
val OrangeLight = Color(0xFFFB923C)
val OrangeDark = Color(0xFFEA580C)
val ErrorText = Color(0xFFDC2626)
val AccentPurple = Color(0xFF8B5CF6)
val AccentOrange = Color(0xFFF59E0B)
val AccentSlate = Color(0xFF64748B)
val ErrorBg = Color(0x40EF4444)

var AppBg by mutableStateOf(Color(0xFFF5F5F4))
    private set
var AppSurface by mutableStateOf(Color(0xFFFFFFFF))
    private set
var AppSurfaceSoft by mutableStateOf(Color(0xFFFAFAF9))
    private set
var AppText by mutableStateOf(Color(0xFF18181B))
    private set
var AppMuted by mutableStateOf(Color(0xFF71717A))
    private set
var AppBorder by mutableStateOf(Color(0x1A18181B))
    private set
var SuccessBg by mutableStateOf(Color(0x1A10B981))
    private set
var SuccessText by mutableStateOf(Color(0xFF10B981))
    private set

fun setAppThemeColors(dark: Boolean) {
    AppBg = if (dark) AppBgDark else Color(0xFFF5F5F4)
    AppSurface = if (dark) AppSurfaceDark else Color(0xFFFFFFFF)
    AppSurfaceSoft = if (dark) AppSurfaceSoftDark else Color(0xFFFAFAF9)
    AppText = if (dark) AppTextDark else Color(0xFF18181B)
    AppMuted = if (dark) AppMutedDark else Color(0xFF71717A)
    AppBorder = if (dark) AppBorderDark else Color(0x1A18181B)
    SuccessBg = if (dark) Color(0x3310B981) else Color(0x1A10B981)
    SuccessText = Color(0xFF10B981)
}
