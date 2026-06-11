import { createContext, useState, useCallback, useEffect } from 'react'
import { cartApi } from '@/api/cart'
import { useAuth } from '@/hooks/useAuth'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const role = user?.role?.name || user?.role

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null)
      return
    }
    if (role !== 'CUSTOMER') {
  setCart(null)
  return
}
    setLoading(true)
    try {
      const { data } = await cartApi.getCart()
      setCart(data.data)
    } catch {
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, role])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const cartItemCount = Array.isArray(cart?.items) ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0

  const addToCart = useCallback(async (productId, quantity = 1) => {
    await cartApi.addItem({ productId, quantity })
    await fetchCart()
  }, [fetchCart])

  const updateCartItem = useCallback(async (itemId, quantity) => {
    await cartApi.updateItem(itemId, { quantity })
    await fetchCart()
  }, [fetchCart])

  const removeFromCart = useCallback(async (itemId) => {
    await cartApi.removeItem(itemId)
    await fetchCart()
  }, [fetchCart])

  const clearCart = useCallback(async () => {
    await cartApi.clearCart()
    setCart(null)
  }, [])

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartItemCount,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
