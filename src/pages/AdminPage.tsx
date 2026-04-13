import { useAppStore, TEXT_AI_KEYS, IMAGE_AI_KEYS } from '@/store/useAppStore';
import { Cpu, Key, Lock, Server, DollarSign, ChevronDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { playSuccessSound, playErrorSound } from '@/lib/sounds';

const AdminPage = () => {
  const {
    selectedTextAiKey, setSelectedTextAiKey,
    selectedImageAiKey, setSelectedImageAiKey,
    apiKeys, setApiKey,
    masterCardNumber, setMasterCardNumber,
    serverUrl, setServerUrl,
    subscriptionPrices, setSubscriptionPrice,
  } = useAppStore();
  const [aiPrompt, setAiPrompt] = useState('');
  const [featureLoading, setFeatureLoading] = useState(false);
  const [featureResult, setFeatureResult] = useState('');

  const currentTextKeyValue = apiKeys[selectedTextAiKey] || '';
  const currentImageKeyValue = apiKeys[selectedImageAiKey] || '';

  const handleSaveTextKey = () => {
    if (!currentTextKeyValue.trim()) { toast.error('أدخل المفتاح أولاً'); playErrorSound(); return; }
    playSuccessSound();
    toast.success(`تم حفظ مفتاح ${selectedTextAiKey} بنجاح`);
  };

  const handleSaveImageKey = () => {
    if (!currentImageKeyValue.trim()) { toast.error('أدخل المفتاح أولاً'); playErrorSound(); return; }
    playSuccessSound();
    toast.success(`تم حفظ مفتاح ${selectedImageAiKey} بنجاح`);
  };

  const handleSaveFeature = async () => {
    if (!aiPrompt.trim()) return;
    setFeatureLoading(true);
    setFeatureResult('');
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `أنت مساعد تطوير تطبيقات. المستخدم يطلب إضافة الميزة التالية للتطبيق. قم بشرح كيفية تنفيذها بالتفصيل وأعطِ الكود المطلوب:\n\n${aiPrompt}`,
        },
      });
      if (error) throw error;
      setFeatureResult(data?.response || 'لم يتم الحصول على رد.');
      playSuccessSound();
      toast.success('تم تحليل الميزة بنجاح');
    } catch (err) {
      playErrorSound();
      toast.error('فشل في تحليل الميزة');
      setFeatureResult('حدث خطأ. تأكد من ربط مفتاح API.');
    } finally {
      setFeatureLoading(false);
    }
  };

  const handleSaveCard = () => {
    if (!masterCardNumber.trim()) { toast.error('أدخل رقم البطاقة'); playErrorSound(); return; }
    playSuccessSound();
    toast.success('تم ربط بطاقة الدفع بنجاح');
  };

  const handleSaveServer = () => {
    if (!serverUrl.trim()) { toast.error('أدخل عنوان السيرفر'); playErrorSound(); return; }
    playSuccessSound();
    toast.success('تم حفظ عنوان السيرفر');
  };

  const handleSavePrices = () => {
    playSuccessSound();
    toast.success('تم حفظ الأسعار بنجاح');
  };

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="غرفة المدير" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Section 1: Text AI Key */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <Cpu className="w-5 h-5 text-primary" />
            <h3 className="font-bold">مفتاح الذكاء الاصطناعي النصي</h3>
          </div>
          <div className="mb-3">
            <label className="text-xs text-muted-foreground mb-1 block text-right">اختر المفتاح</label>
            <div className="relative">
              <select value={selectedTextAiKey} onChange={(e) => setSelectedTextAiKey(e.target.value)}
                className="w-full glass-input px-3 py-2.5 text-sm bg-secondary text-foreground appearance-none text-right pr-3 pl-8">
                {TEXT_AI_KEYS.map((k) => (<option key={k} value={k}>{k}</option>))}
              </select>
              <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="glass-input flex items-center gap-2 px-3 py-2.5 mb-3">
            <Cpu className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input type="password" value={currentTextKeyValue} onChange={(e) => setApiKey(selectedTextAiKey, e.target.value)}
              className="flex-1 bg-transparent text-foreground outline-none text-right text-sm" placeholder="أدخل المفتاح..." />
          </div>
          <button onClick={handleSaveTextKey} className="w-full glow-btn py-2.5 text-sm active:scale-95 transition-transform">ربط</button>
        </div>

        {/* Section 2: Image AI Key */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="font-bold">مفتاح إنشاء الصور</h3>
          </div>
          <div className="mb-3">
            <label className="text-xs text-muted-foreground mb-1 block text-right">اختر المفتاح</label>
            <div className="relative">
              <select value={selectedImageAiKey} onChange={(e) => setSelectedImageAiKey(e.target.value)}
                className="w-full glass-input px-3 py-2.5 text-sm bg-secondary text-foreground appearance-none text-right pr-3 pl-8">
                {IMAGE_AI_KEYS.map((k) => (<option key={k} value={k}>{k}</option>))}
              </select>
              <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="glass-input flex items-center gap-2 px-3 py-2.5 mb-3">
            <Key className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input type="password" value={currentImageKeyValue} onChange={(e) => setApiKey(selectedImageAiKey, e.target.value)}
              className="flex-1 bg-transparent text-foreground outline-none text-right text-sm" placeholder="أدخل المفتاح..." />
          </div>
          <button onClick={handleSaveImageKey} className="w-full glow-btn py-2.5 text-sm active:scale-95 transition-transform">ربط</button>
        </div>

        {/* Section 3: AI Feature Injector - Now functional */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-primary">✨</span>
            <h3 className="font-bold">حقن ميزات جديدة</h3>
          </div>
          <p className="text-[10px] text-muted-foreground text-right mb-2">اكتب الميزة المطلوبة وسيقوم الذكاء الاصطناعي بتحليلها وتوليد الكود</p>
          <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
            className="w-full glass-input p-3 text-sm text-right resize-none h-28 text-foreground" placeholder="مثال: أضف زر مشاركة في المنشورات..." />
          <button onClick={handleSaveFeature} disabled={featureLoading}
            className="w-full glow-btn py-2.5 text-sm mt-3 active:scale-95 transition-transform flex items-center justify-center gap-2">
            {featureLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التحليل...</> : 'تطبيق الميزة'}
          </button>
          {featureResult && (
            <div className="mt-3 glass-input p-3 text-xs text-right text-foreground max-h-60 overflow-y-auto whitespace-pre-wrap animate-fade-in">
              {featureResult}
            </div>
          )}
        </div>

        {/* Section 4: MasterCard */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <Lock className="w-5 h-5 text-primary" />
            <div className="text-right">
              <h3 className="font-bold">بوابة الدفع</h3>
              <p className="text-xs text-muted-foreground">ربط الماستر كارد لاستقبال المدفوعات</p>
            </div>
          </div>
          <div className="glass-input flex items-center gap-2 px-3 py-2.5">
            <input type="password" value={masterCardNumber} onChange={(e) => setMasterCardNumber(e.target.value)}
              className="flex-1 bg-transparent text-foreground outline-none text-right text-sm" placeholder="رقم الماستر كارد" />
          </div>
          <button onClick={handleSaveCard} className="w-full glow-btn py-2.5 text-sm mt-3 active:scale-95 transition-transform">ربط البطاقة</button>
        </div>

        {/* Section 5: Server URL */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <Server className="w-5 h-5 text-primary" />
            <h3 className="font-bold">إعدادات السيرفر</h3>
          </div>
          <div className="glass-input flex items-center gap-2 px-3 py-2.5">
            <input type="text" value={serverUrl} onChange={(e) => setServerUrl(e.target.value)}
              className="flex-1 bg-transparent text-foreground outline-none text-right text-sm" placeholder="أدخل عنوان السيرفر..." dir="ltr" />
          </div>
          <button onClick={handleSaveServer} className="w-full glow-btn py-2.5 text-sm mt-3 active:scale-95 transition-transform">حفظ</button>
        </div>

        {/* Section 6: Subscription Pricing */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-bold">أسعار الاشتراكات</h3>
          </div>
          <div className="space-y-3">
            {([
              { key: 'beginner' as const, label: 'مبتدئ' },
              { key: 'intermediate' as const, label: 'متوسط' },
              { key: 'pro' as const, label: 'محترف' },
            ]).map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-12">$/شهر</span>
                <input type="number" value={subscriptionPrices[key]} onChange={(e) => setSubscriptionPrice(key, e.target.value)}
                  className="flex-1 glass-input px-3 py-2 text-sm text-right text-foreground" placeholder="0.00" />
                <span className="text-sm font-bold w-16 text-right">{label}</span>
              </div>
            ))}
          </div>
          <button onClick={handleSavePrices} className="w-full glow-btn py-2.5 text-sm mt-3 active:scale-95 transition-transform">حفظ الأسعار</button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminPage;
