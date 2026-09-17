import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cte_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' or 'pickup'
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cte_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add Item to Cart
  const addToCart = (foodItem, quantity = 1, selectedAddons = [], notes = '') => {
    setCartItems((prev) => {
      // Create unique key for item + addon combination
      const addonKey = selectedAddons.map((a) => a.name).sort().join('|');
      const cartItemId = `${foodItem.id}-${addonKey}`;

      const existingIndex = prev.findIndex((item) => item.cartItemId === cartItemId);

      const basePrice = foodItem.discount_price !== null ? foodItem.discount_price : foodItem.price;
      const addonsTotal = selectedAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
      const unitPrice = basePrice + addonsTotal;

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].subtotal = updated[existingIndex].quantity * unitPrice;
        return updated;
      } else {
        return [
          ...prev,
          {
            cartItemId,
            food_id: foodItem.id,
            name: foodItem.name,
            image_url: foodItem.image_url,
            is_veg: foodItem.is_veg,
            unitPrice,
            quantity,
            subtotal: unitPrice * quantity,
            selected_addons: selectedAddons,
            notes
          }
        ];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: newQty,
              subtotal: item.unitPrice * newQty
            }
          : item
      )
    );
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Calculations
  const itemTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Auto-validate or recalculate discount if coupon applied
  let discountAmount = 0;
  if (appliedCoupon && itemTotal >= (Number(appliedCoupon.min_order_value) || 0)) {
    if (appliedCoupon.discount_type === 'percentage') {
      const calc = (itemTotal * (Number(appliedCoupon.discount_value) || 0)) / 100;
      discountAmount = Math.min(calc, Number(appliedCoupon.max_discount) || calc);
    } else {
      const val = Number(appliedCoupon.discount_value) || 0;
      discountAmount = Math.min(val, Number(appliedCoupon.max_discount) || val);
    }
    discountAmount = parseFloat(discountAmount.toFixed(2));
  }

  const isDelivery = deliveryType === 'delivery';
  let deliveryFee = isDelivery ? 40 : 0;
  if (appliedCoupon && appliedCoupon.code === 'FREESHIP') {
    deliveryFee = 0;
  }

  const discountedItemTotal = Math.max(0, itemTotal - discountAmount);
  const taxes = parseFloat((discountedItemTotal * 0.05).toFixed(2)); // 5% GST
  const finalAmount = parseFloat((discountedItemTotal + taxes + deliveryFee).toFixed(2));

  // Apply Coupon
  const applyCoupon = async (code) => {
    setCouponError('');
    if (!code || !code.trim()) {
      setCouponError('Please enter a coupon code.');
      return false;
    }

    try {
      const res = await api.post('/coupons/validate', {
        code: code.trim().toUpperCase(),
        order_amount: itemTotal
      });

      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        return true;
      } else {
        setCouponError(res.message || 'Invalid coupon.');
        return false;
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code.');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const totalCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        deliveryType,
        setDeliveryType,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
        priceBreakdown: {
          itemTotal,
          discountAmount,
          taxes,
          deliveryFee,
          finalAmount
        }
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
