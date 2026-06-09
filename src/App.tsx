import { Outlet } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";

function Layout() {
  return (
    <div className="min-h-screen bg-[#F7F5F2] flex flex-col font-sans selection:bg-[#C17B5C]/20">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

export default Layout;

