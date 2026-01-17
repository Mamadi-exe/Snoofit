import { create } from 'zustand';
import { UserStats, Zone, Milestone, Activity, ZoneCaptureState } from '@/types/fitquest';
import { defaultUserStats, mockZones, mockMilestones, mockActivities } from '@/data/mockData';

const ZONE_GRACE_PERIOD_MS = 30000; // 30 seconds outside zone before resetting
const STEP_THRESHOLDS = [2500, 5000, 7500, 10000]; // Step milestones
const PROGRESS_MILESTONES = [25, 50, 75, 100]; // Corresponding percentages

interface FitQuestState {
  // User state
  userStats: UserStats;
  userName: string;
  userId: string;
  
  // Zones
  zones: Zone[];
  
  // Milestones
  milestones: Milestone[];
  
  // Activities
  activities: Activity[];
  
  // UI state
  isCapturing: boolean;
  capturingZoneId: string | null;
  stepsInCurrentZone: number;
  isOutsideZone: boolean;
  outsideZoneSince: number | null; // Timestamp when user left zone
  
  // Actions
  updateUserStats: (stats: Partial<UserStats>) => void;
  startCapture: (zoneId: string) => void;
  cancelCapture: () => void;
  addStepsToZone: (zoneId: string, steps: number, isInsideZone: boolean) => void;
  setOutsideZone: (outside: boolean) => void;
  checkAndResetProgress: (zoneId: string) => void;
  attemptTitleTransfer: (zoneId: string, challengerId: string, challengerName: string, challengerSteps: number) => boolean;
  completeZoneCapture: (zoneId: string) => void;
  unlockMilestone: (milestoneId: string) => void;
  redeemMilestone: (milestoneId: string) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  checkAndUnlockMilestones: () => Milestone[];
}

