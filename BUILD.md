# Dejobe Download Manager — Build Guide

## Prerequisites

### Required
- **Python 3.12+** — [python.org](https://python.org)
- **CMake 3.25+** — [cmake.org](https://cmake.org)
- **Visual Studio Build Tools 2022** — C compiler (MSVC)

### Optional
- **NSIS 3.x** — For building the installer
- **PyInstaller 6.x** — For packaging (`pip install pyinstaller`)

---

## Development Setup

### 1. Clone & Install Dependencies

```powershell
cd "e:\Num Download Manager"
pip install -r requirements.txt
```

### 2. Run from Source

```powershell
python -m app.main
```

### 3. Run CLI

```powershell
python -m app.cli download https://example.com/file.zip
```

---

## Building the C Engine

```powershell
cd engine
cmake -B build -G "Visual Studio 17 2022"
cmake --build build --config Release
```

Output: `engine/build/Release/dejobe.dll`

---

## Packaging the Application

### Full Release Build (Engine + App + Installer)

```powershell
python build/build_all.py --release
```

### Individual Steps

```powershell
python build/build_all.py --engine-only   # C engine only
python build/build_all.py --app-only      # PyInstaller only
python build/build_all.py --installer     # NSIS only
```

### Output Structure

```
dist/
└── Dejobe/
    ├── Dejobe.exe          # Main executable
    ├── dejobe.dll          # C engine (if built)
    ├── app/themes/         # QSS themes
    ├── native_host/        # Browser extension host
    └── ...                 # Python runtime + deps
```

---

## Browser Extension

### Load in Chrome/Edge (Developer Mode)

1. Go to `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `browser_extension/` directory
5. Note the Extension ID
6. Update `browser_extension/native_host/manifest.json` with the ID

### Register Native Messaging Host

The NSIS installer handles this automatically. For manual setup:

```powershell
# Chrome
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.dejobe.download_manager" /d "C:\path\to\native_host\manifest.json"

# Edge
reg add "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.dejobe.download_manager" /d "C:\path\to\native_host\manifest.json"
```

---

## Configuration

Config file: `%APPDATA%\Dejobe\config.json`

```json
{
    "general": {
        "default_save_dir": "C:\\Users\\User\\Downloads",
        "max_concurrent_downloads": 5,
        "clipboard_monitoring": true
    },
    "connection": {
        "max_connections_per_download": 16,
        "connection_timeout": 30
    },
    "ui": {
        "theme": "dark",
        "minimize_to_tray": true,
        "start_minimized": false
    }
}
```
