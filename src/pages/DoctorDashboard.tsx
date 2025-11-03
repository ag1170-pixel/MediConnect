import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, FileText, AlertTriangle, Calendar, Search, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Patient, HealthMetrics, DoctorNote, HealthAlert } from '@/types/health';

const DoctorDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientMetrics, setPatientMetrics] = useState<HealthMetrics[]>([]);
  const [patientAlerts, setPatientAlerts] = useState<HealthAlert[]>([]);
  const [doctorNotes, setDoctorNotes] = useState<DoctorNote[]>([]);
  const [newNote, setNewNote] = useState({
    diagnosis: '',
    prescription: '',
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchPatients();
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientMetrics();
      fetchPatientAlerts();
      fetchDoctorNotes();
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patients:', error);
      return;
    }

    setPatients(data || []);
  };

  const fetchPatientMetrics = async () => {
    if (!selectedPatient) return;

    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('patient_id', selectedPatient.id)
      .order('recorded_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching patient metrics:', error);
      return;
    }

    setPatientMetrics(data || []);
  };

  const fetchPatientAlerts = async () => {
    if (!selectedPatient) return;

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('patient_id', selectedPatient.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patient alerts:', error);
      return;
    }

    setPatientAlerts((data || []) as HealthAlert[]);
  };

  const fetchDoctorNotes = async () => {
    if (!selectedPatient) return;

    const { data, error } = await supabase
      .from('doctor_notes')
      .select('*')
      .eq('patient_id', selectedPatient.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching doctor notes:', error);
      return;
    }

    setDoctorNotes(data || []);
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !user || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('doctor_notes')
        .insert({
          patient_id: selectedPatient.id,
          doctor_id: user.id,
          ...newNote,
        });

      if (error) throw error;

      toast.success('Doctor notes saved successfully!');
      setNewNote({ diagnosis: '', prescription: '', notes: '' });
      fetchDoctorNotes();
    } catch (error) {
      console.error('Error saving doctor notes:', error);
      toast.error('Failed to save doctor notes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('alerts')
      .update({ is_resolved: true })
      .eq('id', alertId);

    if (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
      return;
    }

    toast.success('Alert resolved');
    fetchPatientAlerts();
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medical_conditions?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Stethoscope className="h-8 w-8" />
            Doctor Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor patients and provide medical care</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Selection */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <UserCheck className="h-5 w-5" />
                Select Patient
              </CardTitle>
              <CardDescription>Choose a patient to review their health data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-input"
                  />
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="font-medium text-card-foreground">{patient.full_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {patient.age && `Age: ${patient.age}`}
                        {patient.gender && ` • ${patient.gender}`}
                      </div>
                      {patient.medical_conditions && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {patient.medical_conditions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Health Data */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPatient ? (
              <>
                {/* Patient Info */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">{selectedPatient.full_name}</CardTitle>
                    <CardDescription className="flex flex-wrap gap-4">
                      {selectedPatient.age && <span>Age: {selectedPatient.age}</span>}
                      {selectedPatient.gender && <span>Gender: {selectedPatient.gender}</span>}
                      {selectedPatient.phone && <span>Phone: {selectedPatient.phone}</span>}
                    </CardDescription>
                  </CardHeader>
                  {selectedPatient.medical_conditions && (
                    <CardContent>
                      <div className="text-sm">
                        <strong>Medical Conditions:</strong> {selectedPatient.medical_conditions}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Alerts */}
                {patientAlerts.filter(alert => !alert.is_resolved).length > 0 && (
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <AlertTriangle className="h-5 w-5" />
                        Active Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {patientAlerts
                          .filter(alert => !alert.is_resolved)
                          .map((alert) => (
                            <Alert key={alert.id} className="border-destructive bg-destructive/10">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="flex justify-between items-center">
                                <span className="text-destructive-foreground">{alert.message}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => resolveAlert(alert.id)}
                                >
                                  Resolve
                                </Button>
                              </AlertDescription>
                            </Alert>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Metrics */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <Calendar className="h-5 w-5" />
                      Recent Health Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patientMetrics.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No health metrics recorded yet.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {patientMetrics.slice(0, 5).map((metric) => (
                          <div key={metric.id} className="p-4 rounded-lg bg-background border border-border">
                            <div className="flex justify-between items-start mb-3">
                              <Badge variant="secondary">
                                {new Date(metric.recorded_at).toLocaleDateString()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(metric.recorded_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {metric.blood_pressure_systolic && metric.blood_pressure_diastolic && (
                                <div>
                                  <span className="text-muted-foreground">Blood Pressure:</span>
                                  <div className="font-medium">{metric.blood_pressure_systolic}/{metric.blood_pressure_diastolic}</div>
                                </div>
                              )}
                              {metric.heart_rate && (
                                <div>
                                  <span className="text-muted-foreground">Heart Rate:</span>
                                  <div className="font-medium">{metric.heart_rate} BPM</div>
                                </div>
                              )}
                              {metric.body_temperature && (
                                <div>
                                  <span className="text-muted-foreground">Temperature:</span>
                                  <div className="font-medium">{metric.body_temperature}°F</div>
                                </div>
                              )}
                              {metric.blood_oxygen && (
                                <div>
                                  <span className="text-muted-foreground">Blood Oxygen:</span>
                                  <div className="font-medium">{metric.blood_oxygen}%</div>
                                </div>
                              )}
                              {metric.stress_level && (
                                <div>
                                  <span className="text-muted-foreground">Stress Level:</span>
                                  <div className="font-medium">{metric.stress_level}/10</div>
                                </div>
                              )}
                              {metric.sleep_hours && (
                                <div>
                                  <span className="text-muted-foreground">Sleep:</span>
                                  <div className="font-medium">{metric.sleep_hours}h (Quality: {metric.sleep_quality_rating}/5)</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Doctor Notes */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <FileText className="h-5 w-5" />
                      Medical Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitNote} className="space-y-4 mb-6">
                      <div>
                        <Label htmlFor="diagnosis" className="text-card-foreground">Diagnosis</Label>
                        <Input
                          id="diagnosis"
                          value={newNote.diagnosis}
                          onChange={(e) => setNewNote(prev => ({ ...prev, diagnosis: e.target.value }))}
                          placeholder="Enter diagnosis..."
                          className="bg-background border-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="prescription" className="text-card-foreground">Prescription</Label>
                        <Textarea
                          id="prescription"
                          value={newNote.prescription}
                          onChange={(e) => setNewNote(prev => ({ ...prev, prescription: e.target.value }))}
                          placeholder="Enter prescription details..."
                          className="bg-background border-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes" className="text-card-foreground">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          value={newNote.notes}
                          onChange={(e) => setNewNote(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Enter additional notes..."
                          className="bg-background border-input"
                        />
                      </div>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Notes'}
                      </Button>
                    </form>

                    {/* Previous Notes */}
                    {doctorNotes.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-card-foreground">Previous Notes</h4>
                        {doctorNotes.map((note) => (
                          <div key={note.id} className="p-4 rounded-lg bg-background border border-border">
                            <div className="text-sm text-muted-foreground mb-2">
                              {new Date(note.created_at).toLocaleString()}
                            </div>
                            {note.diagnosis && (
                              <div className="mb-2">
                                <strong>Diagnosis:</strong> {note.diagnosis}
                              </div>
                            )}
                            {note.prescription && (
                              <div className="mb-2">
                                <strong>Prescription:</strong> {note.prescription}
                              </div>
                            )}
                            {note.notes && (
                              <div>
                                <strong>Notes:</strong> {note.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a patient to view their health data and add medical notes</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DoctorDashboard;