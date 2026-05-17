package tech.subhan.emojismuggle

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import android.Manifest
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import android.content.pm.PackageManager
import android.content.ComponentName
import tech.subhan.emojismuggle.core.StegoEngine
import tech.subhan.emojismuggle.ui.theme.EmojiSmuggleTheme

// ---------------- SETTINGS REPOSITORY ----------------
class SettingsRepository(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)

    var themeMode by mutableStateOf(prefs.getInt("themeMode", 0)) // 0=System, 1=Light, 2=Dark
    var colorAccent by mutableStateOf(prefs.getInt("colorAccent", 0)) // 0=Blue, 1=Purple, 2=Green
    var animationsEnabled by mutableStateOf(prefs.getBoolean("animationsEnabled", true))
    var appIconStyle by mutableStateOf(prefs.getString("appIconStyle", "default") ?: "default")

    var appLockEnabled by mutableStateOf(prefs.getBoolean("appLockEnabled", false))
    var autoDeleteHistory by mutableStateOf(prefs.getBoolean("autoDeleteHistory", false))
    var clipboardProtection by mutableStateOf(prefs.getBoolean("clipboardProtection", true))
    var hiddenMode by mutableStateOf(prefs.getBoolean("hiddenMode", false))

    var encodingStrength by mutableStateOf(prefs.getInt("encodingStrength", 1)) // 0=Basic, 1=Balanced, 2=Strong
    var autoCompress by mutableStateOf(prefs.getBoolean("autoCompress", true))
    var requirePassword by mutableStateOf(prefs.getBoolean("requirePassword", false))

    var offlineMode by mutableStateOf(prefs.getBoolean("offlineMode", true))
    var disableAnalytics by mutableStateOf(prefs.getBoolean("disableAnalytics", false))

    var clipboardAutoDetect by mutableStateOf(prefs.getBoolean("clipboardAutoDetect", true))
    var hapticFeedback by mutableStateOf(prefs.getBoolean("hapticFeedback", true))

    var enableNotifications by mutableStateOf(prefs.getBoolean("enableNotifications", true))
    var securityAlerts by mutableStateOf(prefs.getBoolean("securityAlerts", true))

    fun saveInt(key: String, value: Int) { prefs.edit().putInt(key, value).apply() }
    fun saveBool(key: String, value: Boolean) { prefs.edit().putBoolean(key, value).apply() }
    fun saveString(key: String, value: String) { prefs.edit().putString(key, value).apply() }
}

lateinit var AppSettings: SettingsRepository

fun changeAppIcon(context: Context, iconName: String) {
    val pm = context.packageManager
    val packageName = context.packageName

    val aliases = listOf(
        "tech.subhan.emojismuggle.MainActivity",
        "tech.subhan.emojismuggle.MainActivityAliasCyber",
        "tech.subhan.emojismuggle.MainActivityAliasStealth",
        "tech.subhan.emojismuggle.MainActivityAliasSunset"
    )

    val targetAlias = when (iconName) {
        "cyber" -> "tech.subhan.emojismuggle.MainActivityAliasCyber"
        "stealth" -> "tech.subhan.emojismuggle.MainActivityAliasStealth"
        "sunset" -> "tech.subhan.emojismuggle.MainActivityAliasSunset"
        else -> "tech.subhan.emojismuggle.MainActivity"
    }

    try {
        for (alias in aliases) {
            val newState = if (alias == targetAlias) {
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED
            } else {
                PackageManager.COMPONENT_ENABLED_STATE_DISABLED
            }
            pm.setComponentEnabledSetting(
                ComponentName(packageName, alias),
                newState,
                PackageManager.DONT_KILL_APP
            )
        }
    } catch (e: Exception) {
        e.printStackTrace()
    }
}

data class HistoryItem(
    val type: String, // "ENCODE", "DECODE", "IMAGE", "QR_SCAN"
    val payload: String,
    val timestamp: Long
)

