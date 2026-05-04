import React from "react";
import ShopPage from "@/components/ShopPage";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shop | NextCommerce Nextjs E-commerce template",
  description: "Browse all accessories",
};

const Shop = () => {
  return (
    <main>
      <ShopPage />
    </main>
  );
};

export default Shop;
