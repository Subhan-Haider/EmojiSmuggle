package tech.subhan.emojismuggle2

import android.app.Application

import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.util.Log
import java.io.PrintWriter
import java.io.StringWriter
import kotlin.system.exitProcess

class EmojiSmuggleApp : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Setup Global Crash Handler
        val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, exception ->
            try {
                val sw = StringWriter()
                exception.printStackTrace(PrintWriter(sw))
                val crashLog = sw.toString()
                
                Log.e("EmojiSmuggleCrash", "FATAL CRASH: $crashLog")
                
                // Save to SharedPreferences so we can read it on next launch
                val prefs = getSharedPreferences("app_crash_logs", MODE_PRIVATE)
                prefs.edit().putString("last_crash", crashLog).commit()

                // Launch a fallback activity
                val intent = Intent(this, CrashActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                    putExtra("CRASH_LOG", crashLog)
                }
                startActivity(intent)
                
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                // Kill the process to prevent the standard crash dialog
                android.os.Process.killProcess(android.os.Process.myPid())
                exitProcess(1)
            }
        }
    }
}
