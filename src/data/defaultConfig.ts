import { GradingConfiguration } from '../types';

export const DEFAULT_GRADING_CONFIG: GradingConfiguration = {
  version: 'GRADFY-STD-2026.3',
  configName: 'Commercial Onion Standard (Indian Mandi / Export Grade Model)',
  lastUpdated: '2026-09-15',
  weights: {
    sizeUniformity: 25,
    defectRate: 30,
    sproutingRate: 20,
    skinCondition: 15,
    shapeCharacteristics: 10,
  },
  gradeThresholds: {
    gradeA_MinOQI: 82,
    gradeA_MaxDefectPct: 6,
    gradeB_MinOQI: 68,
    gradeB_MaxDefectPct: 18,
  },
  sizeDiameterMm: {
    undersizedMax: 40,
    optimumMin: 45,
    optimumMax: 75,
    oversizedMin: 85,
  },
  uncertaintyThreshold: 75, // Scores below 75% confidence are routed to Human Verification
  storageRiskMultipliers: {
    sproutingWeight: 1.8,
    mechanicalCutWeight: 1.4,
    moistureWeight: 2.0,
  },
};
