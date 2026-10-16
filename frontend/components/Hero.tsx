import Link from "next/link";

const Hero = () => {
  return (
    <section className="bg-[#F0F5F0] px-5 py-20 text-center sm:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#276749]">
          Find your next experience
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
          Discover events worth showing up for.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
          Find and book events that bring people together.
        </p>
        <Link
          href="#events"
          className="mt-8 inline-flex rounded-xl bg-[#276749] px-6 py-3 font-semibold text-white transition hover:bg-[#1F5139]"
        >
          Explore events
        </Link>
      </div>
    </section>
  );
};

export default Hero;