use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager, Runtime};
use chrono::Utc;

#[tauri::command]
pub async fn save_menu_image<R: Runtime>(app: AppHandle<R>, file_path: String) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let images_dir = app_dir.join("images");
    
    if !images_dir.exists() {
        fs::create_dir_all(&images_dir).map_err(|e| e.to_string())?;
    }
    
    let source_path = PathBuf::from(&file_path);
    let extension = source_path.extension().and_then(|e| e.to_str()).unwrap_or("png");
    let timestamp = Utc::now().format("%Y%m%d_%H%M%S_%f").to_string();
    let file_name = format!("{}.{}", timestamp, extension);
    let dest_path = images_dir.join(&file_name);
    
    fs::copy(&source_path, &dest_path).map_err(|e| e.to_string())?;
    
    // Return the path relative to the app data dir, or a custom tauri protocol path if configured
    Ok(dest_path.to_string_lossy().to_string())
}
