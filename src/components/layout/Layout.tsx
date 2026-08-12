import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingDonateButton from "./FloatingDonateButton";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[60] bg-accent text-accent-foreground px-4 py-2 rounded-md font-semibold shadow-lg"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <FloatingDonateButton />
    </div>
  );
};

export default Layout;
