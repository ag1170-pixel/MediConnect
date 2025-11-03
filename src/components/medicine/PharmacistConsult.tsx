import { useState } from "react";
import { MessageCircle, Phone, Video, Clock, User, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Pharmacist {
  id: string;
  name: string;
  qualification: string;
  experience: string;
  rating: number;
  specialization: string;
  image: string;
  available: boolean;
}

const mockPharmacists: Pharmacist[] = [
  {
    id: "1",
    name: "Dr. Priya Sharma",
    qualification: "PharmD",
    experience: "8+ years",
    rating: 4.8,
    specialization: "Clinical Pharmacy",
    image: "/placeholder.svg",
    available: true
  },
  {
    id: "2",
    name: "Dr. Rajesh Kumar",
    qualification: "M.Pharm",
    experience: "12+ years",
    rating: 4.9,
    specialization: "Medication Management",
    image: "/placeholder.svg",
    available: true
  }
];

export function PharmacistConsult() {
  const [selectedPharmacist, setSelectedPharmacist] = useState<Pharmacist | null>(null);
  const [consultType, setConsultType] = useState<'chat' | 'call' | 'video'>('chat');
  const [question, setQuestion] = useState('');
  const { toast } = useToast();

  const handleConsultRequest = () => {
    if (!question.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter your question before requesting consultation.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Consultation Requested",
      description: `${selectedPharmacist?.name} will respond to your ${consultType} request shortly.`
    });

    // Reset form
    setQuestion('');
    setSelectedPharmacist(null);
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          Free Pharmacist Consultation
        </CardTitle>
        <p className="text-muted-foreground">
          Get expert advice from licensed pharmacists 24/7
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {mockPharmacists.map((pharmacist) => (
            <Card key={pharmacist.id} className={`rounded-xl cursor-pointer transition-all hover:shadow-md ${
              selectedPharmacist?.id === pharmacist.id ? 'ring-2 ring-primary' : ''
            }`} onClick={() => setSelectedPharmacist(pharmacist)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={pharmacist.image} />
                    <AvatarFallback>{pharmacist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{pharmacist.name}</h4>
                      {pharmacist.available && (
                        <Badge className="bg-success/10 text-success border-success">
                          Online
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{pharmacist.qualification}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs ml-1">{pharmacist.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{pharmacist.experience}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedPharmacist && (
          <div className="space-y-4">
            {/* Consultation Type */}
            <div>
              <h4 className="font-medium mb-3">Choose Consultation Type</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={consultType === 'chat' ? 'default' : 'outline'}
                  onClick={() => setConsultType('chat')}
                  className="rounded-xl"
                  size="sm"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </Button>
                <Button
                  variant={consultType === 'call' ? 'default' : 'outline'}
                  onClick={() => setConsultType('call')}
                  className="rounded-xl"
                  size="sm"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button
                  variant={consultType === 'video' ? 'default' : 'outline'}
                  onClick={() => setConsultType('video')}
                  className="rounded-xl"
                  size="sm"
                >
                  <Video className="h-4 w-4 mr-1" />
                  Video
                </Button>
              </div>
            </div>

            {/* Question Input */}
            <div>
              <h4 className="font-medium mb-2">Your Question</h4>
              <Textarea
                placeholder="Ask about drug interactions, dosage, side effects, or any medication-related queries..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="rounded-xl"
                rows={3}
              />
            </div>

            {/* Common Questions */}
            <div>
              <h4 className="font-medium mb-2">Common Questions</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Drug interactions with my current medication",
                  "Side effects and precautions",
                  "Correct dosage and timing",
                  "Storage instructions",
                  "Alternative medicines"
                ].map((q, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuestion(q)}
                    className="rounded-full text-xs"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full rounded-2xl" disabled={!question.trim()}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Consultation with {selectedPharmacist.name}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Consultation Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                    <Avatar>
                      <AvatarImage src={selectedPharmacist.image} />
                      <AvatarFallback>{selectedPharmacist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedPharmacist.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedPharmacist.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        Expected Response Time
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {consultType === 'chat' ? '2-5 minutes' : 
                       consultType === 'call' ? '5-10 minutes' : '10-15 minutes'}
                    </p>
                  </div>

                  <Button onClick={handleConsultRequest} className="w-full rounded-2xl">
                    Confirm Consultation Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}