export type UserRole = 'farmer' | 'buyer' | 'inspector' | 'admin';

export type GradeClassification = 'Grade A' | 'Grade B' | 'Grade C' | 'Reject';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type StorageRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ImageQualityCheck {
  status: 'pass' | 'warning' | 'fail';
  blurScore: number; // 0-100 (higher is sharper)
  lightingScore: number; // 0-100 (ideal is 60-85)
  framingScore: number; // 0-100
  detectedOnionsCount: number;
  overlapIndex: number; // 0-100
  issues: string[];
  guidance: string[];
}

export interface BatchImage {
  id: string;
  angle: 'front' | 'side' | 'base' | 'overview';
  label: string;
  url: string;
  timestamp: string;
  qualityCheck: ImageQualityCheck;
}

export interface DetectedOnion {
  id: string;
  box: { x: number; y: number; width: number; height: number }; // percentage coords (0-100)
  diameterMm: number;
  estimatedWeightGrams: number;
  grade: GradeClassification;
  defects: string[];
  confidence: number; // 0-100
  skinColor: 'Copper-Red' | 'Deep Red' | 'Golden Brown' | 'Pale Yellow';
}

export interface DetectedDefect {
  type: 'Sprouting' | 'Mechanical Cut' | 'Peel Detachment' | 'Doubles / Deformity' | 'Neck Rot / Mold' | 'Under-sized (<40mm)' | 'Over-sized (>85mm)';
  count: number;
  percentage: number;
  severity: 'Low' | 'Moderate' | 'Severe';
  impactOnGrade: string;
}

export interface OqiFactorBreakdown {
  score: number; // 0-100
  weight: number; // percentage
  observation: string;
  benchmark: string;
}

export interface OqiBreakdown {
  sizeUniformity: OqiFactorBreakdown;
  defectRate: OqiFactorBreakdown;
  sproutingRate: OqiFactorBreakdown;
  skinCondition: OqiFactorBreakdown;
  shapeCharacteristics: OqiFactorBreakdown;
}

export interface StorageRiskAssessment {
  level: StorageRiskLevel;
  riskScore: number; // 0-100 (higher means higher risk)
  factors: string[];
  recommendation: string;
  disclaimer: string;
}

export interface GradingExplanation {
  summary: string;
  primaryGrade: GradeClassification;
  gradeConfidence: number;
  positiveObservations: string[];
  penalizingObservations: string[];
  ruleReference: string;
  distinction: {
    aiObservation: string;
    configuredRule: string;
    humanVerificationNeeded: boolean;
  };
}

export interface AnalysisResult {
  id: string;
  batchId: string;
  timestamp: string;
  model: {
    name: string;
    version: string;
    inferenceProvider: 'local-cv-engine' | 'gemini-vision' | 'simulated-calibrated';
    isOfflineInference: boolean;
  };
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0-100
  overallGrade: GradeClassification;
  gradeDistribution: {
    gradeA: number; // percentage
    gradeB: number;
    gradeC: number;
    reject: number;
  };
  oqiScore: number; // 0-100
  oqiBreakdown: OqiBreakdown;
  detectedOnions: DetectedOnion[];
  detectedDefects: DetectedDefect[];
  storageRisk: StorageRiskAssessment;
  explainability: GradingExplanation;
  isSampleBasedEstimate: boolean;
  sampleSizeAnalyzed: number;
  totalBatchEstimatedUnits: number;
  flaggedForHumanReview: boolean;
  flagReason?: string;
}

export interface HumanVerification {
  verifiedBy: string;
  role: string;
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'MODIFIED';
  originalGrade: GradeClassification;
  finalGrade: GradeClassification;
  originalOqi: number;
  finalOqi: number;
  inspectorNotes: string;
  correctionReason?: string;
  feedbackDatasetIncluded: boolean;
}

export interface LotSegregation {
  lotId: string;
  parentBatchId: string;
  name: string;
  grade: GradeClassification;
  targetDestination: string;
  percentageOfBatch: number;
  estimatedKg: number;
  userPricePerKg?: number;
  estimatedValue?: number;
  createdAt: string;
  qrHash: string;
  status: 'Ready' | 'Dispatched' | 'Allocated';
}

export interface QualityPassport {
  passportId: string;
  batchId: string;
  reportId: string;
  farmerName: string;
  farmerLocation: string;
  procurementCenter: string;
  date: string;
  overallGrade: GradeClassification;
  oqiScore: number;
  storageRiskLevel: StorageRiskLevel;
  verificationStatus: string;
  modelVersion: string;
  sha256Hash: string;
  qrPayload: string;
  isTamperVerified: boolean;
}

export interface SamplingPlan {
  enabled: boolean;
  totalCrates: number;
  sampledCratesCount: number;
  sampleWeightKg: number;
  standardReference: string; // e.g. "Codex / ISO 2859 Sampling Plan"
}

export interface Batch {
  id: string;
  batchCode: string;
  name: string;
  farmerName: string;
  farmerPhone: string;
  location: string;
  variety: string;
  harvestDate: string;
  arrivalDate: string;
  quantityKg: number;
  crateCount: number;
  samplingPlan: SamplingPlan;
  status: 'Draft' | 'Images Captured' | 'Analysis Complete' | 'Under Review' | 'Verified' | 'Lot Segregated';
  createdAt: string;
  updatedAt: string;
  images: BatchImage[];
  analysisResult?: AnalysisResult;
  humanVerification?: HumanVerification;
  lots?: LotSegregation[];
  qualityPassport?: QualityPassport;
  syncStatus: 'synced' | 'pending_sync' | 'sync_error';
  isDemoData: boolean;
  operatorNotes?: string;
}

export interface GradingConfiguration {
  version: string;
  configName: string;
  lastUpdated: string;
  weights: {
    sizeUniformity: number; // 25
    defectRate: number; // 30
    sproutingRate: number; // 20
    skinCondition: number; // 15
    shapeCharacteristics: number; // 10
  };
  gradeThresholds: {
    gradeA_MinOQI: number; // 82
    gradeA_MaxDefectPct: number; // 6
    gradeB_MinOQI: number; // 68
    gradeB_MaxDefectPct: number; // 18
  };
  sizeDiameterMm: {
    undersizedMax: number; // 40
    optimumMin: number; // 45
    optimumMax: number; // 75
    oversizedMin: number; // 85
  };
  uncertaintyThreshold: number; // below 75% confidence triggers Human Verification
  storageRiskMultipliers: {
    sproutingWeight: number;
    mechanicalCutWeight: number;
    moistureWeight: number;
  };
}

export interface SyncQueueItem {
  id: string;
  batchId: string;
  action: 'create_batch' | 'update_analysis' | 'human_verify' | 'create_lots' | 'update_config';
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error?: string;
  payload: any;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'batch_ready' | 'low_confidence' | 'sync_completed' | 'sync_failed' | 'report_generated' | 'verification_completed';
  timestamp: string;
  read: boolean;
  batchId?: string;
  reportId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  batchId?: string;
}

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  organization: string;
  location: string;
  avatarInitials: string;
}

export interface SystemStatus {
  online: boolean;
  localDbActive: boolean;
  syncQueueCount: number;
  lastSyncTime: string | null;
  modelVersion: string;
  backendConnected: boolean;
  geminiVisionAvailable: boolean;
  storageUsageMb: number;
  indexedDbRecordsCount: number;
}

