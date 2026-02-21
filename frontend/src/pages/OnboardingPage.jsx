import { useState } from "react";
import { useAuthUser } from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeOnboarding } from "../lib/api";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
  User,
  MapPin,
  Globe,
  Languages,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Video,
} from "lucide-react";

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Japanese",
  "Korean",
  "Chinese (Mandarin)",
  "Chinese (Cantonese)",
  "Arabic",
  "Hindi",
  "Bengali",
  "Turkish",
  "Vietnamese",
  "Thai",
  "Dutch",
  "Greek",
  "Polish",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Hebrew",
];

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullname || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguages?.[0] || "",
    location: authUser?.location || "",
  });

  const { mutate: onboardMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const handleSubmit = () => {
    onboardMutation(formData);
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim().length >= 2;
      case 2:
        return formData.nativeLanguage && formData.learningLanguage;
      case 3:
        return formData.location.trim().length >= 2;
      case 4:
        return formData.bio.trim().length >= 10;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Video className="w-7 h-7 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Complete Your Profile</h2>
            <p className="text-base-content/60 mt-1">
              Let's get to know you better for connecting with others
            </p>
          </div>

          {/* Progress Steps */}
          <ul className="steps steps-horizontal w-full mb-8">
            <li className={`step ${currentStep >= 1 ? "step-primary" : ""}`}>
              <span className="text-xs">Name</span>
            </li>
            <li className={`step ${currentStep >= 2 ? "step-primary" : ""}`}>
              <span className="text-xs">Languages</span>
            </li>
            <li className={`step ${currentStep >= 3 ? "step-primary" : ""}`}>
              <span className="text-xs">Location</span>
            </li>
            <li className={`step ${currentStep >= 4 ? "step-primary" : ""}`}>
              <span className="text-xs">Bio</span>
            </li>
          </ul>

          {/* Step 1: Name */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
                <User className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold">What's your name?</h3>
                  <p className="text-sm text-base-content/60">
                    This is how others will see you
                  </p>
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="input input-bordered w-full"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Step 2: Languages */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-xl">
                <Languages className="w-8 h-8 text-secondary" />
                <div>
                  <h3 className="font-semibold">Your Languages</h3>
                  <p className="text-sm text-base-content/60">
                    Connect with people who speak your language
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Native Language
                    </span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.nativeLanguage}
                    onChange={(e) =>
                      setFormData({ ...formData, nativeLanguage: e.target.value })
                    }
                  >
                    <option value="">Select your native language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      <Languages className="w-4 h-4 inline mr-1" />
                      Learning Language
                    </span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.learningLanguage}
                    onChange={(e) =>
                      setFormData({ ...formData, learningLanguage: e.target.value })
                    }
                  >
                    <option value="">Select language you're learning</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-xl">
                <MapPin className="w-8 h-8 text-accent" />
                <div>
                  <h3 className="font-semibold">Where are you from?</h3>
                  <p className="text-sm text-base-content/60">
                    Help others find you based on location
                  </p>
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Location</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., New York, USA"
                  className="input input-bordered w-full"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Step 4: Bio */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-info/5 rounded-xl">
                <FileText className="w-8 h-8 text-info" />
                <div>
                  <h3 className="font-semibold">Tell us about yourself</h3>
                  <p className="text-sm text-base-content/60">
                    Share a bit about your interests and goals
                  </p>
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Bio</span>
                  <span className="label-text-alt">
                    {formData.bio.length}/200
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-32 w-full"
                  placeholder="I'm passionate about learning languages and meeting new people from different cultures..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value.slice(0, 200) })
                  }
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Minimum 10 characters
                  </span>
                </label>
              </div>

              {/* Preview Card */}
              <div className="p-4 bg-base-200 rounded-xl">
                <h4 className="text-sm font-medium mb-3 text-base-content/70">
                  Preview
                </h4>
                <div className="flex items-start gap-3">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full">
                      <img
                        src={authUser?.profilePic || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                        alt={formData.fullName}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold">{formData.fullName}</h5>
                    <p className="text-sm text-base-content/60 line-clamp-2">
                      {formData.bio || "Your bio will appear here..."}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.nativeLanguage && (
                        <span className="badge badge-primary badge-sm">
                          {formData.nativeLanguage}
                        </span>
                      )}
                      {formData.location && (
                        <span className="badge badge-ghost badge-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          {formData.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              className="btn btn-ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>
            
            {currentStep < 4 ? (
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!isStepValid() || isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete Profile
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;