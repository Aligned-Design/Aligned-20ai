import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { BrandIntakeFormData } from '@/types/brand-intake';
import { AutosaveIndicator } from '@/components/ui/autosave-indicator';
import { useAutosave } from '@/hooks/use-autosave';

import Section1BrandBasics from '@/components/brand-intake/Section1BrandBasics';
import Section2VoiceMessaging from '@/components/brand-intake/Section2VoiceMessaging';
import Section3VisualIdentity from '@/components/brand-intake/Section3VisualIdentity';
import Section4ContentPreferences from '@/components/brand-intake/Section4ContentPreferences';
import Section5Operational from '@/components/brand-intake/Section5Operational';
import Section6AITraining from '@/components/brand-intake/Section6AITraining';

const SECTIONS = [
  { number: 1, title: 'Brand Basics', component: Section1BrandBasics },
  { number: 2, title: 'Voice & Messaging', component: Section2VoiceMessaging },
  { number: 3, title: 'Visual Identity', component: Section3VisualIdentity },
  { number: 4, title: 'Content Preferences', component: Section4ContentPreferences },
  { number: 5, title: 'Operational', component: Section5Operational },
  { number: 6, title: 'AI Training', component: Section6AITraining },
];

export default function BrandIntake() {
  const [searchParams] = useSearchParams();
  const brandId = searchParams.get('brandId');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<BrandIntakeFormData>>({
    primaryColor: '#8B5CF6',
    secondaryColor: '#F0F7F7',
    accentColor: '#EC4899',
    fontFamily: 'Nourd',
    brandPersonality: [],
    toneKeywords: [],
    fontWeights: [],
    logoFiles: [],
    brandImageryFiles: [],
    referenceMaterialLinks: [],
    platformsUsed: [],
    preferredContentTypes: [],
    hashtagsToInclude: [],
    competitorsOrInspiration: [],
    socialHandles: [],
    textReferenceFiles: [],
    visualReferenceFiles: [],
    previousContentFiles: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Auto-save functionality
  const { saving, lastSaved, error: autosaveError } = useAutosave({
    data: formData,
    onSave: async (data) => {
      if (!brandId) return;
      
      // Save non-file fields to brand_kit JSON
      const { logoFiles, brandImageryFiles, textReferenceFiles, visualReferenceFiles, previousContentFiles, ...dataToSave } = data;
      
      await supabase
        .from('brands')
        .update({ brand_kit: dataToSave })
        .eq('id', brandId);
    },
    interval: 5000,
    enabled: !!brandId,
  });

  useEffect(() => {
    if (!brandId) {
      toast({
        title: 'No brand selected',
        description: 'Please create or select a brand first.',
        variant: 'destructive',
      });
      navigate('/brands');
    }
  }, [brandId, navigate, toast]);

  const handleFieldChange = (field: keyof BrandIntakeFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.brandName?.trim()) newErrors.brandName = 'Brand name is required';
      if (!formData.shortDescription?.trim()) newErrors.shortDescription = 'Description is required';
      if (!formData.industry) newErrors.industry = 'Please select an industry';
      if (formData.websiteUrl && !formData.websiteUrl.match(/^https?:\/\/.+/)) {
        newErrors.websiteUrl = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < SECTIONS.length) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep() || !brandId || !user) return;

    setSubmitting(true);
    try {
      // Save final form data
      const { logoFiles, brandImageryFiles, textReferenceFiles, visualReferenceFiles, previousContentFiles, ...dataToSave } = formData;
      
      await supabase
        .from('brands')
        .update({
          brand_kit: dataToSave,
          intake_completed: true,
          intake_completed_at: new Date().toISOString(),
        })
        .eq('id', brandId);

      // TODO: Upload files to Supabase Storage
      // TODO: Trigger website crawling worker
      // TODO: Generate voice_summary and visual_summary

      toast({
        title: 'Brand intake completed!',
        description: 'Your brand profile is being processed. Redirecting to summary...',
      });

      navigate(`/brand-snapshot?brandId=${brandId}`);
    } catch (error: any) {
      toast({
        title: 'Error saving brand intake',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const CurrentSection = SECTIONS[currentStep - 1].component;
  const progress = (currentStep / SECTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Brand Intake Form</h1>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {SECTIONS.length}: {SECTIONS[currentStep - 1].title}
              </p>
            </div>
            {brandId && <AutosaveIndicator saving={saving} lastSaved={lastSaved} error={autosaveError} />}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex justify-between">
          {SECTIONS.map((section) => (
            <div
              key={section.number}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <button
                onClick={() => setCurrentStep(section.number)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  currentStep > section.number
                    ? 'border-primary bg-primary text-primary-foreground'
                    : currentStep === section.number
                    ? 'border-primary bg-background text-primary'
                    : 'border-muted bg-background text-muted-foreground'
                }`}
                aria-label={`Go to ${section.title}`}
              >
                {currentStep > section.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  section.number
                )}
              </button>
              <span className="hidden sm:block text-xs text-center text-muted-foreground">
                {section.title}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-card border rounded-xl p-6 md:p-8">
          <CurrentSection
            data={formData}
            onChange={handleFieldChange}
            errors={errors}
          />
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || submitting}
            className="min-h-[44px]"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < SECTIONS.length ? (
            <Button onClick={handleNext} className="min-h-[44px]">
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="min-h-[44px] bg-gradient-to-r from-primary to-fuchsia-500"
            >
              {submitting ? 'Processing...' : 'Complete Brand Intake'}
            </Button>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          You can skip optional fields and return later. All progress is auto-saved.
        </div>
      </div>
    </div>
  );
}
