package tech.subhan.emojismuggle2

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import tech.subhan.emojismuggle2.core.StegoEngine
import tech.subhan.emojismuggle2.ui.theme.EmojiSmuggleTheme

@OptIn(ExperimentalMaterial3Api::class)
class ShareActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT) ?: ""

        setContent {
            EmojiSmuggleTheme {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .clickable { finish() },
                    contentAlignment = Alignment.BottomCenter
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(enabled = false) {}
                            .clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                            .background(MaterialTheme.colorScheme.background)
                            .padding(24.dp)
                    ) {
                        ShareSheetView(
                            sharedText = sharedText,
                            onClose = { finish() }
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShareSheetView(
    sharedText: String,
    onClose: () -> Unit
) {
    val context = LocalContext.current
    var isEncodingMode by remember { mutableStateOf<Boolean?>(null) }
    var password by remember { mutableStateOf("") }
    var resultText by remember { mutableStateOf("") }
    var operationDone by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .width(40.dp)
                .height(4.dp)
                .clip(RoundedCornerShape(2.dp))
                .background(MaterialTheme.colorScheme.onBackground.copy(alpha = 0.2f))
                .align(Alignment.CenterHorizontally)
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Emoji Smuggle Share Sheet",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Text(
            text = "Shared Content:",
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
        )
        Text(
            text = if (sharedText.length > 80) sharedText.take(80) + "..." else sharedText,
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(vertical = 4.dp)
        )
        
        Spacer(modifier = Modifier.height(16.dp))

        if (isEncodingMode == null) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = { isEncodingMode = true },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("🔑 Encode Text", fontWeight = FontWeight.Bold)
                }
                
                Button(
                    onClick = { isEncodingMode = false },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)
                ) {
                    Text("🔓 Decode Emojis", fontWeight = FontWeight.Bold)
                }
            }
        } else {
            if (!operationDone) {
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text(if (isEncodingMode == true) "AES Password (Optional)" else "AES Password (If Encrypted)") },
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Button(
                    onClick = {
                        if (isEncodingMode == true) {
                            val stego = StegoEngine.smuggle(sharedText, password, carrierCount = AppSettings.emojiLimit)
                            if (stego.isNotEmpty()) {
                                resultText = stego
                                operationDone = true
                                AppHistory.addEntry("ENCODE", sharedText)
                                if (AppSettings.hapticFeedback) {
                                    try {
                                        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as android.os.Vibrator
                                        vibrator.vibrate(android.os.VibrationEffect.createOneShot(50, android.os.VibrationEffect.DEFAULT_AMPLITUDE))
                                    } catch (e: Exception) {}
                                }
                            }
                        } else {
                            val decrypted = StegoEngine.extract(sharedText, password)
                            if (decrypted.isNotEmpty() && !decrypted.startsWith("ERROR")) {
                                resultText = decrypted
                                operationDone = true
                                AppHistory.addEntry("DECODE", decrypted)
                                if (AppSettings.hapticFeedback) {
                                    try {
                                        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as android.os.Vibrator
                                        vibrator.vibrate(android.os.VibrationEffect.createOneShot(50, android.os.VibrationEffect.DEFAULT_AMPLITUDE))
                                    } catch (e: Exception) {}
                                }
                            } else {
                                Toast.makeText(context, "Failed to decode payload. Wrong password or invalid emojis.", Toast.LENGTH_LONG).show()
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(if (isEncodingMode == true) "Encode & Secure" else "Decode Secret", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
            } else {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(if (isEncodingMode == true) "Encoded Emojis:" else "Decoded Message:", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(resultText, fontSize = 15.sp, color = MaterialTheme.colorScheme.onSecondaryContainer)
                    }
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("Stego Payload", resultText))
                            Toast.makeText(context, "Copied to clipboard!", Toast.LENGTH_SHORT).show()
                            onClose()
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("📋 Copy & Close", fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = {
                            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_TEXT, resultText)
                            }
                            context.startActivity(Intent.createChooser(shareIntent, "Share payload via"))
                            onClose()
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.tertiary)
                    ) {
                        Text("📤 Share", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
