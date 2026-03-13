import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Phone } from 'lucide-react';

const REMEMBER_LOGIN_KEY = 'agriflow_remember_login';
const REMEMBER_LOGIN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [form, setForm] = useState({
    phoneNumber: '',
    password: '',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REMEMBER_LOGIN_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) {
        localStorage.removeItem(REMEMBER_LOGIN_KEY);
        return;
      }

      setForm({
        phoneNumber: parsed.phoneNumber || '',
        password: parsed.password || '',
      });
      setRememberMe(true);
    } catch {
      localStorage.removeItem(REMEMBER_LOGIN_KEY);
    }
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const user = await login(form);

      if (rememberMe) {
        localStorage.setItem(
          REMEMBER_LOGIN_KEY,
          JSON.stringify({
            phoneNumber: form.phoneNumber,
            password: form.password,
            expiresAt: Date.now() + REMEMBER_LOGIN_TTL_MS,
          }),
        );
      } else {
        localStorage.removeItem(REMEMBER_LOGIN_KEY);
      }

      const redirectUrl = user.role === 'seller' ? '/dashboard' : '/marketplace';
      navigate(redirectUrl);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8f7] px-4 py-6">
      <div className="w-full max-w-sm rounded-lg border border-[#d8ddda] bg-white shadow-sm">
        <form onSubmit={onSubmit} className="space-y-4 px-6 py-6">
          <div>
            <h1 className="text-3xl font-black text-[#1f1f1f]">Welcome Back to AgriFlow.</h1>
            <p className="mt-2 text-sm text-[#666]">Log in with your phone number and password.</p>
          </div>

          {/* Phone Number Input */}
          <div>
            <div className="flex h-11 items-center rounded-lg border border-[#d0d6d2] bg-white px-3">
              <Phone size={16} className="text-[#999]" />
              <input
                type="text"
                placeholder="Phone number"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="ml-2 flex-1 bg-transparent text-sm outline-none"
                autoComplete="username"
                required
              />
            </div>
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
                autoComplete="current-password"
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

          <label className="flex items-center gap-2 text-sm text-[#4e5f58]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 accent-[#20a46b]"
            />
            Remember me for the next 30 days
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#20a46b] py-3 font-semibold text-white hover:bg-[#1a8657]"
          >
            Login
          </button>

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
