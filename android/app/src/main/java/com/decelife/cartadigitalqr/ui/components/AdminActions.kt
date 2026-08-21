package com.decelife.cartadigitalqr.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.staticCompositionLocalOf

/** Shared actions for the private-panel header. */
data class AdminActions(
    val goHome: () -> Unit = {},
    val showQr: () -> Unit = {},
    val toggleTheme: () -> Unit = {},
    val logout: () -> Unit = {},
    val isNight: Boolean = false,
)

val LocalAdminActions = staticCompositionLocalOf { AdminActions() }

@Composable
fun adminActions(): AdminActions = LocalAdminActions.current
