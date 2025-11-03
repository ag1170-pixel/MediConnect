import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-primary">MediConnect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              India's leading healthcare platform connecting patients with the best doctors across the country.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link to="/search" className="block text-muted-foreground hover:text-primary">
                Find Doctors
              </Link>
              <Link to="/specialties" className="block text-muted-foreground hover:text-primary">
                Specialties
              </Link>
              <Link to="/about" className="block text-muted-foreground hover:text-primary">
                About Us
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary">
                Contact
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Services</h3>
            <div className="space-y-2 text-sm">
              <Link to="/book-appointment" className="block text-muted-foreground hover:text-primary">
                Book Appointment
              </Link>
              <Link to="/health-checkup" className="block text-muted-foreground hover:text-primary">
                Health Checkups
              </Link>
              <Link to="/medicine" className="block text-muted-foreground hover:text-primary">
                Online Medicine
              </Link>
              <Link to="/lab-tests" className="block text-muted-foreground hover:text-primary">
                Lab Tests
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 8218836531</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@mediconnect.in</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Agra, Uttar Pradesh, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 MediConnect. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}