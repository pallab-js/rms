import { invoke } from "@tauri-apps/api/core";

let isInitialized = false;

export async function dbInit(pin: string): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('DB not available in SSR context');
  }
  try {
    await invoke("db_init", { pin });
    isInitialized = true;
    console.log('[DB] Initialized with encryption');
    // Note: runMigrations() should be called by the orchestrator after dbInit
    invoke("create_backup").catch(err => console.error("[DB_BACKUP_ERROR]", err));
  } catch (error) {
    isInitialized = false;
    throw error;
  }
}

export async function dbClose(): Promise<void> {
  try {
    await invoke("db_close");
    isInitialized = false;
    console.log('[DB] Connection closed');
  } catch (error) {
    console.error('[DB_CLOSE_ERROR]', error);
    throw error;
  }
}

export function isDbReady(): boolean {
  return isInitialized;
}

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  try {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }
    return await invoke<T[]>("db_query", { sql, params });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[DB_QUERY_ERROR] SQL: "${sql}" | Params: ${JSON.stringify(params)} | Error: ${errorMsg}`);
    throw new Error(`Database operation failed. ${process.env.NODE_ENV === 'development' ? `Details: ${errorMsg}` : 'Please try again or contact support.'}`);
  }
}

export async function execute(sql: string, params: unknown[] = []): Promise<{ changes: number; lastInsertRowid: number | bigint | null }> {
  try {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }
    const result = await invoke<{ rows_affected: number; last_insert_id: number | null }>("db_execute", { sql, params });
    return { changes: result.rows_affected, lastInsertRowid: result.last_insert_id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[DB_EXECUTE_ERROR] SQL: "${sql}" | Params: ${JSON.stringify(params)} | Error: ${errorMsg}`);
    throw new Error(`Database write failed. ${process.env.NODE_ENV === 'development' ? `Details: ${errorMsg}` : 'Please try again.'}`);
  }
}

export async function upsert(table: string, data: Record<string, unknown>, id?: number): Promise<{ changes: number; lastInsertRowid: number | bigint | null }> {
  try {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }
    const result = await invoke<{ rows_affected: number; last_insert_id: number | null }>("db_upsert", { table, data, id: id || null });
    return { changes: result.rows_affected, lastInsertRowid: result.last_insert_id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[DB_UPSERT_ERROR] Table: "${table}" | ID: ${id} | Error: ${errorMsg}`);
    throw new Error(`Database operation failed. ${process.env.NODE_ENV === 'development' ? `Details: ${errorMsg}` : 'Please try again.'}`);
  }
}

export async function dbDelete(table: string, id: number): Promise<{ changes: number }> {
  try {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }
    const result = await invoke<{ rows_affected: number }>("db_delete", { table, id });
    return { changes: result.rows_affected };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[DB_DELETE_ERROR] Table: "${table}" | ID: ${id} | Error: ${errorMsg}`);
    throw new Error(`Database delete failed. ${process.env.NODE_ENV === 'development' ? `Details: ${errorMsg}` : 'Please try again.'}`);
  }
}

export async function setDbSetting(key: string, value: string): Promise<void> {
  try {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }
    await invoke("db_set_setting", { key, value });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[DB_SET_SETTING_ERROR] Key: "${key}" | Error: ${errorMsg}`);
    throw new Error(`Failed to save setting. ${process.env.NODE_ENV === 'development' ? `Details: ${errorMsg}` : 'Please try again.'}`);
  }
}

export async function withTransaction<T>(fn: () => Promise<T>): Promise<T> {
  await execute("BEGIN TRANSACTION");
  try {
    const result = await fn();
    await execute("COMMIT");
    return result;
  } catch (error) {
    await execute("ROLLBACK");
    throw error;
  }
}
