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
  
  return result;
}

export function englishToHinglish(text: string): string {
  if (!text) return '';
  
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
  };
  
  let result = text.toLowerCase();
  Object.entries(englishToHinglishMap).forEach(([english, hinglish]) => {
    const regex = new RegExp(`\\b${english}\\b`, 'g');
    result = result.replace(regex, hinglish);
  });
  
  return result;
}

export function translateToEnglish(text: string): string {
  if (!text) return '';
  
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
    'pita': 'father',
    'bhai': 'brother',
    'behen': 'sister',
    'aap': 'you',
    'main': 'I',
    'hum': 'we',
    'tum': 'you',
  };
  
  let result = text.toLowerCase();
  Object.entries(translationMap).forEach(([hinglish, english]) => {
    const regex = new RegExp(`\\b${hinglish}\\b`, 'g');
    result = result.replace(regex, english);
  });
  
  return result;
}