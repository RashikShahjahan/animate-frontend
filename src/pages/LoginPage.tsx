import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/animationApi';
import { useAuth } from '../context/AuthContext';

type FormValues = {
  email: string;
  password: string;
};

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await loginUser(data);
      console.log('Login data:', data);
      // Use auth context to store user data and token
      login(response.token, {
        id: response.user.id,
        email: response.user.email,
        username: response.user.username
      });
      // Navigate to home page after successful login
      navigate('/home');
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex justify-center items-center bg-gradient-to-br from-pink-50 to-pink-200 text-pink-800 font-sans overflow-hidden">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center w-full mb-6 flex-col items-center">
          <h1 className="text-2xl font-bold text-pink-800 relative inline-block">
            Sign In
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Welcome back! Sign in to continue
          </p>
        </div>

        {error && (
          <div className="flex flex-col items-center gap-2.5 text-pink-600 bg-pink-100 py-4 px-5 rounded-lg mb-4 text-center shadow-sm animate-slideIn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span className="font-medium text-base">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              className={`w-full p-[14px] text-base border-2 ${errors.email ? 'border-red-300' : 'border-pink-200'} rounded-lg outline-none transition-all duration-200 shadow-sm focus:border-pink-400 focus:shadow-[0_0_0_3px_rgba(255,102,179,0.15)]`}
              {...register('email', { 
                required: 'Email is required', 
                pattern: { 
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                  message: 'Invalid email address' 
                } 
              })}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <a href="#" className="text-xs text-pink-600 hover:text-pink-800">Forgot Password?</a>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`w-full p-[14px] text-base border-2 ${errors.password ? 'border-red-300' : 'border-pink-200'} rounded-lg outline-none transition-all duration-200 shadow-sm focus:border-pink-400 focus:shadow-[0_0_0_3px_rgba(255,102,179,0.15)]`}
              {...register('password', { 
                required: 'Password is required'
              })}
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>
          
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          <button 
            type="submit"
            className="w-full py-[14px] px-7 bg-pink-900 text-white font-semibold border-none rounded-lg cursor-pointer transition-all duration-200 shadow-md shadow-pink-700/30 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-pink-700/40 active:translate-y-0 active:shadow-sm active:shadow-pink-700/40 disabled:bg-pink-400/70 disabled:cursor-not-allowed disabled:shadow-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-1">
                <span className="inline-block w-[6px] h-[6px] rounded-full bg-white animate-pulse"></span>
                <span className="inline-block w-[6px] h-[6px] rounded-full bg-white animate-pulse animation-delay-200"></span>
                <span className="inline-block w-[6px] h-[6px] rounded-full bg-white animate-pulse animation-delay-400"></span>
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-pink-600 hover:text-pink-800 font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 