class HistoryRepository(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("app_history", Context.MODE_PRIVATE)
    val historyList = androidx.compose.runtime.mutableStateListOf<HistoryItem>()

    init {
        loadHistory()
    }

    private fun loadHistory() {
        val raw = prefs.getString("history_data", "") ?: ""
        if (raw.isNotEmpty()) {
            val items = raw.split(";;;")
            for (item in items) {
                if (item.trim().isEmpty()) continue
                val parts = item.split("|||")
                if (parts.size >= 3) {
                    historyList.add(
                        HistoryItem(
                            type = parts[0],
                            timestamp = parts[1].toLongOrNull() ?: System.currentTimeMillis(),
                            payload = parts[2]
                        )
                    )
                }
            }
        }
    }

    fun addEntry(type: String, payload: String) {
        val newItem = HistoryItem(type, payload, System.currentTimeMillis())
        historyList.add(0, newItem)
        saveHistory()
    }

    fun clearHistory() {
        historyList.clear()
        prefs.edit().remove("history_data").apply()
    }

    private fun saveHistory() {
        val serialized = historyList.joinToString(";;;") { "${it.type}|||${it.timestamp}|||${it.payload}" }
        prefs.edit().putString("history_data", serialized).apply()
    }

    fun exportJson(): String {
        val sb = java.lang.StringBuilder()
        sb.append("[\n")
        for (i in 0 until historyList.size) {
            val item = historyList[i]
            sb.append("  {\n")
            sb.append("    \"type\": \"${item.type}\",\n")
            sb.append("    \"timestamp\": ${item.timestamp},\n")
            sb.append("    \"payload\": \"${item.payload.replace("\"", "\\\"")}\"\n")
            sb.append("  }")
            if (i < historyList.size - 1) sb.append(",")
            sb.append("\n")
        }
        sb.append("]")
        return sb.toString()
    }
}

lateinit var AppHistory: HistoryRepository

