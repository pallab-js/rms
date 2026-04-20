import { describe, it, expect } from 'vitest'
import {
  menuCategorySchema,
  menuItemSchema,
  tableSchema,
  reservationSchema,
  staffSchema,
  inventoryItemSchema,
  expenseSchema,
  paymentSchema,
  settingsSchema,
  validateFormData,
} from '../validation'

describe('menuCategorySchema', () => {
  it('validates a valid menu category', () => {
    const data = { name: 'Appetizers', description: 'Start your meal right', color: '#ff0000' }
    const result = menuCategorySchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const data = { name: '' }
    const result = menuCategorySchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects invalid color format', () => {
    const data = { name: 'Test', color: 'not-a-color' }
    const result = menuCategorySchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('accepts valid hex color', () => {
    const data = { name: 'Test', color: '#f59e0b' }
    const result = menuCategorySchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})

describe('menuItemSchema', () => {
  it('validates a valid menu item', () => {
    const data = {
      category_id: 1,
      name: 'Paneer Tikka',
      price: 250,
    }
    const result = menuItemSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects negative price', () => {
    const data = { category_id: 1, name: 'Test', price: -10 }
    const result = menuItemSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects missing category_id', () => {
    const data = { name: 'Test', price: 100 }
    const result = menuItemSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('accepts optional fields', () => {
    const data = { category_id: 1, name: 'Test', price: 100, description: 'Delicious' }
    const result = menuItemSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})

describe('tableSchema', () => {
  it('validates a valid table', () => {
    const data = { table_number: 'T1', capacity: 4 }
    const result = tableSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects capacity less than 1', () => {
    const data = { table_number: 'T1', capacity: 0 }
    const result = tableSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects empty table number', () => {
    const data = { table_number: '', capacity: 4 }
    const result = tableSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('accepts valid status values', () => {
    const data = { table_number: 'T1', capacity: 4, status: 'occupied' }
    const result = tableSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects invalid status', () => {
    const data = { table_number: 'T1', capacity: 4, status: 'invalid' }
    const result = tableSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('reservationSchema', () => {
  it('validates a valid reservation', () => {
    const data = {
      table_id: 1,
      guest_name: 'John Doe',
      party_size: 4,
      reserved_date: '2026-04-20',
      reserved_time: '19:00',
    }
    const result = reservationSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects empty guest name', () => {
    const data = { guest_name: '', party_size: 2, reserved_date: '2026-04-20', reserved_time: '19:00' }
    const result = reservationSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects party size less than 1', () => {
    const data = { guest_name: 'John', party_size: 0, reserved_date: '2026-04-20', reserved_time: '19:00' }
    const result = reservationSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects invalid date format', () => {
    const data = { guest_name: 'John', party_size: 2, reserved_date: '20-04-2026', reserved_time: '19:00' }
    const result = reservationSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects invalid time format', () => {
    const data = { guest_name: 'John', party_size: 2, reserved_date: '2026-04-20', reserved_time: '7pm' }
    const result = reservationSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('accepts valid status values', () => {
    const data = {
      table_id: 1,
      guest_name: 'John',
      party_size: 2,
      reserved_date: '2026-04-20',
      reserved_time: '19:00',
      status: 'no-show',
    }
    const result = reservationSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('accepts null table_id', () => {
    const data = {
      table_id: null,
      guest_name: 'John',
      party_size: 2,
      reserved_date: '2026-04-20',
      reserved_time: '19:00',
    }
    const result = reservationSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})

describe('staffSchema', () => {
  it('validates a valid staff member', () => {
    const data = { name: 'Jane Doe', role: 'waiter', salary: 15000, salary_type: 'monthly' }
    const result = staffSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const data = { name: '', role: 'waiter', salary: 10000, salary_type: 'monthly' }
    const result = staffSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects negative salary', () => {
    const data = { name: 'Jane', role: 'waiter', salary: -100, salary_type: 'monthly' }
    const result = staffSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('accepts valid role values', () => {
    const data = { name: 'Jane', role: 'chef', salary: 20000, salary_type: 'monthly' }
    const result = staffSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects invalid role', () => {
    const data = { name: 'Jane', role: 'superadmin', salary: 10000, salary_type: 'monthly' }
    const result = staffSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('accepts valid email', () => {
    const data = { name: 'Jane', role: 'waiter', salary: 10000, salary_type: 'monthly', email: 'jane@test.com' }
    const result = staffSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const data = { name: 'Jane', role: 'waiter', salary: 10000, salary_type: 'monthly', email: 'not-an-email' }
    const result = staffSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('inventoryItemSchema', () => {
  it('validates a valid inventory item', () => {
    const data = { name: 'Rice', unit: 'kg', current_stock: 50, category_id: 1 }
    const result = inventoryItemSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const data = { name: '', unit: 'kg' }
    const result = inventoryItemSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects empty unit', () => {
    const data = { name: 'Rice', unit: '' }
    const result = inventoryItemSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('expenseSchema', () => {
  it('validates a valid expense', () => {
    const data = {
      category: 'Supplies',
      description: 'Purchased napkins',
      amount: 500,
      date: '2026-04-20',
    }
    const result = expenseSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects negative amount', () => {
    const data = { category: 'Test', description: 'Test', amount: -100, date: '2026-04-20' }
    const result = expenseSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects empty category', () => {
    const data = { category: '', description: 'Test', amount: 100, date: '2026-04-20' }
    const result = expenseSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('paymentSchema', () => {
  it('validates a valid payment', () => {
    const data = { amount_paid: 500, payment_method: 'cash' }
    const result = paymentSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects negative amount', () => {
    const data = { amount_paid: -100, payment_method: 'cash' }
    const result = paymentSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('accepts valid payment methods', () => {
    const data = { amount_paid: 100, payment_method: 'card' }
    const result = paymentSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})

describe('settingsSchema', () => {
  it('validates valid settings', () => {
    const data = {
      restaurant_name: 'My Restaurant',
      address: '123 Main St',
      phone: '+1234567890',
      currency_symbol: '₹',
      tax_rate: 5,
      tax_label: 'GST',
      tax_inclusive: false,
      receipt_header: 'Welcome',
      receipt_footer: 'Thank you',
      timezone: 'Asia/Kolkata',
      order_prefix: 'ORD',
      default_order_type: 'dine_in',
      auto_refresh_interval: 30,
    }
    const result = settingsSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects empty restaurant name', () => {
    const data = { restaurant_name: '', currency_symbol: '₹', tax_rate: 5, tax_label: 'GST', tax_inclusive: false, receipt_header: 'x', receipt_footer: 'x', timezone: 'x', order_prefix: 'x', default_order_type: 'dine_in', auto_refresh_interval: 30 }
    const result = settingsSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects invalid tax rate', () => {
    const data = { restaurant_name: 'Test', currency_symbol: '₹', tax_rate: 150, tax_label: 'GST', tax_inclusive: false, receipt_header: 'x', receipt_footer: 'x', timezone: 'x', order_prefix: 'x', default_order_type: 'dine_in', auto_refresh_interval: 30 }
    const result = settingsSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('validateFormData', () => {
  it('returns success for valid data', () => {
    const data = { table_number: 'T1', capacity: 4 }
    const result = validateFormData(tableSchema, data)
    expect(result.success).toBe(true)
    expect('data' in result).toBe(true)
  })

  it('returns errors for invalid data', () => {
    const data = { table_number: '', capacity: 4 }
    const result = validateFormData(tableSchema, data)
    expect(result.success).toBe(false)
    expect('errors' in result).toBe(true)
  })

  it('collects all field errors', () => {
    const data = { table_number: '', capacity: 0 }
    const result = validateFormData(tableSchema, data)
    expect(result.success).toBe(false)
    const errors = (result as { success: false; errors: Record<string, string> }).errors
    expect(Object.keys(errors).length).toBeGreaterThan(0)
  })
})