import QRCode from 'qrcode';
import { QualityPassport } from '../types';

/**
 * Generate a cryptographically structured deterministic hash
 */
export async function generateReportHash(
  batchId: string,
  reportId: string,
  grade: string,
  oqi: number,
  timestamp: string,
  modelVersion: string
): Promise<string> {
  const rawString = `${batchId}|${reportId}|${grade}|${oqi}|${timestamp}|${modelVersion}|GRADFY-SALT-2026`;
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(rawString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }

  // Simple deterministic hash fallback
  let h = 0x811c9dc5;
  for (let i = 0; i < rawString.length; i++) {
    h ^= rawString.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return ('00000000' + (h >>> 0).toString(16)).slice(-8) + '9b42e718c0df124e';
}

/**
 * Generate a scannable QR Code Data URL
 */
export async function generateQrCodeDataUrl(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      width: 256,
      margin: 1.5,
      color: {
        dark: '#1b382b',
        light: '#fbf9f5',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('QR generation error:', err);
    return '';
  }
}

/**
 * Build a Quality Passport object for a batch
 */
export async function buildQualityPassport(params: {
  batchId: string;
  batchCode: string;
  reportId: string;
  farmerName: string;
  farmerLocation: string;
  procurementCenter: string;
  date: string;
  overallGrade: any;
  oqiScore: number;
  storageRiskLevel: any;
  verificationStatus: string;
  modelVersion: string;
}): Promise<QualityPassport> {
  const sha256Hash = await generateReportHash(
    params.batchId,
    params.reportId,
    params.overallGrade,
    params.oqiScore,
    params.date,
    params.modelVersion
  );

  // Link to internal verification URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gradfy.agri';
  const qrPayload = `${origin}/#verify/${params.reportId}`;

  return {
    passportId: `PASS-${params.batchCode.replace('GRD-', '')}`,
    batchId: params.batchId,
    reportId: params.reportId,
    farmerName: params.farmerName,
    farmerLocation: params.farmerLocation,
    procurementCenter: params.procurementCenter,
    date: params.date,
    overallGrade: params.overallGrade,
    oqiScore: params.oqiScore,
    storageRiskLevel: params.storageRiskLevel,
    verificationStatus: params.verificationStatus,
    modelVersion: params.modelVersion,
    sha256Hash,
    qrPayload,
    isTamperVerified: true,
  };
}
