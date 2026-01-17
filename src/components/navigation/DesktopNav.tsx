import { motion } from 'framer-motion';
import { Map, Trophy, Gift, User } from 'lucide-react';
import { ScreenType } from '@/types/fitquest';

interface DesktopNavProps {
  activeScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

const navItems: { id: ScreenType; icon: typeof Map; label: string }[] = [
  { id: 'map', icon: Map, label: 'Map' },
  { id: 'leaderboard', icon: Trophy, label: 'Ranks' },
  { id: 'rewards', icon: Gift, label: 'Rewards' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export function DesktopNav({ activeScreen, onNavigate }: DesktopNavProps) {
  return (
    <nav className="hidden lg:flex flex-col gap-2 w-20 fixed left-6 top-6 z-40">
      {navItems.map((item) => {
        const isActive = activeScreen === item.id;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all ${
              isActive
                ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary border border-border'
            }`}
            title={item.label}
          >
            <Icon size={28} />
            {isActive && (
              <motion.div
                layoutId="navIndicator"
                className="absolute inset-0 rounded-2xl border-2 border-primary-foreground/50"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
