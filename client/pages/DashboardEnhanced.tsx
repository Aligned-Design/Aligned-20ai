import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FirstVisitTooltip } from '@/components/dashboard/FirstVisitTooltip';
import { GoodNews } from '@/components/dashboard/GoodNews';
import { CalendarAccordion } from '@/components/dashboard/CalendarAccordion';
import { ActionButtonsHeader } from '@/components/dashboard/ActionButtonsHeader';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  LearningMilestoneNotification,
  mockLearningMilestone,
  WinCelebration,
  exampleWins,
  SeasonalDipInsurance,
  summerSlumpWarning,
} from '@/components/retention';

export default function DashboardEnhanced() {
  const { currentWorkspace } = useWorkspace();
  const [showLearningMilestone, setShowLearningMilestone] = useState(true);
  const [showWin, setShowWin] = useState(true);
  const [showSeasonalAlert, setShowSeasonalAlert] = useState(true);

  // Check if it's day 30, 60, 90, etc. for learning milestones
  const daysSinceStart = 30; // This would come from your backend

  return (
    <MainLayout>
      <FirstVisitTooltip page="dashboard">
        <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/20">
          <div className="p-4 sm:p-6 md:p-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{currentWorkspace?.logo || '🏢'}</span>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
                    {currentWorkspace?.name || 'Dashboard'}
                  </h1>
                  <p className="text-slate-600 text-sm mt-1">
                    Your social media command center
                  </p>
                </div>
              </div>
              <ActionButtonsHeader />
            </div>

            {/* Learning Milestone Notification (Day 30, 60, 90) */}
            {showLearningMilestone && daysSinceStart % 30 === 0 && (
              <div className="mb-8">
                <LearningMilestoneNotification
                  milestone={mockLearningMilestone}
                  onDismiss={() => setShowLearningMilestone(false)}
                />
              </div>
            )}

            {/* Win Celebration */}
            {showWin && (
              <div className="mb-8">
                <WinCelebration
                  win={exampleWins[1]}
                  onDismiss={() => setShowWin(false)}
                />
              </div>
            )}

            {/* Seasonal Alert */}
            {showSeasonalAlert && (
              <div className="mb-8">
                <SeasonalDipInsurance
                  data={summerSlumpWarning}
                  onEnableOptimization={() => {
                    console.log('Seasonal optimization enabled');
                  }}
                  onDismiss={() => setShowSeasonalAlert(false)}
                />
              </div>
            )}

            {/* Good News Section */}
            <div className="mb-8">
              <GoodNews />
            </div>

            {/* Calendar Section */}
            <div className="mb-8">
              <CalendarAccordion />
            </div>
          </div>
        </div>
      </FirstVisitTooltip>
    </MainLayout>
  );
}
