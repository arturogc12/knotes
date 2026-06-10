import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-[#F5F9FC] border-t border-[#C8DAE8] py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 text-[#2A3540]">
          <div className="w-8 h-8 bg-[#7EB8DA] rounded-xl flex items-center justify-center">
            <span className="text-white font-serif italic text-lg font-bold">K</span>
          </div>
          <span className="font-sans font-medium text-lg">K-Notes</span>
        </div>
        
        <p className="text-sm text-[#5A7080] font-medium opacity-80">
          © {new Date().getFullYear()} K-Notes. Tu espacio seguro de reflexión basada en TCC.
        </p>
        
        <div className="flex gap-6">
          <Link to="#" className="text-sm text-[#5A7080] font-bold uppercase tracking-widest hover:text-[#7EB8DA] transition-colors">Privacidad</Link>
          <Link to="#" className="text-sm text-[#5A7080] font-bold uppercase tracking-widest hover:text-[#7EB8DA] transition-colors">Términos</Link>
        </div>
      </div>
    </footer>
  );
}
