import { useCallback } from 'react';
import { useProfile } from './useProfile';
import { useHealth } from '@/modules/health/HealthContext';
import { syncHealthMedicationToProfile, convertProfileToHealthMedication } from '@/lib/medicationSync';
import { Medication } from '@/types/health';
import { ProfileMedication } from '@/types/profile';

/**
 * Hook to synchronize medications between health module and profile
 */
export function useMedicationSync() {
  const { profile, addMedication: addToProfile } = useProfile();
  const { medications: healthMedications, addMedication: addToHealth } = useHealth();
  
  // Sync health medication to profile
  const syncToProfile = useCallback((healthMedication: Medication) => {
    syncHealthMedicationToProfile(healthMedication, addToProfile, profile.medications);
  }, [addToProfile, profile.medications]);
  
  // Sync profile medication to health
  const syncToHealth = useCallback((profileMedication: ProfileMedication) => {
    // Check if this medication already exists in health
    const existsInHealth = healthMedications.some(
      healthMed => healthMed.name.toLowerCase() === profileMedication.name.toLowerCase()
    );
    
    if (!existsInHealth) {
      const healthMed = convertProfileToHealthMedication(profileMedication);
      addToHealth(healthMed);
    }
  }, [healthMedications, addToHealth]);
  
  // Sync all profile medications to health
  const syncAllProfileToHealth = useCallback(() => {
    profile.medications.forEach(syncToHealth);
  }, [profile.medications, syncToHealth]);
  
  // Sync all health medications to profile
  const syncAllHealthToProfile = useCallback(() => {
    healthMedications.forEach(syncToProfile);
  }, [healthMedications, syncToProfile]);
  
  return {
    syncToProfile,
    syncToHealth,
    syncAllProfileToHealth,
    syncAllHealthToProfile
  };
}