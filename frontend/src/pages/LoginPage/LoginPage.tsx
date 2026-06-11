import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout, Input, Button } from '../../components';
import { useAuth } from '../../hooks';
import styles from './LoginPage.module.css';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else if (result.error) {
      setError(result.error);
      toast.error(result.error);
    }
  };

  const footer = (
    <>
      <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>REGISTER</a>
      <span>/</span>
      <a href="#" onClick={(e) => { e.preventDefault(); }}>FORGOT PASSWORD</a>
    </>
  );

  return (
    <AuthLayout title="LOGIN" footer={footer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="EMAIL"
          type="email"
          placeholder="email@vk.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="PASSWORD"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          error={error}
        />

        <Button type="submit" loading={isLoading}>
          LOG IN
        </Button>
      </form>
    </AuthLayout>
  );
};