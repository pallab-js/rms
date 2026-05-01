use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};
use std::path::PathBuf;

pub struct DbState {
    pub conn: Mutex<Option<Connection>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryResult {
    pub rows: Vec<Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecuteResult {
    pub rows_affected: usize,
    pub last_insert_id: Option<i64>,
}

#[tauri::command]
pub async fn db_init(
    app: AppHandle,
    state: State<'_, DbState>,
    pin: String,
) -> Result<(), String> {
    let mut conn_lock = state.conn.lock().map_err(|_| "Failed to lock database state")?;
    
    if conn_lock.is_some() {
        return Ok(());
    }

    let app_dir = app.path().app_data_dir().map_err(|_| "Could not find app data directory")?;
    if !app_dir.exists() {
        std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    }
    let db_path = app_dir.join("restaurantOS.db");
    
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    
    // Set encryption key
    conn.pragma_update(None, "key", pin).map_err(|e| e.to_string())?;
    
    // Apply optimizations
    let optimizations = [
        ("journal_mode", "WAL"),
        ("synchronous", "FULL"),
        ("cache_size", "-64000"),
        ("temp_store", "MEMORY"),
        ("foreign_keys", "ON"),
        ("busy_timeout", "5000"),
        ("wal_autocheckpoint", "1000"),
    ];

    for (name, value) in optimizations {
        conn.pragma_update(None, name, value).map_err(|e| format!("Failed to set {}: {}", name, e))?;
    }

    // Test connection / initialization
    conn.execute("SELECT 1", []).map_err(|_| "Authentication failed: Invalid PIN or corrupted database")?;

    *conn_lock = Some(conn);
    Ok(())
}

#[tauri::command]
pub async fn db_query(
    state: State<'_, DbState>,
    sql: String,
    params: Vec<Value>,
) -> Result<Vec<serde_json::Map<String, Value>>, String> {
    let conn_lock = state.conn.lock().map_err(|_| "Failed to lock database state")?;
    let conn = conn_lock.as_ref().ok_or("Database not initialized")?;

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let column_names: Vec<String> = stmt.column_names().into_iter().map(|s| s.to_string()).collect();
    
    let rows = stmt.query_map(rusqlite::params_from_iter(params.iter().map(json_to_rusqlite)), |row| {
        let mut map = serde_json::Map::new();
        for (i, name) in column_names.iter().enumerate() {
            let val: rusqlite::types::Value = row.get(i)?;
            map.insert(name.clone(), rusqlite_to_json(val));
        }
        Ok(map)
    }).map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }
    
    Ok(results)
}

#[tauri::command]
pub async fn db_execute(
    state: State<'_, DbState>,
    sql: String,
    params: Vec<Value>,
) -> Result<ExecuteResult, String> {
    let conn_lock = state.conn.lock().map_err(|_| "Failed to lock database state")?;
    let conn = conn_lock.as_ref().ok_or("Database not initialized")?;

    let rows_affected = conn.execute(&sql, rusqlite::params_from_iter(params.iter().map(json_to_rusqlite)))
        .map_err(|e| e.to_string())?;
    
    let last_insert_id = if rows_affected > 0 {
        Some(conn.last_insert_rowid())
    } else {
        None
    };

    Ok(ExecuteResult {
        rows_affected,
        last_insert_id,
    })
}

fn json_to_rusqlite(v: &Value) -> rusqlite::types::Value {
    match v {
        Value::Null => rusqlite::types::Value::Null,
        Value::Bool(b) => rusqlite::types::Value::Integer(if *b { 1 } else { 0 }),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                rusqlite::types::Value::Integer(i)
            } else if let Some(f) = n.as_f64() {
                rusqlite::types::Value::Real(f)
            } else {
                rusqlite::types::Value::Null
            }
        }
        Value::String(s) => rusqlite::types::Value::Text(s.clone()),
        _ => rusqlite::types::Value::Text(v.to_string()),
    }
}

fn rusqlite_to_json(v: rusqlite::types::Value) -> Value {
    match v {
        rusqlite::types::Value::Null => Value::Null,
        rusqlite::types::Value::Integer(i) => Value::Number(serde_json::Number::from(i)),
        rusqlite::types::Value::Real(f) => Value::Number(serde_json::Number::from_f64(f).unwrap_or(serde_json::Number::from(0))),
        rusqlite::types::Value::Text(s) => Value::String(s),
        rusqlite::types::Value::Blob(b) => Value::String(hex::encode(b)), // Simplified
    }
}
