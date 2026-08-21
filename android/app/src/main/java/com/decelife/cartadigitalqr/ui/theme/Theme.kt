package com.decelife.cartadigitalqr.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.Density
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = OrangePrimary,
    secondary = OrangePrimary,
    tertiary = AccentPurple,
    background = AppBg,
    surface = AppSurface,
    surfaceVariant = AppSurfaceSoft,
    onPrimary = AppText,
    onSecondary = AppText,
    onTertiary = AppText,
    onBackground = AppText,
    onSurface = AppText,
    onSurfaceVariant = AppMuted,
    error = ErrorText,
    onError = AppSurface
)

@Composable
fun CartaDigitalQRTheme(
    content: @Composable () -> Unit
) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = android.graphics.Color.BLACK
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography
    ) {
        // Keep native Android text at the same visual scale as the PWA.
        // Compose otherwise applies the device system fontScale to every sp value.
        val density = LocalDensity.current
        CompositionLocalProvider(
            LocalDensity provides Density(density.density, fontScale = 1f)
        ) {
            content()
        }
    }
}