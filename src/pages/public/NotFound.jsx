import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import Button from '../../components/common/Button.jsx';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-xl">
        404
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Therapist Link or Page Not Found</h1>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
        The branded practice link you visited may have been moved, updated, or does not exist on Unfazed.
      </p>
      <div className="pt-2">
        <Link to="/">
          <Button variant="primary" size="md" icon={ArrowLeft} className="text-xs font-semibold">
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
