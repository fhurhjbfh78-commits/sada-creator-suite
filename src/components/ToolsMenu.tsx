import { X, Code2, Bug, Zap, FileCode2, Database, Braces, FolderTree, TestTube2, FileText, Languages, RefreshCw, SpellCheck, Lightbulb, Mail, ListChecks, GraduationCap, GitCompare, FileType, Globe, Network, Wifi, ScrollText, Search, Link2, TrendingUp, Cloud, DollarSign, Calendar, UserCircle, Trophy, ChefHat, Smile, BookOpen, Quote, Calculator, Image as ImageIcon } from 'lucide-react';

export type Tool = {
  id: string;
  label: string;
  icon: any;
  prompt: string;
};

export const TOOL_CATEGORIES: { title: string; tools: Tool[] }[] = [
  {
    title: '🛠️ أدوات المطور',
    tools: [
      { id: 'img2code', label: 'صورة → كود', icon: ImageIcon, prompt: 'حوّل الصورة المرفقة إلى كود HTML/CSS كامل جاهز للتشغيل (ارفع صورة التصميم بعد الضغط).' },
      { id: 'explain', label: 'شرح كود', icon: Code2, prompt: 'اشرح لي هذا الكود سطراً سطراً بالعربية:\n\n```\n// الصق الكود هنا\n```' },
      { id: 'debug', label: 'كشف أخطاء', icon: Bug, prompt: 'افحص هذا السكربت واكتشف الأخطاء وصححها مع سبب كل خطأ:\n\n```\n// الصق السكربت\n```' },
      { id: 'perf', label: 'تحسين أداء', icon: Zap, prompt: 'حسّن أداء هذا الكود (تعقيد زمني، caching، أفضل الممارسات):\n\n```\n// الكود\n```' },
      { id: 'docs', label: 'كتابة توثيق', icon: FileCode2, prompt: 'اكتب توثيق README احترافي كامل لهذا المشروع (بالإنجليزية والعربية):\n\nوصف المشروع: ' },
      { id: 'json2sql', label: 'JSON → SQL', icon: Braces, prompt: 'حوّل هذا الـ JSON إلى استعلامات SQL كاملة (CREATE TABLE + INSERT):\n\n```json\n{}\n```' },
      { id: 'sql', label: 'استعلام SQL', icon: Database, prompt: 'اكتب لي استعلام SQL معقد يقوم بـ: ' },
      { id: 'pystruct', label: 'هيكل بايثون', icon: FolderTree, prompt: 'صمم هيكلية مشروع Python احترافي (شجرة المجلدات + محتوى كل ملف) للفكرة: ' },
      { id: 'tests', label: 'Unit Tests', icon: TestTube2, prompt: 'اكتب Unit Tests شاملة (pytest/jest حسب اللغة) لهذا الكود:\n\n```\n// الكود\n```' },
    ],
  },
  {
    title: '📚 محتوى وذكاء',
    tools: [
      { id: 'summarize', label: 'تلخيص ملف', icon: FileText, prompt: 'لخّص لي الملف المرفق في نقاط أساسية.' },
      { id: 'translate', label: 'ترجمة', icon: Languages, prompt: 'ترجم النص التالي ترجمة احترافية (حدد اللغة الهدف):\n\nمن: عربي → إلى: إنجليزي\n\nالنص: ' },
      { id: 'rephrase', label: 'إعادة صياغة', icon: RefreshCw, prompt: 'أعد صياغة هذا النص بأسلوب أكثر احترافية:\n\n' },
      { id: 'spellcheck', label: 'تدقيق لغوي', icon: SpellCheck, prompt: 'دقّق النص التالي إملائياً ونحوياً (عربي/إنجليزي):\n\n' },
      { id: 'brainstorm', label: 'عصف ذهني', icon: Lightbulb, prompt: 'أعطني 10 أفكار إبداعية حول: ' },
      { id: 'email', label: 'بريد رسمي', icon: Mail, prompt: 'اكتب بريداً إلكترونياً رسمياً للموضوع التالي:\n\nالمرسل إليه: \nالموضوع: \nالتفاصيل: ' },
      { id: 'tasks', label: 'جدول مهام', icon: ListChecks, prompt: 'نظّم لي جدول مهام اليوم/الأسبوع (Markdown table). المهام:\n\n' },
      { id: 'simplify', label: 'تبسيط علمي', icon: GraduationCap, prompt: 'بسّط لي هذا المفهوم العلمي بأسلوب سهل مع أمثلة:\n\n' },
      { id: 'compare', label: 'مقارنة', icon: GitCompare, prompt: 'قارن بين X و Y في جدول مفصّل (المميزات، العيوب، الاستخدام). العنصران:\n\n' },
      { id: 'convert', label: 'تحويل صيغ', icon: FileType, prompt: 'اشرح لي كيفية تحويل ملف DOCX إلى PDF (أو أي تحويل تريده) خطوة بخطوة:\n\nمن صيغة: \nإلى صيغة: ' },
    ],
  },
  {
    title: '🌐 شبكات ومواقع',
    tools: [
      { id: 'ip', label: 'تحليل IP', icon: Globe, prompt: 'حلّل لي بيانات هذا الـ IP (النوع، الفئة، معلومات محتملة):\n\nIP: ' },
      { id: 'dns', label: 'سجلات DNS', icon: Network, prompt: 'اشرح لي سجلات DNS المتوقعة لهذا النطاق ووظيفة كل نوع (A, AAAA, MX, TXT, CNAME):\n\nالنطاق: ' },
      { id: 'ping', label: 'شرح Ping', icon: Wifi, prompt: 'اشرح لي كيفية قياس اتصال السيرفر (Ping/traceroute) وتفسير النتائج للنطاق: ' },
      { id: 'whois', label: 'Whois', icon: ScrollText, prompt: 'اشرح لي حقول Whois وما يعنيه كل حقل (registrar, creation, expiry, NS) لنطاق: ' },
      { id: 'meta', label: 'وسوم Meta', icon: Search, prompt: 'حلّل وسوم Meta الأساسية لموقعي واقترح تحسينات SEO:\n\n<title>: \n<meta description>: \nURL: ' },
      { id: 'shorten', label: 'اختصار روابط', icon: Link2, prompt: 'اشرح لي أفضل خدمات اختصار الروابط (bit.ly, is.gd) وكيف أستخدمها. الرابط: ' },
      { id: 'seo', label: 'تحليل SEO', icon: TrendingUp, prompt: 'حلّل SEO كامل لهذه الصفحة (H1, headings, alt, canonical, schema, speed):\n\nURL: ' },
    ],
  },
  {
    title: '✨ أدوات عامة وذكية',
    tools: [
      { id: 'weather', label: 'الطقس', icon: Cloud, prompt: 'أعطني حالة الطقس المتوقعة (متوسطات موسمية) لمدينة: ' },
      { id: 'currency', label: 'تحويل عملات', icon: DollarSign, prompt: 'حوّل لي (بأسعار تقريبية):\n\nمن: USD\nإلى: IQD\nالمبلغ: ' },
      { id: 'events', label: 'تقويم أحداث', icon: Calendar, prompt: 'أعطني أهم الأحداث العالمية والأعياد في شهر: ' },
      { id: 'people', label: 'شخصيات', icon: UserCircle, prompt: 'أعطني سيرة موجزة عن الشخصية: ' },
      { id: 'sports', label: 'رياضة', icon: Trophy, prompt: 'أعطني معلومات عن المباراة/البطولة: ' },
      { id: 'recipes', label: 'وصفات طبخ', icon: ChefHat, prompt: 'اقترح لي وصفة طبخ بالمكونات المتوفرة:\n\nالمكونات: ' },
      { id: 'jokes', label: 'نكت', icon: Smile, prompt: 'أعطني 5 نكت عراقية مضحكة الآن.' },
      { id: 'story', label: 'قصة', icon: BookOpen, prompt: 'اكتب لي قصة قصيرة (النوع الأدبي والفكرة):\n\nالنوع: \nالفكرة: ' },
      { id: 'quote', label: 'اقتباس', icon: Quote, prompt: 'أعطني اقتباساً ملهماً لهذا اليوم بالعربية مع شرحه.' },
      { id: 'calc', label: 'حاسبة متقدمة', icon: Calculator, prompt: 'احسب لي (اعرض الخطوات):\n\n' },
    ],
  },
];

type Props = {
  onSelect: (prompt: string) => void;
  onClose: () => void;
};

const ToolsMenu = ({ onSelect, onClose }: Props) => {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-background/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[80dvh] overflow-y-auto glass-card rounded-t-3xl border-t-2 border-primary/40 p-4 space-y-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-xl -mx-4 px-4 py-2 border-b border-border/30 z-10">
          <h2 className="text-base font-bold text-primary">🧰 صندوق الأدوات (36 ميزة)</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary/50 active:scale-90">
            <X className="w-4 h-4" />
          </button>
        </div>

        {TOOL_CATEGORIES.map((cat) => (
          <div key={cat.title} className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground px-1">{cat.title}</h3>
            <div className="grid grid-cols-3 gap-2">
              {cat.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => { onSelect(tool.prompt); onClose(); }}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-secondary/40 hover:bg-primary/20 active:scale-95 transition-all border border-border/30"
                  >
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-[10px] text-center leading-tight">{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <p className="text-[10px] text-center text-muted-foreground pt-2 pb-safe">
          اختر أي أداة → يتعبأ نص جاهز في مربع الرسالة، عدّل حسب حاجتك واضغط إرسال.
        </p>
      </div>
    </div>
  );
};

export default ToolsMenu;
