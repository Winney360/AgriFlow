import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, MapPin, Phone, User, ShoppingBag, Sprout } from 'lucide-react';

const COUNTRY_CODE_OPTIONS = [
  { value: '+254', label: '🇰🇪 KE +254', placeholder: '714648730', flag: '🇰🇪' },
  { value: '+256', label: '🇺🇬 UG +256', placeholder: '772123456', flag: '🇺🇬' },
  { value: '+255', label: '🇹🇿 TZ +255', placeholder: '712345678', flag: '🇹🇿' },
  { value: '+250', label: '🇷🇼 RW +250', placeholder: '788123456', flag: '🇷🇼' },
  { value: '+251', label: '🇪🇹 ET +251', placeholder: '911234567', flag: '🇪🇹' },
];

const getNumberPlaceholder = (countryCode) =>
  COUNTRY_CODE_OPTIONS.find((option) => option.value === countryCode)?.placeholder || '714648730';

const buildFullPhoneNumber = (countryCode, localPhoneNumber) => {
  const cleaned = String(localPhoneNumber || '').replace(/\D/g, '');
  const normalizedLocal = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  return `${countryCode}${normalizedLocal}`;
};

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [signupPending, setSignupPending] = useState(false);

  const [form, setForm] = useState({
    name: '',
    countryCode: '+254',
    localPhoneNumber: '',
    password: '',
    email: '',
    locationName: '',
    role: 'buyer',
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.localPhoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    const composedPhoneNumber = buildFullPhoneNumber(form.countryCode, form.localPhoneNumber);
    if (!composedPhoneNumber || composedPhoneNumber.length < 8) {
      setError('Enter a valid phone number');
      return;
    }

    if (!form.password.trim()) {
      setError('Password is required');
      return;
    }

    try {
      setSignupPending(true);
      const user = await signup({
        name: form.name,
        phoneNumber: composedPhoneNumber,
        password: form.password,
        email: form.email,
        locationName: form.locationName,
        role: form.role,
      });
      const redirectUrl = user.role === 'seller' ? '/dashboard' : '/marketplace';
      navigate(redirectUrl);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create account');
    } finally {
      setSignupPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8f7] px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8">
      <div className="w-full max-w-[350px] xs:max-w-[380px] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[520px] rounded-xl border border-[#d8ddda] bg-white shadow-sm mx-auto">
        <form onSubmit={onSubmit} className="space-y-5 px-3 py-5 xs:px-4 sm:px-6 sm:py-6 md:space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-[#1f1f1f] leading-tight">
              Create your AgriFlow account.
            </h1>
            <p className="text-xs xs:text-sm text-[#666] leading-relaxed">
              Sign up with your details to start buying or selling locally.
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#555] uppercase tracking-wide">
              I want to
            </label>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
              <label 
                className="flex cursor-pointer items-center gap-2 rounded-lg border-2 p-2.5 sm:p-3 transition-all hover:border-[#20a46b] hover:bg-[#f0fdf6]" 
                style={{
                  borderColor: form.role === 'buyer' ? '#20a46b' : '#d0d6d2',
                  backgroundColor: form.role === 'buyer' ? '#f0fdf6' : '#fff'
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={form.role === 'buyer'}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="accent-[#20a46b] w-3.5 h-3.5 sm:w-4 sm:h-4"
                />
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <ShoppingBag size={16} className="text-[#20a46b] flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#333]">Buy</span>
                </div>
              </label>
              
              <label 
                className="flex cursor-pointer items-center gap-2 rounded-lg border-2 p-2.5 sm:p-3 transition-all hover:border-[#20a46b] hover:bg-[#f0fdf6]" 
                style={{
                  borderColor: form.role === 'seller' ? '#20a46b' : '#d0d6d2',
                  backgroundColor: form.role === 'seller' ? '#f0fdf6' : '#fff'
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={form.role === 'seller'}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="accent-[#20a46b] w-3.5 h-3.5 sm:w-4 sm:h-4"
                />
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Sprout size={16} className="text-[#20a46b] flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#333]">Sell</span>
                </div>
              </label>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#555] uppercase tracking-wide">
              Name
            </label>
            <div className="flex items-center h-10 sm:h-11 rounded-lg border border-[#d0d6d2] bg-white px-2.5 sm:px-3 focus-within:border-[#20a46b] focus-within:ring-1 focus-within:ring-[#20a46b] transition-all">
              <User size={16} className="text-[#999] flex-shrink-0" />
              <input
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent text-xs sm:text-sm outline-none px-2 py-2"
                required
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#555] uppercase tracking-wide">
              Phone Number
            </label>
            <div className="flex flex-col xs:flex-row items-stretch gap-2">
              <div className="flex items-center h-10 sm:h-11 rounded-lg border border-[#d0d6d2] bg-white px-2.5 sm:px-3 focus-within:border-[#20a46b] focus-within:ring-1 focus-within:ring-[#20a46b] transition-all w-full xs:w-auto">
                <Phone size={16} className="text-[#999] flex-shrink-0" />
                <select
                  value={form.countryCode}
                  onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                  className="ml-2 h-8 rounded-md border border-[#d0d6d2] bg-[#f8fbf9] px-2 text-xs font-medium text-[#2b4f42] outline-none cursor-pointer hover:bg-[#e8f3ec] transition-colors"
                  aria-label="Select country code"
                >
                  {COUNTRY_CODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="py-1">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 flex items-center h-10 sm:h-11 rounded-lg border border-[#d0d6d2] bg-white px-2.5 sm:px-3 focus-within:border-[#20a46b] focus-within:ring-1 focus-within:ring-[#20a46b] transition-all">
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={getNumberPlaceholder(form.countryCode)}
                  value={form.localPhoneNumber}
                  onChange={(e) => setForm({ ...form, localPhoneNumber: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-transparent text-xs sm:text-sm outline-none px-1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#555] uppercase tracking-wide">
              Password
            </label>
            <div className="flex items-center h-10 sm:h-11 rounded-lg border border-[#d0d6d2] bg-white px-2.5 sm:px-3 focus-within:border-[#20a46b] focus-within:ring-1 focus-within:ring-[#20a46b] transition-all">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password (min. 6 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-transparent text-xs sm:text-sm outline-none"
                minLength="6"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#999] hover:text-[#20a46b] transition-colors p-1 flex-shrink-0"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#555] uppercase tracking-wide">
              Email <span className="font-normal text-[#999]">(Optional)</span>
            </label>
            <div className="flex items-center h-10 sm:h-11 rounded-lg border border-[#d0d6d2] bg-white px-2.5 sm:px-3 focus-within:border-[#20a46b] focus-within:ring-1 focus-within:ring-[#20a46b] transition-all">
              <Mail size={16} className="text-[#999] flex-shrink-0" />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-transparent text-xs sm:text-sm outline-none px-2 py-2"
              />
            </div>
          </div>

          {/* Location Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#555] uppercase tracking-wide">
              Location <span className="font-normal text-[#999]">(Optional)</span>
            </label>
            <div className="flex items-center h-10 sm:h-11 rounded-lg border border-[#d0d6d2] bg-white px-2.5 sm:px-3 focus-within:border-[#20a46b] focus-within:ring-1 focus-within:ring-[#20a46b] transition-all">
              <MapPin size={16} className="text-[#999] flex-shrink-0" />
              <input
                type="text"
                placeholder="Town / Area"
                value={form.locationName}
                onChange={(e) => setForm({ ...form, locationName: e.target.value })}
                className="w-full bg-transparent text-xs sm:text-sm outline-none px-2 py-2"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3">
              <p className="text-xs sm:text-sm text-red-600 text-center font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={signupPending}
            className="w-full rounded-lg bg-[#20a46b] py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white hover:bg-[#1a8657] disabled:bg-[#a3d8b9] disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {signupPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>

          {/* Login Link */}
          <div className="border-t border-[#e0e5e1] pt-4 sm:pt-5 text-center">
            <p className="text-xs sm:text-sm text-[#666]">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-[#20a46b] hover:text-[#1a8657] hover:underline transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};