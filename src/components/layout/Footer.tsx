import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Al-Imran Muslim Aid" className="w-10 h-10 rounded-full object-cover" />
              <span className="font-serif text-xl font-bold">Al-Imran Muslim Aid</span>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Making a difference together. We empower communities through sustainable development, education, and compassionate action for the Ummah.
            </p>
            <div className="flex gap-3">
              {[
                { href: "https://www.facebook.com/alimranmuslimaid1/", icon: <Facebook className="w-4 h-4" />, label: "Facebook" },
                { href: "https://www.tiktok.com/@al_imran_muslim_aid", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16z"/></svg>, label: "TikTok" },
                { href: "https://www.instagram.com/alimranmuslimaid/", icon: <Instagram className="w-4 h-4" />, label: "Instagram" },
                { href: "#", icon: <Youtube className="w-4 h-4" />, label: "YouTube" },
              ].map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors" aria-label={social.label}>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: "About Us", path: "/about" },
                { label: "Our Projects", path: "/projects" },
                { label: "Donate", path: "/donate" },
                { label: "Volunteer", path: "/volunteer" },
                { label: "Blog", path: "/blog" },
                { label: "Careers", path: "/careers" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Get Involved</h3>
            <ul className="space-y-2">
              {[
                { label: "Donate Funds", path: "/donate" },
                { label: "Donate Items", path: "/donate-items" },
                { label: "Become a Member", path: "/membership" },
                { label: "Urgent Appeals", path: "/urgent-appeals" },
                { label: "Privacy Policy", path: "/privacy" },
                { label: "Terms of Use", path: "/terms" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary-foreground/60" />
                <span className="text-sm text-primary-foreground/70">Plot 9 Namakwekwe, Mbale, Uganda</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 shrink-0 text-primary-foreground/60" />
                <span className="text-sm text-primary-foreground/70">+256 701 703 951</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 shrink-0 text-primary-foreground/60" />
                <span className="text-sm text-primary-foreground/70">info@alimranmuslimaid.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Al-Imran Muslim Aid. All rights reserved.
          </p>
          <p className="text-sm text-primary-foreground/60">
            Made with <Heart className="w-3 h-3 inline fill-current text-charity-orange" /> for a better world
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
