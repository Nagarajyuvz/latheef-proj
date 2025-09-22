import { Button } from '@/components/ui/button';
import { DonationService } from '@/services/donationService';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Building,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const Navigation = ({ currentPage, onNavigate, onLogout }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    DonationService.logout();
    toast.success('Logged out successfully');
    onLogout();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'donations', label: 'Donations', icon: DollarSign },
  ];

  const NavButton = ({ 
    item, 
    isMobile = false 
  }: { 
    item: typeof menuItems[0]; 
    isMobile?: boolean;
  }) => (
    <Button
      variant={currentPage === item.id ? 'islamic' : 'ghost'}
      className={`${isMobile ? 'w-full justify-start' : ''} transition-all duration-200`}
      onClick={() => {
        onNavigate(item.id);
        if (isMobile) setIsMobileMenuOpen(false);
      }}
    >
      <item.icon className="w-4 h-4 mr-2" />
      {item.label}
    </Button>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between p-4 bg-card border-b border-border">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-primary">
            <Building className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-arabic font-bold text-lg text-primary">Muslim Community</h1>
            <p className="text-xs text-muted-foreground">Donation Tracking</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex items-center space-x-2">
          {menuItems.map((item) => (
            <NavButton key={item.id} item={item} />
          ))}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          <div className="text-right text-sm">
            <p className="font-medium">Administrator</p>
            <p className="text-xs text-muted-foreground">Logged in</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <nav className="flex items-center justify-between p-4 bg-card border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary">
              <Building className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-arabic font-bold text-primary">Muslim Community</h1>
              <p className="text-xs text-muted-foreground">Donation Tracking</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-card border-b border-border p-4 space-y-2">
            {menuItems.map((item) => (
              <NavButton key={item.id} item={item} isMobile />
            ))}
            
            <div className="islamic-divider my-4"></div>
            
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">Administrator</p>
                <p className="text-xs text-muted-foreground">Logged in</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};