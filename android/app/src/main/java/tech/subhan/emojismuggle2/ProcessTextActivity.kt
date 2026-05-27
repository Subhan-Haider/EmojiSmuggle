package tech.subhan.emojismuggle2

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
import tech.subhan.emojismuggle2.core.StegoEngine
import tech.subhan.emojismuggle2.ui.theme.EmojiSmuggleTheme

@OptIn(ExperimentalMaterial3Api::class)
class ProcessTextActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val textToEncode = intent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT)?.toString() ?: ""
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
                        ProcessTextEncodeView(
                            textToEncode = textToEncode,
                            isReadOnly = isReadOnly,
                            onFinish = { resultText ->
                                if (resultText != null) {
                                    if (!isReadOnly) {
                                        val resultIntent = Intent()
                                        resultIntent.putExtra(Intent.EXTRA_PROCESS_TEXT, resultText)
                                        setResult(RESULT_OK, resultIntent)
                                    } else {
                                        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                        clipboard.setPrimaryClip(ClipData.newPlainText("Encoded Stego", resultText))
                                        Toast.makeText(this@ProcessTextActivity, "Encoded message copied to clipboard!", Toast.LENGTH_SHORT).show()
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
fun ProcessTextEncodeView(
    textToEncode: String,
    isReadOnly: Boolean,
    onFinish: (String?) -> Unit
) {
    val context = LocalContext.current
    var password by remember { mutableStateOf("") }

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
            text = "Encode with Emoji Smuggle",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Text(
            text = "Original Selected Text:",
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
        )
        Text(
            text = if (textToEncode.length > 100) textToEncode.take(100) + "..." else textToEncode,
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(vertical = 4.dp)
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("AES Password (Optional)") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = {
                val encrypted = StegoEngine.smuggle(textToEncode, password, carrierCount = AppSettings.emojiLimit)
                if (encrypted.isNotEmpty()) {
                    AppHistory.addEntry("ENCODE", textToEncode)
                    if (AppSettings.hapticFeedback) {
                        try {
                            val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as android.os.Vibrator
                            vibrator.vibrate(android.os.VibrationEffect.createOneShot(50, android.os.VibrationEffect.DEFAULT_AMPLITUDE))
                        } catch (e: Exception) {}
                    }
                    onFinish(encrypted)
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(
                text = if (isReadOnly) "Encode & Copy" else "Encode & Replace",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp
            )
        }
    }
}
