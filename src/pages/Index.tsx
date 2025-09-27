import { useState, useEffect } from 'react';
import { DonationService } from '@/services/donationService';
import { LoginPage } from '@/components/LoginPage';
import { Dashboard } from '@/components/Dashboard';
import { MembersPage } from '@/components/MembersPage';
import { DonationsPage } from '@/components/DonationsPage';
import { Navigation } from '@/components/Navigation';
import { DonationService } from '@/services/donationService';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await DonationService.initialize();
        setIsLoggedIn(DonationService.isLoggedIn());
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Continue with localStorage fallback
        setIsLoggedIn(DonationService.isLoggedIn());
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeApp();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 islamic-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-arabic font-bold text-primary mb-2">Initializing Database</h2>
          <p className="text-muted-foreground">Setting up your donation tracking system...</p>
        </div>
      </div>
    );
  }

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