import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, Flame } from 'lucide-react';
import { mockLeaderboard } from '@/data/mockData';
import { useFitQuestStore } from '@/stores/fitquestStore';
import { useLanguageStore } from '@/i18n/languageStore';

export function LeaderboardScreen() {
  const { userStats } = useFitQuestStore();
  const { t } = useLanguageStore();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="text-fitquest-gold" size={24} />;
      case 2: return <Medal className="text-gray-400" size={24} />;
      case 3: return <Medal className="text-amber-700" size={24} />;
      default: return null;
    }
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-primary/10 border-2 border-primary';
    if (rank === 1) return 'bg-gradient-to-r from-fitquest-gold/20 to-primary/20 border-2 border-fitquest-gold';
    if (rank === 2) return 'bg-gradient-to-r from-gray-200/50 to-gray-300/50 border-2 border-gray-300';
    if (rank === 3) return 'bg-gradient-to-r from-amber-100/50 to-amber-200/50 border-2 border-amber-300';
    return 'bg-card border border-border';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl font-display tracking-wider mb-2">{t('leaderboard').toUpperCase()}</h2>
          <p className="text-primary-foreground/70">{t('monthlyCompetition')} • {t('december2024')}</p>
        </motion.div>

        {/* User's Rank Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 glass rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 gradient-primary rounded-full flex items-center justify-center text-2xl shadow-glow">
              🏃
            </div>
            <div>
              <p className="text-sm text-primary-foreground/70">{t('yourRank')}</p>
              <p className="text-3xl font-bold">#{userStats.rank}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-fitquest-gold">
              <TrendingUp size={20} />
              <span className="text-sm font-medium">{t('thisWeek')}</span>
            </div>
            <p className="text-2xl font-bold">{userStats.totalPoints.toLocaleString()} pts</p>
          </div>
        </motion.div>
      </div>

      {/* Leaderboard List */}
      <div className="p-6 space-y-3">
        {mockLeaderboard.map((entry, idx) => (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-2xl p-4 flex items-center gap-4 ${getRankBg(entry.rank, entry.isCurrentUser || false)}`}
          >
            {/* Rank */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
              entry.rank === 1 
                ? 'gradient-gold text-secondary' 
                : entry.rank === 2 
                  ? 'bg-gray-300 text-gray-700'
                  : entry.rank === 3
                    ? 'bg-amber-600 text-primary-foreground'
                    : entry.isCurrentUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
            }`}>
              {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
            </div>

            {/* Avatar & Name */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{entry.avatar}</span>
                <div>
                  <p className={`font-bold ${entry.isCurrentUser ? 'text-primary' : ''}`}>
                    {entry.name}
                    {entry.isCurrentUser && <span className="text-xs ml-2 text-primary">(You)</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">{entry.distance} {t('kmTraveled')}</p>
                </div>
              </div>
            </div>

            {/* Points */}
            <div className="text-right">
              <p className="text-xl font-bold text-primary">{entry.points.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{t('points')}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Prizes Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-6"
      >
        <div className="gradient-gold rounded-2xl p-6 text-center text-secondary">
          <div className="flex justify-center mb-3">
            <Trophy size={48} className="text-secondary" />
          </div>
          <h3 className="font-bold text-xl mb-2">{t('monthlyPrizes')}</h3>
          <p className="text-sm text-secondary/80">
            {t('prizeDescription')}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Flame className="text-fitquest-coral" size={20} />
            <span className="font-medium">12 {t('daysLeft')}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
