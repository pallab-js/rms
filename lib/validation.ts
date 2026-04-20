import { z } from "zod"

export const menuCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default("#f59e0b"),
  icon: z.string().optional(),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
})

export const menuItemSchema = z.object({
  category_id: z.number().int().positive("Category is required"),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  price: z.number().min(0, "Price must be positive"),
  cost_price: z.number().min(0).default(0),
  sku: z.string().max(50).optional(),
  image_path: z.string().optional(),
  is_active: z.boolean().default(true),
  is_available: z.boolean().default(true),
  prep_time_min: z.number().int().min(0).default(0),
  sort_order: z.number().int().min(0).default(0),
})

export const tableSchema = z.object({
  table_number: z.string().min(1, "Table number is required").max(20),
  capacity: z.number().int().positive("Capacity must be at least 1"),
  section: z.string().max(50).default("Main"),
  status: z.enum(["available", "occupied", "reserved", "cleaning"]).default("available"),
  shape: z.enum(["rectangle", "circle", "square"]).default("rectangle"),
  pos_x: z.number().int().min(0).default(0),
  pos_y: z.number().int().min(0).default(0),
})

export const reservationSchema = z.object({
  table_id: z.number().int().positive().nullable(),
  guest_name: z.string().min(1, "Guest name is required").max(100),
  guest_phone: z.string().max(20).optional(),
  party_size: z.number().int().positive("Party size must be at least 1"),
  reserved_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  reserved_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  duration_min: z.number().int().min(15).default(90),
  status: z.enum(["confirmed", "seated", "cancelled", "no-show"]).default("confirmed"),
  notes: z.string().max(500).optional(),
})

export const staffSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  role: z.enum(["waiter", "chef", "cashier", "manager", "cleaner", "delivery"]),
  phone: z.string().max(20).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  salary: z.number().min(0, "Salary must be positive"),
  salary_type: z.enum(["monthly", "daily", "hourly"]),
  join_date: z.string().optional(),
  is_active: z.boolean().default(true),
  notes: z.string().max(500).optional(),
})

export const inventoryItemSchema = z.object({
  category_id: z.number().int().positive().nullable(),
  name: z.string().min(1, "Name is required").max(200),
  unit: z.string().min(1, "Unit is required").max(20),
  current_stock: z.number().min(0).default(0),
  min_stock_alert: z.number().min(0).default(0),
  cost_per_unit: z.number().min(0).default(0),
  supplier_name: z.string().max(100).optional(),
  supplier_phone: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
})

export const expenseSchema = z.object({
  category: z.string().min(1, "Category is required").max(50),
  description: z.string().min(1, "Description is required").max(500),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  paid_by: z.string().max(100).optional(),
  receipt_ref: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
})

export const paymentSchema = z.object({
  amount_paid: z.number().positive("Amount must be positive"),
  payment_method: z.enum(["cash", "card", "upi", "split", "other"]),
  change_given: z.number().min(0).default(0),
  reference_no: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
})

export const settingsSchema = z.object({
  restaurant_name: z.string().min(1).max(100),
  address: z.string().max(500),
  phone: z.string().max(20),
  email: z.string().email().optional().or(z.literal("")),
  currency_symbol: z.string().max(5).default("₹"),
  tax_rate: z.number().min(0).max(100),
  tax_label: z.string().max(20),
  tax_inclusive: z.boolean(),
  receipt_header: z.string().max(500),
  receipt_footer: z.string().max(500),
  timezone: z.string().max(50),
  order_prefix: z.string().max(10),
  default_order_type: z.enum(["dine_in", "takeaway", "delivery"]),
  auto_refresh_interval: z.number().int().min(5).max(300),
})

export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const path = issue.path.join(".")
    if (!errors[path]) {
      errors[path] = issue.message
    }
  }
  return { success: false, errors }
}