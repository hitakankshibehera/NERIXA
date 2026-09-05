// ============================================================
// NER-SHIELD AI — Global Data Store (React Context)
// Central state management for all app data
// ============================================================

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type {
  Road, Bridge, Vehicle, Shipment, Warehouse, Hospital,
  WeatherData, Incident, Alert, District, NERState,
  RiskPrediction, DashboardSummary, RiskWeights, DemoState,
  SimulationResult, RouteOption, RouteRequest,
  AuditLog, User, UserRole
} from '@/lib/types';
import {
  firebaseSignInEmail,
  firebaseSignUpEmail,
  firebaseSignInWithGoogle,
  firebaseSignOut,
  onFirebaseAuthStateChanged,
  saveUserProfileToDb,
  getUserProfileFromDb,
  pushIncidentToRealtimeDb,
  subscribeToRealtimeIncidents,
  pushAlertToRealtimeDb,
  subscribeToRealtimeAlerts,
  subscribeToDatabaseConnection,
} from '@/lib/firebase';
import {
  SEED_STATES, SEED_DISTRICTS, SEED_ROADS, SEED_BRIDGES,
  SEED_VEHICLES, SEED_SHIPMENTS, SEED_WEATHER, SEED_INCIDENTS,
  SEED_ALERTS, SEED_WAREHOUSES, SEED_HOSPITALS,
} from '@/data/seed';
import { predictAllRoadRisks, WeightedRiskModel, explainRisk } from '@/lib/ai/risk-engine';
import { calculateTotalImpact } from '@/lib/ai/supply-impact-engine';
import { optimizeRoutes, explainRouteChoice } from '@/lib/ai/route-optimizer';
import { runSimulation } from '@/lib/ai/simulation-engine';
import { DEFAULT_RISK_WEIGHTS, getRiskLevel } from '@/lib/constants';
import type { LiveWeatherReport } from '@/lib/weather/weatherService';
import type {
  RoadImageIntel,
  CCTVCamera,
  SatellitePass,
  FieldOfficerReport,
  ImageIntelligenceSummary,
  IncidentCategory,
  VerificationStatus,
} from '@/lib/types/imageIntelligence';
import {
  SEED_CCTV_CAMERAS,
  SEED_SATELLITE_PASSES,
  SEED_IMAGE_INTEL,
  INITIAL_IMAGE_INTEL_SUMMARY,
} from '@/data/seedImageIntelligence';
import {
  analyzeRoadImage,
  computeRoadRiskUpdate,
  calculateLogisticsImpact,
} from '@/lib/ai/visionEngine';
import {
  getOfflineReportsQueue,
  saveOfflineReport,
  clearOfflineQueue,
  getSimulatedOfflineState,
  setSimulatedOfflineState,
} from '@/lib/offline/offlineStorage';
import type {
  SatelliteObservation,
  SatelliteProduct,
  SatelliteAdminConfig,
  SatelliteIntelligenceSummary,
} from '@/lib/types/satelliteIntelligence';
import {
  SEED_SATELLITE_PRODUCTS,
  SEED_SATELLITE_OBSERVATIONS,
  INITIAL_SATELLITE_ADMIN_CONFIG,
  INITIAL_SATELLITE_SUMMARY,
} from '@/data/seedSatelliteIntelligence';
import { analyzeSatelliteObservationWithAI } from '@/lib/ai/satelliteEngine';

// ── Context Types ──
interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // Core Data
  states: NERState[];
  districts: District[];
  roads: Road[];
  bridges: Bridge[];
  vehicles: Vehicle[];
  shipments: Shipment[];
  warehouses: Warehouse[];
  hospitals: Hospital[];
  weatherData: WeatherData[];
  incidents: Incident[];
  alerts: Alert[];
  auditLogs: AuditLog[];
  riskPredictions: Map<string, RiskPrediction>;
  riskWeights: RiskWeights;

  // Dashboard
  dashboardSummary: DashboardSummary;

  // Demo
  demoState: DemoState;

  // Simulation
  simulationResults: SimulationResult[];
  latestSimulation: SimulationResult | null;

  // GPS Simulation
  gpsSimRunning: boolean;

  // Theme
  theme: 'dark' | 'light';

  // Language
  language: string;

  // Real-Time Weather Database
  liveWeatherReports: LiveWeatherReport[];
  weatherLastUpdated: string | null;
  weatherProvider: string;

  // Image Intelligence & Computer Vision
  imageIntelList: RoadImageIntel[];
  cctvCameras: CCTVCamera[];
  satellitePasses: SatellitePass[];
  offlineReportsQueue: FieldOfficerReport[];
  isOfflineMode: boolean;
  imageIntelSummary: ImageIntelligenceSummary;

  // Satellite AI Intelligence (Copernicus Sentinel-1 / Sentinel-2)
  satelliteObservations: SatelliteObservation[];
  satelliteProducts: SatelliteProduct[];
  satelliteAdminConfig: SatelliteAdminConfig;
  satelliteSummary: SatelliteIntelligenceSummary;
  selectedSatelliteObservation: SatelliteObservation | null;

  // Firebase Live Sync & Auth State
  firebaseConnected: boolean;
  authLoading: boolean;
  authError: string | null;
}

