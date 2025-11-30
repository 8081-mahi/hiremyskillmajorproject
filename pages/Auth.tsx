import React, { useState } from 'react';
import { UserRole, CATEGORIES } from '../types';
import { storageService } from '../services/storage';
import { Button } from '../components/Button';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.SEEKER);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [hourlyRate, setHourlyRate] = useState(20);
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = storageService.login(email, role);
      if (user) {
        onLogin();
      } else {
        setError('Invalid email or role. Check if you signed up correctly.');
      }
    } else {
      if (!name || !email || !password) {
        setError('Please fill in all required fields.');
        return;
      }
      
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        password,
        role,
        balance: 100, // Sign up bonus
        ...(role === UserRole.WORKER && {
          category,
          hourlyRate,
          bio,
          skills: [category], // Simplified for demo
          rating: 0,
          reviewCount: 0,
          isAvailable: true,
          reviews: []
        })
      };
      
      storageService.signup(newUser);
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to SkillLink' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
        
        {/* Role Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === UserRole.SEEKER ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            onClick={() => setRole(UserRole.SEEKER)}
            type="button"
          >
            I need a Service
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === UserRole.WORKER ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            onClick={() => setRole(UserRole.WORKER)}
            type="button"
          >
             I have a Skill
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}
          
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Worker Specific Fields on Signup */}
            {!isLogin && role === UserRole.WORKER && (
              <>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Select Your Skill/Category</label>
                    <select
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
                        <input
                            type="number"
                            min="1"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Short Bio</label>
                    <textarea
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Describe your experience..."
                    />
                 </div>
              </>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg">
            {isLogin ? 'Sign in' : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  );
};