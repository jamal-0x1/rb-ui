import Signup from "@/components/Auth/Signup";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Create an account",
  description: "Create your RB Accessories account — track orders, save addresses, checkout faster.",
  alternates: { canonical: "/signup" },
  robots: { index: true, follow: true },
};

const SignupPage = () => {
  return (
    <main>
      <Signup />
    </main>
  );
};

export default SignupPage;
