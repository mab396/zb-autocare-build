import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Instagram } from 'lucide-react';
import logo from '@/assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img src={logo} alt="ZB AutoCare" className="h-16 w-auto bg-white/10 p-2 rounded-lg" />
            <p className="font-urdu text-accent text-xl">محفوظ سفر کی ضمانت</p>
            <p className="text-white/70 text-sm">
              Trusted car mechanic shop in Karachi with 35+ years of experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-white/70 hover:text-primary transition-colors">Home</Link>
              <Link to="/about" className="text-white/70 hover:text-primary transition-colors">About Us</Link>
              <Link to="/services" className="text-white/70 hover:text-primary transition-colors">Services</Link>
              <Link to="/gallery" className="text-white/70 hover:text-primary transition-colors">Gallery</Link>
              <Link to="/testimonials" className="text-white/70 hover:text-primary transition-colors">Testimonials</Link>
              <Link to="/contact" className="text-white/70 hover:text-primary transition-colors">Contact</Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <div className="space-y-3">
              <a href="tel:+923032931424" className="flex items-center gap-3 text-white/70 hover:text-primary transition-colors">
                <Phone className="w-5 h-5 text-primary" />
                <span>Farhan Ali: +92 303 2931424</span>
              </a>
              <a href="tel:+923331385571" className="flex items-center gap-3 text-white/70 hover:text-primary transition-colors">
                <Phone className="w-5 h-5 text-primary" />
                <span>Zulfiqar Ali: +92 333 1385571</span>
              </a>
              <div className="flex items-start gap-3 text-white/70">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>D-101 Block 12 Gulistan-e-Johar, Karachi 75290</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Clock className="w-5 h-5 text-primary" />
                <span>Mon–Sun | 10 AM – 7 PM</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-lg mb-4">Follow Us</h3>
            <a
              href="https://instagram.com/zbautocare"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-5 h-5" />
              <span>@zbautocare</span>
            </a>
            <div className="mt-4">
              <p className="text-white/70 text-sm">Website:</p>
              <a href="https://www.zbautocare.com" className="text-primary hover:underline">www.zbautocare.com</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-white/60 text-sm">
            © 2025 ZB AutoCare — All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
