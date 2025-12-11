import { Phone } from 'lucide-react';

const StickyCallButton = () => {
  return (
    <a
      href="tel:+923032931424"
      className="fixed bottom-6 right-6 z-50 md:hidden"
      aria-label="Call ZB AutoCare"
    >
      <div className="relative">
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></span>
        
        {/* Button */}
        <div className="relative flex items-center justify-center w-14 h-14 bg-primary rounded-full shadow-glow-lg">
          <Phone className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
    </a>
  );
};

export default StickyCallButton;
