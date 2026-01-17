import { motion } from 'framer-motion';
import { Gift, Star, Zap, CheckCircle, Lock, Crown, Medal, Trophy, Footprints, ExternalLink } from 'lucide-react';
import { useFitQuestStore } from '@/stores/fitquestStore';
import { useLanguageStore } from '@/i18n/languageStore';
import { mockPartnerOffers } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export function RewardsScreen() {
  const { userStats, milestones, redeemMilestone } = useFitQuestStore();
  const { t } = useLanguageStore();

  const getMilestoneIcon = (iconName: string) => {
    switch (iconName) {
      case 'footprints': return <Footprints size={28} />;
      case 'medal': return <Medal size={28} />;
      case 'trophy': return <Trophy size={28} />;
      case 'crown': return <Crown size={28} />;
      default: return <Star size={28} />;
    }
  };

  const handleRedeem = (milestoneId: string, title: string) => {
    redeemMilestone(milestoneId);
    toast({
      title: t('claimedSuccessfully'),
      description: t('promoCodeFor') + ` ${title} ` + t('hasBeenGenerated'),
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <Gift size={32} />
          <h2 className="text-4xl font-display tracking-wider">{t('rewards')}</h2>
        </motion.div>
        <p className="text-primary-foreground/70">{userStats.totalPoints.toLocaleString()} {t('pointsAvailable')}</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Distance Milestones */}
        <section>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Zap className="text-fitquest-gold" size={20} />
            {t('distanceMilestones')}
          </h3>

          <div className="space-y-4">
            {milestones.map((milestone, idx) => {
              const progress = Math.min((userStats.totalDistance / milestone.distance) * 100, 100);
              const isUnlocked = userStats.totalDistance >= milestone.distance;

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-card rounded-2xl p-5 shadow-sm border ${
                    isUnlocked 
                      ? 'border-fitquest-green' 
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      isUnlocked ? milestone.gradientClass : 'bg-muted'
                    } text-primary-foreground`}>
                      {getMilestoneIcon(milestone.iconName)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg">{milestone.title}</h4>
                        {isUnlocked && <CheckCircle className="text-fitquest-green" size={18} />}
                        {!isUnlocked && <Lock className="text-muted-foreground" size={16} />}
                      </div>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>

                    {/* Reward Badge */}
                    <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                      isUnlocked 
                        ? 'bg-fitquest-green/20 text-fitquest-green' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {milestone.reward}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">
                        {userStats.totalDistance.toFixed(1)} / {milestone.distance} km
                      </span>
                      <span className={`font-semibold ${isUnlocked ? 'text-fitquest-green' : 'text-primary'}`}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${isUnlocked ? 'gradient-green' : 'gradient-primary'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Claim Button or Promo Code */}
                  {isUnlocked && !milestone.redeemed && (
                    <Button
                      onClick={() => handleRedeem(milestone.id, milestone.title)}
                      className="w-full h-12 gradient-green text-primary-foreground font-semibold rounded-xl shadow-md"
                    >
                      <Gift size={18} className="mr-2" />
                      {t('claimReward')}
                    </Button>
                  )}

                  {milestone.redeemed && milestone.promoCode && (
                    <div className="bg-fitquest-green/10 rounded-xl p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">{t('yourPromoCode')}</p>
                      <p className="font-mono font-bold text-lg text-fitquest-green">{milestone.promoCode}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Partner Offers */}
        <section>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Star className="text-primary" size={20} />
            {t('partnerOffers')}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {mockPartnerOffers.map((offer, idx) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-card rounded-2xl p-5 text-center shadow-sm border border-border hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="text-5xl mb-3">{offer.iconEmoji}</div>
                <h4 className="font-semibold text-sm mb-1">{offer.partnerName}</h4>
                <p className="text-primary text-sm font-medium">{offer.discountValue}</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                  <ExternalLink size={12} />
                  <span>{t('tapToView')}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CO2 Impact Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-6 text-primary-foreground">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center text-3xl">
                🌱
              </div>
              <div>
                <h3 className="font-bold text-xl">{t('environmentalImpact')}</h3>
                <p className="text-primary-foreground/70">
                  {t('youveSaved')} <span className="font-bold text-fitquest-gold">{userStats.co2Saved} kg</span> {t('ofCO2Emissions')}
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
