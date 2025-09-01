// Export de tous les composants d'export pour faciliter les imports
export { ExportModal } from './ExportModal';
export { ShareWithDoctorButton } from './ShareWithDoctorButton';
export { QRCodeModal } from './QRCodeModal';

// Export des services
export { ExportService } from '../../lib/export/ExportService';
export { DataProcessor } from '../../lib/export/DataProcessor';
export { PDFGenerator } from '../../lib/export/PDFGenerator';
export { ShareService } from '../../lib/export/ShareService';

// Export des types
export type {
  ExportPeriod,
  ExportOptions,
  ExportSection,
  MedicalExportData,
  ExportProgress
} from '../../lib/export/types';

export {
  EXPORT_PERIODS,
  DEFAULT_EXPORT_SECTIONS
} from '../../lib/export/types';