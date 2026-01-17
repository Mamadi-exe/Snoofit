// Zone capture state
export interface ZoneCaptureState {
  ownerId: string; // Current owner user ID
  ownerName: string; // Current owner name
  stepsAccumulated: number; // Total steps accumulated by owner
  captureStartTime: Date; // When owner started defending
  progressPercentage: number; // 0, 25, 50, 75, or 100
  isCompleted: boolean; // 100% captured
}

// Zone types
export interface Zone {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number;
  points: number;
  category: 'landmark' | 'cultural' | 'park' | 'mall' | 'partner';
  canCapture: boolean;
  cooldownEndsAt?: Date;
  imageUrl?: string;
  // Step-based capture system
  captureState?: ZoneCaptureState; // Current capture state
  lastOwnerTransfer?: Date; // When ownership last transferred
}

// Milestone types
export interface Milestone {
  id: string;
  distance: number;
  title: string;
  description: string;
  reward: string;
  rewardType: 'voucher' | 'discount' | 'physical';
  unlocked: boolean;
  redeemed: boolean;
  promoCode?: string;
  iconName: string;
  gradientClass: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  distance: number;
  avatar: string;
  isCurrentUser?: boolean;
}

// User stats
export interface UserStats {
  totalDistance: number;
  totalPoints: number;
  monthlyPoints: number;
  rank: number;
  zonesCaptured: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experiencePoints: number;
  co2Saved: number;
}

// User profile
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  stats: UserStats;
  createdAt: Date;
  lastActiveAt: Date;
}

// Activity log
export interface Activity {
  id: string;
  type: 'zone_capture' | 'distance_sync' | 'milestone_unlocked' | 'milestone_redeemed';
  description: string;
  pointsEarned: number;
  distanceKm?: number;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// Partner offer
export interface PartnerOffer {
  id: string;
  partnerName: string;
  offerTitle: string;
  offerDescription: string;
  discountValue: string;
  category: 'restaurant' | 'pharmacy' | 'gym' | 'retail';
  iconEmoji: string;
  isActive: boolean;
  deepLinkUrl?: string;
}

// Navigation
export type ScreenType = 'onboarding' | 'map' | 'leaderboard' | 'rewards' | 'profile';
