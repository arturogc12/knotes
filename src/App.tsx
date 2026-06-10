import { Outlet } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";

function Layout() {
  return (
    <div className="min-h-screen bg-[#F5F9FC] flex flex-col font-sans selection:bg-[#7EB8DA]/20">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

export default Layout;

