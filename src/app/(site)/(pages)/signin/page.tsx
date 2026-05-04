import Signin from "@/components/Auth/Signin";
import React from "react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your RB Accessories account to view orders, addresses and more.",
  alternates: { canonical: "/signin" },
  robots: { index: true, follow: true },
};

const SigninPage = () => {
  return (
    <main>
      <Signin />
    </main>
  );
};

export default SigninPage;
