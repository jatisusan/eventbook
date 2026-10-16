import Link from "next/link";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-5 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center text-2xl font-bold">
          Event<span className="text-[#276749]">Book</span>
        </Link>
        {children}
      </div>
    </main>
  );
};

export default layout;