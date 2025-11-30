import React, { useState, useEffect } from 'react';
import { User, CATEGORIES, Job, JobStatus, UserRole } from '../types';
import { storageService } from '../services/storage';
import { geminiService } from '../services/geminiService';
import { WorkerCard } from '../components/WorkerCard';
import { Button } from '../components/Button';
import { StarRating } from '../components/StarRating';

export const DashboardSeeker: React.FC = () => {
  const [user, setUser] = useState<User>(storageService.getCurrentUser()!);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [workers, setWorkers] = useState<User[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{category: string, reason: string} | null>(null);

  // Ratings State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [jobToRate, setJobToRate] = useState<Job | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const loadData = () => {
    const allUsers = storageService.getUsers();
    const availableWorkers = allUsers.filter(u => u.role === UserRole.WORKER && u.isAvailable);
    setWorkers(availableWorkers);
    
    const myJobs = storageService.getJobs().filter(j => j.seekerId === user.id && j.status !== JobStatus.PAID_AND_REVIEWED && j.status !== JobStatus.CANCELLED);
    setActiveJobs(myJobs);

    // Refresh user balance
    const currentUser = storageService.getCurrentUser();
    if (currentUser) setUser(currentUser);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Poll for updates
    return () => clearInterval(interval);
  }, [user.id]);

  const handleAiSearch = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiSuggestion(null);
    try {
      const result = await geminiService.analyzeRequest(aiPrompt);
      setAiSuggestion({ category: result.category, reason: result.reason });
      if (result.category !== 'Other') {
        setSelectedCategory(result.category);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleHire = (worker: User) => {
    const description = aiPrompt || `Service required for ${worker.category}`;
    const newJob: Job = {
        id: 'job_' + Date.now(),
        seekerId: user.id,
        seekerName: user.name,
        workerId: worker.id,
        workerName: worker.name,
        category: worker.category!,
        description: description,
        price: worker.hourlyRate!, // Simplified: Just assume 1 hr base price for request
        status: JobStatus.PENDING,
        createdAt: new Date().toISOString()
    };
    storageService.createJob(newJob);
    loadData();
    alert(`Request sent to ${worker.name}! Check 'My Jobs' for status.`);
  };

  const handleCompleteAndPay = (job: Job) => {
    // Logic: Deduct from Seeker, Add to Worker (Simulated)
    // Here we just open the rating modal which handles the final status update
    setJobToRate(job);
    setRatingModalOpen(true);
  };

  const submitReview = () => {
    if (!jobToRate) return;
    
    storageService.addReview(jobToRate.workerId, {
        id: 'rev_' + Date.now(),
        reviewerName: user.name,
        rating: ratingValue,
        comment: reviewComment,
        date: new Date().toISOString()
    });

    storageService.updateJobStatus(jobToRate.id, JobStatus.PAID_AND_REVIEWED);
    
    // Update Seeker Balance (Visual deduction)
    const updatedSeeker = { ...user, balance: user.balance - jobToRate.price };
    storageService.saveUser(updatedSeeker);
    setUser(updatedSeeker);

    // Update Worker Balance
    const worker = storageService.getUsers().find(u => u.id === jobToRate.workerId);
    if(worker) {
        worker.balance += jobToRate.price;
        storageService.saveUser(worker);
    }

    setRatingModalOpen(false);
    setJobToRate(null);
    setReviewComment('');
    setRatingValue(5);
    loadData();
  };

  const filteredWorkers = selectedCategory === 'All' 
    ? workers 
    : workers.filter(w => w.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Active Jobs Section */}
      {activeJobs.length > 0 && (
        <div className="mb-12 bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Jobs</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeJobs.map(job => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-900">{job.workerName}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    job.status === JobStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                                    job.status === JobStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {job.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{job.category}</p>
                            <p className="text-xs text-gray-500 mb-3">{job.description}</p>
                        </div>
                        
                        {job.status === JobStatus.COMPLETED && (
                             <Button size="sm" onClick={() => handleCompleteAndPay(job)} className="w-full mt-2">
                                Pay ${job.price} & Rate
                             </Button>
                        )}
                        {job.status === JobStatus.PENDING && (
                            <p className="text-xs text-center text-gray-500 italic mt-2">Waiting for worker to accept...</p>
                        )}
                        {job.status === JobStatus.IN_PROGRESS && (
                            <p className="text-xs text-center text-blue-600 mt-2 font-medium">Work in progress...</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
      )}

      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Find the perfect help
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          Describe what you need, and our AI will match you with an expert.
        </p>
      </div>

      {/* AI Search Box */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="relative flex items-center">
            <input 
                type="text"
                className="block w-full rounded-full border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-4 pl-6 pr-32 text-lg"
                placeholder="e.g. My kitchen sink is leaking badly..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
            />
            <div className="absolute right-2">
                <Button onClick={handleAiSearch} disabled={isAiLoading} loading={isAiLoading} size="md" className="rounded-full">
                    AI Match
                </Button>
            </div>
        </div>
        {aiSuggestion && (
            <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-indigo-700">
                        {aiSuggestion.reason} We filtered for <strong>{aiSuggestion.category}</strong>.
                    </p>
                </div>
            </div>
        )}
      </div>

      {/* Category Filters */}
      <div className="mb-8 overflow-x-auto pb-4">
        <div className="flex space-x-2">
            <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'All' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
            >
                All Categories
            </button>
            {CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* Worker Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredWorkers.map(worker => (
          <WorkerCard key={worker.id} worker={worker} onHire={handleHire} />
        ))}
        {filteredWorkers.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
                No active workers found in this category.
            </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingModalOpen && jobToRate && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Rate {jobToRate.workerName}
                                </h3>
                                <div className="mt-4 flex justify-center py-4">
                                    <StarRating rating={ratingValue} interactive size="lg" onRate={setRatingValue} />
                                </div>
                                <div className="mt-2">
                                    <textarea
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                        placeholder="Write a review..."
                                        rows={3}
                                        value={reviewComment}
                                        onChange={e => setReviewComment(e.target.value)}
                                    ></textarea>
                                </div>
                                <p className="mt-4 text-sm text-gray-500">
                                    Total Payment: <span className="font-bold text-gray-900">${jobToRate.price}</span> will be deducted from your balance.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <Button onClick={submitReview}>
                            Pay & Submit
                        </Button>
                        <Button variant="secondary" onClick={() => setRatingModalOpen(false)} className="mt-3 sm:mt-0 sm:mr-3">
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};