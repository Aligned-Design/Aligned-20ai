import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight } from "lucide-react";

export default function Screen1SignUp() {
  const { signUp, setOnboardingStep } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"agency" | "single_business">(
    "single_business",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email";
    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      signUp({ name, email, password, role });
      setOnboardingStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 mb-4">
            <span className="text-white font-black text-lg">A</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3">
            Welcome to Aligned
          </h1>
          <p className="text-slate-600 font-medium mb-1">
            Marketing that stays true to your brand.
          </p>
          <p className="text-slate-500 text-sm">
            Let's get you set up in under 3 minutes.
          </p>
        </div>

        {/* Sign-Up Form */}
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/60 p-8 space-y-5 mb-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                errors.name
                  ? "border-red-300 bg-red-50/50"
                  : "border-slate-200 bg-white/50 focus:border-indigo-500 focus:bg-white"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                errors.email
                  ? "border-red-300 bg-red-50/50"
                  : "border-slate-200 bg-white/50 focus:border-indigo-500 focus:bg-white"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                errors.password
                  ? "border-red-300 bg-red-50/50"
                  : "border-slate-200 bg-white/50 focus:border-indigo-500 focus:bg-white"
              }`}
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Role Toggle */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              What describes you best?
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setRole("single_business")}
                className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all border-2 ${
                  role === "single_business"
                    ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                    : "bg-white/50 border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                📊 Single Business
              </button>
              <button
                onClick={() => setRole("agency")}
                className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all border-2 ${
                  role === "agency"
                    ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                    : "bg-white/50 border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                🏢 Agency
              </button>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleContinue}
          className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
        >
          Continue
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Footer Text */}
        <p className="text-xs text-slate-500 text-center mt-6">
          Already have an account?{" "}
          <a
            href="#"
            className="text-indigo-600 font-bold hover:text-indigo-700"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
