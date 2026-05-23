import React from "react";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="w-full h-20 flex items-center justify-between px-6 md:px-12 glass-panel sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-background text-xl shadow-[0_0_15px_rgba(245,166,35,0.4)]">
          <i className="bi bi-camera-fill"></i>
        </div>
        <span className="font-bold text-xl tracking-tight">SnapCapture</span>
      </Link>
      
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium text-muted hover:text-white transition-colors">
          Booth
        </Link>
        <Link href="/gallery" className="text-sm font-medium text-muted hover:text-white transition-colors">
          Gallery
        </Link>
      </div>
    </nav>
  );
}
