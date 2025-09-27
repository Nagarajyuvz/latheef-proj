import { Member, Donation, DashboardStats, EventSummary } from '@/types/donation';
import { createConnection, initializeDatabase } from '@/config/database';

const STORAGE_KEYS = {
  IS_LOGGED_IN: 'muslim-donations-logged-in'
};

// Default admin credentials (in production, this should be properly secured)
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123' // In real app, this would be hashed
};

export class DonationService {
  // Initialize database on first load
  static async initialize() {
    try {
      await initializeDatabase();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Fallback to localStorage if database fails
    }
  }

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
  static async getMembers(): Promise<Member[]> {
    try {
      const connection = await createConnection();
      const [rows] = await connection.execute(`
        SELECT id, name, email, phone, address, join_date as joinDate, is_active as isActive 
        FROM members 
        ORDER BY name ASC
      `);
      await connection.end();
      
      return (rows as any[]).map(row => ({
        ...row,
        id: row.id.toString(),
        isActive: Boolean(row.isActive)
      }));
    } catch (error) {
      console.error('Failed to fetch members:', error);
      return this.getFallbackMembers();
    }
  }

  static async saveMember(member: Omit<Member, 'id'>): Promise<Member> {
    try {
      const connection = await createConnection();
      const [result] = await connection.execute(`
        INSERT INTO members (name, email, phone, address, join_date, is_active) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [member.name, member.email, member.phone, member.address, member.joinDate, member.isActive]);
      
      const insertId = (result as any).insertId;
      await connection.end();
      
      return {
        ...member,
        id: insertId.toString()
      };
    } catch (error) {
      console.error('Failed to save member:', error);
      throw new Error('Failed to save member to database');
    }
  }

  static async updateMember(id: string, updates: Partial<Member>): Promise<boolean> {
    try {
      const connection = await createConnection();
      const fields = [];
      const values = [];
      
      if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
      if (updates.email !== undefined) { fields.push('email = ?'); values.push(updates.email); }
      if (updates.phone !== undefined) { fields.push('phone = ?'); values.push(updates.phone); }
      if (updates.address !== undefined) { fields.push('address = ?'); values.push(updates.address); }
      if (updates.joinDate !== undefined) { fields.push('join_date = ?'); values.push(updates.joinDate); }
      if (updates.isActive !== undefined) { fields.push('is_active = ?'); values.push(updates.isActive); }
      
      if (fields.length === 0) return false;
      
      values.push(id);
      await connection.execute(`
        UPDATE members SET ${fields.join(', ')} WHERE id = ?
      `, values);
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('Failed to update member:', error);
      return false;
    }
  }

  static async deleteMember(id: string): Promise<boolean> {
    try {
      const connection = await createConnection();
      await connection.execute('DELETE FROM members WHERE id = ?', [id]);
      await connection.end();
      return true;
    } catch (error) {
      console.error('Failed to delete member:', error);
      return false;
    }
  }

  // Donations
  static async getDonations(): Promise<Donation[]> {
    try {
      const connection = await createConnection();
      const [rows] = await connection.execute(`
        SELECT 
          d.id,
          d.member_id as memberId,
          m.name as memberName,
          d.amount,
          d.donation_date as date,
          d.type,
          d.event_name as eventName,
          d.notes,
          d.payment_method as paymentMethod
        FROM donations d
        JOIN members m ON d.member_id = m.id
        ORDER BY d.donation_date DESC, d.created_at DESC
      `);
      await connection.end();
      
      return (rows as any[]).map(row => ({
        ...row,
        id: row.id.toString(),
        memberId: row.memberId.toString(),
        date: row.date.toISOString().split('T')[0] // Format as YYYY-MM-DD
      }));
    } catch (error) {
      console.error('Failed to fetch donations:', error);
      return [];
    }
  }

  static async saveDonation(donation: Omit<Donation, 'id'>): Promise<Donation> {
    try {
      const connection = await createConnection();
      const [result] = await connection.execute(`
        INSERT INTO donations (member_id, amount, donation_date, type, event_name, notes, payment_method) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        donation.memberId, 
        donation.amount, 
        donation.date, 
        donation.type, 
        donation.eventName || null, 
        donation.notes || null, 
        donation.paymentMethod || 'cash'
      ]);
      
      const insertId = (result as any).insertId;
      await connection.end();
      
      return {
        ...donation,
        id: insertId.toString()
      };
    } catch (error) {
      console.error('Failed to save donation:', error);
      throw new Error('Failed to save donation to database');
    }
  }

  static async updateDonation(id: string, updates: Partial<Donation>): Promise<boolean> {
    try {
      const connection = await createConnection();
      const fields = [];
      const values = [];
      
      if (updates.memberId !== undefined) { fields.push('member_id = ?'); values.push(updates.memberId); }
      if (updates.amount !== undefined) { fields.push('amount = ?'); values.push(updates.amount); }
      if (updates.date !== undefined) { fields.push('donation_date = ?'); values.push(updates.date); }
      if (updates.type !== undefined) { fields.push('type = ?'); values.push(updates.type); }
      if (updates.eventName !== undefined) { fields.push('event_name = ?'); values.push(updates.eventName || null); }
      if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes || null); }
      if (updates.paymentMethod !== undefined) { fields.push('payment_method = ?'); values.push(updates.paymentMethod); }
      
      if (fields.length === 0) return false;
      
      values.push(id);
      await connection.execute(`
        UPDATE donations SET ${fields.join(', ')} WHERE id = ?
      `, values);
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('Failed to update donation:', error);
      return false;
    }
  }

  static async deleteDonation(id: string): Promise<boolean> {
    try {
      const connection = await createConnection();
      await connection.execute('DELETE FROM donations WHERE id = ?', [id]);
      await connection.end();
      return true;
    } catch (error) {
      console.error('Failed to delete donation:', error);
      return false;
    }
  }

  // Dashboard Stats
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const connection = await createConnection();
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      // Get member stats
      const [memberStats] = await connection.execute(`
        SELECT 
          COUNT(*) as totalMembers,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as activeMembers
        FROM members
      `);
      
      // Get donation stats for this month
      const [monthStats] = await connection.execute(`
        SELECT 
          COUNT(*) as totalDonationsThisMonth,
          COALESCE(SUM(amount), 0) as totalAmountThisMonth,
          COUNT(DISTINCT member_id) as membersPaidThisMonth
        FROM donations 
        WHERE DATE_FORMAT(donation_date, '%Y-%m') = ?
      `, [currentMonth]);
      
      // Get all-time donation stats
      const [allTimeStats] = await connection.execute(`
        SELECT 
          COUNT(*) as totalDonationsAllTime,
          COALESCE(SUM(amount), 0) as totalAmountAllTime
        FROM donations
      `);
      
      await connection.end();
      
      const memberData = (memberStats as any)[0];
      const monthData = (monthStats as any)[0];
      const allTimeData = (allTimeStats as any)[0];
      
      return {
        totalMembers: memberData.totalMembers,
        activeMembers: memberData.activeMembers,
        totalDonationsThisMonth: monthData.totalDonationsThisMonth,
        totalAmountThisMonth: parseFloat(monthData.totalAmountThisMonth),
        membersPaidThisMonth: monthData.membersPaidThisMonth,
        pendingPayments: memberData.activeMembers - monthData.membersPaidThisMonth,
        totalDonationsAllTime: allTimeData.totalDonationsAllTime,
        totalAmountAllTime: parseFloat(allTimeData.totalAmountAllTime)
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return {
        totalMembers: 0,
        activeMembers: 0,
        totalDonationsThisMonth: 0,
        totalAmountThisMonth: 0,
        membersPaidThisMonth: 0,
        pendingPayments: 0,
        totalDonationsAllTime: 0,
        totalAmountAllTime: 0
      };
    }
  }

  // Event summaries
  static async getEventSummaries(): Promise<EventSummary[]> {
    try {
      const connection = await createConnection();
      const [rows] = await connection.execute(`
        SELECT 
          event_name as eventName,
          COUNT(DISTINCT member_id) as donorCount,
          SUM(amount) as totalAmount
        FROM donations 
        WHERE type = 'event' AND event_name IS NOT NULL
        GROUP BY event_name
        ORDER BY totalAmount DESC
      `);
      
      // Get detailed donations for each event
      const eventSummaries: EventSummary[] = [];
      for (const row of rows as any[]) {
        const [donations] = await connection.execute(`
          SELECT 
            d.id,
            d.member_id as memberId,
            m.name as memberName,
            d.amount,
            d.donation_date as date,
            d.type,
            d.event_name as eventName,
            d.notes,
            d.payment_method as paymentMethod
          FROM donations d
          JOIN members m ON d.member_id = m.id
          WHERE d.event_name = ?
          ORDER BY d.donation_date DESC
        `, [row.eventName]);
        
        eventSummaries.push({
          eventName: row.eventName,
          donorCount: row.donorCount,
          totalAmount: parseFloat(row.totalAmount),
          donations: (donations as any[]).map(d => ({
            ...d,
            id: d.id.toString(),
            memberId: d.memberId.toString(),
            date: d.date.toISOString().split('T')[0]
          }))
        });
      }
      
      await connection.end();
      return eventSummaries;
    } catch (error) {
      console.error('Failed to fetch event summaries:', error);
      return [];
    }
  }

  // Fallback methods for when database is not available
  private static getFallbackMembers(): Member[] {
    const data = localStorage.getItem('muslim-donations-members');
    return data ? JSON.parse(data) : [
      {
        id: '1',
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@email.com',
        phone: '+1-555-0101',
        address: '123 Main St, City, State',
        joinDate: '2023-01-15',
        isActive: true
      }
    ];
  }
}