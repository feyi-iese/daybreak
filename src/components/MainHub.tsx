import { useEffect, useState } from 'react';
import type { Profile } from '../db/db';
import type { WeighIn } from '../db/db';
import { listWeighIns } from '../db/weighIns';
import Dashboard from './Dashboard';
import DailyLogView from './tracking/DailyLogView';
import Projection from './Projection';
import BmiCalculator from './BmiCalculator';

interface MainHubProps {
  profile: Profile;
  onEdit: () => void;
}

export default function MainHub({ profile, onEdit }: MainHubProps) {
  const [activeTab, setActiveTab] = useState<'log' | 'journey' | 'bmi' | 'projections'>('log');
  const [currentWeight, setCurrentWeight] = useState<number>(profile.startingWeightKg);
  const [weighIns, setWeighIns] = useState<WeighIn[]>([]);
  useEffect(() => {
    let active = true;
    void listWeighIns().then((list) => {
      if (!active) return;
      setWeighIns(list);
      if (list.length > 0) {
        setCurrentWeight(list[list.length - 1].weightKg);
      } else {
        setCurrentWeight(profile.startingWeightKg);
      }
    });
    return () => {
      active = false;
    };
  }, [profile.startingWeightKg, activeTab]);
  return (
    <div className="space-y-6">
      {/* Segmented Tab Switcher */}
      <div className="segmented w-full shadow-soft" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'log'}
          onClick={() => setActiveTab('log')}
          className={`segmented-option flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-2xl ${
            activeTab === 'log' ? 'segmented-option--active text-primary-600 bg-cream-50 shadow-sm dark:bg-cream-50 dark:text-primary-700 dark:shadow-none' : 'text-ink-soft'
          }`}
          type="button"
        >
          Daily Log
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'journey'}
          onClick={() => setActiveTab('journey')}
          className={`segmented-option flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-2xl ${
            activeTab === 'journey' ? 'segmented-option--active text-primary-600 bg-cream-50 shadow-sm dark:bg-cream-50 dark:text-primary-700 dark:shadow-none' : 'text-ink-soft'
          }`}
          type="button"
        >
          My Journey
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'bmi'}
          onClick={() => setActiveTab('bmi')}
          className={`segmented-option flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-2xl ${
            activeTab === 'bmi' ? 'segmented-option--active text-primary-600 bg-cream-50 shadow-sm dark:bg-cream-50 dark:text-primary-700 dark:shadow-none' : 'text-ink-soft'
          }`}
          type="button"
        >
          BMI
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'projections'}
          onClick={() => setActiveTab('projections')}
          className={`segmented-option flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-2xl ${
            activeTab === 'projections' ? 'segmented-option--active text-primary-600 bg-cream-50 shadow-sm dark:bg-cream-50 dark:text-primary-700 dark:shadow-none' : 'text-ink-soft'
          }`}
          type="button"
        >
          Projections
        </button>
      </div>

      {/* Tab Panels */}
      <div role="tabpanel" className="animate-fade-rise" key={activeTab}>
        {activeTab === 'log' && (
          <DailyLogView profile={profile} />
        )}
        {activeTab === 'journey' && (
          <Dashboard profile={profile} currentWeight={currentWeight} weighIns={weighIns} onEdit={onEdit} />
        )}
        {activeTab === 'bmi' && (
          <BmiCalculator profile={profile} currentWeightKg={currentWeight} />
        )}
        {activeTab === 'projections' && (
          <section className="card">
            {currentWeight <= profile.targetWeightKg ? (
              <div className="text-center py-6">
                <p className="hero-eyebrow text-accent-500">Destination Reached</p>
                <h2 className="section-title mt-2">You&rsquo;ve hit your target weight!</h2>
                <p className="hero-sub mt-2 max-w-[46ch] mx-auto">
                  Projections are active only when you are working towards your goal. Keep tracking your maintenance phase!
                </p>
              </div>
            ) : (
              <Projection profile={profile} currentWeightKg={currentWeight} />
            )}
          </section>
        )}
      </div>
    </div>
  );
}
