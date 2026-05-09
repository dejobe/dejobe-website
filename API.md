# Dejobe Download Manager — API Reference

## C Engine API (`libdejobe.dll`)

### Engine Lifecycle

```c
DDM_Engine* ddm_engine_create(const char* config_path);
void        ddm_engine_destroy(DDM_Engine* engine);
```

| Function | Description |
|----------|-------------|
| `ddm_engine_create` | Initialize the engine. Pass `NULL` for default config. Returns opaque handle. |
| `ddm_engine_destroy` | Shutdown engine and free all resources. |

### Download Management

```c
DDM_Download* ddm_download_create(DDM_Engine* engine, const char* url, const char* save_path);
int           ddm_download_start(DDM_Download* dl);
int           ddm_download_pause(DDM_Download* dl);
int           ddm_download_resume(DDM_Download* dl);
int           ddm_download_cancel(DDM_Download* dl);
```

All control functions return `0` on success, non-zero error code on failure.

### Progress & Status

```c
DDM_Progress ddm_download_progress(DDM_Download* dl);
DDM_Status   ddm_download_status(DDM_Download* dl);
```

#### `DDM_Progress` Fields

| Field | Type | Description |
|-------|------|-------------|
| `total_size` | `int64_t` | Total file size in bytes |
| `downloaded` | `int64_t` | Bytes downloaded so far |
| `percent` | `double` | 0.0 – 100.0 |
| `speed_bps` | `double` | Current speed (bytes/sec) |
| `avg_speed_bps` | `double` | Average speed |
| `peak_speed_bps` | `double` | Peak speed observed |
| `eta_seconds` | `int` | Estimated time remaining |
| `active_connections` | `int` | Currently active segments |

### Configuration

```c
void ddm_set_max_connections(DDM_Download* dl, int count);
void ddm_set_speed_limit(DDM_Download* dl, int64_t bytes_per_sec);
void ddm_set_proxy(DDM_Engine* engine, const char* proxy_url);
```

### Callbacks

```c
typedef void (*ddm_progress_cb)(int dl_id, DDM_Progress* progress, void* userdata);
typedef void (*ddm_complete_cb)(int dl_id, const char* filepath, void* userdata);
typedef void (*ddm_error_cb)(int dl_id, int error_code, const char* message, void* userdata);

void ddm_set_progress_callback(DDM_Download* dl, ddm_progress_cb cb, void* userdata);
void ddm_set_complete_callback(DDM_Download* dl, ddm_complete_cb cb, void* userdata);
void ddm_set_error_callback(DDM_Download* dl, ddm_error_cb cb, void* userdata);
```

---

## Python API

### `DownloadManager` (app/core/download_manager.py)

Central orchestrator for all download operations.

```python
manager = DownloadManager(config, db)

# Add a download
db_id = manager.add_download(url, save_path, filename)

# Control
manager.pause_download(db_id)
manager.resume_download(db_id)
manager.cancel_download(db_id)
manager.resume_all()
manager.pause_all()

# Progress (via signals)
manager.download_added.connect(on_added)       # (db_id, filename, file_size)
manager.progress_updated.connect(on_progress)   # (db_id, downloaded, total, speed, eta, status)
manager.download_completed.connect(on_done)     # (db_id, filename, save_path)
manager.download_failed.connect(on_error)       # (db_id, filename, error)
manager.global_speed_updated.connect(on_speed)  # (speed, active_count)
```

### `EngineBridge` (app/bridge.py)

ctypes bridge to the C engine. Falls back gracefully.

```python
bridge = EngineBridge()
if bridge.available:
    bridge.create_engine()
    handle = bridge.create_download(url, save_path)
    bridge.start_download(handle)
    progress = bridge.get_progress(handle)  # returns BridgeProgress
```

### `CategoryManager` (app/core/category_manager.py)

```python
categories = CategoryManager(db, default_save_dir)
cat_id = categories.detect_category("video.mp4")  # returns category ID
save_dir = categories.get_save_directory("video.mp4")  # "C:/Downloads/Videos"
```

### CLI Usage

```bash
python -m app.cli download <URL> [-o DIR] [-c CONNECTIONS] [-f FILENAME]
python -m app.cli list [-s STATUS]
python -m app.cli status <ID>
```
