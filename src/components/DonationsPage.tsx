import { useState, useEffect } from 'react';
import { Donation, Member } from '@/types/donation';
import { DonationService } from '@/services/donationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Calendar,
  Filter,
  Download,
  Edit,
  Trash2,
  Users,
  Star,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';

interface DonationsPageProps {
  onNavigate: (page: string) => void;
}

export const DonationsPage = ({ onNavigate }: DonationsPageProps) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'monthly' | 'event'>('all');
  const [filterMonth, setFilterMonth] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);

  const [formData, setFormData] = useState({
    memberId: '',
    memberName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'monthly' as 'monthly' | 'event',
    eventName: '',
    notes: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'bank_transfer' | 'other'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setDonations(DonationService.getDonations());
    setMembers(DonationService.getMembers());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.memberId || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const donationData = {
        ...formData,
        amount: parseFloat(formData.amount),
        eventName: formData.type === 'event' ? formData.eventName : undefined
      };

      if (editingDonation) {
        DonationService.updateDonation(editingDonation.id, donationData);
        toast.success('Donation updated successfully!');
        setEditingDonation(null);
      } else {
        DonationService.saveDonation(donationData);
        toast.success('Donation recorded successfully!');
      }
      
      resetForm();
      setShowAddForm(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save donation. Please try again.');
    }
  };

  const handleEdit = (donation: Donation) => {
    setFormData({
      memberId: donation.memberId,
      memberName: donation.memberName,
      amount: donation.amount.toString(),
      date: donation.date,
      type: donation.type,
      eventName: donation.eventName || '',
      notes: donation.notes || '',
      paymentMethod: donation.paymentMethod || 'cash'
    });
    setEditingDonation(donation);
    setShowAddForm(true);
  };

  const handleDelete = (id: string, memberName: string) => {
    if (window.confirm(`Are you sure you want to delete this donation from ${memberName}?`)) {
      DonationService.deleteDonation(id);
      toast.success('Donation deleted successfully');
      loadData();
    }
  };

  const handleMemberSelect = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    setFormData({
      ...formData,
      memberId,
      memberName: member ? member.name : ''
    });
  };

  const resetForm = () => {
    setFormData({
      memberId: '',
      memberName: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      type: 'monthly',
      eventName: '',
      notes: '',
      paymentMethod: 'cash'
    });
    setEditingDonation(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = 
      donation.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (donation.eventName && donation.eventName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || donation.type === filterType;
    
    const matchesMonth = !filterMonth || donation.date.startsWith(filterMonth);

    return matchesSearch && matchesType && matchesMonth;
  });

  const totalAmount = filteredDonations.reduce((sum, donation) => sum + donation.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-arabic font-bold text-primary">Donation Management</h1>
          <p className="text-muted-foreground">Track and manage community donations</p>
        </div>
        <Button 
          variant="islamic" 
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Donation
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search donations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Donations</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="event">Event-based</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="month"
          placeholder="Filter by month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        />

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="font-arabic">
            Total: {formatCurrency(totalAmount)}
          </Badge>
          <Badge variant="secondary">
            {filteredDonations.length} donations
          </Badge>
        </div>
      </div>

      {/* Add/Edit Donation Form */}
      {showAddForm && (
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-primary" />
              {editingDonation ? 'Edit Donation' : 'Record New Donation'}
            </CardTitle>
            <CardDescription>
              {editingDonation ? 'Update donation information' : 'Enter the donation details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="member">Member *</Label>
                <Select value={formData.memberId} onValueChange={handleMemberSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.filter(m => m.isActive).map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Donation</SelectItem>
                    <SelectItem value="event">Event-based Donation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'event' && (
                <div>
                  <Label htmlFor="eventName">Event Name *</Label>
                  <Input
                    id="eventName"
                    value={formData.eventName}
                    onChange={(e) => setFormData({...formData, eventName: e.target.value})}
                    placeholder="e.g., Ramadan, Eid al-Fitr, Mosque Construction"
                    required
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(value: any) => setFormData({...formData, paymentMethod: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes about this donation..."
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="islamic">
                  {editingDonation ? 'Update Donation' : 'Record Donation'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Donations List */}
      <div className="space-y-4">
        {filteredDonations.map((donation) => (
          <Card key={donation.id} className="card-elegant">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-arabic font-semibold text-lg">{donation.memberName}</h3>
                    <Badge variant={donation.type === 'monthly' ? 'default' : 'secondary'}>
                      {donation.type === 'monthly' ? (
                        <>
                          <Calendar className="w-3 h-3 mr-1" />
                          Monthly
                        </>
                      ) : (
                        <>
                          <Gift className="w-3 h-3 mr-1" />
                          {donation.eventName}
                        </>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-bold text-primary text-lg font-arabic">
                        {formatCurrency(donation.amount)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {new Date(donation.date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">
                        {donation.paymentMethod?.replace('_', ' ') || 'Cash'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{donation.type}</p>
                    </div>
                  </div>
                  
                  {donation.notes && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Notes:</strong> {donation.notes}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(donation)}
                    className="h-8 w-8"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(donation.id, donation.memberName)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredDonations.length === 0 && (
        <Card className="card-elegant">
          <CardContent className="text-center py-12">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm || filterType !== 'all' || filterMonth ? 'No donations found' : 'No donations recorded yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== 'all' || filterMonth
                ? 'Try adjusting your search or filter criteria'
                : 'Start by recording your first donation'
              }
            </p>
            {!searchTerm && filterType === 'all' && !filterMonth && (
              <Button variant="islamic" onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Record First Donation
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {filteredDonations.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="stats-card">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold font-arabic text-primary">
                {formatCurrency(totalAmount)}
              </div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
            </CardContent>
          </Card>
          
          <Card className="stats-card">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold font-arabic text-success">
                {filteredDonations.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Donations</p>
            </CardContent>
          </Card>
          
          <Card className="stats-card">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold font-arabic text-secondary">
                {new Set(filteredDonations.map(d => d.memberId)).size}
              </div>
              <p className="text-sm text-muted-foreground">Unique Donors</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};