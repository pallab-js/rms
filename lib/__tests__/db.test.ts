import { describe, it, expect } from 'vitest'
import { validateColumns, buildUpdateSql } from '../db'

describe('validateColumns', () => {
  it('returns valid fields for restaurant_tables', () => {
    const data = {
      table_number: 'T1',
      capacity: 4,
      section: 'Main',
      status: 'available',
      invalid_field: 'ignore',
    }
    const result = validateColumns('restaurant_tables', data)
    expect(result).toContain('table_number')
    expect(result).toContain('capacity')
    expect(result).toContain('section')
    expect(result).toContain('status')
    expect(result).not.toContain('invalid_field')
  })

  it('returns valid fields for reservations', () => {
    const data = {
      guest_name: 'John',
      party_size: 4,
      reserved_date: '2026-04-20',
      reserved_time: '19:00',
      status: 'confirmed',
    }
    const result = validateColumns('reservations', data)
    expect(result).toContain('guest_name')
    expect(result).toContain('party_size')
    expect(result).toContain('reserved_date')
    expect(result).toContain('reserved_time')
    expect(result).toContain('status')
  })

  it('throws for unknown table', () => {
    const data = { name: 'Test' }
    expect(() => validateColumns('unknown_table' as any, data)).toThrow()
  })

  it('filters out non-allowed fields', () => {
    const data = {
      table_number: 'T1',
      capacity: 4,
      created_at: '2026-04-20',
    }
    const result = validateColumns('restaurant_tables', data)
    expect(result).toContain('table_number')
    expect(result).toContain('capacity')
    expect(result).not.toContain('created_at')
  })
})

describe('buildUpdateSql', () => {
  it('builds correct UPDATE SQL for restaurant_tables', () => {
    const data = { capacity: 6, status: 'occupied' }
    const result = buildUpdateSql('restaurant_tables', data, 1)
    expect(result.sql).toBe('UPDATE restaurant_tables SET capacity = ?, status = ? WHERE id = ?')
    expect(result.params).toEqual([6, 'occupied', 1])
  })

  it('builds correct UPDATE SQL for reservations', () => {
    const data = { status: 'no-show', notes: 'Customer not arrived' }
    const result = buildUpdateSql('reservations', data, 5)
    expect(result.sql).toBe('UPDATE reservations SET status = ?, notes = ? WHERE id = ?')
    expect(result.params).toEqual(['no-show', 'Customer not arrived', 5])
  })

  it('converts booleans to integers', () => {
    const data = { is_active: true, is_available: false }
    const result = buildUpdateSql('menu_items', data, 1)
    expect(result.params).toEqual([1, 0, 1])
  })

  it('handles null and undefined values', () => {
    const data = { table_id: null, notes: undefined }
    const result = buildUpdateSql('reservations', data, 1)
    expect(result.params).toContain(null)
  })

  it('throws for invalid table', () => {
    expect(() => buildUpdateSql('invalid_table', { name: 'test' }, 1)).toThrow()
  })

  it('throws for no valid fields', () => {
    const data = { invalid_field: 'test' }
    expect(() => buildUpdateSql('restaurant_tables', data, 1)).toThrow('No valid fields to update')
  })

  it('handles single field update', () => {
    const data = { status: 'occupied' }
    const result = buildUpdateSql('restaurant_tables', data, 1)
    expect(result.sql).toBe('UPDATE restaurant_tables SET status = ? WHERE id = ?')
    expect(result.params).toEqual(['occupied', 1])
  })
})