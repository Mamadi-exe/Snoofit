import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Zap, Star, Activity, MapPin, Trophy, ChevronRight, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/i18n/languageStore';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    titleKey: "welcome",
    subtitleKey: "turnDohaIntoPlayground",
    icon: Zap,
    color: "from-primary to-accent",
  },
  {
    titleKey: "walkAndEarnRewards",
    subtitleKey: "every10kmUnlocksVouchers",
    icon: Activity,
    color: "from-fitquest-teal to-fitquest-green",
  },
  {
    titleKey: "captureZones",
    subtitleKey: "visitLandmarksBonus",
    icon: MapPin,
    color: "from-fitquest-blue to-fitquest-purple",
  },
  {
    titleKey: "competeLeaderboards",
    subtitleKey: "seeHowYouRankQatar",
    icon: Trophy,
    color: "from-fitquest-gold to-primary",
  },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const { t } = useLanguageStore();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleRequestLocation();
    }
  };

  const handleRequestLocation = async () => {
    setRequestingLocation(true);
    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      onComplete();
    } catch (error) {
      // Allow continuing even without location for demo
      onComplete();
    }
  };

  const isLastSlide = currentSlide === slides.length - 1;
  const CurrentIcon = slides[currentSlide].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-snoonu-black via-primary/90 to-primary text-primary-foreground flex flex-col">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-fitquest-gold/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary/30 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1, delay: 0.2 }}
          className="mb-8"
        >
          <div className={`w-28 h-28 bg-gradient-to-br ${slides[currentSlide].color} rounded-3xl flex items-center justify-center shadow-glow relative`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <CurrentIcon size={56} className="text-primary-foreground" />
              </motion.div>
            </AnimatePresence>
            <Star size={24} className="text-fitquest-gold absolute -top-3 -right-3 animate-float" />
          </div>
        </motion.div>

        {/* Title */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-display tracking-wider mb-4">
              {currentSlide === 0 ? (
                <>
                  Snoo<span className="text-fitquest-gold">FIT</span>
                </>
              ) : (
                t(slides[currentSlide].titleKey as any).toUpperCase()
              )}
            </h1>
            <p className="text-xl text-primary-foreground/70 max-w-md mx-auto">
              {t(slides[currentSlide].subtitleKey as any)}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Feature Cards */}
        {currentSlide === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-4 w-full max-w-md mb-12"
          >
            {[
              { icon: Activity, text: t('trackDailySteps'), color: "bg-primary/20 text-primary-foreground" },
              { icon: MapPin, text: t('captureZonesAcrossDoha'), color: "bg-fitquest-teal/20 text-fitquest-teal" },
              { icon: Trophy, text: t('competeOnLeaderboard'), color: "bg-fitquest-gold/20 text-fitquest-gold" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="glass rounded-2xl p-5 flex items-center gap-4"
              >
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                  <item.icon size={24} />
                </div>
                <span className="text-lg font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Progress Dots */}
        <div className="flex gap-2 mb-8">
          {slides.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide 
                  ? 'w-8 bg-fitquest-gold' 
                  : 'w-2 bg-primary-foreground/30 hover:bg-primary-foreground/50'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 px-8 pb-12">
        <Button
          onClick={handleNext}
          disabled={requestingLocation}
          className="w-full h-14 gradient-gold text-secondary font-bold text-lg rounded-2xl shadow-glow hover:shadow-lg transition-all"
        >
          {requestingLocation ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Locate size={24} />
            </motion.div>
          ) : isLastSlide ? (
            <>
              {t('enableLocation')} <Locate size={20} className="ml-2" />
            </>
          ) : (
            <>
              {t('continue')} <ChevronRight size={20} className="ml-1" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-primary-foreground/50 mt-4">
          {t('agreeTermsPrivacy')}
        </p>
      </div>
    </div>
  );
}
