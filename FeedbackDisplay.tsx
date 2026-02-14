
import React from 'react';

interface FeedbackDisplayProps {
  feedback: string;
  onReset: () => void;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback, onReset }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-2xl mx-auto border border-indigo-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Performance Report</h2>
        <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Training Complete
        </div>
      </div>
      
      <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
        {feedback}
      </div>

      <button
        onClick={onReset}
        className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200"
      >
        Start New Simulation
      </button>
    </div>
  );
};

export default FeedbackDisplay;
