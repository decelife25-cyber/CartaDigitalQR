package com.decelife.cartadigitalqr

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.decelife.cartadigitalqr.data.SupabaseAuth
import com.decelife.cartadigitalqr.navigation.AppNavigation
import com.decelife.cartadigitalqr.screens.LoginScreen
import com.decelife.cartadigitalqr.ui.theme.CartaDigitalQRTheme
import com.decelife.cartadigitalqr.ui.theme.OrangePrimary

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val preferences = remember { getSharedPreferences("cartadigitalqr", MODE_PRIVATE) }
            var night by remember { mutableStateOf(preferences.getBoolean("carta-theme-night", false)) }
            var authReady by remember { mutableStateOf(false) }
            var authenticated by remember { mutableStateOf(false) }

            LaunchedEffect(Unit) {
                authenticated = SupabaseAuth.restoreSession(this@MainActivity)
                authReady = true
            }

            CartaDigitalQRTheme(darkTheme = night) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    when {
                        !authReady -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = OrangePrimary)
                        }
                        !authenticated -> LoginScreen(onLoggedIn = { authenticated = true })
                        else -> AppNavigation(
                            isNight = night,
                            onToggleTheme = {
                                night = !night
                                preferences.edit().putBoolean("carta-theme-night", night).apply()
                            },
                            onLogout = {
                                SupabaseAuth.signOut()
                                authenticated = false
                            }
                        )
                    }
                }
            }
        }
    }
}
