import { execute } from "./connection";

export const SAFE_TABLES = ['menu_categories', 'menu_items', 'modifiers', 'restaurant_tables', 'reservations', 'orders', 'order_items', 'payments', 'inventory_categories', 'inventory_items', 'inventory_transactions', 'staff', 'attendance', 'expenses', 'settings'] as const;
export type SafeTable = typeof SAFE_TABLES[number];

export const VALID_COLUMNS: Record<SafeTable, readonly string[]> = {
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

export async function logAudit(
  table: string,
  id: number,
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  newData: unknown = null,
  oldData: unknown = null
): Promise<void> {
  try {
    await execute(
      "INSERT INTO audit_logs (table_name, record_id, action, new_data, old_data) VALUES (?, ?, ?, ?, ?)",
      [table, id, action, newData ? JSON.stringify(newData) : null, oldData ? JSON.stringify(oldData) : null]
    );
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]", error);
  }
}
