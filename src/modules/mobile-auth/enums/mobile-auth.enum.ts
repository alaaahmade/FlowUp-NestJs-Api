export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum Interest {
  PILATES = 'pilates',
  BODYBUILDING = 'bodybuilding',
  YOGA = 'yoga',
  RUNNING = 'running',
  SWIMMING = 'swimming',
  CYCLING = 'cycling',
  HIIT = 'hiit',
  STRENGTH_TRAINING = 'strength_training',
}

// Helper function to get enum values and labels
export function getEnumOptions(enumObj: any) {
  return Object.keys(enumObj).map((key) => ({
    value: enumObj[key],
    label: key.toLowerCase().replace(/_/g, ' '),
  }));
}
