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
            <p className="text-primary-foreground/60 text-xs italic leading-relaxed">
              AIMA is a registered charity registered in Uganda and East Africa. Registered Charity Number: STK5026/2021.
            </p>
            <div className="flex gap-3 flex-wrap">
              {[
                { href: "https://www.facebook.com/alimranmuslimaid1/", icon: <Facebook className="w-4 h-4" />, label: "Facebook" },
                { href: "https://x.com/alimranmuslimaid", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>, label: "X" },
                { href: "https://www.tiktok.com/@al_imran_muslim_aid", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16z"/></svg>, label: "TikTok" },
                { href: "https://www.instagram.com/alimranmuslimaid/", icon: <Instagram className="w-4 h-4" />, label: "Instagram" },
                { href: "https://www.youtube.com/@Al-ImranMuslimAid", icon: <Youtube className="w-4 h-4" />, label: "YouTube" },
                { href: "https://wa.me/message/256701703951", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>, label: "WhatsApp" },
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
                <a href="tel:+256701703951" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">+256 701 703 951</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 shrink-0 text-primary-foreground/60" />
                <a href="mailto:info@alimranmuslimaid.org" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">info@alimranmuslimaid.org</a>
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
