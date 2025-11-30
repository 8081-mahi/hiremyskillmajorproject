import React from 'react';
import { User } from '../types';
import { Button } from './Button';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600 tracking-tight">SkillLink</span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex flex-col items-end mr-4">
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                </div>
                {/* Balance Pill */}
                <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold border border-green-200">
                    Balance: ${user.balance}
                </div>
                <Button variant="secondary" size="sm" onClick={onLogout}>Logout</Button>
              </>
            ) : (
                <span className="text-gray-500 text-sm">Welcome Guest</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};