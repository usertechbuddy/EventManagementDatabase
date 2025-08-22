
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Auth from '@/components/Auth';

const AuthPage = () => {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate('/home');
  };

  return <Auth onAuthSuccess={handleAuthSuccess} />;
};

export default AuthPage;
