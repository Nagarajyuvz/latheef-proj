import { useState, useEffect } from 'react';
import { Member } from '@/types/donation';
import { DonationService } from '@/services/donationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface MembersPageProps {
  onNavigate: (page: string) => void;
}

export const MembersPage = ({ onNavigate }: MembersPageProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    joinDate: new Date().toISOString().split('T')[0],
    isActive: true
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = () => {
    setMembers(DonationService.getMembers());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMember) {
        DonationService.updateMember(editingMember.id, formData);
        toast.success('Member updated successfully!');
        setEditingMember(null);
      } else {
        DonationService.saveMember(formData);
        toast.success('Member added successfully!');
        setShowAddForm(false);
      }
      
      resetForm();
      loadMembers();
    } catch (error) {
      toast.error('Failed to save member. Please try again.');
    }
  };

  const handleEdit = (member: Member) => {
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address,
      joinDate: member.joinDate,
      isActive: member.isActive
    });
    setEditingMember(member);
    setShowAddForm(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      DonationService.deleteMember(id);
      toast.success('Member deleted successfully');
      loadMembers();
    }
  };

  const toggleMemberStatus = (member: Member) => {
    DonationService.updateMember(member.id, { isActive: !member.isActive });
    toast.success(`Member ${!member.isActive ? 'activated' : 'deactivated'} successfully`);
    loadMembers();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true
    });
    setEditingMember(null);
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-arabic font-bold text-primary">Member Management</h1>
          <p className="text-muted-foreground">Manage community members and their information</p>
        </div>
        <Button 
          variant="islamic" 
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Member
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add/Edit Member Form */}
      {showAddForm && (
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary" />
              {editingMember ? 'Edit Member' : 'Add New Member'}
            </CardTitle>
            <CardDescription>
              {editingMember ? 'Update member information' : 'Enter the details for the new member'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="joinDate">Join Date</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
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
                  {editingMember ? 'Update Member' : 'Add Member'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Members Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="card-elegant">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-arabic">{member.name}</CardTitle>
                  <Badge variant={member.isActive ? "default" : "secondary"} className="mt-1">
                    {member.isActive ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(member)}
                    className="h-8 w-8"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(member.id, member.name)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {member.email && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              
              {member.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{member.phone}</span>
                </div>
              )}
              
              {member.address && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{member.address}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleMemberStatus(member)}
                  className="w-full"
                >
                  {member.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <Card className="card-elegant">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'No members found' : 'No members yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? `No members match "${searchTerm}"`
                : 'Start by adding your first community member'
              }
            </p>
            {!searchTerm && (
              <Button variant="islamic" onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Member
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Footer */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="stats-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-arabic text-primary">
              {members.length}
            </div>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-arabic text-success">
              {members.filter(m => m.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground">Active Members</p>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-arabic text-warning">
              {members.filter(m => !m.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground">Inactive Members</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};