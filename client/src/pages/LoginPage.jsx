import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, CheckCircle2, MessageCircle, Phone } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState('');
  const [showTrouble, setShowTrouble] = useState(false);

  const [form, setForm] = useState({
    phoneNumber: '',
    password: '',
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await login(form);
      navigate('/marketplace');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8f7] px-4 py-6">
      <div className="w-full max-w-sm rounded-lg border border-[#d8ddda] bg-white shadow-sm">
        <form onSubmit={onSubmit} className="space-y-4 px-6 py-6">
          <div>
            <h1 className="text-3xl font-black text-[#1f1f1f]">Welcome Back to CropConnect.</h1>
            <p className="mt-2 text-sm text-[#666]">Log in to manage your harvest or find local crops.</p>
          </div>

          {/* Phone Number Input */}
          <div>
            <div className="flex h-11 items-center rounded-lg border border-[#d0d6d2] bg-white px-3">
              <Phone size={16} className="text-[#999]" />
              <input
                type="text"
                placeholder="Username or Verified Phone Number"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="ml-2 flex-1 bg-transparent text-sm outline-none"
                required
              />
            </div>
          </div>

          {/* JWT Verified Badge */}
          <div className="flex items-center gap-2 text-sm text-[#20a46b]">
            <CheckCircle2 size={16} />
            <span className="font-semibold">JWT verified.</span>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex h-11 items-center rounded-lg border border-[#d0d6d2] bg-white px-3">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="flex-1 bg-transparent text-sm outline-none"
                required
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

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-semibold text-[#20a46b] hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Remember Device Toggle */}
          <div className="flex items-center gap-3 rounded-lg border border-[#d0d6d2] bg-white px-3 py-2.5">
            <button
              type="button"
              onClick={() => setRememberDevice(!rememberDevice)}
              className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                rememberDevice ? 'bg-[#20a46b]' : 'bg-[#ddd]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  rememberDevice ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className="text-sm text-[#333]">Remember this device for 30 days.</span>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Secure Login Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-[#20a46b] py-3 font-semibold text-white hover:bg-[#1a8657]"
          >
            Secure Login
          </button>

          {/* Trouble Logging In Section */}
          <div className="rounded-lg border border-[#c8e6d8] bg-[#f0f9f5] p-3">
            <p className="mb-2 text-sm font-semibold text-[#1f1f1f]">Trouble logging in? Verify your account via linked WhatsApp.</p>
            <button
              type="button"
              onClick={() => setShowTrouble(!showTrouble)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#20a46b] bg-white py-2 text-sm font-semibold text-[#20a46b] hover:bg-[#f0f9f5]"
            >
              <MessageCircle size={14} />
              Send Verification Code
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-[#ddd]" />
            <span className="text-xs text-[#999]">OR</span>
            <div className="flex-1 border-t border-[#ddd]" />
          </div>

          {/* SMS Login Option */}
          <button
            type="button"
            className="w-full rounded-lg border border-[#d0d6d2] bg-white py-2.5 text-sm font-semibold text-[#333] hover:bg-[#f9f9f9]"
          >
            Log in with phone number SMS
          </button>

          {/* Sign Up Link */}
          <div className="border-t border-[#e0e5e1] pt-3 text-center text-xs text-[#666]">
            <p>
              New account?{' '}
              <Link to="/signup" className="font-semibold text-[#20a46b] hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
