import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Plus, X } from "lucide-react";

export default function Screen2RoleSetup() {
  const { user, updateUser, setOnboardingStep } = useAuth();
  const [clientCount, setClientCount] = useState<string>("");
  const [teamEmails, setTeamEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [whiteLabel, setWhiteLabel] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAgency = user?.role === "agency";

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (isAgency) {
      if (!clientCount) newErrors.clientCount = "Please specify number of clients";
    } else {
      if (!businessName.trim()) newErrors.businessName = "Business name is required";
      if (!industry) newErrors.industry = "Please select an industry";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addTeamMember = () => {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail) && !teamEmails.includes(currentEmail)) {
      setTeamEmails([...teamEmails, currentEmail]);
      setCurrentEmail("");
    }
  };

  const removeTeamMember = (email: string) => {
    setTeamEmails(teamEmails.filter((e) => e !== email));
  };

  const handleContinue = () => {
    if (validate()) {
      updateUser({
        clientCount: isAgency ? parseInt(clientCount) : undefined,
        teamMembers: isAgency ? teamEmails : undefined,
        whiteLabel: isAgency ? whiteLabel : undefined,
        businessName: !isAgency ? businessName : undefined,
        website: !isAgency ? website : undefined,
        industry: !isAgency ? industry : undefined,
        workspaceName: isAgency ? `Workspace ${Date.now()}` : businessName,
      });
      setOnboardingStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {isAgency ? "Set Up Your Agency" : "Tell Us About Your Business"}
          </h1>
          <p className="text-slate-600 font-medium">Let's define your workspace environment</p>
        </div>

        {/* Form */}
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/60 p-8 space-y-6 mb-6">
          {isAgency ? (
            <>
              {/* Agency: Client Count */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  How many clients will you manage?
                </label>
                <select
                  value={clientCount}
                  onChange={(e) => setClientCount(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                    errors.clientCount
                      ? "border-red-300 bg-red-50/50"
                      : "border-slate-200 bg-white/50 focus:border-indigo-500"
                  }`}
                >
                  <option value="">Select...</option>
                  <option value="1">1 Client</option>
                  <option value="5">2-5 Clients</option>
                  <option value="10">6-10 Clients</option>
                  <option value="20">11-20 Clients</option>
                  <option value="50">20+ Clients</option>
                </select>
                {errors.clientCount && <p className="text-xs text-red-600 mt-1">{errors.clientCount}</p>}
              </div>

              {/* Agency: Team Members */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Invite Your Team (Optional)</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="email"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTeamMember()}
                    placeholder="team@example.com"
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-slate-200 bg-white/50 focus:border-indigo-500 focus:outline-none text-sm"
                  />
                  <button
                    onClick={addTeamMember}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-bold text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                {teamEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {teamEmails.map((email) => (
                      <div
                        key={email}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium"
                      >
                        {email}
                        <button
                          onClick={() => removeTeamMember(email)}
                          className="hover:text-indigo-900 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Agency: White Label */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Would you like to white-label this workspace?
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setWhiteLabel(false)}
                    className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all border-2 ${
                      !whiteLabel
                        ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                        : "bg-white/50 border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    Not yet
                  </button>
                  <button
                    onClick={() => setWhiteLabel(true)}
                    className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all border-2 ${
                      whiteLabel
                        ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                        : "bg-white/50 border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    Yes, please
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Single Business: Business Name */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your Business Name"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                    errors.businessName
                      ? "border-red-300 bg-red-50/50"
                      : "border-slate-200 bg-white/50 focus:border-indigo-500"
                  }`}
                />
                {errors.businessName && <p className="text-xs text-red-600 mt-1">{errors.businessName}</p>}
              </div>

              {/* Single Business: Website */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Website or Social URL (Optional)
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white/50 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Single Business: Industry */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                    errors.industry
                      ? "border-red-300 bg-red-50/50"
                      : "border-slate-200 bg-white/50 focus:border-indigo-500"
                  }`}
                >
                  <option value="">Select an industry...</option>
                  <option value="health_wellness">Health & Wellness</option>
                  <option value="ecommerce">E-Commerce</option>
                  <option value="saas">SaaS</option>
                  <option value="agency">Agency</option>
                  <option value="nonprofit">Non-Profit</option>
                  <option value="education">Education</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="hospitality">Hospitality</option>
                  <option value="other">Other</option>
                </select>
                {errors.industry && <p className="text-xs text-red-600 mt-1">{errors.industry}</p>}
              </div>
            </>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleContinue}
          className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
        >
          Continue to Brand Setup
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
