package com.decelife.cartadigitalqr

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.decelife.cartadigitalqr.navigation.AppNavigation
import com.decelife.cartadigitalqr.ui.theme.CartaDigitalQRTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val preferences = remember { getSharedPreferences("cartadigitalqr", MODE_PRIVATE) }
            var night by remember { mutableStateOf(preferences.getBoolean("carta-theme-night", false)) }

            CartaDigitalQRTheme(darkTheme = night) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation(
                        isNight = night,
                        onToggleTheme = {
                            night = !night
                            preferences.edit().putBoolean("carta-theme-night", night).apply()
                        }
                    )
                }
            }
        }
    }
}
