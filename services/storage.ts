import { User, Job, UserRole, JobStatus, Review, CATEGORIES } from '../types';

const USERS_KEY = 'skilllink_users';
const JOBS_KEY = 'skilllink_jobs';
const CURRENT_USER_KEY = 'skilllink_current_user';

// Seed data if empty
const seedData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const dummyWorkers: User[] = [
      {
        id: 'w1', name: 'John Carpenter', email: 'john@work.com', password: '123', role: UserRole.WORKER, balance: 100,
        category: 'Carpenter', skills: ['Furniture Repair', 'Woodworking'], hourlyRate: 45, bio: 'Expert carpenter with 10 years experience.',
        rating: 4.8, reviewCount: 12, isAvailable: true, reviews: []
      },
      {
        id: 'w2', name: 'Dr. Sarah Smith', email: 'sarah@work.com', password: '123', role: UserRole.WORKER, balance: 500,
        category: 'Doctor', skills: ['General Consultation', 'Pediatrics'], hourlyRate: 100, bio: 'Board certified general practitioner.',
        rating: 5.0, reviewCount: 25, isAvailable: true, reviews: []
      },
      {
        id: 'w3', name: 'Mike Fixit', email: 'mike@work.com', password: '123', role: UserRole.WORKER, balance: 50,
        category: 'Mechanic', skills: ['Car Repair', 'Oil Change'], hourlyRate: 60, bio: 'Quick and reliable auto service.',
        rating: 4.2, reviewCount: 5, isAvailable: true, reviews: []
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(dummyWorkers));
  }
  if (!localStorage.getItem(JOBS_KEY)) {
    localStorage.setItem(JOBS_KEY, JSON.stringify([]));
  }
};

seedData();

export const storageService = {
  getUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  saveUser: (user: User) => {
    const users = storageService.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Update current session if it's the same user
    const currentUser = storageService.getCurrentUser();
    if (currentUser && currentUser.id === user.id) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  login: (email: string, role: UserRole): User | null => {
    const users = storageService.getUsers();
    // Simple mock login - matches email and role (password check skipped for demo simplicity but easy to add)
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  signup: (user: User): User => {
    storageService.saveUser(user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getJobs: (): Job[] => {
    return JSON.parse(localStorage.getItem(JOBS_KEY) || '[]');
  },

  createJob: (job: Job) => {
    const jobs = storageService.getJobs();
    jobs.push(job);
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  },

  updateJobStatus: (jobId: string, status: JobStatus) => {
    const jobs = storageService.getJobs();
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      job.status = status;
      localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    }
  },

  addReview: (workerId: string, review: Review) => {
    const users = storageService.getUsers();
    const worker = users.find(u => u.id === workerId);
    if (worker) {
      if (!worker.reviews) worker.reviews = [];
      worker.reviews.push(review);
      
      // Recalculate average rating
      const totalStars = worker.reviews.reduce((acc, r) => acc + r.rating, 0);
      worker.rating = parseFloat((totalStars / worker.reviews.length).toFixed(1));
      worker.reviewCount = worker.reviews.length;
      
      storageService.saveUser(worker);
    }
  },
  
  // Helper to get available workers by category
  getWorkersByCategory: (category: string): User[] => {
    return storageService.getUsers().filter(u => 
      u.role === UserRole.WORKER && 
      u.category === category && 
      u.isAvailable
    );
  }
};