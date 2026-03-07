import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await signup(form);
      navigate('/marketplace');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create account');
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-[var(--outline)] bg-[var(--surface)] p-5">
      <h1 className="text-2xl font-black">Create account</h1>
      <p className="mb-4 text-sm text-[var(--text-muted)]">Phone and password are required. Email is optional.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        <Input
          placeholder="Phone number"
          value={form.phoneNumber}
          onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
          required
        />
        <Input
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button className="w-full">Sign up</Button>
      </form>
      <p className="mt-3 text-sm text-[var(--text-muted)]">
        Already have an account? <Link to="/login" className="font-bold text-[var(--primary)]">Login</Link>
      </p>
    </section>
  );
};
