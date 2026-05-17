package tech.subhan.emojismuggle

import android.app.Activity
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import tech.subhan.emojismuggle.core.StegoEngine
import tech.subhan.emojismuggle.ui.theme.EmojiSmuggleTheme

@OptIn(ExperimentalMaterial3Api::class)
class ProcessTextDecodeActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val textToDecode = intent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT)?.toString() ?: ""
        val isReadOnly = intent.getBooleanExtra(Intent.EXTRA_PROCESS_TEXT_READONLY, false)

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
                        ProcessTextDecodeView(
                            textToDecode = textToDecode,
                            isReadOnly = isReadOnly,
                            onFinish = { resultText ->
                                if (resultText != null) {
                                    if (!isReadOnly) {
                                        val resultIntent = Intent()
                                        resultIntent.putExtra(Intent.EXTRA_PROCESS_TEXT, resultText)
                                        setResult(RESULT_OK, resultIntent)
                                    } else {
                                        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                        clipboard.setPrimaryClip(ClipData.newPlainText("Decoded Stego", resultText))
                                        Toast.makeText(this@ProcessTextDecodeActivity, "Decoded secret copied to clipboard!", Toast.LENGTH_SHORT).show()
                                    }
                                }
                                finish()
                            }
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProcessTextDecodeView(
    textToDecode: String,
    isReadOnly: Boolean,
    onFinish: (String?) -> Unit
) {
    val context = LocalContext.current
    var password by remember { mutableStateOf("") }
    var decodedText by remember { mutableStateOf("") }
    var hasDecoded by remember { mutableStateOf(false) }

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
            text = "Decode with Emoji Smuggle",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Text(
            text = "Emoji Payload Selected:",
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
        )
        Text(
            text = if (textToDecode.length > 100) textToDecode.take(100) + "..." else textToDecode,
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(vertical = 4.dp)
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        if (!hasDecoded) {
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("AES Password (If Encrypted)") },
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Button(
                onClick = {
                    val decrypted = StegoEngine.extract(textToDecode, password)
                    if (decrypted.isNotEmpty() && !decrypted.startsWith("ERROR")) {
                        decodedText = decrypted
                        hasDecoded = true
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
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Decode Secret", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        } else {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Decoded Payload:", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(decodedText, fontSize = 16.sp, color = MaterialTheme.colorScheme.onSecondaryContainer)
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = { onFinish(decodedText) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(if (isReadOnly) "Copy & Close" else "Replace & Close", fontWeight = FontWeight.Bold)
                }
                
                OutlinedButton(
                    onClick = { onFinish(null) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Cancel", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
