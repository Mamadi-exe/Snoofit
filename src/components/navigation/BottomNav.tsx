import { motion } from 'framer-motion';
import { Map, Trophy, Gift, User } from 'lucide-react';
import { ScreenType } from '@/types/fitquest';

interface BottomNavProps {
  activeScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

const navItems: { id: ScreenType; icon: typeof Map; label: string }[] = [
  { id: 'map', icon: Map, label: 'Map' },
  { id: 'leaderboard', icon: Trophy, label: 'Ranks' },
  { id: 'rewards', icon: Gift, label: 'Rewards' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-2 py-2 safe-area-inset-bottom lg:hidden"
    >
      <div className="max-w-4xl mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileTap={{ scale: 0.9 }}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <item.icon size={24} />
              </motion.div>
              <span className="text-xs font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
