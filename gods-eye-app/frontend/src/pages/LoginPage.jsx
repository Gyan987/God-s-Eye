import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { register, handleSubmit } = useForm();
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (values) => {
    try {
      const { data } = await client.post('/auth/login', values);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (error) {
      setMsg(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <section className="glass mx-auto max-w-md rounded-3xl p-6">
      <h1 className="mb-4 text-2xl font-extrabold">Login</h1>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Email</label>
          <input type="email" {...register('email', { required: true })} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" {...register('password', { required: true })} />
        </div>
        <button className="w-full rounded-xl bg-ocean px-4 py-3 font-bold text-white" type="submit">
          Login
        </button>
      </form>
      {msg && <p className="mt-3 text-sm font-semibold">{msg}</p>}
      <p className="mt-4 text-sm">
        No account? <Link to="/signup" className="font-semibold text-ocean dark:text-amber-300">Create one</Link>
      </p>
    </section>
  );
};

export default LoginPage;
