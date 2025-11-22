'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/ui/card';
import { Checkbox } from '@/components/atoms/ui/checkbox';
import { Input } from '@/components/atoms/ui/input';
import { Label } from '@/components/atoms/ui/label';
import { Progress } from '@/components/atoms/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/ui/select';
import { createUserProfile } from '@/features/user-profile/api/actions';

type Step = 1 | 2 | 3 | 4;

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: '',
    goal: '',
    dietaryPreference: '',
    allergies: [] as string[],
    budgetLevel: '',
    cookingSkillLevel: '',
    timeAvailable: '',
  });

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const progress = (step / TOTAL_STEPS) * 100;

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const submitFormData = new FormData();
    submitFormData.append('age', formData.age);
    submitFormData.append('weight', formData.weight);
    submitFormData.append('height', formData.height);
    submitFormData.append('gender', formData.gender);
    submitFormData.append('activityLevel', formData.activityLevel);
    submitFormData.append('goal', formData.goal);
    submitFormData.append('dietaryPreference', formData.dietaryPreference);
    submitFormData.append('allergies', formData.allergies.join(','));
    submitFormData.append('budgetLevel', formData.budgetLevel);
    submitFormData.append('cookingSkillLevel', formData.cookingSkillLevel);
    submitFormData.append('timeAvailable', formData.timeAvailable);

    const result = await createUserProfile(submitFormData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((step + 1) as Step);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.age && formData.weight && formData.height && formData.gender;
      case 2:
        return formData.activityLevel && formData.goal;
      case 3:
        return formData.dietaryPreference;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome to PrepGenie</CardTitle>
          <CardDescription>
            Let's personalize your experience - Step {step} of {TOTAL_STEPS}
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => updateField('age', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => updateField('gender', value)}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => updateField('weight', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      value={formData.height}
                      onChange={(e) => updateField('height', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fitness & Goals</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <Select
                      value={formData.activityLevel}
                      onValueChange={(value) => updateField('activityLevel', value)}
                    >
                      <SelectTrigger id="activityLevel">
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                        <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                        <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                        <SelectItem value="very_active">Very Active (2x per day)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal">Primary Goal</Label>
                    <Select
                      value={formData.goal}
                      onValueChange={(value) => updateField('goal', value)}
                    >
                      <SelectTrigger id="goal">
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="maintain">Maintain Weight</SelectItem>
                        <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                        <SelectItem value="balanced">Balanced Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dietary Preferences</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dietaryPreference">Diet Type</Label>
                    <Select
                      value={formData.dietaryPreference}
                      onValueChange={(value) => updateField('dietaryPreference', value)}
                    >
                      <SelectTrigger id="dietaryPreference">
                        <SelectValue placeholder="Select dietary preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="omnivore">Omnivore</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="pescatarian">Pescatarian</SelectItem>
                        <SelectItem value="halal">Halal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Common Allergies (select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Dairy', 'Eggs', 'Nuts', 'Shellfish', 'Soy', 'Gluten'].map((allergen) => (
                        <div key={allergen} className="flex items-center space-x-2">
                          <Checkbox
                            id={allergen}
                            checked={formData.allergies.includes(allergen.toLowerCase())}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateField('allergies', [
                                  ...formData.allergies,
                                  allergen.toLowerCase(),
                                ]);
                              } else {
                                updateField(
                                  'allergies',
                                  formData.allergies.filter((a) => a !== allergen.toLowerCase())
                                );
                              }
                            }}
                          />
                          <Label htmlFor={allergen} className="cursor-pointer font-normal">
                            {allergen}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cooking Preferences (Optional)</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cookingSkillLevel">Cooking Skill Level</Label>
                    <Select
                      value={formData.cookingSkillLevel}
                      onValueChange={(value) => updateField('cookingSkillLevel', value)}
                    >
                      <SelectTrigger id="cookingSkillLevel">
                        <SelectValue placeholder="Select skill level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetLevel">Budget Level</Label>
                    <Select
                      value={formData.budgetLevel}
                      onValueChange={(value) => updateField('budgetLevel', value)}
                    >
                      <SelectTrigger id="budgetLevel">
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Budget</SelectItem>
                        <SelectItem value="medium">Medium Budget</SelectItem>
                        <SelectItem value="high">High Budget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="timeAvailable">
                      Time Available for Meal Prep (minutes/day)
                    </Label>
                    <Input
                      id="timeAvailable"
                      type="number"
                      placeholder="60"
                      value={formData.timeAvailable}
                      onChange={(e) => updateField('timeAvailable', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || loading}
              >
                Back
              </Button>
              <Button type="button" onClick={handleNext} disabled={!canProceed() || loading}>
                {step === TOTAL_STEPS ? (loading ? 'Creating profile...' : 'Complete') : 'Next'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
