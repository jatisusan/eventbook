import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <Link href="/" className="text-lg font-bold">
          Event<span className="text-[#276749]">Book</span>
        </Link>
        <p className="text-sm text-gray-500">
          Discover events. Create memories.
        </p>
        <p className="text-sm text-gray-400">© 2026 EventBook</p>
      </div>
    </footer>
  );
};

export default Footer;
