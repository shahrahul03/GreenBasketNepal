export const ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  FARMER: 'FARMER',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER',
}

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PACKING: 'PACKING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
}

export const DELIVERY_STATUS = {
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  ON_THE_WAY: 'ON_THE_WAY',
  DELIVERED: 'DELIVERED',
}

export const STATUS_COLORS = {
  PENDING: 'badge-warning',
  CONFIRMED: 'badge-info',
  PACKING: 'badge-info',
  OUT_FOR_DELIVERY: 'badge-info',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-danger',
  ASSIGNED: 'badge-warning',
  PICKED_UP: 'badge-info',
  ON_THE_WAY: 'badge-info',
}

export const PAYMENT_METHODS = {
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  KHALTI: 'KHALTI',
  ESEWA: 'ESEWA',
}

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
}

export const ITEMS_PER_PAGE = 10
export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
