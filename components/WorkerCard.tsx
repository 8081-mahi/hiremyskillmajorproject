import React from 'react';
import { User } from '../types';
import { StarRating } from './StarRating';
import { Button } from './Button';

interface WorkerCardProps {
  worker: User;
  onHire: (worker: User) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onHire }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {worker.name.charAt(0)}
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">{worker.name}</h3>
              <p className="text-sm text-gray-500">{worker.category}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">${worker.hourlyRate}<span className="text-sm font-normal text-gray-500">/hr</span></p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{worker.bio}</p>

        <div className="flex items-center mb-4 space-x-2">
            <StarRating rating={worker.rating || 0} />
            <span className="text-sm text-gray-500">({worker.reviewCount} reviews)</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
            {worker.skills?.slice(0, 3).map(skill => (
                <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {skill}
                </span>
            ))}
        </div>

        <Button onClick={() => onHire(worker)} className="w-full">
          Hire Now
        </Button>
      </div>
    </div>
  );
};