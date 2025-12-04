import React from 'react';

const SocialLoginButtons: React.FC = () => {
  const handleGoogleLogin = () => {
    // In a real app, this would redirect to Google OAuth
    console.log('Google login clicked');
    window.location.href = '/api/auth/google';
  };

  const handleGithubLogin = () => {
    // In a real app, this would redirect to GitHub OAuth
    console.log('GitHub login clicked');
    window.location.href = '/api/auth/github';
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.657.35-1.098.67-1.333-2.673-.255-5.6-2.39-5.6-5.743 0-1.26.482-2.117 1.318-2.718 1.322-.913 2.988-.44 3.321.823.403.558.422 1.36.113 1.898-1.02.22-2.14.11-2.682-.293.342-.928 1.003-1.433 1.855-1.532 2.83-2.88 4.66-5.822 4.66C8.87 17.58 10 15.825 10 10.017c0-5.517-4.477-10-10-10z" />
        </svg>
        Continue with Google
      </button>

      <button
        onClick={handleGithubLogin}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.657.35-1.098.67-1.333-2.673-.255-5.6-2.39-5.6-5.743 0-1.26.482-2.117 1.318-2.718C4.695 4.597 6.343 3.375 8.377 3.37.422-.167.748-.578.748-1.143 0-.533-.32-.937-.77-1.143-.44-.205-1.003.093-1.003.093-.702 1.05-.387 1.377-.387 1.377.592.977 1.462 1.42 1.98 1.42.518 0 1.003-.44 1.003-1.032 0-.592-.387-1.003-.882-1.003-.28 0-.882.657-.882 1.42 0 .765.518 1.26.882 1.42.365.16.882.057.882-.387 0-.44-.387-1.143-.387-1.143-.44-.205-1.003.093-1.003.093-.702 1.05-.387 1.377-.387 1.377.592.977 1.462 1.42 1.98 1.42.518 0 1.003-.44 1.003-1.032 0-.592-.387-1.003-.882-1.003z" clipRule="evenodd" />
        </svg>
        Continue with GitHub
      </button>
    </div>
  );
};

export default SocialLoginButtons;