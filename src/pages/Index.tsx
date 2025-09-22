import { useState, useEffect } from 'react';
import { DonationService } from '@/services/donationService';
import { LoginPage } from '@/components/LoginPage';
import { Dashboard } from '@/components/Dashboard';
import { MembersPage } from '@/components/MembersPage';
import { DonationsPage } from '@/components/DonationsPage';
import { Navigation } from '@/components/Navigation';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    setIsLoggedIn(DonationService.isLoggedIn());
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto p-6">
        {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
        {currentPage === 'members' && <MembersPage onNavigate={setCurrentPage} />}
        {currentPage === 'donations' && <DonationsPage onNavigate={setCurrentPage} />}
      </main>
    </div>
  );
};

export default Index;