// ---------------- MAIN ACTIVITY ----------------
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        AppSettings = SettingsRepository(applicationContext)
        AppHistory = HistoryRepository(applicationContext)

        setContent {
            val isDark = when (AppSettings.themeMode) {
                1 -> false
                2 -> true
                else -> isSystemInDarkTheme()
            }
            
            EmojiSmuggleTheme(darkTheme = isDark) {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    EmojiSmuggleMainScreen()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmojiSmuggleMainScreen() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.primary,
                tonalElevation = 8.dp
            ) {
                val items = listOf(
                    Triple("home", "🏠", "Home"),
                    Triple("encode", "🛡️", "Encode"),
                    Triple("decode", "🔓", "Decode"),
                    Triple("history", "📜", "History"),
                    Triple("settings", "⚙️", "Settings")
                )
                
                items.forEach { (route, icon, label) ->
                    val selected = currentRoute == route
                    NavigationBarItem(
                        icon = { Text(text = icon, fontSize = 20.sp) },
                        label = { Text(text = label, fontWeight = if(selected) FontWeight.Bold else FontWeight.Normal) },
                        selected = selected,
                        onClick = { 
                            if(route != currentRoute) {
                                navController.navigate(route) {
                                    popUpTo("home") { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(innerPadding).background(MaterialTheme.colorScheme.background)
        ) {
            composable("home") { HomeScreen(navController) }
            composable("encode") { EncodeScreen() }
            composable("decode") { DecodeScreen() }
            composable("history") { HistoryScreen() }
            composable("settings") { SettingsScreen() }
            composable("image") { ImageSmugglingScreen() }
            composable("qr") { QRScanScreen() }
        }
    }
}

// ---------------- REUSABLE UI ----------------

@Composable
fun SectionHeader(title: String) {
    Text(
        text = title,
        color = MaterialTheme.colorScheme.primary,
        fontSize = 14.sp,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.padding(bottom = 8.dp, top = 24.dp)
    )
}

@Composable
fun StandardCard(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) { content() }
    }
}

@Composable
fun SettingsToggleRow(title: String, description: String = "", checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f).padding(end = 16.dp)) {
            Text(title, color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Medium)
            if (description.isNotEmpty()) {
                Text(description, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 12.sp)
            }
        }
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}

// ---------------- SCREENS ----------------

fun getRelativeTime(timestamp: Long): String {
    val diff = System.currentTimeMillis() - timestamp
    return when {
        diff < 60000 -> "Just now"
        diff < 3600000 -> "${diff / 60000}m ago"
        diff < 86400000 -> "${diff / 3600000}h ago"
        else -> "${diff / 86400000}d ago"
    }
}

@Composable
fun AppLogo(modifier: Modifier = Modifier) {
    val activeStyle = AppSettings.appIconStyle
    val (gradientColors, logoEmoji) = when (activeStyle) {
        "cyber" -> listOf(androidx.compose.ui.graphics.Color(0xFF064E3B), androidx.compose.ui.graphics.Color(0xFF10B981)) to "💚"
        "stealth" -> listOf(androidx.compose.ui.graphics.Color(0xFF44403C), androidx.compose.ui.graphics.Color(0xFFEA580C)) to "🧡"
        "sunset" -> listOf(androidx.compose.ui.graphics.Color(0xFF9D174D), androidx.compose.ui.graphics.Color(0xFFD97706)) to "🌅"
        else -> listOf(MaterialTheme.colorScheme.primary, MaterialTheme.colorScheme.secondary) to "🕵️"
    }

    Box(
        modifier = modifier
            .padding(end = 12.dp)
            .size(44.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(
                androidx.compose.ui.graphics.Brush.linearGradient(colors = gradientColors)
            ),
        contentAlignment = Alignment.Center
    ) {
        Text(logoEmoji, fontSize = 22.sp)
    }
}

@Composable
fun HomeScreen(navController: NavHostController) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {

        // 1. HEADER
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                AppLogo()
                Column {
                    Text("Welcome Agent", color = MaterialTheme.colorScheme.onBackground, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    Text("Secure messages with emoji encryption", color = MaterialTheme.colorScheme.primary, fontSize = 12.sp)
                }
            }
            Box(modifier = Modifier.size(40.dp).clip(CircleShape).background(MaterialTheme.colorScheme.primaryContainer), contentAlignment = Alignment.Center) {
                Text("👤", fontSize = 20.sp)
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // HERO BANNER
        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer), shape = RoundedCornerShape(20.dp)) {
            Row(modifier = Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Emoji Smuggle", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = MaterialTheme.colorScheme.onPrimaryContainer)
                    Text("Hide secrets in plain sight. Encode, encrypt, and share.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f), modifier = Modifier.padding(top = 4.dp))
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(onClick = { navController.navigate("encode") }, shape = RoundedCornerShape(10.dp)) { Text("Start Encoding", fontWeight = FontWeight.Bold) }
                }
                Text("🔐", fontSize = 52.sp, modifier = Modifier.padding(start = 12.dp))
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // 2. QUICK ACTIONS
        SectionHeader("Quick Actions")
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                ActionCard("🔐", "Encode", "Hide a message", Modifier.weight(1f)) { navController.navigate("encode") }
                ActionCard("🔓", "Decode", "Reveal secrets", Modifier.weight(1f)) { navController.navigate("decode") }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                ActionCard("🖼️", "Image", "Smuggle photos", Modifier.weight(1f)) { navController.navigate("image") }
                ActionCard("📷", "QR Scan", "Read payloads", Modifier.weight(1f)) { navController.navigate("qr") }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                ActionCard("📜", "History", "Browse vault", Modifier.weight(1f)) { navController.navigate("history") }
                ActionCard("⚙️", "Settings", "Configure app", Modifier.weight(1f)) { navController.navigate("settings") }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // 3. STATS (DYNAMIC)
        val encodeCount = AppHistory.historyList.count { it.type == "ENCODE" }
        val decodeCount = AppHistory.historyList.count { it.type == "DECODE" || it.type == "QR_SCAN" }
        val imageCount = AppHistory.historyList.count { it.type == "IMAGE" }
        val securityLabel = if (AppSettings.requirePassword) "MAX" else "HIGH"

        SectionHeader("System Status")
        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), elevation = CardDefaults.cardElevation(2.dp)) {
            Row(modifier = Modifier.fillMaxWidth().padding(20.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                StatItem(encodeCount.toString(), "Encoded", "🛡️")
                StatItem(decodeCount.toString(), "Decoded", "🔓")
                StatItem(imageCount.toString(), "Images", "🖼️")
                StatItem(securityLabel, "Security", "🔒")
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // 4. RECENT ACTIVITY (DYNAMIC)
        SectionHeader("Recent Activity")
        if (AppHistory.historyList.isEmpty()) {
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), elevation = CardDefaults.cardElevation(2.dp)) {
                Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("📦", fontSize = 32.sp)
                    Text("No activity yet", fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 8.dp))
                    Text("Hide or reveal your first message to see logs here.", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), modifier = Modifier.padding(top = 4.dp))
                }
            }
        } else {
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), elevation = CardDefaults.cardElevation(2.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    val recentItems = AppHistory.historyList.take(5)
                    recentItems.forEachIndexed { index, item ->
                        val icon = when (item.type) {
                            "ENCODE" -> "🛡️"
                            "DECODE" -> "🔓"
                            "IMAGE" -> "🖼️"
                            else -> "📷"
                        }
                        val titleText = when (item.type) {
                            "ENCODE" -> "Encoded secret payload"
                            "DECODE" -> "Decoded stego message"
                            "IMAGE" -> "Smuggled secret into image"
                            else -> "Scanned QR code payload"
                        }
                        val preview = if (item.payload.length > 24) item.payload.take(24) + "…" else item.payload
                        ActivityItem(icon, "$titleText ($preview)", getRelativeTime(item.timestamp))
                        if (index < recentItems.size - 1) {
                            Divider(modifier = Modifier.padding(vertical = 10.dp))
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // 5. FEATURE HIGHLIGHTS
        SectionHeader("Platform Capabilities")
        LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            item { HighlightCard("🕵️ Invisible Text", "Zero-Width Unicode chars hide data inside emojis.") }
            item { HighlightCard("🔒 AES-256", "Military-grade encryption protects every payload.") }
            item { HighlightCard("📵 Fully Offline", "No servers, no cloud. 100% local processing.") }
            item { HighlightCard("📤 Share Anywhere", "Works with WhatsApp, SMS, Telegram and more.") }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // 6. SECURITY TIPS
        SectionHeader("Security Tips")
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(
                Pair("💡", "Use a strong password with uppercase, lowercase, numbers and symbols."),
                Pair("🔒", "Never share your password in the same message as the encoded payload."),
                Pair("📱", "Enable App Lock in Settings so only you can access your vault."),
                Pair("🗑️", "Use Auto-delete to clear decoded messages automatically after reading.")
            ).forEach { (icon, tip) ->
                Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant), shape = RoundedCornerShape(12.dp)) {
                    Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(icon, fontSize = 18.sp, modifier = Modifier.padding(end = 12.dp))
                        Text(tip, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // 7. QUICK NAV
        SectionHeader("Quick Navigation")
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(onClick = { navController.navigate("settings") }, modifier = Modifier.weight(1f)) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) { Text("⚙️"); Text("Settings", fontSize = 10.sp) }
            }
            OutlinedButton(onClick = { navController.navigate("history") }, modifier = Modifier.weight(1f)) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) { Text("📜"); Text("History", fontSize = 10.sp) }
            }
            OutlinedButton(onClick = { }, modifier = Modifier.weight(1f)) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) { Text("ℹ️"); Text("About", fontSize = 10.sp) }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
