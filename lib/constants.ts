export const REFRESH_INTERVALS = {
  DASHBOARD: 30000,
  SIDEBAR: 30000,
} as const

export const DEFAULTS = {
  ORDER_PREFIX: "ORD",
  TAX_RATE: 5,
  TAX_LABEL: "GST",
  TAX_INCLUSIVE: false,
  DEFAULT_ORDER_TYPE: "dine_in" as const,
  AUTO_REFRESH_INTERVAL: 30,
  RESTAURANT_NAME: "The Golden Fork",
  CURRENCY_SYMBOL: "₹",
}

export const ORDER_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  SERVED: "served",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

export const ORDER_TYPES = {
  DINE_IN: "dine_in",
  TAKEAWAY: "takeaway",
  DELIVERY: "delivery",
} as const

export const TABLE_STATUSES = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  RESERVED: "reserved",
  CLEANING: "cleaning",
} as const

export const RESERVATION_STATUSES = {
  CONFIRMED: "confirmed",
  SEATED: "seated",
  CANCELLED: "cancelled",
  NO_SHOW: "no-show",
} as const

export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  UPI: "upi",
  SPLIT: "split",
  OTHER: "other",
} as const

export const TRANSACTION_TYPES = {
  RESTOCK: "restock",
  USAGE: "usage",
  WASTE: "waste",
  ADJUSTMENT: "adjustment",
} as const

export const ATTENDANCE_STATUSES = {
  PRESENT: "present",
  ABSENT: "absent",
  HALF_DAY: "half-day",
  LEAVE: "leave",
} as const

export const STAFF_ROLES = {
  WAITER: "waiter",
  CHEF: "chef",
  CASHIER: "cashier",
  MANAGER: "manager",
  CLEANER: "cleaner",
  DELIVERY: "delivery",
} as const

export const SALARY_TYPES = {
  MONTHLY: "monthly",
  DAILY: "daily",
  HOURLY: "hourly",
} as const