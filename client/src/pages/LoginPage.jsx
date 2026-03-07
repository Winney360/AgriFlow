import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ phoneNumber: '', password: '' });
  const [error, setError] = useState('');

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
    <section className="mx-auto max-w-md rounded-2xl border border-[var(--outline)] bg-[var(--surface)] p-5">
      <h1 className="text-2xl font-black">Login</h1>
      <p className="mb-4 text-sm text-[var(--text-muted)]">Use your phone number and password.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          placeholder="Phone number"
          value={form.phoneNumber}
          onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button className="w-full">Login</Button>
      </form>
      <p className="mt-3 text-sm text-[var(--text-muted)]">
        New account? <Link to="/signup" className="font-bold text-[var(--primary)]">Sign up</Link>
      </p>
    </section>
  );
};
