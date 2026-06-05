import { useContext } from 'react'
import { CartContext } from '@/context/CartContext'

/**
 * Custom hook to access cart operations and state.
 * 
 * Provides:
 * - cart: The current cart object (items, subtotal, etc.)
 * - loading: boolean indicating sync status with backend
 * - addToCart: (productId, quantity) => Promise
 * - updateCartItem: (itemId, quantity) => Promise
 * - removeFromCart: (itemId) => Promise
 * - clearCart: () => Promise
 * 
 * @throws {Error} if used outside of a CartProvider
 */
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
