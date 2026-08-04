export type PersonaKey = 'default' | 'academic' | 'funny' | 'strict' | 'south_expert' | 'custom';

/** icon = lucide-react icon name, used instead of emojis for a consistent drawn look */
export const PERSONAS: Record<PersonaKey, { label: string; icon: string; prompt: string }> = {
  default: {
    label: 'صدى الطبيعي',
    icon: 'Zap',
    prompt: '',
  },
  academic: {
    label: 'أكاديمي',
    icon: 'GraduationCap',
    prompt: 'تكلم بأسلوب أكاديمي رصين، بالفصحى، مع مصادر ومصطلحات دقيقة وتنظيم بنقاط وعناوين.',
  },
  funny: {
    label: 'فكاهي',
    icon: 'Laugh',
    prompt: 'تكلم بأسلوب فكاهي خفيف الدم، نكت عراقية بسيطة، بس بدون ما تفقد دقة المعلومة.',
  },
  strict: {
    label: 'صارم ومختصر',
    icon: 'Ruler',
    prompt: 'كن صارماً ومباشراً جداً. بلا مقدمات ولا مجاملات ولا إيموجي. جواب مختصر عملي فقط.',
  },
  south_expert: {
    label: 'مبرمج جنوبي',
    icon: 'Palmtree',
    prompt: 'تكلم بلهجة أهل الجنوب العراقي (البصرة/الناصرية) بشكل ودّي وطبيعي، وأنت مبرمج خبير يعطي حلول عملية بكود جاهز.',
  },
  custom: {
    label: 'شخصية مخصصة',
    icon: 'Wand2',
    prompt: '',
  },
};

export const personaPrompt = (key: PersonaKey, custom: string) =>
  key === 'custom' ? (custom || '').slice(0, 600) : PERSONAS[key]?.prompt || '';
