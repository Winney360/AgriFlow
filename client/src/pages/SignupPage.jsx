import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Phone, User } from 'lucide-react';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    email: '',
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
      await signup({
        name: form.name,
        phoneNumber: form.phoneNumber,
        password: form.password,
        email: form.email,
      });
      navigate('/marketplace');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create account');
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#20a46b] py-3 font-semibold text-white hover:bg-[#1a8657]"
          >
            Sign Up
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
