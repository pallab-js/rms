import { z } from 'zod';

export const MenuItemSchema = z.object({
  id: z.number().optional(),
  category_id: z.number().int().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0),
  cost_price: z.number().min(0).default(0),
  sku: z.string().max(50).optional(),
  image_path: z.string().optional(),
  is_active: z.number().int().min(0).max(1).default(1),
  is_available: z.number().int().min(0).max(1).default(1),
  prep_time_min: z.number().int().min(0).default(0),
  sort_order: z.number().int().default(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type MenuItem = z.infer<typeof MenuItemSchema>;

export const OrderSchema = z.object({
  id: z.number().optional(),
  order_number: z.string().min(1).max(50),
  table_id: z.number().int().min(1).optional().nullable(),
  party_size: z.number().int().min(1).default(1),
  order_type: z.enum(['dine_in', 'takeaway', 'delivery']).default('dine_in'),
  status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled']).default('pending'),
  customer_name: z.string().max(100).optional(),
  customer_phone: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
  subtotal: z.number().min(0).default(0),
  discount_type: z.enum(['none', 'percentage', 'fixed']).default('none'),
  discount_val: z.number().min(0).default(0),
  tax_amount: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  completed_at: z.string().optional().nullable(),
});

export type Order = z.infer<typeof OrderSchema>;

export const OrderItemSchema = z.object({
  id: z.number().optional(),
  order_id: z.number().int().min(1),
  menu_item_id: z.number().int().min(1),
  quantity: z.number().int().min(1).default(1),
  unit_price: z.number().min(0),
  modifiers_chosen: z.string().optional(),
  item_notes: z.string().max(500).optional(),
  status: z.enum(['pending', 'preparing', 'ready', 'served']).default('pending'),
  created_at: z.string().optional(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;