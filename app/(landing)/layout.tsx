import Footer from "@/components/Shared/Footer/Footer";
// import Header from "@/components/Shared/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* <div className="absolute top-0 left-0 w-full h-screen">
        <Header />
      </div> */}
      {children}
      <Footer />
    </div>
  );
}
