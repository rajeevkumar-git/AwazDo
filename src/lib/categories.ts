export interface Category {
  id: string;
  name_en: string;
  name_hi: string;
  icon: string;
  color: string;
  subcategories: {
    id: string;
    name_en: string;
    name_hi: string;
  }[];
}

export const categories: Category[] = [
  {
    id: 'roads',
    name_en: 'Roads & Footpaths',
    name_hi: 'सड़कें और फुटपाथ',
    icon: '🛣️',
    color: '#FF6B35', // Electric Orange
    subcategories: [
      { id: 'pothole', name_en: 'Pothole on Road', name_hi: 'सड़क पर गड्ढा' },
      { id: 'broken_divider', name_en: 'Broken Divider', name_hi: 'टूटा हुआ डिवाइडर' },
      { id: 'waterlogging_road', name_en: 'Road Waterlogging', name_hi: 'सड़क पर जलभराव' },
      { id: 'street_light_broken', name_en: 'Street Lights Not Working', name_hi: 'स्ट्रीट लाइट खराब होना' },
      { id: 'encroachment', name_en: 'Footpath Encroachment', name_hi: 'फुटपाथ पर अतिक्रमण' }
    ]
  },
  {
    id: 'water',
    name_en: 'Water Supply',
    name_hi: 'पानी की आपूर्ति',
    icon: '💧',
    color: '#0070F3', // Blue
    subcategories: [
      { id: 'no_water', name_en: 'No Water Supply', name_hi: 'पानी की आपूर्ति ठप' },
      { id: 'dirty_water', name_en: 'Contaminated / Dirty Water', name_hi: 'गंदा / दूषित पानी' },
      { id: 'pipe_leakage', name_en: 'Water Pipeline Leakage', name_hi: 'पानी के पाइप का रिसाव' },
      { id: 'low_pressure', name_en: 'Low Water Pressure', name_hi: 'पानी का कम दबाव' }
    ]
  },
  {
    id: 'sanitation',
    name_en: 'Sanitation & Waste',
    name_hi: 'सफाई और कचरा',
    icon: '🗑️',
    color: '#00C49F', // Green
    subcategories: [
      { id: 'garbage_dump', name_en: 'Garbage Dump Overflow', name_hi: 'कचरे के ढेर का फैलाव' },
      { id: 'sewage_overflow', name_en: 'Sewage Line Blockage/Overflow', name_hi: 'सीवर जाम / ओवरफ्लो' },
      { id: 'dead_animal', name_en: 'Dead Animal Removal', name_hi: 'मृत पशु हटाना' },
      { id: 'no_public_toilet', name_en: 'Public Toilet Maintenance', name_hi: 'सार्वजनिक शौचालय की सफाई' }
    ]
  },
  {
    id: 'electricity',
    name_en: 'Electricity',
    name_hi: 'बिजली',
    icon: '⚡',
    color: '#FFB800', // Yellow
    subcategories: [
      { id: 'power_cut', name_en: 'Frequent Power Outages', name_hi: 'अक्सर बिजली कटौती' },
      { id: 'hanging_wires', name_en: 'Dangerous Loose Hanging Wires', name_hi: 'खतरनाक लटके हुए तार' },
      { id: 'transformer_fault', name_en: 'Transformer Fault', name_hi: 'ट्रांसफार्मर में खराबी' },
      { id: 'wrong_billing', name_en: 'Electricity Billing Issue', name_hi: 'बिजली बिल में त्रुटि' }
    ]
  },
  {
    id: 'parks',
    name_en: 'Public Parks & Trees',
    name_hi: 'सार्वजनिक पार्क और पेड़',
    icon: '🌳',
    color: '#10B981', // Forest Green
    subcategories: [
      { id: 'park_maintenance', name_en: 'Unmaintained Park / Broken Swings', name_hi: 'पार्क का रखरखाव न होना / झूले टूटना' },
      { id: 'tree_falling', name_en: 'Fallen Tree Blocking Road', name_hi: 'गिरा हुआ पेड़ रास्ता रोके हुए' },
      { id: 'tree_trimming', name_en: 'Tree Trimming Required', name_hi: 'पेड़ों की छंटाई की आवश्यकता' }
    ]
  },
  {
    id: 'health',
    name_en: 'Public Health & Stray Animals',
    name_hi: 'जन स्वास्थ्य और आवारा पशु',
    icon: '🐕',
    color: '#EF4444', // Red
    subcategories: [
      { id: 'stray_dog_menace', name_en: 'Stray Dog / Monkey Menace', name_hi: 'आवारा कुत्तों / बंदरों का आतंक' },
      { id: 'mosquito_breeding', name_en: 'Fogging Required / Mosquito Breeding', name_hi: 'फॉगिंग की जरूरत / मच्छरों का प्रकोप' },
      { id: 'illegal_slaughterhouse', name_en: 'Illegal Meat Shops / Slaughterhouse', name_hi: 'अवैध मीट की दुकानें / बूचड़खाना' }
    ]
  },
  {
    id: 'corruption',
    name_en: 'Corruption & Fraud',
    name_hi: 'भ्रष्टाचार और धोखाधड़ी',
    icon: '⚠️',
    color: '#D97706', // Amber
    subcategories: [
      { id: 'bribe_demand', name_en: 'Bribe Demanded by Official', name_hi: 'अधिकारी द्वारा रिश्वत की मांग' },
      { id: 'substandard_work', name_en: 'Substandard Civic Work Quality', name_hi: 'घटिया निर्माण कार्य की गुणवत्ता' },
      { id: 'encroachment_govt_land', name_en: 'Encroachment of Government Land', name_hi: 'सरकारी जमीन पर कब्जा' }
    ]
  }
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}

export function getSubcategoryName(catId: string, subId: string, lang: 'en' | 'hi'): string {
  const cat = getCategoryById(catId);
  if (!cat) return subId;
  const sub = cat.subcategories.find(s => s.id === subId);
  return sub ? (lang === 'hi' ? sub.name_hi : sub.name_en) : subId;
}
