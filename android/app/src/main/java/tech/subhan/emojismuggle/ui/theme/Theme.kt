package tech.subhan.emojismuggle.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryBlueDark,
    background = BackgroundDark,
    surface = SurfaceDark,
    onPrimary = SurfaceLight,
    onBackground = TextDarkTheme,
    onSurface = TextDarkTheme,
    error = ErrorColor
)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryBlue,
    background = BackgroundLight,
    surface = SurfaceLight,
    onPrimary = SurfaceLight,
    onBackground = TextDark,
    onSurface = TextDark,
    error = ErrorColor
)

@Composable
fun EmojiSmuggleTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val accent = try { tech.subhan.emojismuggle.AppSettings.colorAccent } catch (e: Exception) { 0 }

    val primaryColor = if (darkTheme) {
        when (accent) {
            1 -> PrimaryPurpleDark
            2 -> PrimaryGreenDark
            else -> PrimaryBlueDark
        }
    } else {
        when (accent) {
            1 -> PrimaryPurple
            2 -> PrimaryGreen
            else -> PrimaryBlue
        }
    }

    val colorScheme = if (darkTheme) {
        darkColorScheme(
            primary = primaryColor,
            background = BackgroundDark,
            surface = SurfaceDark,
            onPrimary = SurfaceLight,
            onBackground = TextDarkTheme,
            onSurface = TextDarkTheme,
            error = ErrorColor
        )
    } else {
        lightColorScheme(
            primary = primaryColor,
            background = BackgroundLight,
            surface = SurfaceLight,
            onPrimary = SurfaceLight,
            onBackground = TextDark,
            onSurface = TextDark,
            error = ErrorColor
        )
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
