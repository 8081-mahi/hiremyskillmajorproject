import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Auth } from './pages/Auth';
import { DashboardSeeker } from './pages/DashboardSeeker';
import { DashboardWorker } from './pages/DashboardWorker';
import { storageService } from './services/storage';
import { User, UserRole } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const currentUser = storageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    const currentUser = storageService.getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = () => {
    storageService.logout();
    setUser(null);
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar user={user} onLogout={handleLogout} />
      
      <main>
        {!user ? (
          <Auth onLogin={handleLogin} />
        ) : (
          <>
            {user.role === UserRole.SEEKER ? (
              <DashboardSeeker />
            ) : (
              <DashboardWorker />
            )}
          </>
        )}
      </main>

      {!user && (
        <footer className="bg-white border-t border-gray-200 mt-auto py-8">
            <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} SkillLink. All rights reserved.
            </div>
        </footer>
      )}
    </div>
  );
}

export default App;