interface AppActions {
  // Auth
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (email: string, password: string, name: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearAuthError: () => void;

  // Risk
  recalculateRisks: () => void;
  explainRiskForRoad: (roadId: string) => string;
  updateRiskWeights: (weights: RiskWeights) => void;

  // Routes
  getOptimizedRoutes: (request: RouteRequest) => RouteOption[];

  // Simulation
  runWhatIfSimulation: (scenario: Parameters<typeof runSimulation>[0]) => SimulationResult;

  // Incidents
  reportIncident: (incident: Omit<Incident, 'id' | 'reportedAt' | 'status' | 'aiAnalysis'>) => Incident;

  // Alerts
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;

  // Roads
  updateRoadStatus: (roadId: string, status: Road['status']) => void;

  // GPS Simulation
  startGpsSimulation: () => void;
  pauseGpsSimulation: () => void;
  resetGpsSimulation: () => void;

  // Demo
  startDemo: () => void;
  pauseDemo: () => void;
  resetDemo: () => void;

  // Theme
  toggleTheme: () => void;

  // Language
  setLanguage: (lang: string) => void;

  // Weather Telemetry
  refreshLiveWeather: () => Promise<void>;

  // Audit
  addAuditLog: (action: string, module: string, oldValue?: string, newValue?: string) => void;

  // Refresh dashboard
  refreshDashboard: () => void;

  // Image Intelligence Actions
  submitFieldOfficerReport: (report: Omit<FieldOfficerReport, 'id' | 'timestamp' | 'offlineSyncStatus'>) => Promise<void>;
  verifyImageIntelDecision: (intelId: string, decision: 'VERIFY' | 'REJECT' | 'MARK_FALSE_POSITIVE' | 'ESCALATE' | 'UPDATE_ROAD_STATUS', notes?: string) => void;
  addCCTVCamera: (camera: Omit<CCTVCamera, 'id' | 'lastImageReceived' | 'lastUpdateTime'>) => void;
  updateCCTVCamera: (id: string, updates: Partial<CCTVCamera>) => void;
  deleteCCTVCamera: (id: string) => void;
  toggleOfflineSimulation: () => void;
  syncOfflineReports: () => Promise<void>;
  triggerHackathonImageScenario: () => Promise<void>;

  // Satellite AI Intelligence Actions
  searchSatelliteObservations: (criteria: { state?: string; district?: string; satellite?: string; maxCloud?: number; roadId?: string }) => Promise<SatelliteObservation[]>;
  analyzeSatelliteObservation: (observationId: string) => Promise<SatelliteObservation | null>;
  runSatelliteFloodScenario: () => Promise<void>;
  requestFieldVerificationForSatellite: (observationId: string) => void;
  updateSatelliteAdminConfig: (updates: Partial<SatelliteAdminConfig>) => void;
  selectSatelliteObservation: (obs: SatelliteObservation | null) => void;
}

type AppContextType = AppState & AppActions;

const AppContext = createContext<AppContextType | null>(null);

// ── Demo Users ──
const DEMO_USERS: User[] = [
  { id: 'u-1', email: 'admin@nershield.gov.in', name: 'Dr. Rajesh Kumar', role: 'SUPER_ADMIN', active: true, createdAt: '2026-01-01' },
  { id: 'u-2', email: 'state@nershield.gov.in', name: 'Anupam Sharma', role: 'STATE_ADMIN', stateId: 'assam', active: true, createdAt: '2026-01-15' },
  { id: 'u-3', email: 'officer@nershield.gov.in', name: 'Priya Gogoi', role: 'DISTRICT_OFFICER', stateId: 'assam', districtId: 'kamrup-metro', active: true, createdAt: '2026-02-01' },
  { id: 'u-4', email: 'field@nershield.gov.in', name: 'Bimal Das', role: 'FIELD_OFFICER', stateId: 'assam', districtId: 'nagaon', active: true, createdAt: '2026-02-15' },
  { id: 'u-5', email: 'logistics@nershield.gov.in', name: 'Meena Borah', role: 'LOGISTICS_OPERATOR', active: true, createdAt: '2026-03-01' },
  { id: 'u-6', email: 'viewer@nershield.gov.in', name: 'Guest User', role: 'VIEWER', active: true, createdAt: '2026-03-15' },
];

// ── Provider ──
export function AppProvider({ children }: { children: React.ReactNode }) {
  // ── State ──
  const [user, setUser] = useState<User | null>(null);
  const [roads, setRoads] = useState<Road[]>(SEED_ROADS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(SEED_VEHICLES);
  const [shipments, setShipments] = useState<Shipment[]>(SEED_SHIPMENTS);
  const [incidents, setIncidents] = useState<Incident[]>(SEED_INCIDENTS);
  const [alerts, setAlerts] = useState<Alert[]>(SEED_ALERTS);
  const [weatherData, setWeatherData] = useState<WeatherData[]>(SEED_WEATHER);
  const [liveWeatherReports, setLiveWeatherReports] = useState<LiveWeatherReport[]>([]);
  const [weatherLastUpdated, setWeatherLastUpdated] = useState<string | null>(null);
  const [weatherProvider, setWeatherProvider] = useState<string>('Stormglass.io (NOAA/ECMWF) + OpenWeather Sensor Array');
  const [riskWeights, setRiskWeights] = useState<RiskWeights>(DEFAULT_RISK_WEIGHTS);
  const [riskPredictions, setRiskPredictions] = useState<Map<string, RiskPrediction>>(new Map());
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [latestSimulation, setLatestSimulation] = useState<SimulationResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [gpsSimRunning, setGpsSimRunning] = useState(false);
  const [demoState, setDemoState] = useState<DemoState>({ isRunning: false, currentStep: 0, totalSteps: 10, isPaused: false });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguageState] = useState('en');

  // Image Intelligence & Computer Vision State
  const [imageIntelList, setImageIntelList] = useState<RoadImageIntel[]>(SEED_IMAGE_INTEL);
  const [cctvCameras, setCctvCameras] = useState<CCTVCamera[]>(SEED_CCTV_CAMERAS);
  const [satellitePasses, setSatellitePasses] = useState<SatellitePass[]>(SEED_SATELLITE_PASSES);
  const [offlineReportsQueue, setOfflineReportsQueue] = useState<FieldOfficerReport[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [imageIntelSummary, setImageIntelSummary] = useState<ImageIntelligenceSummary>(INITIAL_IMAGE_INTEL_SUMMARY);

  // Satellite AI Intelligence State (Copernicus CDSE Sentinel-1 / Sentinel-2)
  const [satelliteObservations, setSatelliteObservations] = useState<SatelliteObservation[]>(SEED_SATELLITE_OBSERVATIONS);
  const [satelliteProducts, setSatelliteProducts] = useState<SatelliteProduct[]>(SEED_SATELLITE_PRODUCTS);
  const [satelliteAdminConfig, setSatelliteAdminConfig] = useState<SatelliteAdminConfig>(INITIAL_SATELLITE_ADMIN_CONFIG);
  const [satelliteSummary, setSatelliteSummary] = useState<SatelliteIntelligenceSummary>(INITIAL_SATELLITE_SUMMARY);
  const [selectedSatelliteObservation, setSelectedSatelliteObservation] = useState<SatelliteObservation | null>(SEED_SATELLITE_OBSERVATIONS[0]);

  // Firebase Realtime DB & Auth State
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize Firebase listeners, offline queue and check Copernicus status on mount
  useEffect(() => {
    setOfflineReportsQueue(getOfflineReportsQueue());
    setIsOfflineMode(getSimulatedOfflineState());

    // Check backend Copernicus API status
    fetch('/api/satellite/status')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.configured === 'boolean') {
          setSatelliteAdminConfig(prev => ({
            ...prev,
            connected: data.connected ?? false,
            credentialsConfigured: data.configured ?? false,
            syncStatus: data.connected ? 'CONNECTED' : data.configured ? 'FAILED' : 'NOT_CONFIGURED',
            clientIdMasked: data.configured ? 'cdse-verified-key' : 'NOT_CONFIGURED',
          }));
        }
      })
      .catch(err => {
        console.warn('Could not query satellite status API:', err);
      });

    // 1. Firebase Auth State Listener
    const unsubAuth = onFirebaseAuthStateChanged(async (fbUser) => {
      if (fbUser) {
        try {
          const dbProfile = await getUserProfileFromDb(fbUser.uid);
          if (dbProfile) {
            setUser(dbProfile);
          } else {
            const newProfile: User = {
              id: fbUser.uid,
              email: fbUser.email || '',
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Authorized Responder',
              role: 'DISTRICT_OFFICER',
              active: true,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };
            setUser(newProfile);
            saveUserProfileToDb(newProfile).catch(() => {});
          }
        } catch (e) {
          console.warn('Could not restore Firebase profile:', e);
        }
      }
    });

    // 2. Firebase Realtime Database Connectivity Listener
    const unsubConn = subscribeToDatabaseConnection((connected) => {
      setFirebaseConnected(connected);
    });

    // 3. Realtime Incidents Synchronization from /incidents
    const unsubIncidents = subscribeToRealtimeIncidents((rtdbIncidents) => {
      if (rtdbIncidents && rtdbIncidents.length > 0) {
        setIncidents((prev) => {
          const map = new Map<string, Incident>();
          prev.forEach((inc) => map.set(inc.id, inc));
          rtdbIncidents.forEach((inc) => map.set(inc.id, inc));
          return Array.from(map.values());
        });
      }
    });

    // 4. Realtime Alerts Synchronization from /alerts
    const unsubAlerts = subscribeToRealtimeAlerts((rtdbAlerts) => {
      if (rtdbAlerts && rtdbAlerts.length > 0) {
        setAlerts((prev) => {
          const map = new Map<string, Alert>();
          prev.forEach((alt) => map.set(alt.id, alt));
          rtdbAlerts.forEach((alt) => map.set(alt.id, alt));
          return Array.from(map.values());
        });
      }
    });

    return () => {
      unsubAuth();
      unsubConn();
      unsubIncidents();
      unsubAlerts();
    };
  }, []);

  const gpsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch Live Weather Telemetry ──
  const refreshLiveWeather = useCallback(async () => {
    try {
      const res = await fetch('/api/weather');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.weatherData && json.reports) {
          setWeatherData(json.weatherData);
          setLiveWeatherReports(json.reports);
          setWeatherLastUpdated(json.timestamp);
          if (json.provider) setWeatherProvider(json.provider);
        }
      }
    } catch (err) {
      console.error('Failed to fetch live weather:', err);
    }
  }, []);

  useEffect(() => {
    refreshLiveWeather();
    // Auto-refresh weather every 5 minutes
    const timer = setInterval(refreshLiveWeather, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [refreshLiveWeather]);

  // ── Weather Map ──
  const weatherMap = React.useMemo(() => {
    const m = new Map<string, WeatherData>();
    weatherData.forEach(w => m.set(w.districtId, w));
    return m;
  }, [weatherData]);

  // ── Calculate Risks ──
  const recalculateRisks = useCallback(() => {
    const predictions = predictAllRoadRisks(roads, weatherMap, riskWeights);
    setRiskPredictions(predictions);
    
    // Update roads with predictions
    setRoads(prev => prev.map(road => ({
      ...road,
      currentRisk: predictions.get(road.id) || road.currentRisk,
    })));
  }, [roads, weatherMap, riskWeights]);

  // Initial risk calculation
  useEffect(() => {
    recalculateRisks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Dashboard Summary ──
  const dashboardSummary = React.useMemo<DashboardSummary>(() => {
    const criticalRoads = roads.filter(r => {
      const risk = riskPredictions.get(r.id)?.currentRisk ?? 0;
      return risk > 80 || r.status === 'BLOCKED' || r.status === 'CRITICAL';
    }).length;

    const highRiskCorridors = roads.filter(r => {
      const risk = riskPredictions.get(r.id)?.currentRisk ?? 0;
      return risk > 60;
    }).length;

    const activeVehicles = vehicles.filter(v => v.status !== 'DELIVERED').length;
    
    const atRiskShipments = shipments.filter(s => 
      s.status === 'AT_RISK' || s.status === 'DELAYED'
    ).length;

    const criticalAlerts = alerts.filter(a => 
      a.level === 'CRITICAL' && a.status === 'ACTIVE'
    ).length;

    const totalAccessibility = roads.reduce((sum, r) => {
      return sum + (riskPredictions.get(r.id)?.accessibilityScore ?? 70);
    }, 0);
    const nerConnectivity = Math.round(totalAccessibility / Math.max(roads.length, 1));

    const blockedRoads = roads.filter(r => r.status === 'BLOCKED').length;

    return {
      nerConnectivity,
      criticalRoads,
      highRiskCorridors,
      activeVehicles,
      atRiskShipments,
      criticalAlerts,
      totalRoads: roads.length,
      totalVehicles: vehicles.length,
      totalShipments: shipments.length,
      totalIncidents: incidents.length,
      blockedRoads,
    };
  }, [roads, vehicles, shipments, incidents, alerts, riskPredictions]);

  // ── Auth (Firebase + Demo Fast Login) ──
  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      // 1. Fast Demo Login check
      const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (pass === 'demo' && demoUser) {
        setUser({ ...demoUser, lastLogin: new Date().toISOString() });
        setAuthLoading(false);
        return true;
      }

      // 2. Firebase Authentication
      const fbUser = await firebaseSignInEmail(email, pass);
      const dbProfile = await getUserProfileFromDb(fbUser.uid);
      const activeUser: User = dbProfile || {
        id: fbUser.uid,
        email: fbUser.email || email,
        name: fbUser.displayName || email.split('@')[0],
        role: demoUser ? demoUser.role : 'DISTRICT_OFFICER',
        active: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      setUser(activeUser);
      saveUserProfileToDb(activeUser).catch(() => {});
      setAuthLoading(false);
      return true;
    } catch (err: any) {
      console.warn('Firebase login attempt fallback check:', err);
      // Fallback for rapid testing if demo account was chosen
      const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (demoUser) {
        setUser({ ...demoUser, lastLogin: new Date().toISOString() });
        setAuthLoading(false);
        return true;
      }
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found'
        ? 'Invalid email or password. Please verify credentials or create an account.'
        : err.code === 'auth/too-many-requests'
        ? 'Too many failed login attempts. Please try again in a few moments.'
        : err.message || 'Authentication error with Firebase.';
      setAuthError(msg);
      setAuthLoading(false);
      return false;
    }
  }, []);

  const register = useCallback(async (email: string, pass: string, name: string, role: string): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { userProfile } = await firebaseSignUpEmail(email, pass, name, (role as UserRole) || 'VIEWER');
      setUser(userProfile);
      setAuthLoading(false);
      return true;
    } catch (err: any) {
      console.warn('Firebase registration error:', err);
      const msg = err.code === 'auth/email-already-in-use'
        ? 'This email address is already registered. Please sign in instead.'
        : err.code === 'auth/weak-password'
        ? 'Password should be at least 6 characters long.'
        : err.code === 'auth/operation-not-allowed'
        ? 'Email/Password sign-in is not enabled in Firebase Console yet. Please toggle it under Firebase Console -> Authentication -> Sign-in method.'
        : err.message || 'Failed to create Firebase user account.';
      setAuthError(msg);
      setAuthLoading(false);
      return false;
    }
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { userProfile } = await firebaseSignInWithGoogle();
      setUser(userProfile);
      setAuthLoading(false);
      return true;
    } catch (err: any) {
      console.warn('Firebase Google Auth error:', err);
      const msg = err.code === 'auth/popup-closed-by-user'
        ? 'Google sign-in popup was closed before completing.'
        : err.code === 'auth/operation-not-allowed'
        ? 'Google provider is not enabled in Firebase Console. Please enable it under Authentication -> Sign-in method.'
        : err.message || 'Failed to sign in with Google.';
      setAuthError(msg);
      setAuthLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut();
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
    setUser(null);
  }, []);

  // ── Risk ──
  const explainRiskForRoad = useCallback((roadId: string) => {
    const pred = riskPredictions.get(roadId);
    if (!pred) return 'No risk prediction available for this road.';
    return explainRisk(pred);
  }, [riskPredictions]);

  const updateRiskWeights = useCallback((weights: RiskWeights) => {
    setRiskWeights(weights);
    addAuditLogInternal('Updated risk model weights', 'AI_CONFIG', JSON.stringify(riskWeights), JSON.stringify(weights));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskWeights]);

  // ── Routes ──
  const getOptimizedRoutes = useCallback((request: RouteRequest) => {
    return optimizeRoutes(request, roads, riskPredictions);
  }, [roads, riskPredictions]);

  // ── Simulation ──
  const runWhatIfSimulation = useCallback((scenario: Parameters<typeof runSimulation>[0]) => {
    const result = runSimulation(
      scenario, roads, vehicles, shipments, weatherMap, riskPredictions, user?.id ?? 'anonymous'
    );
    setSimulationResults(prev => [...prev, result]);
    setLatestSimulation(result);
    addAuditLogInternal('Ran what-if simulation', 'SIMULATION', '', JSON.stringify({ type: scenario.type, roadId: scenario.roadId }));
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roads, vehicles, shipments, weatherMap, riskPredictions, user]);

  // ── Incidents ──
  const reportIncident = useCallback((incidentData: Omit<Incident, 'id' | 'reportedAt' | 'status' | 'aiAnalysis'>) => {
    const id = `inc-${Date.now()}`;
    
    // AI Analysis
    const severityScore = incidentData.severity;
    const blockagePercent = incidentData.type === 'LANDSLIDE' ? severityScore * 9 :
                            incidentData.type === 'FLOOD' ? severityScore * 7 :
                            incidentData.type === 'ROAD_BLOCKED' ? 90 :
                            incidentData.type === 'BRIDGE_DAMAGE' ? severityScore * 10 :
                            severityScore * 5;

    const newIncident: Incident = {
      ...incidentData,
      id,
      reportedAt: new Date().toISOString(),
      status: 'REPORTED',
      aiAnalysis: {
        type: incidentData.type,
        severity: severityScore,
        roadBlockage: Math.min(blockagePercent, 100),
        confidence: 85 + Math.random() * 10,
        affectedVehicles: Math.floor(Math.random() * 15) + 3,
        affectedShipments: Math.floor(Math.random() * 10) + 2,
        estimatedClearTime: `${Math.floor(severityScore * 3)}-${Math.floor(severityScore * 5)} hours`,
        recommendations: [
          'Update road risk score',
          'Alert nearby vehicles',
          'Notify district authority',
          severityScore > 7 ? 'Consider road closure' : 'Monitor situation',
        ],
      },
    };

    setIncidents(prev => [newIncident, ...prev]);

    // Generate alert
    const alertLevel = severityScore > 8 ? 'CRITICAL' : severityScore > 6 ? 'HIGH' : severityScore > 4 ? 'MEDIUM' : 'LOW';
    const newAlert: Alert = {
      id: `al-${Date.now()}`,
      level: alertLevel,
      title: `${incidentData.type.replace(/_/g, ' ')} reported on ${incidentData.roadName || 'road'}`,
      message: incidentData.description,
      category: 'INCIDENT',
      roadId: incidentData.roadId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      aiRecommendation: `Severity ${severityScore}/10. ${blockagePercent}% road blockage estimated. Recommend immediate assessment.`,
    };
    setAlerts(prev => [newAlert, ...prev]);

    // Synchronize to Firebase Realtime Database (nerixa-2e6f6-default-rtdb)
    pushIncidentToRealtimeDb(newIncident).catch(err => {
      console.warn('Realtime Database incident sync warning:', err);
    });
    pushAlertToRealtimeDb(newAlert).catch(err => {
      console.warn('Realtime Database alert sync warning:', err);
    });

    addAuditLogInternal('Reported new incident', 'INCIDENTS', '', JSON.stringify({ id, type: incidentData.type }));

    return newIncident;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Alerts ──
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' as const, acknowledgedAt: new Date().toISOString(), acknowledgedBy: user?.name } : a
    ));
  }, [user]);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'RESOLVED' as const, resolvedAt: new Date().toISOString(), resolvedBy: user?.name } : a
    ));
  }, [user]);

  // ── Road Status ──
  const updateRoadStatus = useCallback((roadId: string, status: Road['status']) => {
    setRoads(prev => prev.map(r => {
      if (r.id === roadId) {
        addAuditLogInternal('Updated road status', 'ROADS', r.status, status);
        return { ...r, status, lastUpdated: new Date().toISOString() };
      }
      return r;
    }));
    // Trigger risk recalculation
    setTimeout(() => recalculateRisks(), 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recalculateRisks]);

  // ── GPS Simulation ──
  const startGpsSimulation = useCallback(() => {
    setGpsSimRunning(true);
    if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
    
    gpsIntervalRef.current = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status === 'DELIVERED' || v.status === 'IDLE') return v;
        if (!v.destination) return v;

        const dx = (v.destination.lng - v.currentLocation.lng) * 0.01;
        const dy = (v.destination.lat - v.currentLocation.lat) * 0.01;
        const newLat = v.currentLocation.lat + dy + (Math.random() - 0.5) * 0.002;
        const newLng = v.currentLocation.lng + dx + (Math.random() - 0.5) * 0.002;

        const distToTarget = Math.sqrt(
          (v.destination.lat - newLat) ** 2 + (v.destination.lng - newLng) ** 2
        );
        
        if (distToTarget < 0.05) {
          return { ...v, status: 'DELIVERED' as const, speed: 0, currentLocation: v.destination };
        }

        return {
          ...v,
          currentLocation: { lat: newLat, lng: newLng },
          speed: 30 + Math.random() * 40,
          lastUpdated: new Date().toISOString(),
        };
      }));
    }, 2000);
  }, []);

  const pauseGpsSimulation = useCallback(() => {
    setGpsSimRunning(false);
    if (gpsIntervalRef.current) {
      clearInterval(gpsIntervalRef.current);
      gpsIntervalRef.current = null;
    }
  }, []);

  const resetGpsSimulation = useCallback(() => {
    pauseGpsSimulation();
    setVehicles(SEED_VEHICLES);
  }, [pauseGpsSimulation]);

  // ── Demo Mode ──
  const startDemo = useCallback(() => {
    setDemoState({ isRunning: true, currentStep: 1, totalSteps: 10, isPaused: false, startedAt: new Date().toISOString() });
    
    // Reset to initial state
    setRoads(SEED_ROADS);
    setVehicles(SEED_VEHICLES);
    setShipments(SEED_SHIPMENTS);
    setIncidents(SEED_INCIDENTS);
    setAlerts(SEED_ALERTS);

    let step = 1;
    
    const runStep = () => {
      setDemoState(prev => ({ ...prev, currentStep: step }));

      switch (step) {
        case 1: // Medicine vehicle starts from Guwahati
          setVehicles(prev => prev.map(v => 
            v.id === 'v-1' ? { ...v, status: 'MOVING' as const, speed: 45 } : v
          ));
          break;
        case 2: // Heavy rainfall begins
          // Already in weather data
          break;
        case 3: // Road risk increases 28% → 84%
          setRoads(prev => prev.map(r => 
            r.id === 'nh-15' ? { ...r, condition: 'POOR' as const, trafficLevel: 'CONGESTED' as const } : r
          ));
          break;
        case 4: // 6 medicine shipments at risk
          setShipments(prev => prev.map(s => 
            s.commodity === 'MEDICINE' ? { ...s, status: 'AT_RISK' as const } : s
          ));
          break;
        case 5: // Route AI recommends Route B
          break;
        case 6: // Simulated landslide
          setIncidents(prev => [{
            id: 'inc-demo', type: 'LANDSLIDE', severity: 9,
            location: { lat: 27.3, lng: 92.3 }, roadId: 'nh-15', roadName: 'NH-15',
            districtId: 'west-kameng', stateId: 'arunachal',
            description: 'DEMO: Major landslide triggered by heavy rainfall on NH-15 near Bomdila',
            reportedBy: 'Demo System', reportedAt: new Date().toISOString(),
            status: 'VERIFIED',
            aiAnalysis: {
              type: 'LANDSLIDE', severity: 9.2, roadBlockage: 95, confidence: 94,
              affectedVehicles: 18, affectedShipments: 11,
              estimatedClearTime: '24-36 hours',
              recommendations: ['Close NH-15 immediately', 'Reroute all vehicles', 'Deploy emergency services']
            }
          }, ...prev]);
          break;
        case 7: // Road blocked
          setRoads(prev => prev.map(r => 
            r.id === 'nh-15' ? { ...r, status: 'BLOCKED' as const } : r
          ));
          break;
        case 8: // What-if impact
          setAlerts(prev => [{
            id: 'al-demo-1', level: 'CRITICAL', title: 'DEMO: NH-15 BLOCKED — 38 vehicles affected',
            message: '38 vehicles affected. 24 shipments delayed. 9 critical shipments at risk. Expected delay: 7.2 hours.',
            category: 'SIMULATION', roadId: 'nh-15', status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            aiRecommendation: 'Immediate action required: Reroute vehicles, prioritize 9 critical shipments, deploy warehouse reserves.'
          }, ...prev]);
          break;
        case 9: // AI action plan
          setAlerts(prev => [{
            id: 'al-demo-2', level: 'HIGH', title: 'DEMO: AI Action Plan Generated',
            message: '1. Reroute 18 vehicles via Route B\n2. Prioritize 9 critical medicine shipments\n3. Deploy 3 vehicles from Guwahati Warehouse\n4. Activate Emergency Corridor\n5. Alert all District Officers',
            category: 'AI_ACTION', status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            aiRecommendation: 'Execute all 5 action items. Estimated cost: ₹3.4 lakh additional.'
          }, ...prev]);
          break;
        case 10: // Dashboard updates
          recalculateRisks();
          break;
      }

      step++;
      if (step <= 10) {
        demoIntervalRef.current = setTimeout(runStep, 15000); // 15s per step, ~2.5min total
      } else {
        setDemoState(prev => ({ ...prev, isRunning: false }));
      }
    };

    runStep();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recalculateRisks]);

  const pauseDemo = useCallback(() => {
    setDemoState(prev => ({ ...prev, isPaused: true }));
    if (demoIntervalRef.current) {
      clearTimeout(demoIntervalRef.current);
    }
  }, []);

  const resetDemo = useCallback(() => {
    if (demoIntervalRef.current) clearTimeout(demoIntervalRef.current);
    setDemoState({ isRunning: false, currentStep: 0, totalSteps: 10, isPaused: false });
    setRoads(SEED_ROADS);
    setVehicles(SEED_VEHICLES);
    setShipments(SEED_SHIPMENTS);
    setIncidents(SEED_INCIDENTS);
    setAlerts(SEED_ALERTS);
    setTimeout(() => recalculateRisks(), 100);
  }, [recalculateRisks]);

  // ── Theme ──
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // ── Language ──
  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
  }, []);

  // ── Audit ──
  const addAuditLogInternal = (action: string, module: string, oldValue?: string, newValue?: string) => {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      userId: user?.id ?? 'system',
      userName: user?.name ?? 'System',
      action,
      module,
      timestamp: new Date().toISOString(),
      oldValue,
      newValue,
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const addAuditLog = useCallback((action: string, module: string, oldValue?: string, newValue?: string) => {
    addAuditLogInternal(action, module, oldValue, newValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Image Intelligence Actions ──
  const submitFieldOfficerReport = useCallback(async (reportData: Omit<FieldOfficerReport, 'id' | 'timestamp' | 'offlineSyncStatus'>) => {
    const reportId = `rep-${Date.now()}`;
    const timestamp = new Date().toISOString();

    if (isOfflineMode) {
      const offlineReport: FieldOfficerReport = {
        ...reportData,
        id: reportId,
        timestamp,
        offlineSyncStatus: 'PENDING_SYNC',
      };
      const updatedQueue = saveOfflineReport(offlineReport);
      setOfflineReportsQueue(updatedQueue);
      setImageIntelSummary(prev => ({
        ...prev,
        fieldReportsPendingSync: updatedQueue.length,
      }));
      addAuditLog(
        `Field Officer offline capture queued (${reportData.incidentType}) for ${reportData.roadNumber}`,
        'IMAGE_INTEL_OFFLINE'
      );
      return;
    }

    // Online execution: Analyze with AI Computer Vision
    const targetRoad = roads.find(r => r.id === reportData.roadId);
    const aiDetection = analyzeRoadImage({
      sourceType: 'FIELD_OFFICER',
      imageUrl: reportData.imageUrl,
      roadId: reportData.roadId,
      districtId: reportData.districtId,
      suggestedType: reportData.incidentType,
      userDescription: reportData.description,
      existingRisk: targetRoad?.currentRisk?.currentRisk,
    }, roads);

    const riskUpdate = computeRoadRiskUpdate(targetRoad, aiDetection);
    const logisticsImpact = calculateLogisticsImpact(reportData.roadId, aiDetection, vehicles, shipments);

    const newIntel: RoadImageIntel = {
      id: `intel-${Date.now()}`,
      title: `${aiDetection.incidentType.replace(/_/g, ' ')} detected by Field Officer on ${reportData.roadNumber}`,
      sourceType: 'FIELD_OFFICER',
      sourceId: reportData.officerId,
      sourceName: `${reportData.officerName} (Field Officer)`,
      imageUrl: reportData.imageUrl,
      beforeImageUrl: '/reality/normal_road_baseline.jpg',
      thumbnailUrl: reportData.imageUrl,
      timestamp,
      lat: reportData.lat,
      lng: reportData.lng,
      districtId: reportData.districtId,
      districtName: reportData.districtName,
      state: 'Assam',
      roadId: reportData.roadId,
      roadNumber: reportData.roadNumber,
      isDemo: false,
      aiDetection,
      riskUpdate,
      logisticsImpact,
      verification: {
        status: 'AI_DETECTED',
        auditTrail: [{
          id: `aud-${Date.now()}`,
          timestamp,
          userId: reportData.officerId,
          userName: reportData.officerName,
          userRole: 'FIELD_OFFICER',
          action: 'VERIFY',
          notes: `Field report uploaded. AI evaluated confidence at ${aiDetection.confidence}%.`,
          previousStatus: 'AI_DETECTED',
          newStatus: 'AI_DETECTED',
        }],
      },
      metadata: {
        resolution: '1920x1080',
        fileSize: reportData.fileSizeBytes ? `${(reportData.fileSizeBytes / 1024 / 1024).toFixed(1)} MB` : '3.2 MB',
      }
    };

    setImageIntelList(prev => [newIntel, ...prev]);

    // Apply risk update to the road
    if (targetRoad) {
      setRoads(prev => prev.map(r => r.id === reportData.roadId ? {
        ...r,
        status: riskUpdate.newAccessibility,
        currentRisk: {
          roadId: r.id,
          roadName: r.name,
          currentRisk: riskUpdate.newRisk,
          riskCategory: getRiskLevel(riskUpdate.newRisk),
          risk6h: Math.min(100, riskUpdate.newRisk + 4),
          risk12h: Math.min(100, riskUpdate.newRisk + 8),
          risk24h: Math.min(100, riskUpdate.newRisk + 12),
          accessibilityScore: Math.max(0, 100 - riskUpdate.newRisk),
          confidence: aiDetection.confidence,
          primaryFactors: [
            { name: 'AI Image Detection', weight: 0.45, value: riskUpdate.newRisk / 100, contribution: 45, description: riskUpdate.reason },
            { name: 'Terrain Saturation', weight: 0.30, value: 0.8, contribution: 30, description: 'Saturated mountain escarpment' },
            { name: 'Structural Integrity', weight: 0.25, value: 0.7, contribution: 25, description: 'Debris impediment on pavement' },
          ],
          calculatedAt: timestamp,
          modelVersion: 'NERIXA-CV-v2.4',
        }
      } : r));
    }

    // Auto-generate AI Alert if high or critical
    if (aiDetection.severity === 'CRITICAL' || aiDetection.severity === 'HIGH') {
      const newAlert: Alert = {
        id: `al-img-${Date.now()}`,
        level: aiDetection.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        title: `AI VISION ALERT: ${aiDetection.incidentType.replace(/_/g, ' ')} on ${reportData.roadNumber}`,
        message: `${riskUpdate.reason} — ${logisticsImpact.affectedVehiclesCount} vehicles affected, ${logisticsImpact.criticalMedicineDeliveries.length} critical medicine deliveries delayed (${logisticsImpact.estimatedDelayMinutes} mins delay).`,
        category: 'IMAGE_INTELLIGENCE',
        roadId: reportData.roadId,
        status: 'ACTIVE',
        createdAt: timestamp,
        aiRecommendation: `${aiDetection.recommendedAction} Alternate Corridor: ${logisticsImpact.alternativeRouteName}.`,
      };
      setAlerts(prev => [newAlert, ...prev]);
    }

    addAuditLog(
      `AI Computer Vision analyzed field image for ${reportData.roadNumber}: ${aiDetection.incidentType} (Risk ${riskUpdate.previousRisk} → ${riskUpdate.newRisk})`,
      'IMAGE_INTELLIGENCE'
    );

    setImageIntelSummary(prev => ({
      ...prev,
      imagesReceivedToday: prev.imagesReceivedToday + 1,
      aiIncidentsDetected: prev.aiIncidentsDetected + 1,
      criticalIncidents: aiDetection.severity === 'CRITICAL' ? prev.criticalIncidents + 1 : prev.criticalIncidents,
      highSeverityIncidents: aiDetection.severity === 'HIGH' ? prev.highSeverityIncidents + 1 : prev.highSeverityIncidents,
    }));
  }, [isOfflineMode, roads, vehicles, shipments, addAuditLog]);

  const syncOfflineReports = useCallback(async () => {
    const queue = getOfflineReportsQueue();
    if (queue.length === 0) return;

    for (const report of queue) {
      await submitFieldOfficerReport({
        officerId: report.officerId,
        officerName: report.officerName,
        districtId: report.districtId,
        districtName: report.districtName,
        roadId: report.roadId,
        roadNumber: report.roadNumber,
        lat: report.lat,
        lng: report.lng,
        incidentType: report.incidentType,
        description: report.description,
        imageUrl: report.imageUrl,
        fileSizeBytes: report.fileSizeBytes,
      });
    }

    clearOfflineQueue();
    setOfflineReportsQueue([]);
    setImageIntelSummary(prev => ({ ...prev, fieldReportsPendingSync: 0 }));
    addAuditLog(`Synchronized ${queue.length} offline field reports successfully`, 'OFFLINE_SYNC');
  }, [submitFieldOfficerReport, addAuditLog]);

  const verifyImageIntelDecision = useCallback((
    intelId: string,
    decision: 'VERIFY' | 'REJECT' | 'MARK_FALSE_POSITIVE' | 'ESCALATE' | 'UPDATE_ROAD_STATUS',
    notes: string = ''
  ) => {
    const timestamp = new Date().toISOString();
    const currentUserName = user?.name || 'Dr. Rajesh Kumar (Super Admin)';
    const currentUserRole = user?.role || 'SUPER_ADMIN';

    let nextStatus: VerificationStatus = 'OFFICER_VERIFIED';
    if (decision === 'REJECT' || decision === 'MARK_FALSE_POSITIVE') nextStatus = 'REJECTED';
    if (decision === 'ESCALATE') nextStatus = 'ESCALATED';
    if (decision === 'UPDATE_ROAD_STATUS' || decision === 'VERIFY') nextStatus = 'AUTHORITY_CONFIRMED';

    setImageIntelList(prev => prev.map(intel => {
      if (intel.id !== intelId) return intel;

      const newAuditItem = {
        id: `aud-${Date.now()}`,
        timestamp,
        userId: user?.id || 'u-1',
        userName: currentUserName,
        userRole: currentUserRole,
        action: decision,
        notes: notes || `Action ${decision} performed by ${currentUserRole}`,
        previousStatus: intel.verification.status,
        newStatus: nextStatus,
      };

      if (decision === 'UPDATE_ROAD_STATUS') {
        setRoads(rPrev => rPrev.map(r => r.id === intel.roadId ? {
          ...r,
          status: intel.aiDetection.accessibilityStatus === 'BLOCKED' ? 'BLOCKED' : 'PARTIALLY_BLOCKED'
        } : r));
      } else if (decision === 'REJECT' || decision === 'MARK_FALSE_POSITIVE') {
        setRoads(rPrev => rPrev.map(r => r.id === intel.roadId ? {
          ...r,
          status: 'OPEN'
        } : r));
      }

      return {
        ...intel,
        verification: {
          status: nextStatus,
          verifiedBy: currentUserName,
          verifiedAt: timestamp,
          notes: notes || intel.verification.notes,
          auditTrail: [newAuditItem, ...intel.verification.auditTrail],
        }
      };
    }));

    addAuditLog(`Human-in-the-Loop decision: ${decision} on Image Intel ${intelId}`, 'HUMAN_VERIFICATION');
  }, [user, addAuditLog]);

  const addCCTVCamera = useCallback((cam: Omit<CCTVCamera, 'id' | 'lastImageReceived' | 'lastUpdateTime'>) => {
    const newCam: CCTVCamera = {
      ...cam,
      id: `cctv-${Date.now()}`,
      lastImageReceived: 'Just registered',
      lastUpdateTime: new Date().toISOString(),
    };
    setCctvCameras(prev => [newCam, ...prev]);
    setImageIntelSummary(prev => ({
      ...prev,
      camerasTotal: prev.camerasTotal + 1,
      camerasOnline: prev.camerasOnline + 1,
    }));
    addAuditLog(`Added new CCTV camera: ${cam.name}`, 'CAMERA_MANAGEMENT');
  }, [addAuditLog]);

  const updateCCTVCamera = useCallback((id: string, updates: Partial<CCTVCamera>) => {
    setCctvCameras(prev => prev.map(c => c.id === id ? { ...c, ...updates, lastUpdateTime: new Date().toISOString() } : c));
    addAuditLog(`Updated CCTV camera ${id}`, 'CAMERA_MANAGEMENT');
  }, [addAuditLog]);

  const deleteCCTVCamera = useCallback((id: string) => {
    setCctvCameras(prev => prev.filter(c => c.id !== id));
    setImageIntelSummary(prev => ({
      ...prev,
      camerasTotal: Math.max(0, prev.camerasTotal - 1),
    }));
    addAuditLog(`Deleted CCTV camera ${id}`, 'CAMERA_MANAGEMENT');
  }, [addAuditLog]);

  const toggleOfflineSimulation = useCallback(() => {
    setIsOfflineMode(prev => {
      const next = !prev;
      setSimulatedOfflineState(next);
      return next;
    });
  }, []);

  // ── Hackathon Demo Scenario (Prompt #15) ──
  const triggerHackathonImageScenario = useCallback(async () => {
    // 1. Initial State: Medicine vehicle v-1 travelling on NH-15 with initial Risk 32
    setRoads(prev => prev.map(r => r.id === 'nh-15' ? {
      ...r,
      status: 'OPEN',
      currentRisk: {
        roadId: 'nh-15',
        roadName: r.name,
        currentRisk: 32,
        riskCategory: 'LOW',
        risk6h: 36,
        risk12h: 40,
        risk24h: 45,
        accessibilityScore: 78,
        confidence: 90,
        primaryFactors: [
          { name: 'Weather Index', weight: 0.35, value: 0.3, contribution: 35, description: 'Moderate overcast, clear carriageway' }
        ],
        calculatedAt: new Date().toISOString(),
        modelVersion: 'NERIXA-CV-v2.4',
      }
    } : r));

    // 2. Simulate delay of 1.2 seconds for dramatic effect, then fresh landslide image arrives
    await new Promise(r => setTimeout(r, 1200));

    // 3. AI Computer Vision detects Landslide with 94.6% confidence
    const simulatedIntel: RoadImageIntel = {
      id: `intel-demo-${Date.now()}`,
      title: 'CRITICAL: Landslide Detected by CAM-101 on NH-15 Bomdila Switchback',
      sourceType: 'CCTV_CAMERA',
      sourceId: 'cctv-1',
      sourceName: 'CAM-101: Bomdila Mountain Pass Switchback [DEMO DATA]',
      imageUrl: '/reality/landslide_aerial_reality.jpg',
      beforeImageUrl: '/reality/normal_road_baseline.jpg',
      thumbnailUrl: '/reality/landslide_aerial_reality.jpg',
      timestamp: new Date().toISOString(),
      lat: 27.2645,
      lng: 92.4215,
      districtId: 'west-kameng',
      districtName: 'West Kameng',
      state: 'Arunachal Pradesh',
      roadId: 'nh-15',
      roadNumber: 'NH-15',
      isDemo: true,
      aiDetection: {
        incidentType: 'LANDSLIDE',
        severity: 'CRITICAL',
        confidence: 94.6,
        description: 'Major landslide detected blocking approximately 70% of roadway. 14,500 m³ granite boulders and mud slurry burying dual carriageway. Stranded supply convoys detected at perimeter.',
        affectedRoad: 'NH-15 (Chainage km 142.4)',
        accessibilityStatus: 'BLOCKED',
        recommendedAction: 'Immediate road closure. BRO heavy machinery deployed. Reroute essential medical shipments via Balipara Bypass Corridor.',
        roadBlockagePercent: 70,
        debrisVolumeM3: 14500,
        detectedFeatures: ['Granite boulders >2m', 'Saturated mud slurry', 'Stranded oil tanker convoy', 'Severed roadside retention gabions'],
      },
      riskUpdate: {
        previousRisk: 32,
        newRisk: 86,
        reason: 'Road risk increased from 32 to 86 because AI Computer Vision detected a major landslide blocking approximately 70% of the roadway.',
        applied: true,
        timestamp: new Date().toISOString(),
        previousAccessibility: 'OPEN',
        newAccessibility: 'BLOCKED',
      },
      logisticsImpact: {
        affectedVehiclesCount: 14,
        affectedShipmentsCount: 9,
        criticalShipmentsCount: 4,
        criticalMedicineDeliveries: [
          'SH-102: Emergency Oxygen Cylinders for Tawang District Hospital',
          'SH-105: Cold-Chain Anti-Venom & Pediatric Vaccines for Bomdila Health Centre'
        ],
        estimatedDelayMinutes: 320, // 5h 20m
        supplyDisruptionRisk: 'HIGH',
        alternativeRouteAvailable: true,
        alternativeRouteName: 'Balipara-Bhalukpong-Charduar Mountain Bypass Loop',
        alternativeRouteDeltaKm: 42.6,
        affectedVehicleIds: ['v-1', 'v-2', 'v-3'],
        affectedShipmentIds: ['s-1', 's-2'],
      },
      verification: {
        status: 'AI_DETECTED',
        auditTrail: [{
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: 'sys-ai',
          userName: 'NERIXA AI Computer Vision Engine',
          userRole: 'SYSTEM',
          action: 'VERIFY',
          notes: 'Automated CV Detection: LANDSLIDE (Confidence 94.6%). Road risk escalated from 32 to 86.',
          previousStatus: 'AI_DETECTED',
          newStatus: 'AI_DETECTED',
        }]
      },
      metadata: {
        resolution: '3840x2160',
        altitudeAGL: '145m AGL',
        fileSize: '4.8 MB',
      }
    };

    // 4. Update state: road status -> BLOCKED, risk -> 86
    setImageIntelList(prev => [simulatedIntel, ...prev]);

    setRoads(prev => prev.map(r => r.id === 'nh-15' ? {
      ...r,
      status: 'BLOCKED',
      currentRisk: {
        roadId: 'nh-15',
        roadName: r.name,
        currentRisk: 86,
        riskCategory: 'CRITICAL',
        risk6h: 90,
        risk12h: 92,
        risk24h: 95,
        accessibilityScore: 14,
        confidence: 94.6,
        primaryFactors: [
          { name: 'AI Image Detection', weight: 0.50, value: 0.86, contribution: 50, description: 'Road risk increased from 32 to 86 because AI detected a major landslide blocking ~70% of roadway.' },
          { name: 'Monsoon Saturation', weight: 0.30, value: 0.85, contribution: 30, description: 'Heavy precipitation triggering slope collapse' },
          { name: 'Historical Vulnerability', weight: 0.20, value: 0.80, contribution: 20, description: 'High historical landslide frequency zone' }
        ],
        calculatedAt: new Date().toISOString(),
        modelVersion: 'NERIXA-CV-v2.4',
      }
    } : r));

    // 5. Generate critical AI alert
    const newAlert: Alert = {
      id: `al-demo-${Date.now()}`,
      level: 'CRITICAL',
      title: 'CRITICAL ALERT: AI Vision Detected Landslide on NH-15 (Risk 32 → 86)',
      message: 'Road risk increased from 32 to 86. Road is BLOCKED. 14 vehicles affected, 4 critical medicine deliveries at risk. Estimated delay: 5h 20m. Alternative route available via Balipara.',
      category: 'IMAGE_INTELLIGENCE',
      roadId: 'nh-15',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      aiRecommendation: 'Authority verification required: Approve emergency detour via Balipara-Bhalukpong-Charduar loop to safeguard oxygen and vaccine shipments.',
    };
    setAlerts(prev => [newAlert, ...prev]);

    addAuditLog(
      'Hackathon Demo Scenario: Landslide detected on NH-15, Risk increased 32 → 86, Road marked BLOCKED',
      'HACKATHON_DEMO'
    );
  }, [addAuditLog]);

  // ── Satellite AI Intelligence Actions ──
  const searchSatelliteObservations = useCallback(async (criteria: { state?: string; district?: string; satellite?: string; maxCloud?: number; roadId?: string }) => {
    try {
      const params = new URLSearchParams();
      if (criteria.state) params.set('state', criteria.state);
      if (criteria.district) params.set('district', criteria.district);
      if (criteria.satellite) params.set('satellite', criteria.satellite);
      if (criteria.maxCloud !== undefined) params.set('maxCloud', criteria.maxCloud.toString());
      if (criteria.roadId) params.set('roadId', criteria.roadId);

      const res = await fetch(`/api/satellite/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.observations)) {
          setSatelliteObservations(data.observations);
          return data.observations;
        }
      }
    } catch (e) {
      console.warn('Satellite search fetch error:', e);
    }
    return satelliteObservations;
  }, [satelliteObservations]);

  const analyzeSatelliteObservation = useCallback(async (observationId: string) => {
    const obs = satelliteObservations.find(o => o.id === observationId);
    if (!obs) return null;

    const analysis = analyzeSatelliteObservationWithAI(obs, roads, vehicles, shipments);

    // Update the observation in state
    const updatedObs: SatelliteObservation = {
      ...obs,
      detection: analysis.detection,
      roadImpact: analysis.roadImpact,
      status: 'PROCESSED',
    };

    setSatelliteObservations(prev => prev.map(o => o.id === observationId ? updatedObs : o));
    setSelectedSatelliteObservation(updatedObs);

    // If road impacted, update road risk and accessibility in riskPredictions & roads
    if (analysis.roadImpact) {
      const targetRoadId = analysis.roadImpact.roadId;
      setRoads(prev => prev.map(r => r.id === targetRoadId ? {
        ...r,
        status: analysis.roadImpact!.roadStatus,
        currentRisk: {
          roadId: targetRoadId,
          roadName: r.name,
          currentRisk: analysis.roadImpact!.updatedRisk,
          riskCategory: 'CRITICAL',
          risk6h: 88,
          risk12h: 90,
          risk24h: 92,
          accessibilityScore: analysis.roadImpact!.updatedAccessibility,
          confidence: analysis.detection.confidence,
          primaryFactors: [
            {
              name: 'Satellite SAR Flood Inundation',
              weight: 0.50,
              value: 0.84,
              contribution: 55,
              description: `Copernicus Sentinel-1 SAR analysis detected ${analysis.detection.areaKm2} km² flood zone intersecting highway corridor.`
            },
            {
              name: 'Hydrological Saturation',
              weight: 0.30,
              value: 0.80,
              contribution: 30,
              description: 'Embankment subgrade submerged under water.'
            },
            {
              name: 'Historical Flood Basin',
              weight: 0.20,
              value: 0.70,
              contribution: 15,
              description: 'Brahmaputra alluvial overflow zone'
            }
          ],
          calculatedAt: new Date().toISOString(),
          modelVersion: 'NERIXA-SAT-v2.1',
        }
      } : r));

      setRiskPredictions(prev => {
        const next = new Map(prev);
        next.set(targetRoadId, {
          roadId: targetRoadId,
          roadName: analysis.roadImpact!.roadName,
          currentRisk: analysis.roadImpact!.updatedRisk,
          riskCategory: 'CRITICAL',
          risk6h: 88,
          risk12h: 90,
          risk24h: 92,
          accessibilityScore: analysis.roadImpact!.updatedAccessibility,
          confidence: analysis.detection.confidence,
          primaryFactors: [
            {
              name: 'Satellite SAR Flood Inundation',
              weight: 0.50,
              value: 0.84,
              contribution: 55,
              description: `Copernicus Sentinel-1 SAR analysis detected ${analysis.detection.areaKm2} km² flood zone intersecting highway corridor.`
            },
            {
              name: 'Hydrological Saturation',
              weight: 0.30,
              value: 0.80,
              contribution: 30,
              description: 'Embankment subgrade submerged under water.'
            },
            {
              name: 'Historical Flood Basin',
              weight: 0.20,
              value: 0.70,
              contribution: 15,
              description: 'Brahmaputra alluvial overflow zone'
            }
          ],
          calculatedAt: new Date().toISOString(),
          modelVersion: 'NERIXA-SAT-v2.1',
        });
        return next;
      });
    }

    // If alert generated, add to active alerts
    if (analysis.generatedAlert) {
      const newAlert: Alert = {
        id: `al-sat-${Date.now()}`,
        ...analysis.generatedAlert,
        createdAt: new Date().toISOString(),
      };
      setAlerts(prev => [newAlert, ...prev]);
    }

    // Update summary counts
    setSatelliteSummary(prev => ({
      ...prev,
      floodDetections: prev.floodDetections + (analysis.detection.detectionType === 'POSSIBLE_FLOOD' ? 1 : 0),
      roadsAffected: Math.max(prev.roadsAffected, 2),
      criticalShipmentsAffected: Math.max(prev.criticalShipmentsAffected, 3),
    }));

    addAuditLog(
      `AI Satellite Analysis: ${obs.satellite} ${obs.sensor} observation processed for ${obs.districtName}. Detected: ${analysis.detection.detectionType} (${analysis.detection.severity}).`,
      'SATELLITE_INTELLIGENCE'
    );

    return updatedObs;
  }, [satelliteObservations, roads, vehicles, shipments, addAuditLog]);

  const runSatelliteFloodScenario = useCallback(async () => {
    // 1. Locate primary Sentinel-1 Sonitpur flood observation
    const sonitpurObs = satelliteObservations.find(o => o.id === 'sat-obs-sonitpur-01') || satelliteObservations[0];
    if (!sonitpurObs) return;

    // 2. Perform AI Satellite Analysis
    await analyzeSatelliteObservation(sonitpurObs.id);

    // 3. Mark affected vehicles as AT_RISK
    setVehicles(prev => prev.map(v => 
      ['TRK-AS-01', 'TRK-AS-09', 'TRK-AR-04'].includes(v.vehicleNumber) 
        ? { ...v, status: 'AT_RISK', risk: 84 }
        : v
    ));

    // 4. Mark affected shipments as AT_RISK / DELAYED
    setShipments(prev => prev.map(s => 
      s.commodity === 'MEDICINE' || s.destination.toLowerCase().includes('tawang')
        ? { ...s, status: 'AT_RISK' }
        : s
    ));

    addAuditLog(
      'Hackathon Satellite Flood Scenario: Sentinel-1 SAR flood detected on NH-15. Risk increased 34 → 84. Vehicles & critical medicine convoys rerouted via Route B bypass.',
      'SATELLITE_HACKATHON_DEMO'
    );
  }, [satelliteObservations, analyzeSatelliteObservation, addAuditLog]);

  const requestFieldVerificationForSatellite = useCallback((observationId: string) => {
    setSatelliteObservations(prev => prev.map(o => {
      if (o.id === observationId && o.detection) {
        return {
          ...o,
          detection: {
            ...o.detection,
            fieldVerificationStatus: 'DISPATCHED',
          }
        };
      }
      return o;
    }));

    addAuditLog(
      `Field Verification Dispatched: Satellite observation ${observationId} flagged for officer on-ground ground truth verification.`,
      'SATELLITE_INTELLIGENCE'
    );
  }, [addAuditLog]);

  const updateSatelliteAdminConfig = useCallback((updates: Partial<SatelliteAdminConfig>) => {
    setSatelliteAdminConfig(prev => ({ ...prev, ...updates }));
    addAuditLog('Satellite Admin Configuration updated.', 'SATELLITE_ADMIN');
  }, [addAuditLog]);

  const selectSatelliteObservation = useCallback((obs: SatelliteObservation | null) => {
    setSelectedSatelliteObservation(obs);
  }, []);

  const refreshDashboard = useCallback(() => {
    recalculateRisks();
  }, [recalculateRisks]);

  const value: AppContextType = {
    user, isAuthenticated: !!user,
    states: SEED_STATES, districts: SEED_DISTRICTS,
    roads, bridges: SEED_BRIDGES, vehicles, shipments,
    warehouses: SEED_WAREHOUSES, hospitals: SEED_HOSPITALS,
    weatherData, incidents, alerts, auditLogs,
    riskPredictions, riskWeights,
    dashboardSummary, demoState,
    simulationResults, latestSimulation,
    gpsSimRunning, theme, language,
    liveWeatherReports, weatherLastUpdated, weatherProvider,
    imageIntelList, cctvCameras, satellitePasses,
    offlineReportsQueue, isOfflineMode, imageIntelSummary,
    satelliteObservations, satelliteProducts, satelliteAdminConfig, satelliteSummary, selectedSatelliteObservation,
    firebaseConnected, authLoading, authError,
    login, loginWithGoogle, register, logout, clearAuthError,
    recalculateRisks, explainRiskForRoad, updateRiskWeights,
    getOptimizedRoutes, runWhatIfSimulation,
    reportIncident, acknowledgeAlert, resolveAlert,
    updateRoadStatus,
    startGpsSimulation, pauseGpsSimulation, resetGpsSimulation,
    startDemo, pauseDemo, resetDemo,
    toggleTheme, setLanguage,
    refreshLiveWeather,
    addAuditLog, refreshDashboard,
    submitFieldOfficerReport,
    verifyImageIntelDecision,
    addCCTVCamera, updateCCTVCamera, deleteCCTVCamera,
    toggleOfflineSimulation,
    syncOfflineReports,
    triggerHackathonImageScenario,
    searchSatelliteObservations,
    analyzeSatelliteObservation,
    runSatelliteFloodScenario,
    requestFieldVerificationForSatellite,
    updateSatelliteAdminConfig,
    selectSatelliteObservation,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