export const useFitQuestStore = create<FitQuestState>((set, get) => ({
  // Initial state
  userStats: defaultUserStats,
  userName: 'Ahmed Al-Thani',
  userId: 'user_001',
  zones: mockZones.map(z => ({
    ...z,
    captureState: undefined,
    lastOwnerTransfer: undefined,
  })),
  milestones: mockMilestones.map(m => ({
    ...m,
    unlocked: defaultUserStats.totalDistance >= m.distance,
  })),
  activities: mockActivities,
  isCapturing: false,
  capturingZoneId: null,
  stepsInCurrentZone: 0,
  isOutsideZone: false,
  outsideZoneSince: null,
  
  // Actions
  updateUserStats: (stats) => set((state) => ({
    userStats: { ...state.userStats, ...stats },
  })),

  startCapture: (zoneId) => set((state) => {
    const zone = state.zones.find(z => z.id === zoneId);
    if (!zone) return state;

    // Initialize capture state if zone is not owned yet
    const captureState: ZoneCaptureState = zone.captureState || {
      ownerId: state.userId,
      ownerName: state.userName,
      stepsAccumulated: 0,
      captureStartTime: new Date(),
      progressPercentage: 0,
      isCompleted: false,
    };

    return {
      isCapturing: true,
      capturingZoneId: zoneId,
      stepsInCurrentZone: 0,
      isOutsideZone: false,
      outsideZoneSince: null,
      zones: state.zones.map(z =>
        z.id === zoneId ? { ...z, captureState } : z
      ),
    };
  }),

  cancelCapture: () => set({
    isCapturing: false,
    capturingZoneId: null,
    stepsInCurrentZone: 0,
    isOutsideZone: false,
    outsideZoneSince: null,
  }),

  addStepsToZone: (zoneId, steps, isInsideZone) => set((state) => {
    const zone = state.zones.find(z => z.id === zoneId);
    if (!zone || !state.isCapturing || !zone.captureState) return state;

    if (!isInsideZone) {
      // Update outside zone timestamp
      return {
        isOutsideZone: true,
        outsideZoneSince: state.outsideZoneSince || Date.now(),
      };
    }

    // Inside zone - accumulate steps
    const newSteps = zone.captureState.stepsAccumulated + steps;
    
    // Calculate progress level (0-100)
    const progressPercentage = Math.min((newSteps / 10000) * 100, 100);
    
    const updatedCaptureState: ZoneCaptureState = {
      ...zone.captureState,
      stepsAccumulated: newSteps,
      progressPercentage: Math.round(progressPercentage),
      isCompleted: progressPercentage >= 100,
    };

    get().addActivity({
      type: 'distance_sync',
      description: `Added ${steps} steps to ${zone.name} capture (${updatedCaptureState.stepsAccumulated}/10000)`,
      pointsEarned: 0,
      distanceKm: steps / 1000,
    });

    return {
      zones: state.zones.map(z =>
        z.id === zoneId ? { ...z, captureState: updatedCaptureState } : z
      ),
      stepsInCurrentZone: newSteps,
      isOutsideZone: false,
      outsideZoneSince: null,
    };
  }),

  setOutsideZone: (outside) => set((state) => {
    if (!outside) {
      return {
        isOutsideZone: false,
        outsideZoneSince: null,
      };
    }
    
    return {
      isOutsideZone: true,
      outsideZoneSince: state.outsideZoneSince || Date.now(),
    };
  }),

  checkAndResetProgress: (zoneId) => set((state) => {
    if (!state.outsideZoneSince) return state;

    const timeSinceLeft = Date.now() - state.outsideZoneSince;
    
    // If grace period exceeded, reset capture
    if (timeSinceLeft > ZONE_GRACE_PERIOD_MS) {
      return {
        isCapturing: false,
        capturingZoneId: null,
        stepsInCurrentZone: 0,
        isOutsideZone: false,
        outsideZoneSince: null,
        zones: state.zones.map(z =>
          z.id === zoneId && z.captureState
            ? { 
                ...z, 
                captureState: {
                  ...z.captureState,
                  stepsAccumulated: 0,
                  progressPercentage: 0,
                  isCompleted: false,
                }
              }
            : z
        ),
      };
    }

    return state;
  }),

  attemptTitleTransfer: (zoneId, challengerId, challengerName, challengerSteps) => {
    const state = get();
    const zone = state.zones.find(z => z.id === zoneId);
    
    if (!zone || !zone.captureState) return false;

    const currentOwnerSteps = zone.captureState.stepsAccumulated;
    const timeDiff = Date.now() - zone.captureState.captureStartTime.getTime();
    const timeWindow = 3600000; // 1 hour window for comparison

    // Compare: challenger must have more steps in same time window
    if (timeDiff <= timeWindow && challengerSteps > currentOwnerSteps) {
      const newCaptureState: ZoneCaptureState = {
        ownerId: challengerId,
        ownerName: challengerName,
        stepsAccumulated: challengerSteps,
        captureStartTime: new Date(),
        progressPercentage: Math.round((challengerSteps / 10000) * 100),
        isCompleted: challengerSteps >= 10000,
      };

      set((state) => ({
        zones: state.zones.map(z =>
          z.id === zoneId
            ? { 
                ...z, 
                captureState: newCaptureState,
                lastOwnerTransfer: new Date(),
              }
            : z
        ),
      }));

      get().addActivity({
        type: 'zone_capture',
        description: `${challengerName} outpaced ${zone.captureState.ownerName} and took control of ${zone.name}!`,
        pointsEarned: zone.points,
      });

      return true;
    }

    return false;
  },

  completeZoneCapture: (zoneId) => {
    const state = get();
    const zone = state.zones.find(z => z.id === zoneId);
    if (!zone || !zone.captureState) return;

    set((s) => ({
      zones: s.zones.map(z =>
        z.id === zoneId && z.captureState
          ? {
              ...z,
              captureState: {
                ...z.captureState,
                isCompleted: true,
                progressPercentage: 100,
              },
            }
          : z
      ),
      userStats: {
        ...s.userStats,
        totalPoints: s.userStats.totalPoints + zone.points,
        monthlyPoints: s.userStats.monthlyPoints + zone.points,
        zonesCaptured: s.userStats.zonesCaptured + 1,
      },
      isCapturing: false,
      capturingZoneId: null,
      stepsInCurrentZone: 0,
    }));

    get().addActivity({
      type: 'zone_capture',
      description: `Successfully captured ${zone.name}! +${zone.points} points`,
      pointsEarned: zone.points,
    });

    get().checkAndUnlockMilestones();
  },

  unlockMilestone: (milestoneId) => set((state) => ({
    milestones: state.milestones.map(m =>
      m.id === milestoneId ? { ...m, unlocked: true } : m
    ),
  })),

  redeemMilestone: (milestoneId) => set((state) => ({
    milestones: state.milestones.map(m =>
      m.id === milestoneId 
        ? { ...m, redeemed: true, promoCode: `FITQUEST${Math.random().toString(36).substring(2, 8).toUpperCase()}` } 
        : m
    ),
  })),

  addActivity: (activity) => set((state) => ({
    activities: [
      {
        ...activity,
        id: `a${Date.now()}`,
        createdAt: new Date(),
      },
      ...state.activities,
    ],
  })),

  checkAndUnlockMilestones: () => {
    const { userStats, milestones, unlockMilestone, addActivity } = get();
    const newlyUnlocked: Milestone[] = [];

    milestones.forEach(milestone => {
      if (!milestone.unlocked && userStats.totalDistance >= milestone.distance) {
        unlockMilestone(milestone.id);
        newlyUnlocked.push(milestone);
        addActivity({
          type: 'milestone_unlocked',
          description: `Unlocked ${milestone.title}`,
          pointsEarned: 0,
        });
      }
    });

    return newlyUnlocked;
  },
}));
