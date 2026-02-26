import { useState } from 'react';
import { useProfile } from '@/hooks/useEnergy';
import { DayView } from '@/components/DayView';
import { SettingsView } from '@/components/SettingsView';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { ThemeProvider } from 'next-themes';

type View = 'day' | 'settings';

export default function App() {
  const { profile, loading, updateProfile } = useProfile();
  const [view, setView] = useState<View>('day');
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('energi-onboarded') === 'true';
  });

  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !onboarded || !profile ? (
        <OnboardingWizard
          onComplete={async (budget) => {
            await updateProfile({ dailyBudget: budget });
            localStorage.setItem('energi-onboarded', 'true');
            setOnboarded(true);
          }}
        />
      ) : view === 'day' ? (
        <DayView profile={profile} onOpenSettings={() => setView('settings')} />
      ) : view === 'settings' ? (
        <SettingsView
          profile={profile}
          onUpdateProfile={updateProfile}
          onBack={() => setView('day')}
        />
      ) : null}
    </ThemeProvider>
  );
}
