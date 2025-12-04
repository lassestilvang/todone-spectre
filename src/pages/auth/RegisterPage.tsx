import React from 'react';
import RegisterForm from '../../features/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;