"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import React from "react";
import { store } from "./store";
import { hydrateCart } from "./features/cart-slice";
import { hydrateWishlist } from "./features/wishlist-slice";

const CART_KEY = "rb_cart";
const WISHLIST_KEY = "rb_wishlist";

const safeParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const cartItems = safeParse<unknown[]>(localStorage.getItem(CART_KEY));
    if (Array.isArray(cartItems)) {
      store.dispatch(hydrateCart(cartItems as never));
    }
    const wishItems = safeParse<unknown[]>(localStorage.getItem(WISHLIST_KEY));
    if (Array.isArray(wishItems)) {
      store.dispatch(hydrateWishlist(wishItems as never));
    }

    let lastCart = store.getState().cartReducer.items;
    let lastWish = store.getState().wishlistReducer.items;

    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      if (state.cartReducer.items !== lastCart) {
        lastCart = state.cartReducer.items;
        localStorage.setItem(CART_KEY, JSON.stringify(lastCart));
      }
      if (state.wishlistReducer.items !== lastWish) {
        lastWish = state.wishlistReducer.items;
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(lastWish));
      }
    });

    return unsubscribe;
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
