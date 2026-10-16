 "use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-500">
          Log in to manage your event bookings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-[#276749] focus:ring-2 focus:ring-[#276749]/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-[#276749] focus:ring-2 focus:ring-[#276749]/20"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-[#276749] px-4 py-3 font-semibold text-white transition hover:bg-[#1F5139]"
        >
          Log in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-[#276749]">
          Create one
        </Link>
      </p>
    </section>
  );
};

export default LoginPage;
