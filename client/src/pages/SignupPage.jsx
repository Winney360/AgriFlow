import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, MessageCircle, CheckCircle2, Mail, Phone } from 'lucide-react';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const [form, setForm] = useState({
    phoneNumber: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAgreed: false,
  });

  const passwordRequirements = [
    { id: 1, text: '8 characters, 1 special character', met: form.password.length >= 8 && /[!@#$%^&*]/.test(form.password) },
    { id: 2, text: '6 characters, 3 special character', met: form.password.length >= 6 && (form.password.match(/[!@#$%^&*]/g) || []).length >= 3 },
    { id: 3, text: '3 characters, 1 special character', met: form.password.length >= 3 && /[!@#$%^&*]/.test(form.password) },
  ];

  const handleSendVerificationCode = async () => {
    setError('');
    if (!form.phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }
    // TODO: Call API to send verification code
    setVerificationSent(true);
  };

  const handleNextStep = async (event) => {
    event?.preventDefault?.();
    setError('');

    if (step === 1) {
      if (!form.phoneNumber.trim()) {
        setError('Phone number is required');
        return;
      }
      if (!form.password.trim()) {
        setError('Password is required');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!form.termsAgreed) {
        setError('You must agree to the Terms of Service');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!form.name.trim()) {
        setError('Name is required');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      try {
        await signup(form);
        navigate('/marketplace');
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to create account');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8f7] px-4 py-6">
      <div className="w-full max-w-sm rounded-lg border border-[#d8ddda] bg-white shadow-sm">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-[#e0e5e1] px-6 py-4">
          {[
            { num: 1, label: 'Verification' },
            { num: 2, label: 'Details' },
            { num: 3, label: 'Preferences' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div className={`text-sm font-semibold ${step >= s.num ? 'text-[#20a46b]' : 'text-[#999]'}`}>
                {s.num} of 3
              </div>
              <div className="text-xs text-[#666]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <form onSubmit={handleNextStep} className="space-y-4 px-6 py-6">
          {step === 1 && (
            <>
              <div>
                <h2 className="text-3xl font-black text-[#1f1f1f]">Join AgriFlow Today.</h2>
                <p className="mt-1 text-sm text-[#666]">Let's verify your identity and establish trust.</p>
              </div>

              <div>
                <div className="flex h-11 items-center rounded-lg border border-[#d0d6d2] bg-white px-3">
                  <Phone size={16} className="text-[#999]" />
                  <input
                    type="text"
                    placeholder="Username or Verified Phone Number"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="ml-2 flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#e8ecea] bg-[#f8faf9] p-3 text-sm text-[#333]">
                <p className="font-semibold">For local trust, verification via linked WhatsApp is required.</p>
              </div>

              <button
                type="button"
                onClick={handleSendVerificationCode}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#20a46b] py-3 font-semibold text-white hover:bg-[#1a8657]"
              >
                <MessageCircle size={16} />
                Send Verification Code
              </button>

              {verificationSent && (
                <div className="flex items-center gap-2 text-sm text-[#20a46b]">
                  <CheckCircle2 size={16} />
                  <span>JWT verified.</span>
                  <button type="button" className="font-semibold text-[#20a46b] underline">
                    Verify via SMS (optional)
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#555] mb-1">Create Password</label>
                  <div className="flex h-11 items-center rounded-lg border border-[#d0d6d2] bg-white px-3">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#999] hover:text-[#666]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#555] mb-1">Confirm Password</label>
                  <div className="flex h-11 items-center rounded-lg border border-[#d0d6d2] bg-white px-3">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[#999] hover:text-[#666]"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-[#666]">
                {passwordRequirements.map((req) => (
                  <div key={req.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={req.met} readOnly className="h-4 w-4 cursor-default" />
                    <span>{req.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex h-11 items-center gap-2 rounded-lg border border-[#d0d6d2] bg-white px-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={form.termsAgreed}
                  onChange={(e) => setForm({ ...form, termsAgreed: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="terms" className="flex-1 text-sm text-[#333]">
                  I agree to the <span className="font-semibold text-[#20a46b]">Terms of Service</span> and{' '}
                  <span className="font-semibold text-[#20a46b]">Privacy Policy.</span>
                </label>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                className="w-full rounded-lg bg-[#20a46b] py-3 font-semibold text-white hover:bg-[#1a8657]"
              >
                Create Account
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-[#ddd]" />
                <span className="text-xs text-[#999]">OR</span>
                <div className="flex-1 border-t border-[#ddd]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-[#d0d6d2] bg-white py-2.5 text-sm font-semibold text-[#333] hover:bg-[#f9f9f9]"
                >
                  Sign up with Google
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#d0d6d2] bg-white py-2.5 text-sm font-semibold text-[#333] hover:bg-[#f9f9f9]"
                >
                  Sign up with SMS
                </button>
              </div>

              <div className="space-y-1 border-t border-[#e0e5e1] pt-3 text-center text-xs text-[#666]">
                <p>For support, <span className="text-[#20a46b]">aboutUs</span>, <span className="text-[#20a46b]">Eonaor</span>, <span className="text-[#20a46b]">Contact Support</span></p>
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-[#20a46b]">
                    Log in
                  </Link>
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h2 className="text-3xl font-black text-[#1f1f1f]">Tell us about yourself.</h2>
                <p className="mt-1 text-sm text-[#666]">We need some details to set up your account.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555] mb-2">Full Name</label>
                <div className="flex h-11 items-center rounded-lg border border-[#d0d6d2] bg-white px-3">
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555] mb-2">Email (Optional)</label>
                <div className="flex h-11 items-center rounded-lg border border-[#d0d6d2] bg-white px-3">
                  <Mail size={16} className="text-[#999]" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="ml-2 flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                className="w-full rounded-lg bg-[#20a46b] py-3 font-semibold text-white hover:bg-[#1a8657]"
              >
                Next Step
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full rounded-lg border border-[#d0d6d2] bg-white py-3 font-semibold text-[#333] hover:bg-[#f9f9f9]"
              >
                Back
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h2 className="text-3xl font-black text-[#1f1f1f]">Preferences.</h2>
                <p className="mt-1 text-sm text-[#666]">How would you like to use AgriFlow?</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 rounded-lg border border-[#d0d6d2] bg-white p-4 cursor-pointer hover:bg-[#f9f9f9]">
                  <input type="radio" name="role" value="seller" className="h-4 w-4" />
                  <div>
                    <p className="font-semibold text-[#333]">I want to sell crops/livestock</p>
                    <p className="text-xs text-[#666]">List and manage your products</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-[#d0d6d2] bg-white p-4 cursor-pointer hover:bg-[#f9f9f9]">
                  <input type="radio" name="role" value="buyer" className="h-4 w-4" />
                  <div>
                    <p className="font-semibold text-[#333]">I want to buy crops/livestock</p>
                    <p className="text-xs text-[#666]">Browse and purchase from local farmers</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-[#d0d6d2] bg-white p-4 cursor-pointer hover:bg-[#f9f9f9]">
                  <input type="radio" name="role" value="both" className="h-4 w-4" />
                  <div>
                    <p className="font-semibold text-[#333]">Both seller and buyer</p>
                    <p className="text-xs text-[#666]">List products and buy from others</p>
                  </div>
                </label>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                className="w-full rounded-lg bg-[#20a46b] py-3 font-semibold text-white hover:bg-[#1a8657]"
              >
                Complete Sign Up
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full rounded-lg border border-[#d0d6d2] bg-white py-3 font-semibold text-[#333] hover:bg-[#f9f9f9]"
              >
                Back
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
