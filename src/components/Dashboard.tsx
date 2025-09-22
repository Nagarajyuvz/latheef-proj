import { useEffect, useState } from 'react';
import { DashboardStats, EventSummary } from '@/types/donation';
import { DonationService } from '@/services/donationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Heart,
  Star,
  BarChart3
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<EventSummary[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setStats(DonationService.getDashboardStats());
    setEvents(DonationService.getEventSummaries());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    color = "primary" 
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: any;
    trend?: string;
    color?: "primary" | "success" | "warning" | "secondary";
  }) => (
    <Card className="stats-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-arabic">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <p className="text-xs text-success mt-1">
            <TrendingUp className="inline w-3 h-3 mr-1" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-arabic font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground">Community donation overview and statistics</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="elegant" onClick={() => onNavigate('donations')}>
            <DollarSign className="w-4 h-4 mr-2" />
            Manage Donations
          </Button>
          <Button variant="islamicSecondary" onClick={() => onNavigate('members')}>
            <Users className="w-4 h-4 mr-2" />
            Manage Members
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          description={`${stats.activeMembers} active members`}
          icon={Users}
          trend={`${((stats.activeMembers / stats.totalMembers) * 100).toFixed(1)}% active`}
          color="primary"
        />
        
        <StatCard
          title="This Month"
          value={formatCurrency(stats.totalAmountThisMonth)}
          description={`From ${stats.totalDonationsThisMonth} donations`}
          icon={DollarSign}
          trend={`${stats.membersPaidThisMonth} members contributed`}
          color="success"
        />
        
        <StatCard
          title="Paid This Month"
          value={stats.membersPaidThisMonth}
          description={`${stats.pendingPayments} pending payments`}
          icon={Heart}
          color="primary"
        />
        
        <StatCard
          title="All Time Total"
          value={formatCurrency(stats.totalAmountAllTime)}
          description={`From ${stats.totalDonationsAllTime} total donations`}
          icon={BarChart3}
          color="secondary"
        />
      </div>

      {/* Islamic Divider */}
      <div className="islamic-divider my-8"></div>

      {/* Quick Actions & Event Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-secondary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onNavigate('add-donation')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Record New Donation
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onNavigate('add-member')}
            >
              <Users className="w-4 h-4 mr-2" />
              Add New Member
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onNavigate('donations')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View All Donations
            </Button>
          </CardContent>
        </Card>

        {/* Event Summary */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-accent" />
              Special Events
            </CardTitle>
            <CardDescription>
              Event-based donation summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.slice(0, 3).map((event, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{event.eventName}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.donorCount} donors
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {formatCurrency(event.totalAmount)}
                      </p>
                    </div>
                  </div>
                ))}
                {events.length > 3 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full"
                    onClick={() => onNavigate('donations')}
                  >
                    View all events
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No special events recorded yet
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => onNavigate('add-donation')}
                >
                  Record Event Donation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alert for pending payments */}
      {stats.pendingPayments > 0 && (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium text-warning">
                  {stats.pendingPayments} members have pending monthly payments
                </p>
                <p className="text-sm text-muted-foreground">
                  Consider following up with members who haven't contributed this month.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};