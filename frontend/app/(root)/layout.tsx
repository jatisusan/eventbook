import Header from "@/components/Header";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-1 flex-col px-5 xs:px-10 md:px-16">
      <div className="max-w-7xl">
        <Header />
        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
};

export default layout;