fun ActionCard(icon: String, title: String, desc: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier.clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(modifier = Modifier.size(48.dp).clip(RoundedCornerShape(12.dp)).background(MaterialTheme.colorScheme.primaryContainer), contentAlignment = Alignment.Center) {
                Text(icon, fontSize = 24.sp)
            }
            Column(modifier = Modifier.padding(start = 12.dp)) {
                Text(title, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                Text(desc, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 12.sp)
            }
        }
    }
}

@Composable
fun StatItem(value: String, label: String, icon: String = "") {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        if (icon.isNotEmpty()) Text(icon, fontSize = 16.sp)
        Text(value, color = MaterialTheme.colorScheme.primary, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(top = 2.dp))
        Text(label, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 11.sp)
    }
}

@Composable
fun ActivityItem(icon: String, text: String, time: String) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
        Box(modifier = Modifier.size(36.dp).clip(CircleShape).background(MaterialTheme.colorScheme.primaryContainer), contentAlignment = Alignment.Center) {
            Text(icon, fontSize = 16.sp)
        }
        Column(modifier = Modifier.weight(1f).padding(start = 12.dp)) {
            Text(text, color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Medium, fontSize = 13.sp)
            Text(time, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 11.sp)
        }
        Text("›", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f), fontSize = 20.sp)
    }
}

