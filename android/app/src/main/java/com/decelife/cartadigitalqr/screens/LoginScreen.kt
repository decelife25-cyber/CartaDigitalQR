package com.decelife.cartadigitalqr.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Login
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.decelife.cartadigitalqr.data.SupabaseAuth
import com.decelife.cartadigitalqr.ui.theme.AppBg
import com.decelife.cartadigitalqr.ui.theme.AppMuted
import com.decelife.cartadigitalqr.ui.theme.AppText
import com.decelife.cartadigitalqr.ui.theme.OrangePrimary
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(onLoggedIn: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    Box(Modifier.fillMaxSize().background(AppBg), contentAlignment = Alignment.Center) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(Icons.Default.Lock, null, tint = OrangePrimary, modifier = Modifier.size(42.dp))
            Text("Panel Privado", color = AppText, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
            Text("Inicia sesión para editar la carta", color = AppMuted, fontSize = 12.sp)

            OutlinedTextField(
                value = email,
                onValueChange = { email = it; error = null },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Email") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                enabled = !loading,
                shape = RoundedCornerShape(10.dp)
            )
            OutlinedTextField(
                value = password,
                onValueChange = { password = it; error = null },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Contraseña") },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                enabled = !loading,
                shape = RoundedCornerShape(10.dp)
            )

            if (error != null) Text(error.orEmpty(), color = MaterialTheme.colorScheme.error, fontSize = 11.sp)

            Button(
                onClick = {
                    if (email.isBlank() || password.isBlank()) {
                        error = "Introduce el email y la contraseña."
                        return@Button
                    }
                    loading = true
                    scope.launch {
                        try {
                            val authError = SupabaseAuth.signIn(email, password)
                            if (authError == null) onLoggedIn() else error = authError
                        } catch (e: Exception) {
                            error = e.message ?: "No se ha podido iniciar sesión."
                        } finally { loading = false }
                    }
                },
                enabled = !loading,
                modifier = Modifier.fillMaxWidth().height(44.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary, contentColor = Color.White)
            ) {
                if (loading) CircularProgressIndicator(color = Color.White, modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                else { Icon(Icons.Default.Login, null, modifier = Modifier.size(18.dp)); Spacer(Modifier.width(7.dp)); Text("Acceder", fontWeight = FontWeight.ExtraBold) }
            }
        }
    }
}
