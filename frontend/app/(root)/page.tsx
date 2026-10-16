import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import EventsList from "@/components/EventsList";


export default function Home() {
  return (
    <main className=" bg-[#FAFAF8] text-[#20231F]">
      <Hero />
      <EventsList />
      <Footer />
    </main>
  );
}