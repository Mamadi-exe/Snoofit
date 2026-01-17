import { motion } from 'framer-motion';
import { User, MapPin, Trophy, Target, Award, Flame, Calendar, TrendingUp, Settings, ChevronRight, Activity } from 'lucide-react';
import { useFitQuestStore } from '@/stores/fitquestStore';
import { useLanguageStore } from '@/i18n/languageStore';
import { mockActivities } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';

export function ProfileScreen() {
  const { userStats, userName } = useFitQuestStore();
  const { t } = useLanguageStore();

  const level = Math.floor(userStats.totalDistance / 10) + 1;
  const levelProgress = (userStats.totalDistance % 10) * 10;

  const stats = [
    { label: t('totalDistance'), value: `${userStats.totalDistance} km`, icon: Target, color: 'text-primary' },
    { label: t('zonesCapturedStat'), value: userStats.zonesCaptured.toString(), icon: MapPin, color: 'text-fitquest-teal' },
    { label: t('currentRank'), value: `#${userStats.rank}`, icon: Trophy, color: 'text-fitquest-gold' },
    { label: t('activeStreak'), value: `${userStats.currentStreak} ${t('days')}`, icon: Flame, color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center text-4xl shadow-glow"
          >
            🏃
          </motion.div>
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold"
            >
              {userName}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-primary-foreground/70"
            >
              Level {level} • {userStats.totalPoints.toLocaleString()} {t('pts')}
            </motion.p>
          </div>
        </div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-4"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Award className="text-fitquest-gold" size={20} />
              <span className="font-semibold">Level {level}</span>
            </div>
            <span className="text-sm text-primary-foreground/70">Level {level + 1}</span>
          </div>
          <div className="w-full bg-primary-foreground/20 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full gradient-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <p className="text-xs text-primary-foreground/50 mt-2 text-center">
            {(10 - (userStats.totalDistance % 10)).toFixed(1)} km to next level
          </p>
        </motion.div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <section>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Activity className="text-primary" size={20} />
            {t('stats')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card rounded-2xl p-5 text-center shadow-sm border border-border"
              >
                <stat.icon className={`mx-auto mb-2 ${stat.color}`} size={28} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Streaks */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="gradient-primary rounded-2xl p-5 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Flame size={28} />
                </div>
                <div>
                  <p className="text-sm text-primary-foreground/70">{t('activeStreak')}</p>
                  <p className="text-3xl font-bold">{userStats.currentStreak} {t('days')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary-foreground/70">Longest</p>
                <p className="text-xl font-bold">{userStats.longestStreak} {t('days')}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Activity Log */}
        <section>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Calendar className="text-fitquest-purple" size={20} />
            {t('recentActivity')}
          </h3>
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            {mockActivities.slice(0, 5).map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                className={`flex items-center justify-between p-4 ${
                  idx < mockActivities.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'zone_capture' 
                      ? 'bg-fitquest-teal/20 text-fitquest-teal'
                      : activity.type === 'milestone_unlocked'
                        ? 'bg-fitquest-gold/20 text-fitquest-gold'
                        : 'bg-fitquest-blue/20 text-fitquest-blue'
                  }`}>
                    {activity.type === 'zone_capture' ? <MapPin size={18} /> : 
                     activity.type === 'milestone_unlocked' ? <Award size={18} /> : 
                     <TrendingUp size={18} />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {activity.pointsEarned > 0 && (
                  <span className="text-fitquest-green font-semibold">
                    +{activity.pointsEarned}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Settings Link */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full bg-card rounded-2xl p-4 shadow-sm border border-border flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Settings className="text-muted-foreground" size={24} />
            <span className="font-medium">{t('settings')}</span>
          </div>
          <ChevronRight className="text-muted-foreground" size={20} />
        </motion.button>
      </div>
    </div>
  );
}
