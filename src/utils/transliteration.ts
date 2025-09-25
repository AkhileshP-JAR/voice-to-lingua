// All transliteration and translation logic has been replaced with AI4Bharat APIs
// Use the useAI4BharatTranslation hook for Hindi → Hinglish → English conversion
// No local translation logic is needed anymore

export const translateToEnglish = (text: string): string => {
  // This function is kept for backward compatibility
  // but should not be used for new implementations
  // Use useAI4BharatTranslation.translateHindiToEnglish instead
  console.warn('translateToEnglish is deprecated. Use useAI4BharatTranslation hook instead.');
  return text;
};
