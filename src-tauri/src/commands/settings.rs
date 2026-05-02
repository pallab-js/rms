use serde::Serialize;
use std::fs;
use tauri::{AppHandle, Manager, Runtime};

#[derive(Debug, Serialize)]
pub struct DbInfo {
    pub path: String,
    pub size_bytes: u64,
}

#[tauri::command]
pub async fn get_db_info<R: Runtime>(app: AppHandle<R>) -> Result<DbInfo, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("restaurantOS.db");

    let metadata = fs::metadata(&db_path).map_err(|e| e.to_string())?;

    Ok(DbInfo {
        path: db_path.to_string_lossy().to_string(),
        size_bytes: metadata.len(),
    })
}

#[tauri::command]
pub async fn export_database<R: Runtime>(
    app: AppHandle<R>,
    dest_path: String,
) -> Result<(), String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("restaurantOS.db");

    fs::copy(db_path, dest_path).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn create_backup<R: Runtime>(app: AppHandle<R>) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("restaurantOS.db");

    let backups_dir = app_dir.join("backups");
    if !backups_dir.exists() {
        fs::create_dir_all(&backups_dir).map_err(|e| e.to_string())?;
    }

    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S").to_string();
    let backup_path = backups_dir.join(format!("backup_{}.db", timestamp));

    fs::copy(&db_path, &backup_path).map_err(|e| e.to_string())?;

    Ok(backup_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
pub async fn get_db_path<R: Runtime>(app: AppHandle<R>) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("restaurantOS.db");
    Ok(db_path.to_string_lossy().to_string())
}
