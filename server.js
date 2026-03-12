const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync, exec } = require("child_process");
const os = require("os");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const TEMP_DIR = path.join(os.tmpdir(), "webtoapk");
const CLEANUP_DELAY = 10 * 60 * 1000; // 10 min

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// ── Helpers ──────────────────────────────────────────────

function parseMultipart(buffer, boundary) {
  const parts = {};
  const sep = `--${boundary}`;
  const raw = buffer.toString("binary");
  const chunks = raw.split(sep).slice(1, -1);

  for (const chunk of chunks) {
    const headerEnd = chunk.indexOf("\r\n\r\n");
    const headers = chunk.slice(0, headerEnd);
    const body = chunk.slice(headerEnd + 4, chunk.length - 2);

    const nameMatch = headers.match(/name="([^"]+)"/);
    const fileMatch = headers.match(/filename="([^"]+)"/);
    if (!nameMatch) continue;

    if (fileMatch) {
      parts[nameMatch[1]] = {
        filename: fileMatch[1],
        data: Buffer.from(body, "binary"),
      };
    } else {
      parts[nameMatch[1]] = body.trim();
    }
  }
  return parts;
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath, filename) {
  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    "Content-Type": "application/vnd.android.package-archive",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": stat.size,
    "Access-Control-Allow-Origin": "*",
  });
  fs.createReadStream(filePath).pipe(res);
}

function cleanupLater(dir) {
  setTimeout(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`[cleanup] ${dir}`);
  }, CLEANUP_DELAY);
}

// ── WebView APK generation ──────────────────────────────

function generateWebViewApk(params, buildDir) {
  const { url, appName, themeColor, orientation, fullscreen } = params;
  const packageName = `com.webtoapk.${appName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  const orientationAttr =
    orientation === "portrait" ? 'android:screenOrientation="portrait"'
    : orientation === "landscape" ? 'android:screenOrientation="landscape"'
    : "";

  const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}">
    <uses-permission android:name="android.permission.INTERNET" />
    <application
        android:allowBackup="true"
        android:label="${appName}"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            ${orientationAttr}
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const fullscreenImports = fullscreen === "true" ? `
import android.view.WindowManager;
import android.view.View;` : "";

  const fullscreenCode = fullscreen === "true" ? `
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);` : "";

  const mainActivity = `package ${packageName};

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;${fullscreenImports}

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);${fullscreenCode}

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);

        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("${url}");
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}`;

  const styles = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:colorPrimary">${themeColor}</item>
        <item name="android:statusBarColor">${themeColor}</item>
        <item name="android:navigationBarColor">${themeColor}</item>
    </style>
</resources>`;

  const srcDir = path.join(buildDir, "app", "src", "main");
  const javaDir = path.join(srcDir, "java", ...packageName.split("."));
  const resValues = path.join(srcDir, "res", "values");
  const resMipmap = path.join(srcDir, "res", "mipmap");

  fs.mkdirSync(javaDir, { recursive: true });
  fs.mkdirSync(resValues, { recursive: true });
  fs.mkdirSync(resMipmap, { recursive: true });

  fs.writeFileSync(path.join(srcDir, "AndroidManifest.xml"), manifest);
  fs.writeFileSync(path.join(javaDir, "MainActivity.java"), mainActivity);
  fs.writeFileSync(path.join(resValues, "styles.xml"), styles);

  return { packageName, srcDir, javaDir, resValues, resMipmap };
}

// ── APK Build (requires Android SDK / aapt2 + d8 + apksigner) ──

