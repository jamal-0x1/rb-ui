import MyAccount from "@/components/MyAccount";
import React from "react";

import { Metadata } from "next";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "My account",
  description: "Your RB Accessories profile, orders and saved addresses.",
  robots: { index: false, follow: false },
};

const MyAccountPage = () => {
  return (
    <main>
      <MyAccount />
    </main>
  );
};

export default MyAccountPage;
