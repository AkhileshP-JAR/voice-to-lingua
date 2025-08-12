// Simple transliteration utilities
// This is a basic implementation - in production, you'd use more sophisticated libraries

const hindiToHinglishMap: Record<string, string> = {
  // Basic vowels
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  
  // Consonants
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
  'ष': 'sh', 'स': 's', 'ह': 'h',
  
  // Vowel signs
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
  
  // Special characters
  '्': '', // halant (virama)
  'ं': 'n', // anusvara
  'ः': 'h', // visarga
};

const commonHindiWords: Record<string, string> = {
  'नमस्ते': 'namaste',
  'धन्यवाद': 'dhanyawad',
  'कैसे': 'kaise',
  'क्या': 'kya',
  'कहाँ': 'kahan',
  'कब': 'kab',
  'कौन': 'kaun',
  'क्यों': 'kyon',
  'हाँ': 'haan',
  'नहीं': 'nahin',
  'अच्छा': 'achha',
  'बुरा': 'bura',
  'बड़ा': 'bada',
  'छोटा': 'chota',
  'पानी': 'paani',
  'खाना': 'khaana',
  'घर': 'ghar',
  'स्कूल': 'school',
  'दोस्त': 'dost',
  'माता': 'mata',
  'पिता': 'pita',
  'भाई': 'bhai',
  'बहन': 'behen',
};

export function hindiToHinglish(text: string): string {
  if (!text) return '';
  
  console.log('Converting Hindi to Hinglish:', text);
  
  // First try to match common words
  let result = text;
  Object.entries(commonHindiWords).forEach(([hindi, hinglish]) => {
    const regex = new RegExp(hindi, 'g');
    result = result.replace(regex, hinglish);
  });
  
  // Then do character-by-character transliteration for remaining text
  result = result.split('').map(char => {
    return hindiToHinglishMap[char] || char;
  }).join('');
  
  // If no conversion happened and it's still in Devanagari, return the original
  // This handles cases where the speech recognition might return romanized Hindi
  if (result === text && /[\u0900-\u097F]/.test(text)) {
    console.log('No transliteration mapping found, keeping original');
  }
  
  console.log('Hindi to Hinglish result:', result);
  return result;
}

export function englishToHinglish(text: string): string {
  if (!text) return '';
  
  console.log('Converting English to Hinglish:', text);
  
  // Simple phonetic conversion for common English words
  const englishToHinglishMap: Record<string, string> = {
    'hello': 'hello',
    'hi': 'hi',
    'how are you': 'aap kaise hain',
    'thank you': 'dhanyawad',
    'good': 'achha',
    'bad': 'bura',
    'yes': 'haan',
    'no': 'nahin',
    'water': 'paani',
    'food': 'khaana',
    'house': 'ghar',
    'school': 'school',
    'friend': 'dost',
    'mother': 'mummy',
    'father': 'papa',
    'brother': 'bhai',
    'sister': 'didi',
    'what': 'kya',
    'where': 'kahan',
    'when': 'kab',
    'how': 'kaise',
    'why': 'kyon',
    'who': 'kaun',
    'i am': 'main hoon',
    'you are': 'aap hain',
    'this is': 'yeh hai',
    'that is': 'woh hai',
  };
  
  let result = text.toLowerCase();
  Object.entries(englishToHinglishMap).forEach(([english, hinglish]) => {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    result = result.replace(regex, hinglish);
  });
  
  // If no significant conversion happened, try to keep some English words mixed
  if (result.toLowerCase() === text.toLowerCase()) {
    // Add some Hinglish flavor to common English words
    result = result.replace(/\bthe\b/gi, '').replace(/\s+/g, ' ').trim();
  }
  
  console.log('English to Hinglish result:', result);
  return result;
}

export function translateToEnglish(text: string): string {
  if (!text) return '';
  
  console.log('Translating to English:', text);
  
  // Simple Hindi/Hinglish to English translation
  const translationMap: Record<string, string> = {
    'namaste': 'hello',
    'dhanyawad': 'thank you',
    'kaise': 'how',
    'kya': 'what',
    'kahan': 'where',
    'kab': 'when',
    'kaun': 'who',
    'kyon': 'why',
    'haan': 'yes',
    'nahin': 'no',
    'achha': 'good',
    'bura': 'bad',
    'bada': 'big',
    'chota': 'small',
    'paani': 'water',
    'khaana': 'food',
    'ghar': 'house',
    'school': 'school',
    'dost': 'friend',
    'mata': 'mother',
    'mummy': 'mother',
    'pita': 'father',
    'papa': 'father',
    'bhai': 'brother',
    'behen': 'sister',
    'didi': 'sister',
    'aap': 'you',
    'main': 'I',
    'hum': 'we',
    'tum': 'you',
    'yeh': 'this',
    'woh': 'that',
    'hai': 'is',
    'hoon': 'am',
    'hain': 'are',
    'hello': 'hello',
    'hi': 'hi',
  };
  
  let result = text.toLowerCase();
  Object.entries(translationMap).forEach(([hinglish, english]) => {
    const regex = new RegExp(`\\b${hinglish}\\b`, 'gi');
    result = result.replace(regex, english);
  });
  
  // Clean up extra spaces
  result = result.replace(/\s+/g, ' ').trim();
  
  console.log('Translation to English result:', result);
  return result;
}