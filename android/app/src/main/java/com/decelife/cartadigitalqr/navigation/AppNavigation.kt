package com.decelife.cartadigitalqr.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.decelife.cartadigitalqr.screens.ConfiguracionScreen
import com.decelife.cartadigitalqr.screens.FamiliasScreen
import com.decelife.cartadigitalqr.screens.HomeScreen
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
            FamiliasScreen(onBackClick = { navController.popBackStack() })
        }
        composable("productos") {
            ProductosScreen(onBackClick = { navController.popBackStack() })
        }
        composable("configuracion") {
            ConfiguracionScreen(onBackClick = { navController.popBackStack() })
        }
    }
}