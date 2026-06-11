import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout, Input, Button } from '../../components';
import { useAuth } from '../../hooks';
import toast from 'react-hot-toast';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await register(formData);
    
    if (result.success) {
      toast.success('Registration successful!');
      navigate('/');
    } else if (result.errors) {
      setErrors(result.errors);
      toast.error('Registration failed');
    }
  };

  const footer = (
    <>
      <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>LOG IN</a>
      <span>/</span>
      <a href="#" onClick={(e) => { e.preventDefault(); }}>FORGOT PASSWORD</a>
    </>
  );

  return (
    <AuthLayout title="REGISTRATION" footer={footer}>
      <form onSubmit={handleSubmit}>
        <Input
          label="NAME"
          name="name"
          placeholder="Kriss"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />

        <Input
          label="EMAIL"
          name="email"
          type="email"
          placeholder="email@vk.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Input
          label="PASSWORD"
          name="password"
          type="password"
          placeholder="********"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Input
          label="CONFIRM PASSWORD"
          name="confirmPassword"
          type="password"
          placeholder="********"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button type="submit" loading={isLoading}>
          SUBMIT
        </Button>
      </form>
    </AuthLayout>
  );
};