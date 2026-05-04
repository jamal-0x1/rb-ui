import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: CartItem[];
};

type CartItem = {
  lineId: string;
  id: number | string;
  variantId?: string;
  variantSku?: string;
  variantSize?: string | null;
  variantColor?: string | null;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

export const makeLineId = (
  id: string | number,
  variantId?: string | null,
): string => `${id}:${variantId ?? "_"}`;

const initialState: InitialState = {
  items: [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (
      state,
      action: PayloadAction<
        Omit<CartItem, "lineId"> & {
          variants?: Array<{
            id: string;
            sku?: string;
            size?: string | null;
            color?: string | null;
          }>;
        }
      >,
    ) => {
      const {
        id,
        title,
        price,
        quantity,
        discountedPrice,
        imgs,
        variants,
        variantSku,
        variantSize,
        variantColor,
      } = action.payload;
      const variantId = action.payload.variantId ?? variants?.[0]?.id;
      const fallback = variants?.find((v) => v.id === variantId);
      const lineId = makeLineId(id, variantId);
      const existing = state.items.find((item) => item.lineId === lineId);

      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({
          lineId,
          id,
          variantId,
          variantSku: variantSku ?? fallback?.sku,
          variantSize: variantSize ?? fallback?.size ?? null,
          variantColor: variantColor ?? fallback?.color ?? null,
          title,
          price,
          quantity,
          discountedPrice,
          imgs,
        });
      }
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const lineId = action.payload;
      state.items = state.items.filter((item) => item.lineId !== lineId);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ lineId: string; quantity: number }>,
    ) => {
      const { lineId, quantity } = action.payload;
      const existing = state.items.find((item) => item.lineId === lineId);
      if (existing) existing.quantity = quantity;
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];
    },

    hydrateCart: (
      state,
      action: PayloadAction<Array<Partial<CartItem> & { id: string | number }>>,
    ) => {
      state.items = action.payload.map((raw) => ({
        lineId: raw.lineId ?? makeLineId(raw.id, raw.variantId),
        id: raw.id,
        variantId: raw.variantId,
        variantSku: raw.variantSku,
        variantSize: raw.variantSize ?? null,
        variantColor: raw.variantColor ?? null,
        title: raw.title ?? "",
        price: raw.price ?? 0,
        discountedPrice: raw.discountedPrice ?? raw.price ?? 0,
        quantity: raw.quantity ?? 1,
        imgs: raw.imgs,
      }));
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.discountedPrice * item.quantity;
  }, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
  hydrateCart,
} = cart.actions;
export default cart.reducer;
