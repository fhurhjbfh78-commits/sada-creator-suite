import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bot, TrendingUp, ShieldCheck, LayoutTemplate, Loader2, Play, Copy, Check, Eye } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { useAppStore } from '@/store/useAppStore';
import { PERSONAS } from '@/lib/personas';

type Tab = 'agent' | 'predict' | 'ui' | 'security';

type Step = { title: string; detail: string; output?: string; status: 'pending' | 'running' | 'done' | 'error' };
type Insight = { title: string; risk: string; when: string; advice: string };
type Issue = { title: string; severity: string; line: string; why: string; patch: string };

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'agent', label: 'الوكيل الذاتي', icon: Bot },
  { id: 'predict', label: 'تحليل تنبؤي', icon: TrendingUp },
  { id: 'ui', label: 'مولّد واجهات', icon: LayoutTemplate },
  { id: 'security', label: 'فحص أمني', icon: ShieldCheck },
];

const RISK_COLOR: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/40',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
};

const CopyBtn = ({ text }: { text: string }) => {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        } catch { toast.error('تعذّر النسخ'); }
      }}
      className="p-1.5 rounded-lg bg-muted/40 active:scale-95"
      aria-label="نسخ"
    >
      {ok ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const LabPage = () => {
  const { aiPersona, customPersona } = useAppStore();
  const personaText = aiPersona === 'custom' ? customPersona : (PERSONAS[aiPersona]?.prompt || '');

  const [tab, setTab] = useState<Tab>('agent');
  const [busy, setBusy] = useState(false);

  // Agent
  const [task, setTask] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [report, setReport] = useState('');

  // Predict / Security shared code input
  const [code, setCode] = useState('');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [predictSummary, setPredictSummary] = useState('');
  const [predictScore, setPredictScore] = useState<number | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [secScore, setSecScore] = useState<number | null>(null);

  // UI generator
  const [uiPrompt, setUiPrompt] = useState('');
  const [uiHtml, setUiHtml] = useState('');
  const [uiSchema, setUiSchema] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const call = async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('agent-run', {
      body: { ...payload, persona: personaText || undefined },
    });
    if (error) throw new Error(error.message || 'فشل الاتصال');
    if (data && data.success === false) throw new Error(data.error || 'فشل الطلب');
    return data || {};
  };

  const runAgent = async () => {
    if (!task.trim() || busy) return;
    setBusy(true);
    setReport('');
    setSteps([]);
    try {
      const planned = await call({ kind: 'plan', task });
      const list: Step[] = (planned.steps || []).map((s: any) => ({
        title: s.title, detail: s.detail, status: 'pending' as const,
      }));
      if (!list.length) throw new Error('تعذّر إنشاء الخطة');
      setSteps(list);

      let ctx = '';
      for (let i = 0; i < list.length; i++) {
        setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: 'running' } : s)));
        try {
          const res = await call({ kind: 'step', task, step: `${list[i].title} — ${list[i].detail}`, context: ctx.slice(-8000) });
          const out = String(res.output || '');
          ctx += `\n\n[${list[i].title}]\n${out}`;
          setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, output: out, status: 'done' } : s)));
        } catch (e: any) {
          setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, output: e?.message || 'فشل', status: 'error' } : s)));
        }
      }

      const rep = await call({ kind: 'report', task, context: ctx.slice(-12000) });
      setReport(String(rep.report || ''));
      toast.success('اكتملت المهمة ✅');
    } catch (e: any) {
      toast.error(e?.message || 'فشل تنفيذ المهمة');
    } finally {
      setBusy(false);
    }
  };

  const runPredict = async () => {
    if (!code.trim() && !task.trim()) { toast.error('الصق الكود أو اكتب وصف'); return; }
    setBusy(true);
    try {
      const d = await call({ kind: 'predict', code, task });
      setPredictScore(typeof d.score === 'number' ? d.score : null);
      setPredictSummary(String(d.summary || ''));
      setInsights(Array.isArray(d.insights) ? d.insights : []);
      if (!d.insights?.length && !d.summary) toast.info('لا توجد ملاحظات');
    } catch (e: any) {
      toast.error(e?.message || 'فشل التحليل');
    } finally { setBusy(false); }
  };

  const runSecurity = async () => {
    if (!code.trim()) { toast.error('الصق الكود أولاً'); return; }
    setBusy(true);
    try {
      const d = await call({ kind: 'security', code });
      setSecScore(typeof d.score === 'number' ? d.score : null);
      setIssues(Array.isArray(d.issues) ? d.issues : []);
      if (!d.issues?.length) toast.success('ما لقيت ثغرات واضحة 👌');
    } catch (e: any) {
      toast.error(e?.message || 'فشل الفحص');
    } finally { setBusy(false); }
  };

  const runUi = async () => {
    if (!uiPrompt.trim()) { toast.error('اوصف الواجهة المطلوبة'); return; }
    setBusy(true);
    setUiHtml(''); setUiSchema(''); setShowPreview(false);
    try {
      const d = await call({ kind: 'ui', task: uiPrompt });
      const html = String(d.html || '');
      if (!html) throw new Error('لم يتم توليد كود');
      setUiHtml(html);
      setUiSchema(String(d.schema || ''));
      setShowPreview(true);
      toast.success('تم توليد الواجهة ✨');
    } catch (e: any) {
      toast.error(e?.message || 'فشل التوليد');
    } finally { setBusy(false); }
  };

  const openInIde = () => {
    try {
      sessionStorage.setItem('sada_ide_prefill', uiHtml);
      window.location.href = '/game';
    } catch { toast.error('تعذّر الفتح'); }
  };

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="مختبر صدى" />

      <div className="flex-shrink-0 grid grid-cols-4 gap-1 px-2 py-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
              tab === id ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-card/40 text-muted-foreground border border-transparent'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="truncate w-full text-center px-0.5">{label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3">
        {/* ---------- AGENT ---------- */}
        {tab === 'agent' && (
          <>
            <div className="glass-card p-3 space-y-2">
              <p className="text-[11px] text-muted-foreground">
                اكتب مهمة كاملة وصدى يقسمها خطوات وينفذها وحده ويعطيك تقرير نهائي.
              </p>
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="مثال: افحص كود تسجيل الدخول، سوي Refactoring، واكتبلي خطة نشر"
                rows={3}
                className="w-full bg-muted/30 rounded-xl p-3 text-sm outline-none resize-none border border-border/40 focus:border-primary/50"
              />
              <button
                onClick={runAgent}
                disabled={busy || !task.trim()}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {busy ? 'جاري التنفيذ...' : 'ابدأ جلسة العمل'}
              </button>
            </div>

            {steps.map((s, i) => (
              <div key={i} className="glass-card p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    s.status === 'done' ? RISK_COLOR.low : s.status === 'error' ? RISK_COLOR.critical : s.status === 'running' ? RISK_COLOR.medium : 'bg-muted/30 text-muted-foreground border-border/40'
                  }`}>
                    {s.status === 'done' ? 'تم' : s.status === 'error' ? 'خطأ' : s.status === 'running' ? 'يشتغل' : 'بالانتظار'}
                  </span>
                  <p className="font-bold text-sm flex-1 text-right truncate">{i + 1}. {s.title}</p>
                </div>
                {s.detail && <p className="text-[11px] text-muted-foreground">{s.detail}</p>}
                {s.output && (
                  <div className="relative">
                    <pre className="bg-muted/30 rounded-lg p-2 text-[11px] whitespace-pre-wrap break-words max-h-64 overflow-y-auto" dir="auto">{s.output}</pre>
                    <div className="absolute top-1 left-1"><CopyBtn text={s.output} /></div>
                  </div>
                )}
              </div>
            ))}

            {report && (
              <div className="glass-card p-3 space-y-2 border border-primary/30">
                <div className="flex items-center justify-between">
                  <CopyBtn text={report} />
                  <p className="font-bold text-sm text-primary">📋 التقرير النهائي</p>
                </div>
                <pre className="text-[12px] whitespace-pre-wrap break-words" dir="auto">{report}</pre>
              </div>
            )}
          </>
        )}

        {/* ---------- PREDICT ---------- */}
        {tab === 'predict' && (
          <>
            <div className="glass-card p-3 space-y-2">
              <p className="text-[11px] text-muted-foreground">تحليل استباقي: يتوقع المشاكل قبل ما تصير (تسريب ذاكرة، بطء، توسّع).</p>
              <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="السياق (اختياري): مثلاً تطبيق يستقبل 1000 طلب/دقيقة"
                className="w-full bg-muted/30 rounded-xl p-2.5 text-sm outline-none border border-border/40 focus:border-primary/50"
              />
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="الصق الكود هنا..."
                rows={6}
                dir="ltr"
                className="w-full bg-muted/30 rounded-xl p-3 text-xs font-mono outline-none resize-none border border-border/40 focus:border-primary/50"
              />
              <button onClick={runPredict} disabled={busy} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />} تحليل تنبؤي
              </button>
            </div>

            {predictScore !== null && (
              <div className="glass-card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-primary">{predictScore}%</span>
                  <span className="text-sm font-bold">درجة سلامة الكود</span>
                </div>
                {predictSummary && <p className="text-[12px] text-muted-foreground">{predictSummary}</p>}
              </div>
            )}

            {insights.map((ins, i) => (
              <div key={i} className="glass-card p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${RISK_COLOR[ins.risk] || RISK_COLOR.medium}`}>{ins.risk}</span>
                  <p className="font-bold text-sm flex-1 text-right">{ins.title}</p>
                </div>
                {ins.when && <p className="text-[11px] text-muted-foreground">⏱ {ins.when}</p>}
                {ins.advice && <p className="text-[12px] whitespace-pre-wrap">💡 {ins.advice}</p>}
              </div>
            ))}
          </>
        )}

        {/* ---------- UI GENERATOR ---------- */}
        {tab === 'ui' && (
          <>
            <div className="glass-card p-3 space-y-2">
              <p className="text-[11px] text-muted-foreground">اوصف الواجهة وصدى يبنيها كود كامل + مخطط قاعدة بيانات + معاينة فورية.</p>
              <textarea
                value={uiPrompt}
                onChange={(e) => setUiPrompt(e.target.value)}
                placeholder="مثال: صفحة تسجيل دخول احترافية بتدرج بنفسجي وحقول إيميل وباسورد"
                rows={3}
                className="w-full bg-muted/30 rounded-xl p-3 text-sm outline-none resize-none border border-border/40 focus:border-primary/50"
              />
              <button onClick={runUi} disabled={busy} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LayoutTemplate className="w-4 h-4" />} توليد الواجهة
              </button>
            </div>

            {uiHtml && (
              <>
                <div className="flex gap-2">
                  <button onClick={() => setShowPreview((v) => !v)} className="flex-1 py-2 rounded-xl bg-card/60 border border-border/40 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95">
                    <Eye className="w-4 h-4" /> {showPreview ? 'إخفاء المعاينة' : 'معاينة'}
                  </button>
                  <button onClick={openInIde} className="flex-1 py-2 rounded-xl bg-card/60 border border-border/40 text-xs font-bold active:scale-95">فتح بالمحرر</button>
                  <CopyBtn text={uiHtml} />
                </div>
                {showPreview && (
                  <div className="glass-card p-1 overflow-hidden">
                    <iframe
                      title="preview"
                      srcDoc={uiHtml}
                      sandbox="allow-scripts"
                      className="w-full h-[420px] rounded-xl bg-white"
                    />
                  </div>
                )}
                <div className="glass-card p-3">
                  <p className="font-bold text-xs mb-1">الكود</p>
                  <pre dir="ltr" className="bg-muted/30 rounded-lg p-2 text-[10px] font-mono max-h-64 overflow-auto whitespace-pre">{uiHtml}</pre>
                </div>
                {uiSchema && (
                  <div className="glass-card p-3">
                    <div className="flex items-center justify-between mb-1">
                      <CopyBtn text={uiSchema} />
                      <p className="font-bold text-xs">مخطط قاعدة البيانات</p>
                    </div>
                    <pre dir="ltr" className="bg-muted/30 rounded-lg p-2 text-[10px] font-mono max-h-52 overflow-auto whitespace-pre">{uiSchema}</pre>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ---------- SECURITY ---------- */}
        {tab === 'security' && (
          <>
            <div className="glass-card p-3 space-y-2">
              <p className="text-[11px] text-muted-foreground">فحص أمني للكود مع باتش جاهز لكل ثغرة.</p>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="الصق الكود هنا..."
                rows={7}
                dir="ltr"
                className="w-full bg-muted/30 rounded-xl p-3 text-xs font-mono outline-none resize-none border border-border/40 focus:border-primary/50"
              />
              <button onClick={runSecurity} disabled={busy} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} افحص الأمان
              </button>
            </div>

            {secScore !== null && (
              <div className="glass-card p-3 flex items-center justify-between">
                <span className="text-2xl font-black text-primary">{secScore}%</span>
                <span className="text-sm font-bold">درجة الأمان</span>
              </div>
            )}

            {issues.map((iss, i) => (
              <div key={i} className="glass-card p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${RISK_COLOR[iss.severity] || RISK_COLOR.medium}`}>{iss.severity}</span>
                  <p className="font-bold text-sm flex-1 text-right">{iss.title}</p>
                </div>
                {iss.line && <p className="text-[11px] text-muted-foreground">📍 السطر: {iss.line}</p>}
                {iss.why && <p className="text-[12px]">{iss.why}</p>}
                {iss.patch && (
                  <div className="relative">
                    <pre dir="ltr" className="bg-muted/30 rounded-lg p-2 text-[10px] font-mono max-h-52 overflow-auto whitespace-pre">{iss.patch}</pre>
                    <div className="absolute top-1 left-1"><CopyBtn text={iss.patch} /></div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default LabPage;
