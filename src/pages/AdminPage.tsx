import { useAppStore, TEXT_AI_KEYS, IMAGE_AI_KEYS } from '@/store/useAppStore';
import { Cpu, Key, Lock, Server, DollarSign, ChevronDown, Loader2, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { playSuccessSound, playErrorSound } from '@/lib/sounds';

interface FeatureRequest {
  id: string;
  request_text: string;
  generated_code: string | null;
  status: string;
  created_at: string;
}

const AdminPage = () => {
  const {
    selectedTextAiKey, setSelectedTextAiKey,
    selectedImageAiKey, setSelectedImageAiKey,
    apiKeys, setApiKey,
    masterCardNumber, setMasterCardNumber,
    serverUrl, setServerUrl,
    subscriptionPrices, setSubscriptionPrice,
  } = useAppStore();
  const { user } = useAuth();
  const [aiPrompt, setAiPrompt] = useState('');
  const [featureLoading, setFeatureLoading] = useState(false);
  const [requests, setRequests] = useState<FeatureRequest[]>([]);

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

  // Load existing feature requests
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('feature_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setRequests(data as FeatureRequest[]);
    };
    load();
  }, [user?.id]);

  const handleSaveFeature = async () => {
    if (!aiPrompt.trim() || !user) return;
    setFeatureLoading(true);
    try {
      // 1) Generate code via AI
      const { data, error } = await supabase.functions.invoke('apply-feature', {
        body: { featureRequest: aiPrompt },
      });
      if (error) throw error;
      const code = data?.result || '';

      // 2) Save the request + generated code in DB (real persistence)
      const { data: inserted, error: insErr } = await supabase
        .from('feature_requests')
        .insert({ user_id: user.id, request_text: aiPrompt, generated_code: code, status: 'pending' })
        .select()
        .single();
      if (insErr) throw insErr;

      setRequests((prev) => [inserted as FeatureRequest, ...prev]);
      setAiPrompt('');
      playSuccessSound();
      toast.success('تم حفظ الميزة! ستُطبّق على التطبيق قريباً.');
    } catch (err) {
      console.error(err);
      playErrorSound();
      toast.error('فشل في حفظ الميزة');
    } finally {
      setFeatureLoading(false);
    }
  };

  const handleMarkApplied = async (id: string) => {
    const { error } = await supabase
      .from('feature_requests')
      .update({ status: 'applied' })
      .eq('id', id);
    if (error) { toast.error('فشل التحديث'); playErrorSound(); return; }
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'applied' } : r));
    playSuccessSound();
    toast.success('تم وضع علامة "مطبّقة"');
  };

  const handleDeleteRequest = async (id: string) => {
    const { error } = await supabase.from('feature_requests').delete().eq('id', id);
    if (error) { toast.error('فشل الحذف'); playErrorSound(); return; }
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success('تم الحذف');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    playSuccessSound();
    toast.success('تم نسخ الكود!');
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

        {/* Section 3: AI Feature Injector - REAL */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-primary">✨</span>
            <h3 className="font-bold">حقن ميزات جديدة</h3>
          </div>
          <p className="text-[10px] text-muted-foreground text-right mb-2">اكتب الميزة المطلوبة وسيقوم الذكاء الاصطناعي بتحليلها وتوليد الكود الجاهز</p>
          <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
            className="w-full glass-input p-3 text-sm text-right resize-none h-28 text-foreground" placeholder="مثال: أضف زر مشاركة في المنشورات..." />
          <button onClick={handleSaveFeature} disabled={featureLoading}
            className="w-full glow-btn py-2.5 text-sm mt-3 active:scale-95 transition-transform flex items-center justify-center gap-2">
            {featureLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التحليل...</> : 'تطبيق الميزة'}
          </button>
          {featureResult && (
            <div className="mt-3 space-y-2">
              <div className="glass-input p-3 text-xs text-right text-foreground max-h-60 overflow-y-auto whitespace-pre-wrap animate-fade-in font-mono" dir="ltr">
                {featureResult}
              </div>
              <button onClick={handleCopyCode} className="w-full glass-card py-2 text-xs text-primary active:scale-95 transition-transform">
                📋 نسخ الكود
              </button>
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
