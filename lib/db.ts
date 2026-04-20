import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (typeof window === 'undefined') {
    throw new Error('DB not available in SSR context');
  }
  if (!db) {
    db = await Database.load('sqlite:restaurantOS.db');
    await optimizeDatabase(db);
  }
  return db;
}

export async function optimizeDatabase(database: Database): Promise<void> {
  const optimizations = [
    { pragma: 'journal_mode', value: 'WAL' },
    { pragma: 'synchronous', value: 'NORMAL' },
    { pragma: 'cache_size', value: -64000 },
    { pragma: 'temp_store', value: 'MEMORY' },
    { pragma: 'foreign_keys', value: 'ON' },
    { pragma: 'busy_timeout', value: 5000 },
  ];
  for (const opt of optimizations) {
    try {
      await database.execute(`PRAGMA ${opt.pragma} = ${opt.value}`);
    } catch (err) {
      console.warn(`[DB_OPTIMIZE] Failed to set PRAGMA ${opt.pragma}:`, err);
    }
  }
  console.log('[DB_OPTIMIZE] SQLite optimized for Apple Silicon (WAL mode)');
}

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  try {
    const database = await getDb();
    if (!database) return [];
    return await database.select<T[]>(sql, params);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[DB_QUERY_ERROR] SQL: "${sql}" | Params: ${JSON.stringify(params)} | Error: ${errorMsg}`);
    throw new Error(`Database operation failed. ${process.env.NODE_ENV === 'development' ? `Details: ${errorMsg}` : 'Please try again or contact support.'}`);
  }
}

export async function execute(sql: string, params: unknown[] = []): Promise<{ changes: number; lastInsertRowid: number | bigint | null }> {
  try {
    const database = await getDb();
    if (!database) return { changes: 0, lastInsertRowid: null };
    const result = await database.execute(sql, params);
    return { changes: result.rowsAffected, lastInsertRowid: result.lastInsertId };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[DB_EXECUTE_ERROR] SQL: "${sql}" | Params: ${JSON.stringify(params)} | Error: ${errorMsg}`);
    throw new Error(`Database write failed. ${process.env.NODE_ENV === 'development' ? `Details: ${errorMsg}` : 'Please try again.'}`);
  }
}

export async function withTransaction<T>(fn: () => Promise<T>): Promise<T> {
  const database = await getDb();
  await database.execute("BEGIN TRANSACTION");
  try {
    const result = await fn();
    await database.execute("COMMIT");
    return result;
  } catch (error) {
    await database.execute("ROLLBACK");
    throw error;
  }
}

const SAFE_TABLES = ['menu_categories', 'menu_items', 'modifiers', 'restaurant_tables', 'reservations', 'orders', 'order_items', 'payments', 'inventory_categories', 'inventory_items', 'inventory_transactions', 'staff', 'attendance', 'expenses', 'settings'] as const;
type SafeTable = typeof SAFE_TABLES[number];

const VALID_COLUMNS: Record<SafeTable, readonly string[]> = {
  menu_categories: ['name', 'description', 'color', 'icon', 'sort_order', 'is_active'],
  menu_items: ['category_id', 'name', 'description', 'price', 'cost_price', 'sku', 'image_path', 'is_active', 'is_available', 'prep_time_min', 'sort_order'],
  modifiers: ['menu_item_id', 'name', 'options', 'is_required'],
  restaurant_tables: ['table_number', 'capacity', 'section', 'status', 'shape', 'pos_x', 'pos_y'],
  reservations: ['table_id', 'guest_name', 'guest_phone', 'party_size', 'reserved_date', 'reserved_time', 'duration_min', 'status', 'notes'],
  orders: ['order_number', 'table_id', 'party_size', 'order_type', 'status', 'customer_name', 'customer_phone', 'notes', 'subtotal', 'discount_type', 'discount_val', 'tax_amount', 'total', 'completed_at'],
  order_items: ['order_id', 'menu_item_id', 'quantity', 'unit_price', 'modifiers_chosen', 'item_notes', 'status'],
  payments: ['order_id', 'amount_paid', 'payment_method', 'change_given', 'reference_no', 'notes'],
  inventory_categories: ['name'],
  inventory_items: ['category_id', 'name', 'unit', 'current_stock', 'min_stock_alert', 'cost_per_unit', 'supplier_name', 'supplier_phone', 'last_restocked', 'notes'],
  inventory_transactions: ['item_id', 'type', 'quantity', 'notes'],
  staff: ['name', 'role', 'phone', 'email', 'salary', 'salary_type', 'join_date', 'is_active', 'notes'],
  attendance: ['staff_id', 'date', 'check_in', 'check_out', 'status', 'notes'],
  expenses: ['category', 'description', 'amount', 'date', 'paid_by', 'receipt_ref', 'notes'],
  settings: ['key', 'value'],
} as const;

export function validateColumns<T extends SafeTable>(table: T, data: Record<string, unknown>): string[] {
  const allowed = VALID_COLUMNS[table];
  const validFields: string[] = [];
  for (const key of Object.keys(data)) {
    if (allowed.includes(key as typeof allowed[number])) {
      validFields.push(key);
    }
  }
  return validFields;
}

