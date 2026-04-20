use chrono::Local;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Mutex;

static ORDER_COUNTER: AtomicU32 = AtomicU32::new(1);
static LAST_DATE: Mutex<Option<String>> = Mutex::new(None);

#[tauri::command]
pub async fn generate_order_number() -> Result<String, String> {
    let now = Local::now();
    let date_str = now.format("%Y%m%d").to_string();
    
    let mut last_date = LAST_DATE.lock().map_err(|e| e.to_string())?;
    
    if last_date.as_ref() != Some(&date_str) {
        ORDER_COUNTER.store(1, Ordering::SeqCst);
        *last_date = Some(date_str.clone());
    }
    
    let count = ORDER_COUNTER.fetch_add(1, Ordering::SeqCst);
    Ok(format!("ORD-{}-{:04}", date_str, count))
}
