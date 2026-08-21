package com.decelife.cartadigitalqr.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
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

private val DarkColorScheme = darkColorScheme(
    primary = OrangePrimaryDark,
    secondary = OrangePrimaryDark,
    tertiary = AccentPurple,
    background = AppBgDark,
    surface = AppSurfaceDark,
    surfaceVariant = AppSurfaceSoftDark,
    onPrimary = AppTextDark,
    onSecondary = AppTextDark,
    onTertiary = AppTextDark,
    onBackground = AppTextDark,
    onSurface = AppTextDark,
    onSurfaceVariant = AppMutedDark,
    error = ErrorText,
    onError = AppSurfaceDark
)

@Composable
fun CartaDigitalQRTheme(
    darkTheme: Boolean = false,
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
        colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
        typography = Typography
    ) {
        // Keep native Android text at the same visual scale as the PWA.
        val density = LocalDensity.current
        CompositionLocalProvider(
            LocalDensity provides Density(density.density, fontScale = 1f)
        ) {
            content()
        }
    }
}
