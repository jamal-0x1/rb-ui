import React from "react";
import Link from "next/link";

const Login = () => (
  <div className="bg-white shadow-1 rounded-[10px] py-5 px-5.5 flex flex-wrap items-center gap-2">
    <span className="text-dark">Returning customer?</span>
    <Link
      href="/signin?next=/checkout"
      className="font-medium text-blue hover:underline"
    >
      Sign in
    </Link>
  </div>
);

export default Login;
