export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  isActive: boolean;
}

export interface Donation {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  type: 'monthly' | 'event';
  eventName?: string;
  notes?: string;
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'other';
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalDonationsThisMonth: number;
  totalAmountThisMonth: number;
  membersPaidThisMonth: number;
  pendingPayments: number;
  totalDonationsAllTime: number;
  totalAmountAllTime: number;
}

export interface EventSummary {
  eventName: string;
  totalAmount: number;
  donorCount: number;
  donations: Donation[];
}