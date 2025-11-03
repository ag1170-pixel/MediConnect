import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Thermometer, Droplets, Brain, Moon, Plus, History, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Patient, HealthMetrics, HealthMetricsInput, HealthAlert } from '@/types/health';

const HealthDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [metrics, setMetrics] = useState<HealthMetricsInput>({});
  const [recentMetrics, setRecentMetrics] = useState<HealthMetrics[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchPatientData();
      fetchRecentMetrics();
      fetchAlerts();
    }
  }, [user, loading, navigate]);

  const fetchPatientData = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching patient:', error);
      return;
    }

    if (!data) {
      // Create patient record if doesn't exist
      const { data: newPatient, error: createError } = await supabase
        .from('patients')
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email || 'Patient',
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating patient:', createError);
        return;
      }
      setPatient(newPatient);
    } else {
      setPatient(data);
    }
  };

  const fetchRecentMetrics = async () => {
    if (!user) return;

    const { data: patientData } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!patientData) return;

    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('patient_id', patientData.id)
      .order('recorded_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching metrics:', error);
      return;
    }

    setRecentMetrics(data || []);
  };

  const fetchAlerts = async () => {
    if (!user) return;

    const { data: patientData } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!patientData) return;

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('patient_id', patientData.id)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
      return;
    }

    setAlerts((data || []) as HealthAlert[]);
  };

  const validateMetrics = (metrics: HealthMetricsInput): string[] => {
    const warnings = [];

    if (metrics.blood_pressure_systolic && metrics.blood_pressure_diastolic) {
      if (metrics.blood_pressure_systolic > 140 || metrics.blood_pressure_diastolic > 90) {
        warnings.push('High blood pressure detected');
      }
    }

    if (metrics.heart_rate) {
      if (metrics.heart_rate > 100) warnings.push('High heart rate detected');
      if (metrics.heart_rate < 60) warnings.push('Low heart rate detected');
    }

    if (metrics.body_temperature) {
      if (metrics.body_temperature > 100.4) warnings.push('Fever detected');
      if (metrics.body_temperature < 97) warnings.push('Low body temperature detected');
    }

    if (metrics.blood_oxygen && metrics.blood_oxygen < 95) {
      warnings.push('Low blood oxygen level detected');
    }

    return warnings;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const warnings = validateMetrics(metrics);

      const { error } = await supabase
        .from('health_metrics')
        .insert({
          patient_id: patient.id,
          ...metrics,
        });

      if (error) throw error;

      // Create alerts for warnings
      if (warnings.length > 0) {
        for (const warning of warnings) {
          await supabase.from('alerts').insert({
            patient_id: patient.id,
            metric_type: 'vital_signs',
            alert_type: 'warning',
            message: warning,
          });
        }
      }

      toast.success('Health metrics recorded successfully!');
      setMetrics({});
      fetchRecentMetrics();
      fetchAlerts();
    } catch (error) {
      console.error('Error saving metrics:', error);
      toast.error('Failed to save health metrics');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-4xl font-bold text-foreground mb-2">Health Dashboard</h1>
          <p className="text-muted-foreground">Track your health metrics and stay connected with your doctor</p>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Health Alerts</h2>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Alert key={alert.id} className="border-destructive bg-destructive/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-destructive-foreground">
                    {alert.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Health Metrics Input */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Plus className="h-5 w-5" />
                Record Health Metrics
              </CardTitle>
              <CardDescription>Enter your current health readings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Blood Pressure */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-card-foreground">
                    <Heart className="h-4 w-4" />
                    Blood Pressure
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Systolic"
                      value={metrics.blood_pressure_systolic || ''}
                      onChange={(e) => setMetrics(prev => ({
                        ...prev,
                        blood_pressure_systolic: e.target.value ? parseInt(e.target.value) : undefined
                      }))}
                      className="bg-background border-input"
                    />
                    <span className="self-center text-muted-foreground">/</span>
                    <Input
                      type="number"
                      placeholder="Diastolic"
                      value={metrics.blood_pressure_diastolic || ''}
                      onChange={(e) => setMetrics(prev => ({
                        ...prev,
                        blood_pressure_diastolic: e.target.value ? parseInt(e.target.value) : undefined
                      }))}
                      className="bg-background border-input"
                    />
                  </div>
                </div>

                {/* Heart Rate */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-card-foreground">
                    <Activity className="h-4 w-4" />
                    Heart Rate (BPM)
                  </Label>
                  <Input
                    type="number"
                    placeholder="72"
                    value={metrics.heart_rate || ''}
                    onChange={(e) => setMetrics(prev => ({
                      ...prev,
                      heart_rate: e.target.value ? parseInt(e.target.value) : undefined
                    }))}
                    className="bg-background border-input"
                  />
                </div>

                {/* Body Temperature */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-card-foreground">
                    <Thermometer className="h-4 w-4" />
                    Body Temperature (°F)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="98.6"
                    value={metrics.body_temperature || ''}
                    onChange={(e) => setMetrics(prev => ({
                      ...prev,
                      body_temperature: e.target.value ? parseFloat(e.target.value) : undefined
                    }))}
                    className="bg-background border-input"
                  />
                </div>

                {/* Blood Oxygen */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-card-foreground">
                    <Droplets className="h-4 w-4" />
                    Blood Oxygen (SpO2 %)
                  </Label>
                  <Input
                    type="number"
                    placeholder="98"
                    value={metrics.blood_oxygen || ''}
                    onChange={(e) => setMetrics(prev => ({
                      ...prev,
                      blood_oxygen: e.target.value ? parseInt(e.target.value) : undefined
                    }))}
                    className="bg-background border-input"
                  />
                </div>

                {/* Stress Level */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-card-foreground">
                    <Brain className="h-4 w-4" />
                    Stress Level (1-10): {metrics.stress_level || 1}
                  </Label>
                  <Slider
                    value={[metrics.stress_level || 1]}
                    onValueChange={(value) => setMetrics(prev => ({ ...prev, stress_level: value[0] }))}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Sleep */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-card-foreground">
                    <Moon className="h-4 w-4" />
                    Sleep Hours
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="8"
                    value={metrics.sleep_hours || ''}
                    onChange={(e) => setMetrics(prev => ({
                      ...prev,
                      sleep_hours: e.target.value ? parseFloat(e.target.value) : undefined
                    }))}
                    className="bg-background border-input"
                  />
                </div>

                {/* Sleep Quality */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-card-foreground">
                    <Moon className="h-4 w-4" />
                    Sleep Quality (1-5): {metrics.sleep_quality_rating || 1}
                  </Label>
                  <Slider
                    value={[metrics.sleep_quality_rating || 1]}
                    onValueChange={(value) => setMetrics(prev => ({ ...prev, sleep_quality_rating: value[0] }))}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Recording...' : 'Record Metrics'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Metrics History */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-card-foreground">
                <span className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Metrics
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? 'Hide' : 'Show All'}
                </Button>
              </CardTitle>
              <CardDescription>Your latest health readings</CardDescription>
            </CardHeader>
            <CardContent>
              {recentMetrics.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No metrics recorded yet. Start tracking your health!
                </p>
              ) : (
                <div className="space-y-4">
                  {recentMetrics.slice(0, showHistory ? 10 : 3).map((metric) => (
                    <div key={metric.id} className="p-4 rounded-lg bg-background border border-border">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="secondary">
                          {new Date(metric.recorded_at).toLocaleDateString()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(metric.recorded_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {metric.blood_pressure_systolic && metric.blood_pressure_diastolic && (
                          <div>
                            <span className="text-muted-foreground">BP:</span> {metric.blood_pressure_systolic}/{metric.blood_pressure_diastolic}
                          </div>
                        )}
                        {metric.heart_rate && (
                          <div>
                            <span className="text-muted-foreground">HR:</span> {metric.heart_rate} BPM
                          </div>
                        )}
                        {metric.body_temperature && (
                          <div>
                            <span className="text-muted-foreground">Temp:</span> {metric.body_temperature}°F
                          </div>
                        )}
                        {metric.blood_oxygen && (
                          <div>
                            <span className="text-muted-foreground">SpO2:</span> {metric.blood_oxygen}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HealthDashboard;