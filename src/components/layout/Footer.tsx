import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-[#F7F5F2] border-t border-[#E8D8CC] py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 text-[#2D2D2D]">
          <div className="w-8 h-8 bg-[#C17B5C] rounded-xl flex items-center justify-center">
            <span className="text-white font-serif italic text-lg font-bold">K</span>
          </div>
          <span className="font-sans font-medium text-lg">K-Notes</span>
        </div>
        
        <p className="text-sm text-[#5D6D66] font-medium opacity-80">
          © {new Date().getFullYear()} K-Notes. Tu espacio seguro de reflexión basada en TCC.
        </p>
        
        <div className="flex gap-6">
          <Link to="#" className="text-sm text-[#5D6D66] font-bold uppercase tracking-widest hover:text-[#C17B5C] transition-colors">Privacidad</Link>
          <Link to="#" className="text-sm text-[#5D6D66] font-bold uppercase tracking-widest hover:text-[#C17B5C] transition-colors">Términos</Link>
        </div>
      </div>
    </footer>
  );
}
