import { Medication } from '@/types/health';
import { ProfileMedication } from '@/types/profile';

/**
 * Synchronize medications between the health module and profile
 */
export function syncHealthMedicationToProfile(
  healthMedication: Medication,
  addToProfile: (med: Omit<ProfileMedication, 'id'>) => void,
  existingProfileMedications: ProfileMedication[]
) {
  // Check if this medication already exists in profile
  const existsInProfile = existingProfileMedications.some(
    profileMed => profileMed.name.toLowerCase() === healthMedication.name.toLowerCase()
  );
  
  if (!existsInProfile) {
    // Convert health medication to profile medication format
    const profileMedication: Omit<ProfileMedication, 'id'> = {
      name: healthMedication.name,
      time: '08:00', // Default time, user can change in settings
      frequency: convertHealthFrequencyToProfile(healthMedication.frequency),
      notes: healthMedication.notes
    };
    
    addToProfile(profileMedication);
  }
}

/**
 * Convert health frequency format to profile frequency format
 */
function convertHealthFrequencyToProfile(healthFreq: string): ProfileMedication['frequency'] {
  const freq = healthFreq.toLowerCase();
  
  if (freq.includes('2x') || freq.includes('twice') || freq.includes('deux fois')) {
    return 'twice-daily';
  } else if (freq.includes('semaine') || freq.includes('week')) {
    return 'weekly';
  } else if (freq.includes('besoin') || freq.includes('needed')) {
    return 'as-needed';
  } else {
    return 'daily'; // Default
  }
}

/**
 * Convert profile medication to health medication format
 */
export function convertProfileToHealthMedication(
  profileMed: ProfileMedication,
  icon: string = '💊',
  color: string = 'blue'
): Omit<Medication, 'id'> {
  let frequency = '';
  switch (profileMed.frequency) {
    case 'daily':
      frequency = '1x/jour';
      break;
    case 'twice-daily':
      frequency = '2x/jour';
      break;
    case 'weekly':
      frequency = '1x/semaine';
      break;
    case 'as-needed':
      frequency = 'Si besoin';
      break;
    default:
      frequency = '1x/jour';
  }
  
  let dosage = '';
  if (profileMed.quantity && profileMed.unit) {
    dosage = `${profileMed.quantity} ${profileMed.unit}`;
  } else {
    dosage = 'Dosage à définir';
  }
  
  return {
    name: profileMed.name,
    dosage,
    frequency,
    prescribedBy: 'Non spécifié',
    startDate: Date.now(),
    isActive: true,
    color,
    icon,
    notes: profileMed.notes
  };
}