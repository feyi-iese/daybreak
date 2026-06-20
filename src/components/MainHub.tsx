import { useState } from 'react';
import type { Profile } from '../db/db';
import Dashboard from './Dashboard';
import DailyLogView from './tracking/DailyLogView';

interface MainHubProps {
  profile: Profile;
  onEdit: () => void;
}

export default function MainHub({ profile, onEdit }: MainHubProps) {
  const [activeTab, setActiveTab] = useState<'log' | 'journey'>('log');

  return (
    <div className="space-y-6">
      {/* Segmented Tab Switcher */}
      <div className="segmented w-full shadow-soft" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'log'}
          onClick={() => setActiveTab('log')}
          className={`segmented-option flex items-center justify-center py-2.5 text-sm font-semibold rounded-2xl ${
            activeTab === 'log' ? 'segmented-option--active text-primary-600 bg-cream-50 shadow-sm' : 'text-ink-soft'
          }`}
          type="button"
        >
          Daily Log
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'journey'}
          onClick={() => setActiveTab('journey')}
          className={`segmented-option flex items-center justify-center py-2.5 text-sm font-semibold rounded-2xl ${
            activeTab === 'journey' ? 'segmented-option--active text-primary-600 bg-cream-50 shadow-sm' : 'text-ink-soft'
          }`}
          type="button"
        >
          My Journey
        </button>
      </div>

      {/* Tab Panels */}
      <div role="tabpanel" className="animate-fade-rise" key={activeTab}>
        {activeTab === 'log' ? (
          <DailyLogView profile={profile} />
        ) : (
          <Dashboard profile={profile} onEdit={onEdit} />
        )}
      </div>
    </div>
  );
}