function buildApk(buildDir, params, iconData) {
  const structure = generateWebViewApk(params, buildDir);
  const outputApk = path.join(buildDir, `${params.appName || "app"}.apk`);

  if (iconData) {
    const sizes = ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"];
    for (const size of sizes) {
      const dir = path.join(structure.srcDir, "res", `mipmap-${size}`);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "ic_launcher.png"), iconData);
    }
  } else {
    fs.writeFileSync(path.join(structure.resMipmap, "ic_launcher.png"), Buffer.alloc(0));
  }

  const ANDROID_JAR = process.env.ANDROID_JAR || "/opt/android-sdk/platforms/android-34/android.jar";
  const BUILD_TOOLS = process.env.BUILD_TOOLS || "/opt/android-sdk/build-tools/34.0.0";

  const aapt2 = path.join(BUILD_TOOLS, "aapt2");
  const d8 = path.join(BUILD_TOOLS, "d8");
  const zipalign = path.join(BUILD_TOOLS, "zipalign");
  const apksigner = path.join(BUILD_TOOLS, "apksigner");

  const compiledRes = path.join(buildDir, "compiled_res");
  const classesDir = path.join(buildDir, "classes");
  fs.mkdirSync(compiledRes, { recursive: true });
  fs.mkdirSync(classesDir, { recursive: true });

  try {
    // 1. Compile resources
    execSync(`${aapt2} compile --dir ${path.join(structure.srcDir, "res")} -o ${compiledRes}/`, { stdio: "pipe" });

    // 2. Link resources
    const resZip = path.join(buildDir, "res.zip");
    const resFiles = fs.readdirSync(compiledRes).map(f => path.join(compiledRes, f)).join(" ");
    execSync(`${aapt2} link -o ${resZip} -I ${ANDROID_JAR} --manifest ${path.join(structure.srcDir, "AndroidManifest.xml")} ${resFiles} --auto-add-overlay`, { stdio: "pipe" });

    // 3. Compile Java
    const javaFiles = [];
    function findJava(dir) {
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        if (f.isDirectory()) findJava(path.join(dir, f.name));
        else if (f.name.endsWith(".java")) javaFiles.push(path.join(dir, f.name));
      }
    }
    findJava(structure.javaDir);
    execSync(`javac -source 1.8 -target 1.8 -cp ${ANDROID_JAR} -d ${classesDir} ${javaFiles.join(" ")}`, { stdio: "pipe" });

    // 4. Dex
    const dexOutput = path.join(buildDir, "classes.dex");
    execSync(`${d8} --output ${buildDir} ${classesDir}/**/*.class --lib ${ANDROID_JAR}`, { stdio: "pipe" });

    // 5. Build unsigned APK
    const unsignedApk = path.join(buildDir, "unsigned.apk");
    fs.copyFileSync(resZip, unsignedApk);
    execSync(`cd ${buildDir} && zip -u ${unsignedApk} classes.dex`, { stdio: "pipe" });

    // 6. Align
    const alignedApk = path.join(buildDir, "aligned.apk");
    execSync(`${zipalign} -f 4 ${unsignedApk} ${alignedApk}`, { stdio: "pipe" });

    // 7. Sign (debug keystore)
    const keystore = path.join(buildDir, "debug.keystore");
    execSync(`keytool -genkeypair -v -keystore ${keystore} -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Debug"`, { stdio: "pipe" });
    execSync(`${apksigner} sign --ks ${keystore} --ks-pass pass:android --out ${outputApk} ${alignedApk}`, { stdio: "pipe" });

    return outputApk;
  } catch (err) {
    console.error("[build error]", err.message);
    throw new Error("Erreur de compilation APK: " + err.message);
  }
}

// ── HTTP Server ─────────────────────────────────────────

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  // Health check
  if (req.method === "GET" && req.url === "/") {
    return sendJson(res, 200, { status: "ok", service: "WebToAPK API" });
  }

  // Download endpoint
  if (req.method === "GET" && req.url.startsWith("/download/")) {
    const id = req.url.split("/download/")[1];
    const dir = path.join(TEMP_DIR, id);
    if (!fs.existsSync(dir)) return sendJson(res, 404, { error: "Fichier expiré ou introuvable" });

    const files = fs.readdirSync(dir).filter(f => f.endsWith(".apk"));
    if (files.length === 0) return sendJson(res, 404, { error: "APK introuvable" });

    return sendFile(res, path.join(dir, files[0]), files[0]);
  }

  // Convert endpoint
  if (req.method === "POST" && req.url === "/convert") {
    const contentType = req.headers["content-type"] || "";
    const boundary = contentType.split("boundary=")[1];

    if (!boundary) return sendJson(res, 400, { error: "Content-Type multipart/form-data requis" });

    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const body = Buffer.concat(chunks);
        const fields = parseMultipart(body, boundary);

        const url = fields.url;
        const method = fields.method || "webview";
        const appName = fields.appName || "MyApp";
        const themeColor = fields.themeColor || "#7c3aed";
        const orientation = fields.orientation || "auto";
        const fullscreen = fields.fullscreen || "false";

        if (!url) return sendJson(res, 400, { error: "URL requise" });

        try { new URL(url); } catch { return sendJson(res, 400, { error: "URL invalide" }); }

        if (appName.length > 50) return sendJson(res, 400, { error: "Nom trop long (max 50)" });

        const buildId = crypto.randomUUID();
        const buildDir = path.join(TEMP_DIR, buildId);
        fs.mkdirSync(buildDir, { recursive: true });

        console.log(`[build] ${buildId} | ${method} | ${url} | ${appName}`);

        const iconData = fields.icon?.data || null;

        try {
          const apkPath = buildApk(buildDir, { url, method, appName, themeColor, orientation, fullscreen }, iconData);
          console.log(`[done] ${buildId}`);
          cleanupLater(buildDir);
          sendJson(res, 200, {
            success: true,
            downloadUrl: `/download/${buildId}`,
            filename: path.basename(apkPath),
          });
        } catch (err) {
          console.error(`[error] ${buildId}:`, err.message);
          fs.rmSync(buildDir, { recursive: true, force: true });
          sendJson(res, 500, { error: err.message });
        }
      } catch (err) {
        sendJson(res, 500, { error: "Erreur serveur: " + err.message });
      }
    });
    return;
  }

  sendJson(res, 404, { error: "Route introuvable" });
});

server.listen(PORT, () => {
  console.log(`🚀 WebToAPK API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/`);
  console.log(`   Convert: POST http://localhost:${PORT}/convert`);
});
