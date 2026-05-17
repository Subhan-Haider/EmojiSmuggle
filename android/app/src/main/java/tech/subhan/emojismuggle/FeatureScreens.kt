package tech.subhan.emojismuggle

import android.Manifest
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import tech.subhan.emojismuggle.core.StegoEngine
import java.util.concurrent.Executors

// ──────────────────────────────────────────────
// QR SCAN SCREEN
// ──────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QRScanScreen() {
    val context = LocalContext.current
    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
                    == PackageManager.PERMISSION_GRANTED
        )
    }
    var scannedResult by remember { mutableStateOf("") }
    var decodedPayload by remember { mutableStateOf("") }
    var isScanning by remember { mutableStateOf(true) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted -> hasCameraPermission = granted }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) permissionLauncher.launch(Manifest.permission.CAMERA)
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        Text("QR Scanner", fontSize = 24.sp, fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground, modifier = Modifier.padding(bottom = 4.dp))
        Text("Point camera at a QR code to decode its hidden emoji payload.",
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f), fontSize = 13.sp,
            modifier = Modifier.padding(bottom = 20.dp))

        if (!hasCameraPermission) {
            // Permission denied card
            Card(modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)) {
                Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("📷", fontSize = 48.sp, modifier = Modifier.padding(bottom = 16.dp))
                    Text("Camera Permission Required", fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onErrorContainer)
                    Text("This feature needs camera access to scan QR codes.",
                        color = MaterialTheme.colorScheme.onErrorContainer.copy(alpha = 0.8f),
                        fontSize = 13.sp, modifier = Modifier.padding(top = 8.dp, bottom = 16.dp))
                    Button(onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) },
                        modifier = Modifier.fillMaxWidth()) { Text("Grant Camera Permission") }
                }
            }
        } else {
            // Camera viewfinder
            Card(modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(2.dp)) {
                Box(modifier = Modifier.fillMaxWidth().height(320.dp)) {
                    if (isScanning) {
                        CameraPreview(
                            onQrScanned = { raw ->
                                scannedResult = raw
                                isScanning = false
                                decodedPayload = StegoEngine.extract(raw)
                                if (decodedPayload.isNotEmpty() && !decodedPayload.startsWith("ERROR")) {
                                    AppHistory.addEntry("QR_SCAN", decodedPayload)
                                }
                            }
                        )
                        // Scanning overlay
                        Box(modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center) {
                            Box(modifier = Modifier.size(200.dp)
                                .border(3.dp, MaterialTheme.colorScheme.primary, RoundedCornerShape(12.dp)))
                        }
                    } else {
                        Box(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.surfaceVariant),
                            contentAlignment = Alignment.Center) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("✅", fontSize = 48.sp)
                                Text("QR Code Captured", fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(top = 8.dp))
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                Button(onClick = { isScanning = true; scannedResult = ""; decodedPayload = "" },
                    modifier = Modifier.weight(1f)) { Text("Scan Again") }
                OutlinedButton(onClick = {
                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    if (clipboard.hasPrimaryClip()) {
                        scannedResult = clipboard.primaryClip?.getItemAt(0)?.text?.toString() ?: ""
                        isScanning = false
                        decodedPayload = StegoEngine.extract(scannedResult)
                        if (decodedPayload.isNotEmpty() && !decodedPayload.startsWith("ERROR")) {
                            AppHistory.addEntry("QR_SCAN", decodedPayload)
                        }
                    }
                }, modifier = Modifier.weight(1f)) { Text("Paste & Decode") }
            }

            AnimatedVisibility(visible = scannedResult.isNotEmpty(), enter = fadeIn() + expandVertically()) {
                Column(modifier = Modifier.padding(top = 20.dp)) {
                    Text("QR Content", color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 8.dp))
                    StandardCard {
                        Text(scannedResult, fontSize = 14.sp, modifier = Modifier.padding(bottom = 12.dp))
                        val isError = decodedPayload.startsWith("ERROR") || decodedPayload.isEmpty()
                        Text("Hidden Payload",
                            color = if (isError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 8.dp))
                        Text(if (decodedPayload.isEmpty()) "No hidden payload detected." else decodedPayload,
                            color = if (isError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface,
                            fontSize = 16.sp, modifier = Modifier.padding(bottom = 12.dp))
                        if (!isError) {
                            Button(onClick = {
                                val cb = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                cb.setPrimaryClip(ClipData.newPlainText("Payload", decodedPayload))
                                Toast.makeText(context, "Copied!", Toast.LENGTH_SHORT).show()
                            }, modifier = Modifier.fillMaxWidth()) { Text("Copy Payload") }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text("How to use", fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 8.dp))
        StandardCard {
            listOf(
                "📱 Point your camera at any QR code",
                "🔍 The scanner auto-detects and reads it",
                "🔓 Any hidden emoji payload is extracted",
                "📋 Tap 'Paste & Decode' to decode text directly"
            ).forEach { Text(it, fontSize = 13.sp, modifier = Modifier.padding(vertical = 4.dp)) }
        }
        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun CameraPreview(onQrScanned: (String) -> Unit) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    var scanned by remember { mutableStateOf(false) }
    val executor = remember { Executors.newSingleThreadExecutor() }

    AndroidView(
        factory = { ctx ->
            val previewView = PreviewView(ctx)
            val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
            cameraProviderFuture.addListener({
                val cameraProvider = cameraProviderFuture.get()
                val preview = Preview.Builder().build().also {
                    it.setSurfaceProvider(previewView.surfaceProvider)
                }
                val barcodeScanner = BarcodeScanning.getClient()
                val imageAnalysis = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()
                imageAnalysis.setAnalyzer(executor) { imageProxy ->
                    if (!scanned) {
                        val mediaImage = imageProxy.image
                        if (mediaImage != null) {
                            val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
                            barcodeScanner.process(image)
                                .addOnSuccessListener { barcodes ->
                                    barcodes.firstOrNull()?.rawValue?.let { raw ->
                                        if (!scanned) { scanned = true; onQrScanned(raw) }
                                    }
                                }
                                .addOnCompleteListener { imageProxy.close() }
                        } else imageProxy.close()
                    } else imageProxy.close()
                }
                try {
                    cameraProvider.unbindAll()
                    cameraProvider.bindToLifecycle(lifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageAnalysis)
                } catch (e: Exception) { e.printStackTrace() }
            }, ContextCompat.getMainExecutor(ctx))
            previewView
        },
        modifier = Modifier.fillMaxSize()
    )
}

// ──────────────────────────────────────────────
// IMAGE SMUGGLING SCREEN
// ──────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ImageSmugglingScreen() {
    val context = LocalContext.current
    var selectedImageUri by remember { mutableStateOf<android.net.Uri?>(null) }
    var secretText by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var resultEmoji by remember { mutableStateOf("") }
    var compressionLevel by remember { mutableStateOf(0.6f) } // Default to 60% for optimal length
    var encryptionEnabled by remember { mutableStateOf(true) }
    var smuggleMode by remember { mutableStateOf(1) } // Default to 1 (Image to Emoji) as requested!

    val imagePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri -> selectedImageUri = uri }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) imagePicker.launch("image/*")
        else Toast.makeText(context, "Storage permission required", Toast.LENGTH_SHORT).show()
    }

    fun pickImage() {
        val perm = if (android.os.Build.VERSION.SDK_INT >= 33) Manifest.permission.READ_MEDIA_IMAGES
        else Manifest.permission.READ_EXTERNAL_STORAGE
        if (ContextCompat.checkSelfPermission(context, perm) == PackageManager.PERMISSION_GRANTED)
            imagePicker.launch("image/*")
        else permissionLauncher.launch(perm)
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        Text("Image Smuggle", fontSize = 24.sp, fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground, modifier = Modifier.padding(bottom = 4.dp))
        Text("Transform entire images into secure emoji streams or hide secret messages inside image vectors.",
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f), fontSize = 13.sp,
            modifier = Modifier.padding(bottom = 20.dp))

        // smuggle mode tabs
        Row(modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)) {
            Button(
                onClick = { smuggleMode = 1 },
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (smuggleMode == 1) MaterialTheme.colorScheme.primary 
                                     else MaterialTheme.colorScheme.surfaceVariant
                ),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Image to Emoji", color = if (smuggleMode == 1) Color.White else MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = { smuggleMode = 0 },
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (smuggleMode == 0) MaterialTheme.colorScheme.primary 
                                     else MaterialTheme.colorScheme.surfaceVariant
                ),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Hide Text", color = if (smuggleMode == 0) Color.White else MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Bold)
            }
        }

        // 1. IMAGE PICKER
        SectionHeader("Select Image")
        Card(modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(2.dp), shape = RoundedCornerShape(16.dp)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Box(modifier = Modifier.fillMaxWidth().height(180.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .border(2.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.4f), RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center) {
                    if (selectedImageUri != null) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("🖼️", fontSize = 48.sp)
                            Text("Image Selected ✓", fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(top = 8.dp))
                            Text(selectedImageUri.toString().takeLast(32) + "…",
                                fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                                modifier = Modifier.padding(top = 4.dp, start = 12.dp, end = 12.dp))
                        }
                    } else {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("📁", fontSize = 48.sp)
                            Text("Tap to select image", fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(top = 8.dp))
                            Text("JPG, PNG, WEBP supported", fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                                modifier = Modifier.padding(top = 4.dp))
                        }
                    }
                }
                Spacer(modifier = Modifier.height(12.dp))
                Button(onClick = { pickImage() }, modifier = Modifier.fillMaxWidth()) {
                    Text(if (selectedImageUri == null) "Choose Image from Gallery" else "Change Image")
                }
            }
        }

        // 2. SECRET MESSAGE (if in text mode)
        if (smuggleMode == 0) {
            SectionHeader("Secret Payload")
            StandardCard {
                OutlinedTextField(value = secretText, onValueChange = { secretText = it },
                    label = { Text("Secret text to hide in emoji") },
                    modifier = Modifier.fillMaxWidth().height(100.dp), shape = RoundedCornerShape(8.dp))
                Text("${secretText.length} chars", fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                    modifier = Modifier.fillMaxWidth().padding(top = 4.dp))
            }
        }

        // 3. SETTINGS
        SectionHeader("Options")
        StandardCard {
            Text("Compression Quality: ${(compressionLevel * 100).toInt()}%", fontWeight = FontWeight.Medium)
            Slider(value = compressionLevel, onValueChange = { compressionLevel = it },
                modifier = Modifier.fillMaxWidth())
            Text("💡 Lower quality yields smaller, easier-to-share emoji strings.", fontSize = 11.sp, color = MaterialTheme.colorScheme.primary, modifier = Modifier.padding(top = 4.dp))
            Divider(modifier = Modifier.padding(vertical = 12.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically) {
                Column { Text("AES-256 Encryption", fontWeight = FontWeight.Medium)
                    Text("Password-protect payload", fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)) }
                Switch(checked = encryptionEnabled, onCheckedChange = { encryptionEnabled = it })
            }
            AnimatedVisibility(visible = encryptionEnabled) {
                OutlinedTextField(value = password, onValueChange = { password = it },
                    label = { Text("Encryption Password") },
                    visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth().padding(top = 12.dp), shape = RoundedCornerShape(8.dp))
            }
        }

        // 4. ENCODE BUTTON
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = {
            if (selectedImageUri == null) {
                Toast.makeText(context, "Please select an image first", Toast.LENGTH_SHORT).show()
                return@Button
            }
            val passToUse = if (encryptionEnabled) password else ""
            
            if (smuggleMode == 0) {
                if (secretText.isEmpty()) {
                    Toast.makeText(context, "Please enter a secret message", Toast.LENGTH_SHORT).show()
                    return@Button
                }
                resultEmoji = StegoEngine.smuggle(secretText, passToUse)
                if (resultEmoji.isNotEmpty()) {
                    AppHistory.addEntry("IMAGE", "Smuggled secret text")
                }
                Toast.makeText(context, "Text encoded successfully!", Toast.LENGTH_SHORT).show()
            } else {
                try {
                    val inputStream = context.contentResolver.openInputStream(selectedImageUri!!)
                    var bitmap = android.graphics.BitmapFactory.decodeStream(inputStream)
                    if (bitmap != null) {
                        // Downscale dynamically to prevent memory issues and huge emoji strings
                        val maxDimension = 120
                        if (bitmap.width > maxDimension || bitmap.height > maxDimension) {
                            val ratio = bitmap.width.toFloat() / bitmap.height.toFloat()
                            val newWidth = if (bitmap.width > bitmap.height) maxDimension else (maxDimension * ratio).toInt()
                            val newHeight = if (bitmap.height > bitmap.width) maxDimension else (maxDimension / ratio).toInt()
                            bitmap = android.graphics.Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true)
                        }
                        
                        val outputStream = java.io.ByteArrayOutputStream()
                        val quality = (compressionLevel * 100).toInt().coerceIn(1, 100)
                        bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, quality, outputStream)
                        val bytes = outputStream.toByteArray()
                        val base64 = android.util.Base64.encodeToString(bytes, android.util.Base64.DEFAULT)
                        
                        resultEmoji = StegoEngine.smuggle("IMAGE_STAMP:" + base64, passToUse)
                        if (resultEmoji.isNotEmpty()) {
                            AppHistory.addEntry("IMAGE", "Converted Image (${bytes.size / 1024} KB)")
                        }
                        Toast.makeText(context, "Image successfully transformed to emojis!", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(context, "Failed to parse image bitmap.", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(context, "Encoding error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            }
        }, modifier = Modifier.fillMaxWidth().height(56.dp), shape = RoundedCornerShape(14.dp)) {
            Text(if (smuggleMode == 0) "Smuggle Secret into Emoji" else "Convert Image to Emojis", fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }

        // 5. RESULT
        AnimatedVisibility(visible = resultEmoji.isNotEmpty(), enter = fadeIn() + expandVertically()) {
            Column(modifier = Modifier.padding(top = 24.dp)) {
                SectionHeader("Smuggled Output")
                StandardCard {
                    Text("Your secure emoji stream (copy & share this):", fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                        modifier = Modifier.padding(bottom = 8.dp))
                    Text(resultEmoji, fontSize = 22.sp, modifier = Modifier.padding(bottom = 16.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = {
                            val cb = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            cb.setPrimaryClip(ClipData.newPlainText("Emoji", resultEmoji))
                            Toast.makeText(context, "Copied!", Toast.LENGTH_SHORT).show()
                        }, modifier = Modifier.weight(1f)) { Text("Copy") }
                        Button(onClick = {
                            val intent = android.content.Intent(android.content.Intent.ACTION_SEND)
                                .apply { putExtra(android.content.Intent.EXTRA_TEXT, resultEmoji); type = "text/plain" }
                            context.startActivity(android.content.Intent.createChooser(intent, "Share"))
                        }, modifier = Modifier.weight(1f)) { Text("Share") }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}
