package com.decelife.cartadigitalqr.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.decelife.cartadigitalqr.screens.ConfiguracionScreen
import com.decelife.cartadigitalqr.screens.FamiliaEditorScreen
import com.decelife.cartadigitalqr.screens.FamiliasScreen
import com.decelife.cartadigitalqr.screens.HomeScreen
import com.decelife.cartadigitalqr.screens.ProductoEditorScreen
import com.decelife.cartadigitalqr.screens.ProductosScreen

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "home") {
        composable("home") {
            HomeScreen(
                onNavigateToFamilias = { navController.navigate("familias") },
                onNavigateToProductos = { navController.navigate("productos") },
                onNavigateToConfiguracion = { navController.navigate("configuracion") }
            )
        }
        composable("familias") {
            FamiliasScreen(
                onBackClick = { navController.popBackStack() },
                onNewFamily = { navController.navigate("familia/nuevo") },
                onFamilyClick = { id -> navController.navigate("familia/$id") }
            )
        }
        composable("familia/nuevo") { FamiliaEditorScreen(familiaId = null, onBack = { navController.popBackStack() }) }
        composable("familia/{id}") { entry -> FamiliaEditorScreen(familiaId = entry.arguments?.getString("id"), onBack = { navController.popBackStack() }) }
        composable("productos") {
            ProductosScreen(
                onBackClick = { navController.popBackStack() },
                onNewProduct = { navController.navigate("producto/nuevo") },
                onProductClick = { id -> navController.navigate("producto/$id") }
            )
        }
        composable("producto/nuevo") { ProductoEditorScreen(productId = null, onBack = { navController.popBackStack() }) }
        composable("producto/{id}") { entry -> ProductoEditorScreen(productId = entry.arguments?.getString("id"), onBack = { navController.popBackStack() }) }
        composable("configuracion") { ConfiguracionScreen(onBackClick = { navController.popBackStack() }) }
    }
}
