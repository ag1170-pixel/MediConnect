-- Create patients table for patient information
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  emergency_contact TEXT,
  medical_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_metrics table for storing health readings
CREATE TABLE public.health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  body_temperature DECIMAL(4,1),
  blood_oxygen INTEGER,
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  sleep_hours DECIMAL(3,1),
  sleep_quality_rating INTEGER CHECK (sleep_quality_rating >= 1 AND sleep_quality_rating <= 5),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctor_notes table for doctor observations
CREATE TABLE public.doctor_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL,
  diagnosis TEXT,
  prescription TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table for health warnings
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'warning', 'critical', 'info'
  message TEXT NOT NULL,
  value TEXT,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for patients table
CREATE POLICY "Users can view their own patient record" 
ON public.patients 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own patient record" 
ON public.patients 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own patient record" 
ON public.patients 
FOR UPDATE 
USING (user_id = auth.uid());

-- Create policies for health_metrics table
CREATE POLICY "Users can view their health metrics" 
ON public.health_metrics 
FOR SELECT 
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their health metrics" 
ON public.health_metrics 
FOR INSERT 
WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their health metrics" 
ON public.health_metrics 
FOR UPDATE 
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- Create policies for doctor_notes table
CREATE POLICY "Users can view their doctor notes" 
ON public.doctor_notes 
FOR SELECT 
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can create notes" 
ON public.doctor_notes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Doctors can update their notes" 
ON public.doctor_notes 
FOR UPDATE 
USING (doctor_id = auth.uid());

-- Create policies for alerts table
CREATE POLICY "Users can view their alerts" 
ON public.alerts 
FOR SELECT 
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "System can create alerts" 
ON public.alerts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their alerts" 
ON public.alerts 
FOR UPDATE 
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_notes_updated_at
BEFORE UPDATE ON public.doctor_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();