export function buildUpdateSql<T extends SafeTable>(
  table: T,
  data: Record<string, unknown>,
  id: number
): { sql: string; params: unknown[] } {
  if (!SAFE_TABLES.includes(table)) {
    throw new Error(`[SECURITY] Unsafe table name: ${table}`);
  }
  const fields = validateColumns(table, data);
  if (fields.length === 0) {
    throw new Error(`No valid fields to update for table: ${table}`);
  }
  const setClauses = fields.map(f => `${f} = ?`).join(', ');
  const params = fields.map(f => {
    const val = data[f];
    if (typeof val === 'boolean') return val ? 1 : 0;
    if (val === null || val === undefined) return null;
    return val;
  });
  params.push(id);
  return { sql: `UPDATE ${table} SET ${setClauses} WHERE id = ?`, params };
}

export async function runMigrations(): Promise<void> {
  try {
    console.log("DB: Starting migrations...");
    const database = await getDb();

    // Settings table
    await database.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    console.log("DB: Settings table verified.");

    // Menu Categories
    await database.execute(`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL UNIQUE,
        description TEXT,
        color       TEXT    DEFAULT '#f59e0b',
        icon        TEXT,
        sort_order  INTEGER DEFAULT 0,
        is_active   INTEGER DEFAULT 1,
        created_at  TEXT    DEFAULT (datetime('now'))
      );
    `);

    // Menu Items
    await database.execute(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id   INTEGER NOT NULL REFERENCES menu_categories(id) ON DELETE RESTRICT,
        name          TEXT    NOT NULL,
        description   TEXT,
        price         REAL    NOT NULL CHECK(price >= 0),
        cost_price    REAL    DEFAULT 0,
        sku           TEXT    UNIQUE,
        image_path    TEXT,
        is_active     INTEGER DEFAULT 1,
        is_available  INTEGER DEFAULT 1,
        prep_time_min INTEGER DEFAULT 0,
        sort_order    INTEGER DEFAULT 0,
        created_at    TEXT    DEFAULT (datetime('now')),
        updated_at    TEXT    DEFAULT (datetime('now'))
      );
    `);

    // Modifiers
    await database.execute(`
      CREATE TABLE IF NOT EXISTS modifiers (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        menu_item_id  INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
        name          TEXT    NOT NULL,
        options       TEXT    NOT NULL,
        is_required   INTEGER DEFAULT 0
      );
    `);

    // Tables
    await database.execute(`
      CREATE TABLE IF NOT EXISTS restaurant_tables (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        table_number TEXT   NOT NULL UNIQUE,
        capacity     INTEGER NOT NULL DEFAULT 4,
        section      TEXT    DEFAULT 'Main',
        status       TEXT    DEFAULT 'available',
        shape        TEXT    DEFAULT 'rectangle',
        pos_x        INTEGER DEFAULT 0,
        pos_y        INTEGER DEFAULT 0,
        created_at   TEXT    DEFAULT (datetime('now'))
      );
    `);

    // Reservations
    await database.execute(`
      CREATE TABLE IF NOT EXISTS reservations (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        table_id      INTEGER REFERENCES restaurant_tables(id) ON DELETE SET NULL,
        guest_name    TEXT    NOT NULL,
        guest_phone   TEXT,
        party_size    INTEGER NOT NULL,
        reserved_date TEXT    NOT NULL,
        reserved_time TEXT    NOT NULL,
        duration_min  INTEGER DEFAULT 90,
        status        TEXT    DEFAULT 'confirmed',
        notes         TEXT,
        created_at    TEXT    DEFAULT (datetime('now'))
      );
    `);

    // Orders
    await database.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number  TEXT    NOT NULL UNIQUE,
        table_id      INTEGER REFERENCES restaurant_tables(id) ON DELETE SET NULL,
        party_size    INTEGER DEFAULT 1,
        order_type    TEXT    NOT NULL DEFAULT 'dine_in',
        status        TEXT    NOT NULL DEFAULT 'pending',
        customer_name TEXT,
        customer_phone TEXT,
        notes         TEXT,
        subtotal      REAL    DEFAULT 0,
        discount_type TEXT    DEFAULT 'none',
        discount_val  REAL    DEFAULT 0,
        tax_amount    REAL    DEFAULT 0,
        total         REAL    DEFAULT 0,
        created_at    TEXT    DEFAULT (datetime('now')),
        updated_at    TEXT    DEFAULT (datetime('now')),
        completed_at  TEXT
      );
    `);

    // Migration: Add party_size if it doesn't exist (for existing DBs)
    try {
      await database.execute("ALTER TABLE orders ADD COLUMN party_size INTEGER DEFAULT 1");
      console.log("DB: Added party_size column to orders table.");
    } catch {
      // Ignore error if column already exists
    }

    console.log("DB: Orders table verified.");
    // Order Items
    await database.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id         INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id     INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
        quantity         INTEGER NOT NULL DEFAULT 1,
        unit_price       REAL    NOT NULL,
        modifiers_chosen TEXT,
        item_notes       TEXT,
        status           TEXT    DEFAULT 'pending',
        created_at       TEXT    DEFAULT (datetime('now'))
      );
    `);

    // Payments
    await database.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id       INTEGER NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
        amount_paid    REAL    NOT NULL,
        payment_method TEXT    NOT NULL DEFAULT 'cash',
        change_given   REAL    DEFAULT 0,
        reference_no   TEXT,
        paid_at        TEXT    DEFAULT (datetime('now')),
        notes          TEXT
      );
    `);

    // Inventory Categories
    await database.execute(`
      CREATE TABLE IF NOT EXISTS inventory_categories (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL UNIQUE,
        created_at TEXT    DEFAULT (datetime('now'))
      );
    `);

    // Inventory Items
    await database.execute(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id     INTEGER REFERENCES inventory_categories(id) ON DELETE SET NULL,
        name            TEXT    NOT NULL,
        unit            TEXT    NOT NULL DEFAULT 'kg',
        current_stock   REAL    DEFAULT 0,
        min_stock_alert REAL    DEFAULT 0,
        cost_per_unit   REAL    DEFAULT 0,
        supplier_name   TEXT,
        supplier_phone  TEXT,
        last_restocked  TEXT,
        notes           TEXT,
        created_at      TEXT    DEFAULT (datetime('now')),
        updated_at      TEXT    DEFAULT (datetime('now'))
      );
    `);

    // Inventory Transactions
    await database.execute(`
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id       INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
        type          TEXT    NOT NULL,
        quantity      REAL    NOT NULL,
        notes         TEXT,
        created_at    TEXT    DEFAULT (datetime('now'))
      );
    `);

    // Staff
    await database.execute(`
      CREATE TABLE IF NOT EXISTS staff (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT    NOT NULL,
        role          TEXT    NOT NULL DEFAULT 'waiter',
        phone         TEXT,
        email         TEXT,
        salary        REAL    DEFAULT 0,
        salary_type   TEXT    DEFAULT 'monthly',
        join_date     TEXT,
        is_active     INTEGER DEFAULT 1,
        notes         TEXT,
        created_at    TEXT    DEFAULT (datetime('now'))
      );
    `);

    // Attendance
    await database.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id    INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
        date        TEXT    NOT NULL,
        check_in    TEXT,
        check_out   TEXT,
        status      TEXT    DEFAULT 'present',
        notes       TEXT,
        UNIQUE(staff_id, date)
      );
    `);

    // Expenses
    await database.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        category    TEXT    NOT NULL,
        description TEXT    NOT NULL,
        amount      REAL    NOT NULL,
        date        TEXT    NOT NULL,
        paid_by     TEXT,
        receipt_ref TEXT,
        notes       TEXT,
        created_at  TEXT    DEFAULT (datetime('now'))
      );
    `);

    // Daily Summaries
    await database.execute(`
      CREATE TABLE IF NOT EXISTS daily_summaries (
        date              TEXT PRIMARY KEY,
        total_orders      INTEGER DEFAULT 0,
        total_revenue     REAL    DEFAULT 0,
        total_tax         REAL    DEFAULT 0,
        total_discount    REAL    DEFAULT 0,
        cash_sales        REAL    DEFAULT 0,
        card_sales        REAL    DEFAULT 0,
        upi_sales         REAL    DEFAULT 0,
        total_covers      INTEGER DEFAULT 0,
        avg_order_value   REAL    DEFAULT 0,
        updated_at        TEXT    DEFAULT (datetime('now'))
      );
    `);

    // Create indexes for performance
    await database.execute(`CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at)`);
    await database.execute(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`);
    await database.execute(`CREATE INDEX IF NOT EXISTS idx_attendance_staff_date ON attendance(staff_id, date)`);
    await database.execute(`CREATE INDEX IF NOT EXISTS idx_inventory_stock_alert ON inventory_items(current_stock, min_stock_alert)`);

    console.log("DB: All tables verified.");

    // Seed default settings if table is empty
    interface CountRow { count: number }
    const results = await database.select<CountRow[]>("SELECT COUNT(*) as count FROM settings");
    const count = results[0]?.count || 0;
    
    if (count === 0) {
      console.log("DB: Seeding default settings...");
      await database.execute(`
        INSERT INTO settings (key, value) VALUES
        ('restaurant_name', 'The Golden Fork'),
        ('currency_symbol', '₹'),
        ('tax_rate', '5'),
        ('tax_label', 'GST'),
        ('tax_inclusive', '0'),
        ('address', '123 Food Street, Guwahati, Assam 781001'),
        ('phone', '+91 98765 43210'),
        ('email', 'contact@goldenfork.com'),
        ('receipt_footer', 'Thank you for dining with us!'),
        ('timezone', 'Asia/Kolkata'),
        ('order_prefix', 'ORD'),
        ('default_order_type', 'dine_in'),
        ('auto_refresh_interval', '30');
      `);
      console.log("DB: Default settings seeded.");
    }

    console.log("DB: Migrations completed successfully.");
  } catch (err) {
    console.error("DB: Migration error:", err);
    throw err;
  }
}
