import React, { useState, useEffect } from 'react';
import { User, Job, JobStatus, JobStatus as JS } from '../types';
import { storageService } from '../services/storage';
import { Button } from '../components/Button';

export const DashboardWorker: React.FC = () => {
  const [user, setUser] = useState<User>(storageService.getCurrentUser()!);
  const [jobs, setJobs] = useState<Job[]>([]);

  const loadJobs = () => {
    // Reload user to get latest balance/ratings
    const currentUser = storageService.getCurrentUser();
    if(currentUser) setUser(currentUser);

    const allJobs = storageService.getJobs();
    // Filter jobs assigned to this worker
    setJobs(allJobs.filter(j => j.workerId === user.id));
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const updateStatus = (jobId: string, status: JS) => {
    storageService.updateJobStatus(jobId, status);
    loadJobs();
  };

  const pendingJobs = jobs.filter(j => j.status === JS.PENDING);
  const activeJobs = jobs.filter(j => j.status === JS.IN_PROGRESS);
  const historyJobs = jobs.filter(j => j.status === JS.COMPLETED || j.status === JS.PAID_AND_REVIEWED);

  const toggleAvailability = () => {
      const updatedUser = { ...user, isAvailable: !user.isAvailable };
      storageService.saveUser(updatedUser);
      setUser(updatedUser);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Stat Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Worker Dashboard</h1>
            <p className="text-gray-500">Manage your gigs and earnings</p>
        </div>
        <div className="flex items-center space-x-4">
             <div className="text-right mr-4">
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-bold ${user.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                    {user.isAvailable ? 'Online' : 'Offline'}
                </p>
            </div>
            <Button 
                variant={user.isAvailable ? 'danger' : 'primary'} 
                onClick={toggleAvailability}
            >
                {user.isAvailable ? 'Go Offline' : 'Go Online'}
            </Button>
        </div>
      </div>

      {/* Incoming Requests */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            Incoming Requests
            {pendingJobs.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">{pendingJobs.length}</span>
            )}
        </h2>
        {pendingJobs.length === 0 ? (
             <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500">
                No new requests. Stay online to receive jobs!
             </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingJobs.map(job => (
                    <div key={job.id} className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-yellow-400">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-900">{job.seekerName}</h3>
                                <p className="text-sm text-gray-500">Needs {job.category}</p>
                            </div>
                            <span className="font-bold text-indigo-600">${job.price}</span>
                        </div>
                        <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded text-sm">{job.description}</p>
                        <div className="mt-4 flex space-x-2">
                            <Button size="sm" onClick={() => updateStatus(job.id, JS.IN_PROGRESS)} className="flex-1">
                                Accept
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => updateStatus(job.id, JS.CANCELLED)} className="flex-1">
                                Decline
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Active Jobs */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4">In Progress</h2>
        {activeJobs.length === 0 ? (
             <div className="text-gray-400 italic text-sm">No jobs currently in progress.</div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2">
                {activeJobs.map(job => (
                    <div key={job.id} className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-gray-900">{job.seekerName}</h3>
                            <span className="text-sm text-gray-500">Started: {new Date(job.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="mt-2 text-gray-600">{job.description}</p>
                        <div className="mt-4">
                            <Button variant="primary" onClick={() => updateStatus(job.id, JS.COMPLETED)}>
                                Mark as Completed
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Job History */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Job History</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
                {historyJobs.map(job => (
                    <li key={job.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-900">{job.seekerName}</p>
                            <p className="text-xs text-gray-500">{job.category} - {new Date(job.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm font-bold text-gray-900">${job.price}</p>
                             <span className={`text-xs px-2 py-0.5 rounded-full ${
                                 job.status === JS.PAID_AND_REVIEWED ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                             }`}>
                                {job.status === JS.PAID_AND_REVIEWED ? 'Paid' : 'Pending Payment'}
                             </span>
                        </div>
                    </li>
                ))}
                {historyJobs.length === 0 && (
                     <li className="p-6 text-center text-gray-500">You haven't completed any jobs yet.</li>
                )}
            </ul>
        </div>
      </div>

    </div>
  );
};