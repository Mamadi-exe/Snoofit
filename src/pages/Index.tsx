import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScreenType } from '@/types/fitquest';
import { OnboardingScreen } from '@/components/screens/OnboardingScreen';
import { MapScreen } from '@/components/screens/MapScreen';
import { LeaderboardScreen } from '@/components/screens/LeaderboardScreen';
import { RewardsScreen } from '@/components/screens/RewardsScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { BottomNav } from '@/components/navigation/BottomNav';
import { DesktopNav } from '@/components/navigation/DesktopNav';

const ONBOARDING_KEY = 'fitquest_onboarded';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('onboarding');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasOnboarded = localStorage.getItem(ONBOARDING_KEY);
    if (hasOnboarded) {
      setCurrentScreen('map');
    }
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setCurrentScreen('map');
  };

  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center shadow-glow"
        >
          <span className="text-3xl">🏃</span>
        </motion.div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      case 'map':
        return <MapScreen />;
      case 'leaderboard':
        return <LeaderboardScreen />;
      case 'rewards':
        return <RewardsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <MapScreen />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-background min-h-screen relative overflow-hidden">
      {/* Desktop Navigation */}
      {currentScreen !== 'onboarding' && (
        <DesktopNav activeScreen={currentScreen} onNavigate={handleNavigate} />
      )}

      {/* Desktop Layout Wrapper */}
      <div className="flex flex-col lg:flex-row lg:gap-6 lg:p-6 lg:pl-32">
        {/* Main Content Area */}
        <div className="flex-1 lg:max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, x: currentScreen === 'onboarding' ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-screen lg:min-h-0 lg:rounded-3xl lg:overflow-hidden lg:shadow-lg"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop Sidebar - visible only on large screens */}
        {currentScreen !== 'onboarding' && (
          <aside className="hidden lg:block w-80 space-y-4">
            <div className="bg-card rounded-2xl p-6 shadow-md border border-border">
              <h3 className="font-display text-2xl text-foreground mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Today's Distance</span>
                  <span className="font-bold text-primary">2.4 km</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Zones Nearby</span>
                  <span className="font-bold text-fitquest-teal">3</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Current Rank</span>
                  <span className="font-bold text-fitquest-gold">#5</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-primary rounded-2xl p-6 text-primary-foreground">
              <h3 className="font-display text-xl mb-2">Daily Challenge</h3>
              <p className="text-sm opacity-90 mb-4">Walk 5km today to earn bonus points!</p>
              <div className="w-full bg-primary-foreground/20 rounded-full h-2">
                <div className="bg-primary-foreground h-2 rounded-full w-1/2"></div>
              </div>
              <p className="text-xs mt-2 opacity-80">2.4 / 5 km completed</p>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-md border border-border">
              <h3 className="font-display text-xl text-foreground mb-3">Partner Offers</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                  <span className="text-2xl">🥗</span>
                  <div>
                    <p className="font-medium text-sm">Healthy Restaurant</p>
                    <p className="text-xs text-primary">15% off</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                  <span className="text-2xl">💊</span>
                  <div>
                    <p className="font-medium text-sm">Snoonu Pharmacy</p>
                    <p className="text-xs text-primary">10% off vitamins</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {currentScreen !== 'onboarding' && (
        <BottomNav 
          activeScreen={currentScreen} 
          onNavigate={handleNavigate} 
        />
      )}
    </div>
  );
};

export default Index;
