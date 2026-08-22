package com.decelife.cartadigitalqr.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.decelife.cartadigitalqr.screens.ConfiguracionScreen
import com.decelife.cartadigitalqr.screens.FamiliaEditorScreen
import com.decelife.cartadigitalqr.screens.FamiliasScreen
import com.decelife.cartadigitalqr.screens.HomeScreen
import com.decelife.cartadigitalqr.screens.PortadasScreen
import com.decelife.cartadigitalqr.screens.ProductoEditorScreen
import com.decelife.cartadigitalqr.screens.ProductosScreen
import com.decelife.cartadigitalqr.ui.components.AdminActions
import com.decelife.cartadigitalqr.ui.components.LocalAdminActions
import com.decelife.cartadigitalqr.ui.components.QrCartaDialog

@Composable
fun AppNavigation(isNight: Boolean, onToggleTheme: () -> Unit, onLogout: () -> Unit) {
    val navController = rememberNavController()
    var showQr by remember { mutableStateOf(false) }
    val actions = AdminActions(
        goHome = { navController.navigate("home") { popUpTo("home") { inclusive = false }; launchSingleTop = true } },
        showQr = { showQr = true }, toggleTheme = onToggleTheme, logout = onLogout, isNight = isNight,
    )
    CompositionLocalProvider(LocalAdminActions provides actions) {
        NavHost(navController = navController, startDestination = "home") {
            composable("home") { HomeScreen(onNavigateToFamilias = { navController.navigate("familias") }, onNavigateToProductos = { navController.navigate("productos") }, onNavigateToConfiguracion = { navController.navigate("configuracion") }) }
            composable("familias") { FamiliasScreen(onBackClick = { navController.popBackStack() }, onNewFamily = { navController.navigate("familia/nuevo") }, onFamilyClick = { id -> navController.navigate("familia/$id") }) }
            composable("familia/nuevo") { FamiliaEditorScreen(familiaId = null, onBack = { navController.popBackStack() }) }
            composable("familia/{id}") { entry -> FamiliaEditorScreen(familiaId = entry.arguments?.getString("id"), onBack = { navController.popBackStack() }) }
            composable("productos") { ProductosScreen(onBackClick = { navController.popBackStack() }, onNewProduct = { navController.navigate("producto/nuevo") }, onProductClick = { id -> navController.navigate("producto/$id") }) }
            composable("producto/nuevo") { ProductoEditorScreen(productId = null, onBack = { navController.popBackStack() }) }
            composable("producto/{id}") { entry -> ProductoEditorScreen(productId = entry.arguments?.getString("id"), onBack = { navController.popBackStack() }) }
            composable("configuracion") { ConfiguracionScreen(onBackClick = { navController.popBackStack() }, onNavigateToPortadas = { navController.navigate("portadas") }) }
            composable("portadas") {
                val configId = navController.previousBackStackEntry?.savedStateHandle?.get<String>("configuracion_id")
                if (configId != null) PortadasScreen(configuracionId = configId, onBackClick = { navController.popBackStack() })
                else ConfiguracionScreen(onBackClick = { navController.popBackStack() }, onNavigateToPortadas = { })
            }
        }
        if (showQr) QrCartaDialog(onClose = { showQr = false })
    }
}
