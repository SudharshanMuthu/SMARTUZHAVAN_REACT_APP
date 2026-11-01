export type UserRole = 'Farmer' | 'Transporter' | 'Warehouse' | 'Buyer' | 'Admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  location?: string;
  district?: string;
  createdAt?: string | number | null;
}

