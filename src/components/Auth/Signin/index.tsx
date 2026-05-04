"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { loginUser } from "@/lib/userAuth";

const Signin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") ?? "/my-account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setSubmitting(true);
    try {
      await loginUser(email, password);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Signin"} pages={["Signin"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Sign In to Your Account
              </h2>
              <p>Enter your details below</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="mb-5 rounded-lg border border-red/30 bg-red/5 px-4 py-3 text-sm text-red">
                  {error}
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="block mb-2.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Signing in..." : "Sign in to account"}
              </button>

              <Link
                href="/forgot-password"
                className="block text-center text-dark-4 mt-4.5 ease-out duration-200 hover:text-dark"
              >
                Forgot your password?
              </Link>

              <span className="relative z-1 block font-medium text-center mt-4.5">
                <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                <span className="inline-block px-3 bg-white">Or</span>
              </span>

              <div className="flex flex-col gap-4.5 mt-4.5">
                <button
                  type="button"
                  disabled
                  title="Coming soon"
                  className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 opacity-60 cursor-not-allowed"
                >
                  Sign In with Google (coming soon)
                </button>
                <button
                  type="button"
                  disabled
                  title="Coming soon"
                  className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 opacity-60 cursor-not-allowed"
                >
                  Sign In with GitHub (coming soon)
                </button>
              </div>

              <p className="text-center mt-6">
                Don&apos;t have an account?
                <Link
                  href="/signup"
                  className="text-dark ease-out duration-200 hover:text-blue pl-2"
                >
                  Sign Up Now!
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
