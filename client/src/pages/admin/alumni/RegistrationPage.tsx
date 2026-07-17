import React, { useState } from "react";
import { GradientHeader, GlassCard } from "./components/CardElements";
import { FormGroup, StyledInput, FileUploadZone } from "./components/FormElements";
import { UserPlus, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, FileText, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RegistrationPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    { id: 1, title: "Personal Details", icon: ShieldCheck },
    { id: 2, title: "Academic Info", icon: GraduationCap },
    { id: 3, title: "Employment", icon: Briefcase },
    { id: 4, title: "Documents", icon: FileText }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto pb-24">
      <GradientHeader 
        title="Alumni Registration" 
        description="Register a new alumni profile or review pending self-registrations."
        icon={UserPlus}
        color="from-emerald-600 to-teal-600"
      />

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full -z-10" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500" 
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          />
          
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2 bg-background p-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${step >= s.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground border-2 border-background'}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      <GlassCard className="p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="text-xl font-bold border-b pb-4 mb-6">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="Full Name" required>
                <StyledInput placeholder="John Doe" />
              </FormGroup>
              <FormGroup label="Email Address" required description="We'll send an OTP for verification">
                <StyledInput type="email" placeholder="john@example.com" />
              </FormGroup>
              <FormGroup label="Phone Number" required>
                <StyledInput type="tel" placeholder="+1 (555) 000-0000" />
              </FormGroup>
              <FormGroup label="Date of Birth">
                <StyledInput type="date" />
              </FormGroup>
              <div className="md:col-span-2">
                <FormGroup label="Current Address">
                  <StyledInput placeholder="123 Main St, City, Country" />
                </FormGroup>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="text-xl font-bold border-b pb-4 mb-6">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="Student ID / Roll Number" required>
                <StyledInput placeholder="e.g. CS2019001" />
              </FormGroup>
              <FormGroup label="Department" required>
                <StyledInput placeholder="Computer Science" />
              </FormGroup>
              <FormGroup label="Degree">
                <StyledInput placeholder="B.Tech" />
              </FormGroup>
              <FormGroup label="Passing Year" required>
                <StyledInput type="number" placeholder="2023" />
              </FormGroup>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="text-xl font-bold border-b pb-4 mb-6">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="Current Company" required>
                <StyledInput placeholder="Tech Innovators Inc." />
              </FormGroup>
              <FormGroup label="Designation" required>
                <StyledInput placeholder="Senior Software Engineer" />
              </FormGroup>
              <FormGroup label="Industry">
                <StyledInput placeholder="Information Technology" />
              </FormGroup>
              <FormGroup label="Work Location">
                <StyledInput placeholder="San Francisco, CA" />
              </FormGroup>
              <div className="md:col-span-2">
                <FormGroup label="LinkedIn Profile URL">
                  <StyledInput placeholder="https://linkedin.com/in/username" />
                </FormGroup>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="text-xl font-bold border-b pb-4 mb-6">Documents & Verification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormGroup label="Profile Photo" description="Upload a professional headshot">
                <FileUploadZone accept="image/*" label="Upload Profile Photo" subLabel="JPG, PNG up to 2MB" />
              </FormGroup>
              <FormGroup label="ID Proof / Degree Certificate" required description="Required for admin verification">
                <FileUploadZone accept=".pdf,.jpg,.png" label="Upload Document" subLabel="PDF, JPG up to 5MB" />
              </FormGroup>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t">
          <Button 
            variant="outline" 
            className="rounded-xl"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          {step < totalSteps ? (
            <Button 
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90"
              onClick={() => setStep(s => Math.min(totalSteps, s + 1))}
            >
              Next Step <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90"
              onClick={() => console.log('Submit Form')}
            >
              Submit Registration <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
