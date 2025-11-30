export enum UserRole {
  SEEKER = 'SEEKER',
  WORKER = 'WORKER',
}

export enum JobStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PAID_AND_REVIEWED = 'PAID_AND_REVIEWED',
  CANCELLED = 'CANCELLED'
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, never store plain text
  role: UserRole;
  balance: number;
  // Worker specific fields
  skills?: string[];
  category?: string;
  hourlyRate?: number;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  isAvailable?: boolean;
}

export interface Job {
  id: string;
  seekerId: string;
  seekerName: string;
  workerId: string;
  workerName: string;
  description: string;
  category: string;
  price: number;
  status: JobStatus;
  createdAt: string;
}

export const CATEGORIES = [
  'Teacher',
  'Doctor',
  'Carpenter',
  'Plumber',
  'Electrician',
  'Barber',
  'Home Caretaker',
  'Cook/Chef',
  'Grocery Seller',
  'Mechanic',
  'Sweeper',
  'Painter',
  'Gardener'
];