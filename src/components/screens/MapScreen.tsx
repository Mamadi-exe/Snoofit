import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Target, Zap, Flame, Trophy, X, Check, AlertTriangle } from 'lucide-react';
import { useFitQuestStore } from '@/stores/fitquestStore';
import { useLanguageStore } from '@/i18n/languageStore';
import { Zone } from '@/types/fitquest';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/LanguageToggle';
import snoonuLogo from '@/assets/NIU.png';
import snooFit from '@/assets/SnooFit.png';

// Mapbox token - users should add their own
const MAPBOX_TOKEN = 'pk.eyJ1IjoiOTc0a3hrIiwiYSI6ImNtanNjMnJ6ZTRiMXIzY3F6OTh0YjlnczkifQ.wRlw67luRVvSt0ElJlnsyQ';

// Doha center coordinates
const DOHA_CENTER: [number, number] = [51.5310, 25.2854];

export function MapScreen() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const language = useLanguageStore((state) => state.language);
  const t = useLanguageStore((state) => state.t);
  const isRTL = useLanguageStore((state) => state.isRTL);
  
  const {
    userStats,
    zones,
    isCapturing,
    capturingZoneId,
    stepsInCurrentZone,
    isOutsideZone,
    startCapture,
    cancelCapture,
    addStepsToZone,
    setOutsideZone,
    checkAndResetProgress,
    attemptTitleTransfer,
    completeZoneCapture,
  } = useFitQuestStore();

  // Sync selectedZone with store whenever zones or capturingZoneId changes
  useEffect(() => {
    if (capturingZoneId) {
      const zoneFromStore = zones.find(z => z.id === capturingZoneId);
      if (zoneFromStore) {
        setSelectedZone(zoneFromStore);
      }
    }
  }, [capturingZoneId, zones]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: DOHA_CENTER,
        zoom: 12,
        pitch: 45,
        bearing: -17.6,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );

      map.current.on('load', () => {
        setMapLoaded(true);
        
        // Add 3D buildings
        map.current?.addLayer({
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 12,
          paint: {
            'fill-extrusion-color': '#1a1a2e',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.6,
          },
        });

        // Add atmosphere
        map.current?.setFog({
          color: 'hsl(230, 30%, 8%)',
          'high-color': 'hsl(230, 40%, 15%)',
          'horizon-blend': 0.2,
        });
      });
    } catch (error) {
      console.log('Mapbox initialization skipped - add your token');
      setMapLoaded(true);
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add zone markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    zones.forEach(zone => {
      const el = document.createElement('div');
      el.className = 'zone-marker';
      
      const isCompleted = zone.captureState?.isCompleted;
      const hasCapture = zone.captureState && zone.captureState.stepsAccumulated > 0;
      const progressPercent = zone.captureState?.progressPercentage || 0;

      el.innerHTML = `
        <div class="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all transform hover:scale-110 relative ${
          isCompleted 
            ? 'bg-green-500 shadow-lg' 
            : hasCapture 
              ? 'bg-gradient-to-br from-orange-500 to-yellow-500 shadow-glow animate-pulse' 
              : zone.canCapture 
                ? 'bg-fitquest-blue shadow-glow' 
                : 'bg-gray-500'
        }">
          <span class="text-white text-lg font-bold">${isCompleted ? '✓' : progressPercent ? progressPercent / 25 : '📍'}</span>
          ${hasCapture && !isCompleted ? `<div class="absolute inset-0 rounded-full border-2 border-white" style="border-top-color: transparent; transform: rotate(${(progressPercent % 25) * 3.6}deg);"></div>` : ''}
        </div>
      `;

      el.addEventListener('click', () => {
        if (zone.canCapture) {
          setSelectedZone(zone);
        }
      });

      try {
        const marker = new mapboxgl.Marker(el)
          .setLngLat([zone.longitude, zone.latitude])
          .addTo(map.current!);

        markersRef.current.push(marker);
      } catch (error) {
        // Silently fail if map not ready
      }
    });
  }, [zones, mapLoaded]);

  // Handle step-based capture
  useEffect(() => {
    if (!isCapturing || !capturingZoneId) return;

    const zone = zones.find(z => z.id === capturingZoneId);
    if (!zone || !zone.captureState) return;

    // Simulate step tracking every second
    const stepInterval = setInterval(() => {
      // Simulate random steps (5-15 steps per second)
      const stepsToAdd = Math.floor(Math.random() * 10) + 5;
      addStepsToZone(capturingZoneId, stepsToAdd, !isOutsideZone);
    }, 1000);

    return () => clearInterval(stepInterval);
  }, [isCapturing, capturingZoneId, isOutsideZone, addStepsToZone, zones]);

  // Check completion
  useEffect(() => {
    if (!isCapturing || !capturingZoneId) return;

    const zone = zones.find(z => z.id === capturingZoneId);
    if (zone?.captureState?.isCompleted) {
      completeZoneCapture(capturingZoneId);
    }
  }, [zones, capturingZoneId, isCapturing, completeZoneCapture]);

  // Check if user remains outside zone beyond grace period
  useEffect(() => {
    if (!isOutsideZone || !capturingZoneId) return;

    const resetInterval = setInterval(() => {
      checkAndResetProgress(capturingZoneId);
    }, 5000); // Check every 5 seconds

    return () => clearInterval(resetInterval);
  }, [isOutsideZone, capturingZoneId, checkAndResetProgress]);

  // Simulate geolocation check
  useEffect(() => {
    if (!isCapturing || !capturingZoneId) return;

    const geoInterval = setInterval(() => {
      // 10% chance to detect leaving zone every 5 seconds
      const leftZone = Math.random() > 0.92;
      setOutsideZone(leftZone);
    }, 5000);

    return () => clearInterval(geoInterval);
  }, [isCapturing, capturingZoneId, setOutsideZone]);

  const handleStartCapture = useCallback((zone: Zone) => {
    startCapture(zone.id);
  }, [startCapture]);

  const handleCancelCapture = useCallback(() => {
    cancelCapture();
  }, [cancelCapture]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'landmark': return 'bg-fitquest-blue';
      case 'cultural': return 'bg-fitquest-purple';
      case 'park': return 'bg-fitquest-green';
      case 'mall': return 'bg-fitquest-pink';
      case 'partner': return 'bg-fitquest-orange';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="h-screen bg-background relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* <img src={snoonuLogo} alt="SnooFIT" className="h-12 w-12 object-contain" /> */}
            <div>
              {/* <h2 className="text-2xl font-display tracking-wider">{t('snoonuFitquest')}</h2> */}
              <img src={snooFit} alt="SnooFIT" className="h-10 w-20 object-contain" />
              <p className="text-sm text-primary-foreground/70">
                {userStats.zonesCaptured} {t('zonesCaptured')}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="text-right">
              <div className="text-3xl font-bold">{userStats.totalPoints.toLocaleString()}</div>
              <p className="text-xs text-primary-foreground/70">{t('points')}</p>
            </div>
            {/* Compact language toggle integrated into the banner (smaller on mobile) */}
            <LanguageToggle compact className="ml-2" />
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Map Fallback */}
      {!map.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-fitquest-dark to-secondary">
          <div className="text-center text-primary-foreground/70">
            <MapPin size={64} className="mx-auto mb-4 text-fitquest-blue" />
            <p className="text-lg mb-2">{t('mapPreview')}</p>
            <p className="text-sm">{t('addMapboxToken')}</p>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-24 left-4 right-4 z-20"
      >
        <div className="bg-card rounded-2xl p-4 shadow-lg flex justify-around">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{userStats.totalDistance}km</div>
            <div className="text-xs text-muted-foreground">{t('distance')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
              {userStats.currentStreak}
              <Flame size={20} />
            </div>
            <div className="text-xs text-muted-foreground">{t('dayStreak')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-fitquest-purple flex items-center justify-center gap-1">
              #{userStats.rank}
              <Trophy size={18} />
            </div>
            <div className="text-xs text-muted-foreground">{t('rank')}</div>
          </div>
        </div>
      </motion.div>

      {/* Zone Selection Modal */}
      <AnimatePresence>
        {selectedZone && !isCapturing && (
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            className="absolute bottom-24 left-4 right-4 z-30"
          >
            <div className="bg-card rounded-3xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${getCategoryColor(selectedZone.category)} rounded-xl flex items-center justify-center`}>
                    <MapPin className="text-primary-foreground" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedZone.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{selectedZone.category}</p>
                    {selectedZone.captureState && (
                      <p className="text-xs text-fitquest-blue font-semibold">
                        {selectedZone.captureState.isCompleted 
                          ? `Held by ${selectedZone.captureState.ownerName}` 
                          : `${selectedZone.captureState.progressPercentage}% captured`}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedZone(null)} className="text-muted-foreground">
                  <X size={24} />
                </button>
              </div>
              
              <p className="text-muted-foreground mb-4">{selectedZone.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="text-fitquest-gold" size={20} />
                  <span className="font-bold text-fitquest-gold">+{selectedZone.points} {t('points')}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <Target size={16} className="inline mr-1" />
                  {selectedZone.radius}m {t('radius')}
                </div>
              </div>

              <Button
                onClick={() => handleStartCapture(selectedZone)}
                className="w-full h-14 gradient-primary text-primary-foreground font-bold text-lg rounded-2xl shadow-glow"
              >
                {selectedZone.captureState?.isCompleted ? t('challengeAndDefend') : t('startCapture')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capture Progress Modal */}
      <AnimatePresence>
        {isCapturing && selectedZone && selectedZone.captureState && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="bg-card rounded-3xl p-8 shadow-lg mx-4 max-w-sm w-full text-center">
              {isOutsideZone && (
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-500"
                >
                  <AlertTriangle size={20} />
                  <span className="font-bold text-sm">{t('youLeftZone')}</span>
                </motion.div>
              )}

              <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center shadow-glow relative overflow-hidden">
                <div className="absolute inset-0 rounded-full bg-primary/20"></div>
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <div className="text-center z-10">
                  <div className="text-sm text-primary-foreground/70">{t('progress')}</div>
                  <div className="text-4xl font-bold text-primary-foreground">{selectedZone.captureState.progressPercentage}%</div>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-2">{t('capturing')} {selectedZone.name}</h3>
              <p className="text-muted-foreground mb-6">{t('keepWalking')}</p>

              {/* Progress breakdown */}
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between px-2">
                  <span>{t('steps25')}</span>
                  <span className={selectedZone.captureState.progressPercentage >= 25 ? 'text-fitquest-green font-bold' : 'text-muted-foreground'}>
                    {selectedZone.captureState.progressPercentage >= 25 ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex justify-between px-2">
                  <span>{t('steps50')}</span>
                  <span className={selectedZone.captureState.progressPercentage >= 50 ? 'text-fitquest-green font-bold' : 'text-muted-foreground'}>
                    {selectedZone.captureState.progressPercentage >= 50 ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex justify-between px-2">
                  <span>{t('steps75')}</span>
                  <span className={selectedZone.captureState.progressPercentage >= 75 ? 'text-fitquest-green font-bold' : 'text-muted-foreground'}>
                    {selectedZone.captureState.progressPercentage >= 75 ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex justify-between px-2">
                  <span>{t('steps100')}</span>
                  <span className={selectedZone.captureState.progressPercentage >= 100 ? 'text-fitquest-green font-bold' : 'text-muted-foreground'}>
                    {selectedZone.captureState.progressPercentage >= 100 ? '✓' : '○'}
                  </span>
                </div>
              </div>

              {/* Compact language toggle placed under the steps for quick access */}
              <div className="flex justify-center mt-3">
                <LanguageToggle compact />
              </div>

              <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
                <motion.div
                  className="h-full gradient-primary rounded-full"
                  animate={{ width: `${selectedZone.captureState.progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-fitquest-gold font-bold mb-4">
                <Zap size={24} />
                <span className="text-2xl">+{selectedZone.points} {t('points')}</span>
              </div>

              <div className="text-sm text-muted-foreground mb-6 space-y-1">
                <div>
                  <span className="font-bold text-fitquest-blue">{stepsInCurrentZone}</span> {t('stepsAccumulated')}
                </div>
                {selectedZone.captureState.isCompleted && (
                  <div className="text-fitquest-green font-bold">
                    {t('zoneCaptured')}
                  </div>
                )}
              </div>

              <Button
                onClick={handleCancelCapture}
                variant="outline"
                className="w-full h-12 rounded-xl"
              >
                {t('exit')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
