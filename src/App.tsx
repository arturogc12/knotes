import { Outlet } from "react-router-dom";
import { AuthCallbackHandler } from "./components/auth/AuthCallbackHandler";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";

function Layout() {
  return (
    <div className="min-h-screen bg-[#F7F5F2] flex flex-col font-sans selection:bg-[#C17B5C]/20">
      <AuthCallbackHandler />
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

export default Layout;

