import { Member, Donation, DashboardStats, EventSummary } from '@/types/donation';

const STORAGE_KEYS = {
  MEMBERS: 'muslim-donations-members',
  DONATIONS: 'muslim-donations-donations',
  ADMIN: 'muslim-donations-admin',
  IS_LOGGED_IN: 'muslim-donations-logged-in'
};

// Default admin credentials (in production, this should be properly secured)
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123' // In real app, this would be hashed
};

export class DonationService {
  // Authentication
  static login(username: string, password: string): boolean {
    if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      return true;
    }
    return false;
  }

  static logout(): void {
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
  }

  static isLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  }

  // Members
  static getMembers(): Member[] {
    const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return data ? JSON.parse(data) : this.getInitialMembers();
  }

  static saveMember(member: Omit<Member, 'id'>): Member {
    const members = this.getMembers();
    const newMember: Member = {
      ...member,
      id: Date.now().toString()
    };
    members.push(newMember);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    return newMember;
  }

  static updateMember(id: string, updates: Partial<Member>): boolean {
    const members = this.getMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return false;
    
    members[index] = { ...members[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    return true;
  }

  static deleteMember(id: string): boolean {
    const members = this.getMembers().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    return true;
  }

  // Donations
  static getDonations(): Donation[] {
    const data = localStorage.getItem(STORAGE_KEYS.DONATIONS);
    return data ? JSON.parse(data) : [];
  }

  static saveDonation(donation: Omit<Donation, 'id'>): Donation {
    const donations = this.getDonations();
    const newDonation: Donation = {
      ...donation,
      id: Date.now().toString()
    };
    donations.push(newDonation);
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
    return newDonation;
  }

  static updateDonation(id: string, updates: Partial<Donation>): boolean {
    const donations = this.getDonations();
    const index = donations.findIndex(d => d.id === id);
    if (index === -1) return false;
    
    donations[index] = { ...donations[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
    return true;
  }

  static deleteDonation(id: string): boolean {
    const donations = this.getDonations().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
    return true;
  }

  // Dashboard Stats
  static getDashboardStats(): DashboardStats {
    const members = this.getMembers();
    const donations = this.getDonations();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const activeMembers = members.filter(m => m.isActive);
    const thisMonthDonations = donations.filter(d => d.date.startsWith(currentMonth));
    const membersPaidThisMonth = new Set(thisMonthDonations.map(d => d.memberId)).size;

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      totalDonationsThisMonth: thisMonthDonations.length,
      totalAmountThisMonth: thisMonthDonations.reduce((sum, d) => sum + d.amount, 0),
      membersPaidThisMonth,
      pendingPayments: activeMembers.length - membersPaidThisMonth,
      totalDonationsAllTime: donations.length,
      totalAmountAllTime: donations.reduce((sum, d) => sum + d.amount, 0)
    };
  }

  // Event summaries
  static getEventSummaries(): EventSummary[] {
    const donations = this.getDonations().filter(d => d.type === 'event' && d.eventName);
    const eventMap = new Map<string, Donation[]>();

    donations.forEach(donation => {
      const eventName = donation.eventName!;
      if (!eventMap.has(eventName)) {
        eventMap.set(eventName, []);
      }
      eventMap.get(eventName)!.push(donation);
    });

    return Array.from(eventMap.entries()).map(([eventName, donations]) => ({
      eventName,
      totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
      donorCount: new Set(donations.map(d => d.memberId)).size,
      donations
    }));
  }

  // Utility functions
  private static getInitialMembers(): Member[] {
    const initialMembers: Member[] = [
      {
        id: '1',
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@email.com',
        phone: '+1-555-0101',
        address: '123 Main St, City, State',
        joinDate: '2023-01-15',
        isActive: true
      },
      {
        id: '2',
        name: 'Fatima Al-Zahra',
        email: 'fatima.zahra@email.com',
        phone: '+1-555-0102',
        address: '456 Oak Ave, City, State',
        joinDate: '2023-02-20',
        isActive: true
      },
      {
        id: '3',
        name: 'Muhammad Omar',
        email: 'muhammad.omar@email.com',
        phone: '+1-555-0103',
        address: '789 Pine Rd, City, State',
        joinDate: '2023-03-10',
        isActive: true
      }
    ];
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(initialMembers));
    return initialMembers;
  }
}