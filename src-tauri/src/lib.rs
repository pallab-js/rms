//! RestaurantOS Tauri Application
//!
//! ## Architecture Overview
//!
//! This app uses a hybrid approach for database operations:
//! - **Most DB operations**: Handled directly in frontend via `@tauri-apps/plugin-sql`
//!   (query/execute from lib/db.ts). All business logic (orders, billing, inventory,
//!   staff, reports) goes through this path for simplicity and offline-first capability.
//! - **Tauri commands**: Only used for operations that REQUIRE Rust/:
//!   - `generate_order_number`: Needs Rust's randomness source for unique IDs
//!   - `save_menu_image`: File system access for custom uploads
//!   - `get_db_info`: Read SQLite file metadata for display
//!   - `export_database`: Copy DB file to user-selected location
//!   - `get_app_version`: Read Cargo.toml at compile time
//!   - `get_db_path`: Get SQLite file path for Settings display
//!
//! This design keeps business logic in TypeScript where it's easier to maintain,
//! while using Tauri only where native capabilities are needed.

pub mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(commands::db::DbState {
      conn: std::sync::Mutex::new(None),
    })
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::db::db_init,
      commands::db::db_close,
      commands::db::db_query,
      commands::db::db_execute,
      commands::db::db_upsert,
      commands::db::db_delete,
      commands::db::db_set_setting,
      commands::settings::get_db_info,
      commands::settings::export_database,
      commands::settings::create_backup,
      commands::settings::get_app_version,
      commands::settings::get_db_path,
      commands::menu::save_menu_image,
      commands::orders::generate_order_number,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
