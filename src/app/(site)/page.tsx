import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop accessories — phones, watches, audio & peripherals in BDT",
  description:
    "RB is Bangladesh's accessories storefront. Apple, Samsung, Asus, Logitech and more — BDT pricing, cash on delivery across the country.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
