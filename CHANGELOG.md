# Changelog

All notable changes to Dejobe Download Manager.

## [1.0.0] — 2026-05-07

### Added

#### C Engine (`libdejobe`)
- Multi-segment download engine with dynamic in-half splitting
- Connection pool with HTTP keep-alive reuse
- HTTP/HTTPS/FTP protocol handler via libcurl
- Token-bucket speed limiter (global + per-download)
- Binary state persistence with crash recovery (every 5 seconds)
- Exponential backoff error recovery with segment isolation
- Memory-mapped file assembly (CreateFileMapping/mmap)
- Adaptive dynamic splitter for real-time segment rebalancing

#### Python Application
- **DownloadManager**: Central orchestrator bridging UI, Engine, and Database
- **PyDownloadEngine**: Pure-Python async multi-segment download engine (aiohttp)
- **CategoryManager**: 7 default categories with auto-sorting by extension
- **ClipboardMonitor**: Auto-detect downloadable URLs from clipboard
- **Scheduler**: Timed tasks + post-completion actions (shutdown/sleep/exit)
- **SpeedController**: Python-side token-bucket bandwidth control
- **SiteGrabber**: Async website crawler with depth/filter controls
- **EngineBridge**: ctypes C↔Python bridge with callback marshalling

#### GUI (PySide6)
- **MainWindow**: Toolbar, category sidebar, download table with progress bars
- **ProgressWindow**: Real-time speed graph (QPainter) + colored segment bars
- **DownloadDialog**: URL input with clipboard detection, auth, scheduling
- **SettingsPanel**: 5-tab comprehensive configuration
- **QueueManager**: Queue CRUD with scheduling and post-actions
- **BatchDownload**: URL import from file/clipboard + pattern generator
- **SiteGrabber UI**: Website crawler dialog with live progress log
- **SystemTray**: Tray icon with notifications and quick actions

#### Browser Extension (Chrome/Edge)
- Manifest V3 with download interception
- Context menu "Download with Dejobe"
- Video/audio detection with overlay buttons
- Native messaging host for browser↔app IPC

#### Themes
- Dark theme (electric cyan accents)
- Light theme (GitHub-inspired)
- Dejobe Blue (deep navy with glassmorphism)

#### CLI
- `download` command with live progress bar
- `list` command with status filtering
- `status` command for download details

#### Infrastructure
- CMake build system for C engine
- PyInstaller packaging pipeline
- NSIS professional installer with UAC
- SQLite WAL database with thread-safe access
- Comprehensive documentation (API.md, BUILD.md)
