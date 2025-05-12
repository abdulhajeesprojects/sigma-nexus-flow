
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomePage from './HomePage';

// This component simply redirects to the homepage or renders it directly
const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: If you want to redirect instead of rendering directly
    // navigate('/');
  }, [navigate]);
  
  // Directly render HomePage
  return <HomePage />;
};

export default Index;
