import { useLanguageStore } from '@/i18n/languageStore';
import { motion } from 'framer-motion';

interface LanguageToggleProps {
  compact?: boolean;
  className?: string;
}

export function LanguageToggle({ compact = false, className = '' }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguageStore();

  const enLabel = 'EN';
  const arLabel = compact ? 'AR' : 'العربية';

  return (
    <motion.div
      className={`flex gap-1 bg-secondary rounded-full ${compact ? 'p-0.5' : 'p-1'} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <button
        onClick={() => setLanguage('en')}
        aria-label="Switch to English"
        className={`px-3 ${compact ? 'py-1 text-xs' : 'py-2 text-sm'} rounded-full font-bold transition-all ${
          language === 'en'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {enLabel}
      </button>
      <button
        onClick={() => setLanguage('ar')}
        aria-label="Switch to Arabic"
        className={`px-3 ${compact ? 'py-1 text-xs' : 'py-2 text-sm'} rounded-full font-bold transition-all ${
          language === 'ar'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {arLabel}
      </button>
    </motion.div>
  );
}
