package com.decelife.cartadigitalqr.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.Density
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = OrangePrimary,
    secondary = OrangePrimary,
    tertiary = AccentPurple,
    background = Color(0xFFF5F5F4),
    surface = Color.White,
    surfaceVariant = Color(0xFFFAFAF9),
    onPrimary = Color(0xFF18181B),
    onSecondary = Color(0xFF18181B),
    onTertiary = Color(0xFF18181B),
    onBackground = Color(0xFF18181B),
    onSurface = Color(0xFF18181B),
    onSurfaceVariant = Color(0xFF71717A),
    error = ErrorText,
    onError = Color.White
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
    SideEffect {
        setAppThemeColors(darkTheme)
        if (!view.isInEditMode) {
            val window = (view.context as Activity).window
            window.statusBarColor = android.graphics.Color.BLACK
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
        typography = Typography
    ) {
        val density = LocalDensity.current
        CompositionLocalProvider(
            LocalDensity provides Density(density.density, fontScale = 1f)
        ) {
            content()
        }
    }
}
