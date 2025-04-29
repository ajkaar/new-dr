import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PatientInfo {
  age: string;
  gender: string;
  bmi: string;
  temperature: string;
  heartRate: string;
  bloodPressure: string;
  respiratoryRate: string;
}

export function DiagnosisForm() {
  const { user } = useAuth();
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    age: "",
    gender: "",
    bmi: "",
    temperature: "",
    heartRate: "",
    bloodPressure: "",
    respiratoryRate: ""
  });
  const [symptoms, setSymptoms] = useState("");
  const [clinicalFindings, setClinicalFindings] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);

  const diagnosisMutation = useMutation({
    mutationFn: async () => {
      const data = {
        patientInfo,
        symptoms,
        clinicalFindings: clinicalFindings + "\n\nMedical History: " + medicalHistory
      };
      const res = await apiRequest("POST", "/api/diagnosis", data);
      return await res.json();
    },
    onSuccess: (data) => {
      setDiagnosisResult(data.diagnosis);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    diagnosisMutation.mutate();
  };

  const handleClearForm = () => {
    setPatientInfo({
      age: "",
      gender: "",
      bmi: "",
      temperature: "",
      heartRate: "",
      bloodPressure: "",
      respiratoryRate: ""
    });
    setSymptoms("");
    setClinicalFindings("");
    setMedicalHistory("");
    setDiagnosisResult(null);
  };

  const isInsufficientTokens = !user?.isSubscribed && user?.tokenBalance && user.tokenBalance <= 0;

  return (
    <div className="space-y-6">
      {isInsufficientTokens && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Insufficient tokens</AlertTitle>
          <AlertDescription>
            You don't have enough tokens to use this feature. Please upgrade your subscription.
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-neutral-50">
        <CardHeader>
          <CardTitle>AI Diagnosis Assistant</CardTitle>
          <CardDescription>
            Enter patient symptoms and clinical findings for differential diagnosis suggestions based on standard medical references.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="patient-info" className="text-sm font-medium text-neutral-700 mb-1">Patient Information</Label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label className="text-xs text-neutral-500 mb-1">Age</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g., 45" 
                    value={patientInfo.age}
                    onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-500 mb-1">Gender</Label>
                  <Select 
                    value={patientInfo.gender} 
                    onValueChange={(value) => setPatientInfo({...patientInfo, gender: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-neutral-500 mb-1">BMI</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    placeholder="e.g., 24.5" 
                    value={patientInfo.bmi}
                    onChange={(e) => setPatientInfo({...patientInfo, bmi: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="symptoms" className="text-sm font-medium text-neutral-700 mb-1">Chief Complaints & Symptoms</Label>
              <Textarea 
                id="symptoms" 
                rows={3} 
                placeholder="Enter the patient's symptoms and duration..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="vital-signs" className="text-sm font-medium text-neutral-700 mb-1">Vital Signs</Label>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <Label className="text-xs text-neutral-500 mb-1">Temperature (°C)</Label>
                  <Input 
                    type="number" 
                    step="0.1" 
                    placeholder="e.g., 37.2"
                    value={patientInfo.temperature}
                    onChange={(e) => setPatientInfo({...patientInfo, temperature: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-500 mb-1">Heart Rate (bpm)</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g., 72"
                    value={patientInfo.heartRate}
                    onChange={(e) => setPatientInfo({...patientInfo, heartRate: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-500 mb-1">BP (mmHg)</Label>
                  <Input 
                    type="text" 
                    placeholder="e.g., 120/80"
                    value={patientInfo.bloodPressure}
                    onChange={(e) => setPatientInfo({...patientInfo, bloodPressure: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-500 mb-1">Respiratory Rate</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g., 16"
                    value={patientInfo.respiratoryRate}
                    onChange={(e) => setPatientInfo({...patientInfo, respiratoryRate: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="clinical-findings" className="text-sm font-medium text-neutral-700 mb-1">Clinical Findings & Examination</Label>
              <Textarea 
                id="clinical-findings" 
                rows={3} 
                placeholder="Enter physical examination findings and any test results..."
                value={clinicalFindings}
                onChange={(e) => setClinicalFindings(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="medical-history" className="text-sm font-medium text-neutral-700 mb-1">Medical History</Label>
              <Textarea 
                id="medical-history" 
                rows={2} 
                placeholder="Enter relevant past medical history, medications, allergies..."
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                type="submit" 
                disabled={diagnosisMutation.isPending || isInsufficientTokens || !symptoms.trim()}
              >
                {diagnosisMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Differential Diagnosis"
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClearForm}
                disabled={diagnosisMutation.isPending}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {diagnosisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Differential Diagnosis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm p-4 bg-neutral-50 rounded-lg">{diagnosisResult}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
