"use client";

import Link from "next/link";
import { useState } from "react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.SubmitEvent) => {
    event.preventDefault();
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-gray-500">
          Join EventBook and start discovering events.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            required
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-[#276749]/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-[#276749]/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            required
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-[#276749]/20"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-[#276749] px-4 py-3 font-semibold text-white transition hover:bg-[#1F5139]"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#276749]">
          Log in
        </Link>
      </p>
    </section>
  );
};

export default RegisterPage;
