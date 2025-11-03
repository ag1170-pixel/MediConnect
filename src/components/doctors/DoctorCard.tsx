import { Star, MapPin, Clock, IndianRupee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Doctor } from "@/types";
import { Link } from "react-router-dom";

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Doctor Avatar */}
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={doctor.profile_image} 
              alt={doctor.name}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {doctor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          {/* Doctor Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg text-foreground truncate">
                  Dr. {doctor.name}
                </h3>
                <Badge variant="secondary" className="text-xs rounded-full">
                  {doctor.specialty}
                </Badge>
              </div>
              
              {/* Availability Badge */}
              {doctor.available_today && (
                <Badge variant="outline" className="text-xs border-success text-success">
                  Available Today
                </Badge>
              )}
            </div>

            {/* Experience & Clinic */}
            <div className="space-y-1 text-sm text-muted-foreground mb-3">
              <p>{doctor.years_experience} years experience</p>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{doctor.clinic_name}, {doctor.city}</span>
              </div>
            </div>

            {/* Rating & Fees */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{doctor.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({doctor.reviews_count} reviews)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 text-lg font-semibold text-primary">
                <IndianRupee className="h-4 w-4" />
                <span>{doctor.fees}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Link to={`/doctor/${doctor.id}`} className="flex-1">
                <Button variant="outline" className="w-full rounded-2xl">
                  View Profile
                </Button>
              </Link>
              <Link to={`/book/${doctor.id}`} className="flex-1">
                <Button className="w-full rounded-2xl">
                  <Clock className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}