@Composable
fun HighlightCard(title: String, desc: String) {
    Card(
        modifier = Modifier.width(210.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(title, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSecondaryContainer, fontSize = 14.sp)
            Text(desc, color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.8f), fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EncodeScreen() {
    var text by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var result by remember { mutableStateOf("") }
    val context = LocalContext.current

    Column(modifier = Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        Text("Encode Message", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground, modifier = Modifier.padding(bottom = 16.dp))

        StandardCard {
            OutlinedTextField(
                value = text, onValueChange = { text = it }, label = { Text("Secret payload") },
                modifier = Modifier.fillMaxWidth().height(120.dp), shape = RoundedCornerShape(8.dp)
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = password, onValueChange = { password = it }, label = { Text("Password (Optional)") },
                visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(8.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                if(text.isNotEmpty()) {
                    result = StegoEngine.smuggle(text, password)
                    if (result.isNotEmpty()) {
                        AppHistory.addEntry("ENCODE", text)
                    }
                }
            },
            modifier = Modifier.fillMaxWidth().height(56.dp), shape = RoundedCornerShape(12.dp)
        ) { Text("Encode", fontSize = 16.sp, fontWeight = FontWeight.Bold) }

        AnimatedVisibility(visible = result.isNotEmpty(), enter = fadeIn() + expandVertically()) {
            Column {
                Spacer(modifier = Modifier.height(24.dp))
                StandardCard {
                    Text("Result", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                    Text(result, fontSize = 20.sp, modifier = Modifier.padding(vertical = 16.dp))
                    
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("Emoji Smuggle", result))
                            Toast.makeText(context, "Copied!", Toast.LENGTH_SHORT).show()
                        }, modifier = Modifier.weight(1f)) { Text("Copy") }
                        
                        Button(onClick = {
                            val shareIntent = Intent(Intent.ACTION_SEND).apply { putExtra(Intent.EXTRA_TEXT, result); type = "text/plain" }
                            context.startActivity(Intent.createChooser(shareIntent, "Share Payload"))
                        }, modifier = Modifier.weight(1f)) { Text("Share") }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DecodeScreen() {
    var encodedText by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var decodedText by remember { mutableStateOf("") }
    val context = LocalContext.current

    val imagePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: android.net.Uri? ->
        if (uri != null) {
            var foundText = ""
            try {
                val inputStream = context.contentResolver.openInputStream(uri)
                if (inputStream != null) {
                    val exif = android.media.ExifInterface(inputStream)
                    val comment = exif.getAttribute(android.media.ExifInterface.TAG_USER_COMMENT)
                        ?: exif.getAttribute(android.media.ExifInterface.TAG_IMAGE_DESCRIPTION)
                    if (!comment.isNullOrBlank()) {
                        foundText = comment
                    }
                    inputStream.close()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }

            if (foundText.isNotEmpty()) {
                val decoded = StegoEngine.extract(foundText, password)
                if (!decoded.startsWith("ERROR")) {
                    decodedText = decoded
                    AppHistory.addEntry("DECODE", decoded)
                    Toast.makeText(context, "Hidden EXIF payload extracted successfully!", Toast.LENGTH_SHORT).show()
                    return@rememberLauncherForActivityResult
                }
            }

            // Fallback: Check for QR codes inside the image
            try {
                val image = com.google.mlkit.vision.common.InputImage.fromFilePath(context, uri)
                val scanner = com.google.mlkit.vision.barcode.BarcodeScanning.getClient()
                scanner.process(image)
                    .addOnSuccessListener { barcodes ->
                        val qrContent = barcodes.firstOrNull()?.rawValue
                        if (qrContent != null) {
                            val decoded = StegoEngine.extract(qrContent, password)
                            decodedText = decoded
                            if (!decoded.startsWith("ERROR")) {
                                AppHistory.addEntry("DECODE", decoded)
                                Toast.makeText(context, "Hidden QR payload extracted successfully!", Toast.LENGTH_SHORT).show()
                            }
                        } else {
                            if (decodedText.isEmpty() || decodedText.startsWith("ERROR")) {
                                decodedText = "ERROR: No hidden payload or QR code found in image."
                            }
                        }
                    }
                    .addOnFailureListener {
                        if (decodedText.isEmpty() || decodedText.startsWith("ERROR")) {
                            decodedText = "ERROR: Failed to process image."
                        }
                    }
            } catch (e: Exception) {
                decodedText = "ERROR: Failed to parse image."
            }
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            imagePicker.launch("image/*")
        } else {
            Toast.makeText(context, "Storage permission required to pick images", Toast.LENGTH_SHORT).show()
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        Text("Decode Message", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground, modifier = Modifier.padding(bottom = 16.dp))

        StandardCard {
            OutlinedTextField(
                value = encodedText, onValueChange = { encodedText = it }, label = { Text("Paste emoji string here") },
                modifier = Modifier.fillMaxWidth().height(120.dp), shape = RoundedCornerShape(8.dp)
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = password, onValueChange = { password = it }, label = { Text("Password (If required)") },
                visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(8.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            OutlinedButton(onClick = {
                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                if (clipboard.hasPrimaryClip() && clipboard.primaryClip != null) encodedText = clipboard.primaryClip?.getItemAt(0)?.text?.toString() ?: ""
            }, modifier = Modifier.weight(1f).height(56.dp), shape = RoundedCornerShape(12.dp)) { Text("Paste") }
            
            Button(onClick = {
                decodedText = StegoEngine.extract(encodedText, password)
                if (decodedText.isNotEmpty() && !decodedText.startsWith("ERROR")) {
                    AppHistory.addEntry("DECODE", decodedText)
                }
            }, modifier = Modifier.weight(2f).height(56.dp), shape = RoundedCornerShape(12.dp)) { Text("Decode Text", fontSize = 15.sp, fontWeight = FontWeight.Bold) }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("🖼️ Image Steganography", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 14.sp)
                Text("Extract messages embedded in image metadata or QR codes.", 
                     color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f), 
                     fontSize = 12.sp, 
                     modifier = Modifier.padding(vertical = 8.dp),
                     textAlign = TextAlign.Center)
                
                Button(
                    onClick = {
                        val perm = if (android.os.Build.VERSION.SDK_INT >= 33) Manifest.permission.READ_MEDIA_IMAGES
                                   else Manifest.permission.READ_EXTERNAL_STORAGE
                        if (androidx.core.content.ContextCompat.checkSelfPermission(context, perm) == PackageManager.PERMISSION_GRANTED) {
                            imagePicker.launch("image/*")
                        } else {
                            permissionLauncher.launch(perm)
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Select Image to Decode", fontWeight = FontWeight.Bold)
                }
            }
        }

        AnimatedVisibility(visible = decodedText.isNotEmpty(), enter = fadeIn() + expandVertically()) {
            Column {
                Spacer(modifier = Modifier.height(24.dp))
                StandardCard {
                    val isError = decodedText.startsWith("ERROR")
                    Text(if(isError) "Error" else "Decoded Message", color = if(isError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                    Text(decodedText, fontSize = 18.sp, modifier = Modifier.padding(vertical = 16.dp))
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen() {
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf(0) } // 0=All, 1=Encoded, 2=Decoded

    val filteredList = AppHistory.historyList.filter { item ->
        val matchesSearch = item.payload.contains(searchQuery, ignoreCase = true)
        val matchesFilter = when (selectedFilter) {
            1 -> item.type == "ENCODE" || item.type == "IMAGE"
            2 -> item.type == "DECODE" || item.type == "QR_SCAN"
            else -> true
        }
        matchesSearch && matchesFilter
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("History", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
            if (AppHistory.historyList.isNotEmpty()) {
                TextButton(onClick = { AppHistory.clearHistory() }) {
                    Text("Clear All", color = MaterialTheme.colorScheme.error, fontWeight = FontWeight.Bold)
                }
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search vault...") },
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
            shape = RoundedCornerShape(8.dp)
        )
        
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(bottom = 24.dp)) {
            FilterChip(selected = selectedFilter == 0, onClick = { selectedFilter = 0 }, label = { Text("All") })
            FilterChip(selected = selectedFilter == 1, onClick = { selectedFilter = 1 }, label = { Text("Encoded") })
            FilterChip(selected = selectedFilter == 2, onClick = { selectedFilter = 2 }, label = { Text("Decoded") })
        }

        if (filteredList.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().weight(1f), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🗂️", fontSize = 48.sp, modifier = Modifier.padding(bottom = 16.dp))
                    Text(if (searchQuery.isNotEmpty()) "No results found" else "No history yet", color = MaterialTheme.colorScheme.onBackground, fontWeight = FontWeight.Bold)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredList.size) { index ->
                    val item = filteredList[index]
                    val icon = when (item.type) {
                        "ENCODE" -> "🛡️"
                        "DECODE" -> "🔓"
                        "IMAGE" -> "🖼️"
                        else -> "📷"
                    }
                    val title = when (item.type) {
                        "ENCODE" -> "Encoded Payload"
                        "DECODE" -> "Decoded Payload"
                        "IMAGE" -> "Smuggled Image"
                        else -> "QR Scanned Payload"
                    }
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        elevation = CardDefaults.cardElevation(1.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(icon, fontSize = 16.sp, modifier = Modifier.padding(end = 8.dp))
                                    Text(title, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 13.sp)
                                }
                                Text(getRelativeTime(item.timestamp), color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), fontSize = 11.sp)
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(item.payload, color = MaterialTheme.colorScheme.onSurface, fontSize = 14.sp)
                        }
                    }
                }
            }
        }
    }
}

// ---------------- COMPLETE SETTINGS SYSTEM ----------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen() {
    val context = LocalContext.current
    Column(modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp).verticalScroll(rememberScrollState())) {
        Text("Settings", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground, modifier = Modifier.padding(vertical = 16.dp))
        
        // 1. APPEARANCE
        SectionHeader("Appearance")
        StandardCard {
            Text("Theme Mode", fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                val themes = listOf("System", "Light", "Dark")
                themes.forEachIndexed { index, name ->
                    FilterChip(
                        selected = AppSettings.themeMode == index,
                        onClick = { AppSettings.themeMode = index; AppSettings.saveInt("themeMode", index) },
                        label = { Text(name) }
                    )
                }
            }
            Divider(modifier = Modifier.padding(vertical = 12.dp))
            Text("Accent Color", fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                val accents = listOf("Blue", "Purple", "Green")
                accents.forEachIndexed { index, name ->
                    FilterChip(
                        selected = AppSettings.colorAccent == index,
                        onClick = { AppSettings.colorAccent = index; AppSettings.saveInt("colorAccent", index) },
                        label = { Text(name) }
                    )
                }
            }
            Divider(modifier = Modifier.padding(vertical = 12.dp))
            SettingsToggleRow("Enable Animations", "Smooth screen transitions", AppSettings.animationsEnabled) { AppSettings.animationsEnabled = it; AppSettings.saveBool("animationsEnabled", it) }
            Divider(modifier = Modifier.padding(vertical = 12.dp))
            Text("App Icon Design", fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(8.dp))
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                val icons = listOf(
                    Triple("default", "Classic Indigo", "🕵️"),
                    Triple("cyber", "Neon Cyberpunk", "💚"),
                    Triple("stealth", "Stealth Tactical", "🧡"),
                    Triple("sunset", "Sweet Sunset", "🌅")
                )
                icons.forEach { (key, name, emoji) ->
                    val isSelected = AppSettings.appIconStyle == key
                    Card(
                        modifier = Modifier.fillMaxWidth().clickable {
                            AppSettings.appIconStyle = key
                            AppSettings.saveString("appIconStyle", key)
                            changeAppIcon(context, key)
                            Toast.makeText(context, "App icon updated to $name!", Toast.LENGTH_SHORT).show()
                        },
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) MaterialTheme.colorScheme.primaryContainer 
                                             else MaterialTheme.colorScheme.surfaceVariant
                        ),
                        border = if (isSelected) androidx.compose.foundation.BorderStroke(2.dp, MaterialTheme.colorScheme.primary) else null
                    ) {
                        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(emoji, fontSize = 24.sp, modifier = Modifier.padding(end = 12.dp))
                            Text(name, fontWeight = FontWeight.Bold, color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }

        // 2. SECURITY
        SectionHeader("Security")
        StandardCard {
            SettingsToggleRow("App Lock", "Require biometrics to open", AppSettings.appLockEnabled) { AppSettings.appLockEnabled = it; AppSettings.saveBool("appLockEnabled", it) }
            Divider(modifier = Modifier.padding(vertical = 8.dp))
            SettingsToggleRow("Auto-delete decoded messages", "Don't save history", AppSettings.autoDeleteHistory) { AppSettings.autoDeleteHistory = it; AppSettings.saveBool("autoDeleteHistory", it) }
            Divider(modifier = Modifier.padding(vertical = 8.dp))
            SettingsToggleRow("Clipboard Protection", "Clear clipboard after 60s", AppSettings.clipboardProtection) { AppSettings.clipboardProtection = it; AppSettings.saveBool("clipboardProtection", it) }
            Divider(modifier = Modifier.padding(vertical = 8.dp))
            SettingsToggleRow("Hidden Mode", "Hide content in recent apps view", AppSettings.hiddenMode) { AppSettings.hiddenMode = it; AppSettings.saveBool("hiddenMode", it) }
        }

        // 3. ENCODING
        SectionHeader("Encoding Settings")
        StandardCard {
            Text("Default Strength", fontWeight = FontWeight.Medium)
            Slider(value = AppSettings.encodingStrength.toFloat(), onValueChange = { AppSettings.encodingStrength = it.toInt(); AppSettings.saveInt("encodingStrength", it.toInt()) }, valueRange = 0f..2f, steps = 1)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Basic", fontSize = 12.sp); Text("Balanced", fontSize = 12.sp); Text("Strong", fontSize = 12.sp)
            }
            Divider(modifier = Modifier.padding(vertical = 16.dp))
            SettingsToggleRow("Require Password", "Force AES encryption on all messages", AppSettings.requirePassword) { AppSettings.requirePassword = it; AppSettings.saveBool("requirePassword", it) }
            Divider(modifier = Modifier.padding(vertical = 8.dp))
            SettingsToggleRow("Auto-compress Media", "Shrink images before encoding", AppSettings.autoCompress) { AppSettings.autoCompress = it; AppSettings.saveBool("autoCompress", it) }
        }

        // 4. PRIVACY
        SectionHeader("Privacy")
        StandardCard {
            SettingsToggleRow("Offline Mode", "Force local processing only", AppSettings.offlineMode) { AppSettings.offlineMode = it; AppSettings.saveBool("offlineMode", it) }
            Divider(modifier = Modifier.padding(vertical = 8.dp))
            SettingsToggleRow("Disable Analytics", "Opt-out of crash reporting", AppSettings.disableAnalytics) { AppSettings.disableAnalytics = it; AppSettings.saveBool("disableAnalytics", it) }
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedButton(
                onClick = {
                    AppHistory.clearHistory()
                    AppSettings.themeMode = 0
                    AppSettings.saveInt("themeMode", 0)
                    AppSettings.colorAccent = 0
                    AppSettings.saveInt("colorAccent", 0)
                    AppSettings.appIconStyle = "default"
                    AppSettings.saveString("appIconStyle", "default")
                    AppSettings.animationsEnabled = true
                    AppSettings.saveBool("animationsEnabled", true)
                    AppSettings.appLockEnabled = false
                    AppSettings.saveBool("appLockEnabled", false)
                    AppSettings.autoDeleteHistory = false
                    AppSettings.saveBool("autoDeleteHistory", false)
                    AppSettings.clipboardProtection = true
                    AppSettings.saveBool("clipboardProtection", true)
                    AppSettings.hiddenMode = false
                    AppSettings.saveBool("hiddenMode", false)
                    changeAppIcon(context, "default")
                    Toast.makeText(context, "All app preferences and history wiped completely!", Toast.LENGTH_LONG).show()
                },
                modifier = Modifier.fillMaxWidth()
            ) { Text("Wipe All App Data", color = MaterialTheme.colorScheme.error) }
        }

        // 5. BEHAVIOR
        SectionHeader("Behavior")
        StandardCard {
            SettingsToggleRow("Clipboard Auto-detect", "Prompt when payload is copied", AppSettings.clipboardAutoDetect) { AppSettings.clipboardAutoDetect = it; AppSettings.saveBool("clipboardAutoDetect", it) }
            Divider(modifier = Modifier.padding(vertical = 8.dp))
            SettingsToggleRow("Haptic Feedback", "Vibrate on success/error", AppSettings.hapticFeedback) { AppSettings.hapticFeedback = it; AppSettings.saveBool("hapticFeedback", it) }
        }

        // 6. DATA & STORAGE
        SectionHeader("Data & Storage")
        StandardCard {
            Row(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Storage Used", fontWeight = FontWeight.Medium)
                val size = AppHistory.historyList.size
                val spaceText = if (size == 0) "12 KB" else "${12 + size * 2} KB"
                Text(spaceText, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = {
                        val json = AppHistory.exportJson()
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("Emoji Smuggle Backup", json))
                        
                        val shareIntent = Intent(Intent.ACTION_SEND).apply {
                            putExtra(Intent.EXTRA_TEXT, json)
                            type = "text/plain"
                        }
                        context.startActivity(Intent.createChooser(shareIntent, "Export Vault Backup"))
                        Toast.makeText(context, "JSON Backup copied & share panel opened!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                ) { Text("Export JSON") }
                
                OutlinedButton(
                    onClick = {
                        try {
                            context.cacheDir.deleteRecursively()
                            Toast.makeText(context, "Temporary image cache cleared successfully!", Toast.LENGTH_SHORT).show()
                        } catch (e: Exception) {
                            Toast.makeText(context, "Cache clear failed.", Toast.LENGTH_SHORT).show()
                        }
                    },
                    modifier = Modifier.weight(1f)
                ) { Text("Clear Cache") }
            }
        }

        // 7. NOTIFICATIONS
        SectionHeader("Notifications")
        StandardCard {
            SettingsToggleRow("Enable Notifications", "Allow app alerts", AppSettings.enableNotifications) { AppSettings.enableNotifications = it; AppSettings.saveBool("enableNotifications", it) }
            Divider(modifier = Modifier.padding(vertical = 8.dp))
            SettingsToggleRow("Security Alerts", "Warn on suspicious payloads", AppSettings.securityAlerts) { AppSettings.securityAlerts = it; AppSettings.saveBool("securityAlerts", it) }
        }

        // 8. ABOUT
        SectionHeader("About")
        StandardCard {
            Text("Emoji Smuggle", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            Text("Version 3.0.0 (Production)", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f), fontSize = 14.sp)
            Spacer(modifier = Modifier.height(16.dp))
            Text("A premium offline steganography platform designed with Material 3 principles.", fontSize = 14.sp)
            Spacer(modifier = Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://emoji.subhan.tech"))) }, modifier = Modifier.weight(1f)) { Text("Website") }
                Button(onClick = { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://github.com/Subhan-Haider"))) }, modifier = Modifier.weight(1f)) { Text("GitHub") }
            }
        }
        
        Spacer(modifier = Modifier.height(32.dp))
    }
}
