"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Header = () => {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout successful.");
      router.push("/");
    } catch {
      toast.error("Unable to log out. Please try again.");
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#276749] text-lg font-bold text-white">
            E
          </span>
          <span className="text-xl font-bold tracking-tight">
            Event<span className="text-[#276749]">Book</span>
          </span>
        </Link>

        {!isLoading && (
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-gray-600 sm:block">
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold transition hover:border-[#276749] hover:text-[#276749]"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden px-3 py-2 text-sm font-semibold hover:text-[#276749] sm:block"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-[#276749] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F5139]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
