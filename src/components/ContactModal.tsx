import { IoClose } from "react-icons/io5";
import { useEffect } from "react";
import { FaInstagram, FaFacebook, FaTwitter, FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import logoHG from "../assets/logoHG.png";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const contactInfo = {
    phone: "+234 123 456 7890",
    email: "info@huldahgabriels.com",
    address: "Lagos, Nigeria",
    socials: {
      instagram: "https://instagram.com/huldahgabriels",
      facebook: "https://facebook.com/huldahgabriels",
      twitter: "https://twitter.com/huldahgabriels",
      whatsapp: "https://wa.me/2341234567890",
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close modal"
        >
          <IoClose className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 rounded-t-2xl text-center">
          <img
            src={logoHG}
            alt="Huldah Gabriels Logo"
            className="w-16 h-16 mx-auto mb-3 object-contain bg-white rounded-full p-2"
          />
          <h2 className="text-2xl font-gentium text-white font-bold">Get In Touch</h2>
          <p className="text-white/90 text-sm mt-1">We'd love to hear from you</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Details */}
          <div className="space-y-4">
            {/* Phone */}
            <a
              href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                <FaPhone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-gray-900 font-medium">{contactInfo.phone}</p>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${contactInfo.email}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                <FaEnvelope className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-gray-900 font-medium">{contactInfo.email}</p>
              </div>
            </a>

            {/* Address */}
            <div className="flex items-center gap-4 p-3 rounded-lg">
              <div className="bg-primary/10 p-3 rounded-full">
                <FaMapMarkerAlt className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-gray-900 font-medium">{contactInfo.address}</p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Follow Us</h3>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={contactInfo.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <FaInstagram className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Instagram</span>
              </a>

              <a
                href={contactInfo.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <FaFacebook className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </a>

              <a
                href={contactInfo.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <FaTwitter className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Twitter</span>
              </a>

              <a
                href={contactInfo.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <FaWhatsapp className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;

