import React from "react";

export function Footer() {
  return (
    <footer className="w-full py-8 px-6 mt-auto border-t border-border bg-background flex flex-col items-center justify-center gap-4 text-sm text-muted">
      <div className="flex items-center justify-center gap-6">
        <a href="#" className="p-2 rounded-full hover:bg-white/5 hover:text-white hover:scale-110 transition-all duration-300 text-lg flex items-center justify-center" aria-label="GitHub">
          <i className="bi bi-github"></i>
        </a>
        <a href="#" className="p-2 rounded-full hover:bg-white/5 hover:text-white hover:scale-110 transition-all duration-300 text-lg flex items-center justify-center" aria-label="X (Twitter)">
          <i className="bi bi-twitter-x"></i>
        </a>
        <a href="#" className="p-2 rounded-full hover:bg-white/5 hover:text-white hover:scale-110 transition-all duration-300 text-lg flex items-center justify-center" aria-label="Email">
          <i className="bi bi-envelope"></i>
        </a>
      </div>
      <div className="text-center">
        <p>© {new Date().getFullYear()} SnapCapture Booth. All rights reserved.</p>
      </div>
    </footer>
  );
}
