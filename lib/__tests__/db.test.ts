import { describe, it, expect } from 'vitest'
import { validateColumns } from '../db'

describe('validateColumns', () => {
  it('returns valid fields for restaurant_tables', () => {
    const data = {
      table_number: 'T1',
      capacity: 4,
      section: 'Main',
      invalid_field: 'trash'
    }
    const result = validateColumns('restaurant_tables', data)
    expect(result).toContain('table_number')
    expect(result).toContain('capacity')
    expect(result).toContain('section')
    expect(result).not.toContain('invalid_field')
  })

  it('returns valid fields for menu_items', () => {
    const data = {
      name: 'Burger',
      price: 10.5,
      is_active: true,
      created_at: '2023-01-01' // Not in allowed list for updates
    }
    const result = validateColumns('menu_items', data)
    expect(result).toEqual(['name', 'price', 'is_active'])
    expect(result).not.toContain('created_at')
  })

  it('returns empty array if no valid fields', () => {
    const data = { junk: 'data', foo: 'bar' }
    const result = validateColumns('settings', data)
    expect(result).toEqual([])
  })

  it('handles mixed valid and invalid fields for staff', () => {
    const data = { name: 'Alice', role: 'waiter', id: 5, unknown: 'field' }
    const result = validateColumns('staff', data)
    expect(result).toContain('name')
    expect(result).toContain('role')
    expect(result).not.toContain('id')
    expect(result).not.toContain('unknown')
  })

  it('correctly filters for reservations', () => {
    const data = {
      guest_name: 'Bob',
      party_size: 2,
      created_at: 'now',
      capacity: 4 // Belongs to tables, not reservations
    }
    const result = validateColumns('reservations', data)
    expect(result).toContain('guest_name')
    expect(result).toContain('party_size')
    expect(result).not.toContain('created_at')
    expect(result).not.toContain('capacity')
  })

  it('ignores invalid fields for orders', () => {
    const data = { status: 'pending', invalid_field: 'trash' }
    const result = validateColumns('orders', data)
    expect(result).toEqual(['status'])
    expect(result).not.toContain('invalid_field')
  })
})
