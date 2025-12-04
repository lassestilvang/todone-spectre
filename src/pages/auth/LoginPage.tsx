import React from 'react';
import LoginForm from '../../features/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoginForm />
    </div>
  );
};

export default LoginPage;