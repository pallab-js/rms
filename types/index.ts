export interface SettingEntry {
  key: string;
  value: string;
}

export interface SettingsData {
  restaurant_name: string;
  address: string;
  phone: string;
  email: string;
  currency_symbol: string;
  tax_rate: number;
  tax_label: string;
  tax_inclusive: boolean;
  receipt_header: string;
  receipt_footer: string;
  timezone: string;
  order_prefix: string;
  default_order_type: 'dine_in' | 'takeaway' | 'delivery';
  auto_refresh_interval: number;
}

export interface DbInfo {
  path: string;
  size_bytes: number;
}

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  description?: string;
  price: number;
  cost_price: number;
  sku?: string;
  image_path?: string;
  is_active: boolean;
  is_available: boolean;
  prep_time_min: number;
  sort_order: number;
  margin?: number;
}

export interface ModifierOption {
  label: string;
  price_delta: number;
}

export interface Modifier {
  id: number;
  menu_item_id: number;
  name: string;
  options: ModifierOption[];
  is_required: boolean;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';
export type TableShape = 'rectangle' | 'circle' | 'square';

export interface RestaurantTable {
  id: number;
  table_number: string;
  capacity: number;
  section: string;
  status: TableStatus;
  shape: TableShape;
  pos_x: number;
  pos_y: number;
  created_at?: string;
}

export type ReservationStatus = 'confirmed' | 'seated' | 'cancelled' | 'no-show';

export interface Reservation {
  id: number;
  table_id: number | null;
  guest_name: string;
  guest_phone?: string;
  party_size: number;
  reserved_date: string;
  reserved_time: string;
  duration_min: number;
  status: ReservationStatus;
  notes?: string;
  created_at?: string;
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';

export interface Order {
  id: number;
  order_number: string;
  table_id?: number;
  table_number?: string;
  order_type: OrderType;
  status: OrderStatus;
  party_size: number;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  subtotal: number;
  discount_type: 'none' | 'percent' | 'flat';
  discount_val: number;
  tax_amount: number;
  total: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  menu_item_name?: string;
  quantity: number;
  unit_price: number;
  modifiers_chosen?: string;
  item_notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  created_at?: string;
}

export interface InventoryCategory {
  id: number;
  name: string;
  created_at: string;
}

export interface InventoryItem {
  id: number;
  category_id: number | null;
  category_name?: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock_alert: number;
  cost_per_unit: number;
  supplier_name?: string;
  supplier_phone?: string;
  last_restocked?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'restock' | 'usage' | 'waste' | 'adjustment';

export interface InventoryTransaction {
  id: number;
  item_id: number;
  item_name?: string;
  type: TransactionType;
  quantity: number;
  notes?: string;
  created_at: string;
}

export type StaffRole = 'waiter' | 'chef' | 'cashier' | 'manager' | 'cleaner' | 'delivery';
export type SalaryType = 'monthly' | 'daily' | 'hourly';

export interface Staff {
  id: number;
  name: string;
  role: StaffRole;
  phone?: string;
  email?: string;
  salary: number;
  salary_type: SalaryType;
  join_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave';

export interface AttendanceRecord {
  id: number;
  staff_id: number;
  staff_name?: string;
  role?: StaffRole;
  date: string;
  check_in?: string;
  check_out?: string;
  status: AttendanceStatus;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'split' | 'other';

export interface Payment {
  id: number;
  order_id: number;
  order_number?: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  change_given: number;
  reference_no?: string;
  paid_at: string;
  notes?: string;
}

export interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: string;
  paid_by?: string;
  receipt_ref?: string;
  notes?: string;
  created_at: string;
}

export interface SalesSummary {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  total_tax: number;
  total_discount: number;
}

export interface HourlySales {
  hour: string;
  revenue: number;
}

export interface OrderTypeSplit {
  type: string;
  revenue: number;
}

export interface PaymentMethodSplit {
  method: string;
  revenue: number;
}

export interface MenuItemPerformance {
  item_name: string;
  quantity_sold: number;
  revenue: number;
  category_name?: string;
}

export interface DashboardStats {
  today_revenue: number;
  yesterday_revenue: number;
  active_orders: number;
  pending_orders: number;
  tables_occupied: number;
  total_tables: number;
  covers_today: number;
  avg_order_value: number;
  hourly_sales: { hour: string; revenue: number }[];
  recent_orders: Order[];
  low_stock_count: number;
  upcoming_reservations: Reservation[];
}
