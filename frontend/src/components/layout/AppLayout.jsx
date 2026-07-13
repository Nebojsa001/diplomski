import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Zatvori meni kad se promijeni ruta (npr. klik na link na mobilnom)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Navbar
        onMenuToggle={() => setIsMenuOpen((open) => !open)}
        isMenuOpen={isMenuOpen}
      />

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
