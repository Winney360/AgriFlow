import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, MapPin, Phone, User, ShoppingBag, Sprout } from 'lucide-react';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [signupPending, setSignupPending] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
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
    if (!form.phoneNumber.trim()) {
      setError('Phone number is required');
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
        phoneNumber: form.phoneNumber,
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
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8f7] px-4 py-6">
      <div className="w-full max-w-sm rounded-lg border border-[#d8ddda] bg-white shadow-sm">
        <form onSubmit={onSubmit} className="space-y-4 px-6 py-6">
          <div>
            <h1 className="text-3xl font-black text-[#1f1f1f]">Create your AgriFlow account.</h1>
            <p className="mt-2 text-sm text-[#666]">Sign up with your details to start buying or selling locally.</p>
          </div>

          <div>
            <label className="mb-3 block text-xs font-semibold text-[#555]">I want to</label>
            <div className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border-2 p-3 transition-colors" style={{borderColor: form.role === 'buyer' ? '#20a46b' : '#d0d6d2', backgroundColor: form.role === 'buyer' ? '#f0fdf6' : '#fff'}}>
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={form.role === 'buyer'}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="accent-[#20a46b]"
                />
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-[#20a46b]" />
                  <span className="text-sm font-semibold text-[#333]">Buy</span>
                </div>
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border-2 p-3 transition-colors" style={{borderColor: form.role === 'seller' ? '#20a46b' : '#d0d6d2', backgroundColor: form.role === 'seller' ? '#f0fdf6' : '#fff'}}>
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={form.role === 'seller'}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="accent-[#20a46b]"
                />
                <div className="flex items-center gap-2">
                  <Sprout size={16} className="text-[#20a46b]" />
                  <span className="text-sm font-semibold text-[#333]">Sell</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#555]">Name</label>
            <div className="flex h-11 items-center rounded-lg border border-[#d0d6d2] bg-white px-3">
              <User size={16} className="text-[#999]" />
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="ml-2 flex-1 bg-transparent text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#555]">Phone Number</label>
            <div className="flex h-11 items-center rounded-lg border border-[#d0d6d2] bg-white px-3">
              <Phone size={16} className="text-[#999]" />
              <input
                type="text"
                placeholder="e.g. +2547..."
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="ml-2 flex-1 bg-transparent text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#555]">Password</label>
            <div className="flex h-11 items-center rounded-lg border border-[#d0d6d2] bg-white px-3">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
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

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#555]">Email (Optional)</label>
            <div className="flex h-11 items-center rounded-lg border border-[#d0d6d2] bg-white px-3">
              <Mail size={16} className="text-[#999]" />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="ml-2 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#555]">Location (Optional)</label>
            <div className="flex h-11 items-center rounded-lg border border-[#d0d6d2] bg-white px-3">
              <MapPin size={16} className="text-[#999]" />
              <input
                type="text"
                placeholder="Town / Area"
                value={form.locationName}
                onChange={(e) => setForm({ ...form, locationName: e.target.value })}
                className="ml-2 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={signupPending}
            className="w-full rounded-lg bg-[#20a46b] py-3 font-semibold text-white hover:bg-[#1a8657]"
          >
            {signupPending ? 'Creating Account...' : 'Sign Up'}
          </button>

          <div className="border-t border-[#e0e5e1] pt-3 text-center text-xs text-[#666]">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#20a46b] hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
