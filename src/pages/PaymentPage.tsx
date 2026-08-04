import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, Eye, EyeOff, User, DollarSign } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePrices } from '@/hooks/useAdminSettings';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const PaymentPage = () => {
  const { profile } = useAppStore();
  const [submitting, setSubmitting] = useState(false);
  const prices = usePrices();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [showCvv, setShowCvv] = useState(false);


  const plans = [
    { id: 'beginner', label: 'باقة مبتدئ', sub: 'شهري', price: `$${prices.beginner}` },
    { id: 'intermediate', label: 'باقة متوسط', sub: 'شهري', price: `$${prices.intermediate}` },
    { id: 'pro', label: 'باقة Pro', sub: 'شهري', price: `$${prices.pro}` },
  ];

  const currentPrice = plans.find(p => p.id === selectedPlan)?.price || `$${prices.pro}`;

  const handlePay = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('يرجى تسجيل الدخول أولاً');
        navigate('/login');
        return;
      }
      // Access is granted by the server after the payment is verified.
      const { error } = await supabase
        .from('subscriptions')
        .insert({ user_id: user.id, plan: selectedPlan, status: 'pending' });
      if (error) throw error;
      toast.success('تم استلام طلب الاشتراك. سيتم تفعيله بعد التحقق من الدفع.');
      navigate('/chat');
    } catch (e: any) {
      toast.error('تعذّر إرسال طلب الاشتراك');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="الدفع" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold">صَدي</span>
            <span className="font-bold">{profile.name}</span>
          </div>

          <div className="glass-input flex items-center gap-2 px-3 py-2.5 mb-3">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <input className="flex-1 bg-transparent text-foreground outline-none text-right text-sm" placeholder="رقم البطاقة" />
          </div>

          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground text-right mb-1">CVV</p>
              <div className="glass-input flex items-center gap-2 px-3 py-2.5">
                <button onClick={() => setShowCvv(!showCvv)}>
                  {showCvv ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </button>
                <input className="flex-1 bg-transparent text-foreground outline-none text-right text-sm" placeholder="CVV" type={showCvv ? 'text' : 'password'} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground text-right mb-1">تاريخ الاختئوار</p>
              <div className="glass-input flex items-center gap-2 px-3 py-2.5">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input className="flex-1 bg-transparent text-foreground outline-none text-right text-sm" placeholder="MM / YY" />
              </div>
            </div>
          </div>

          <div className="glass-input flex items-center gap-2 px-3 py-2.5">
            <User className="w-5 h-5 text-muted-foreground" />
            <input className="flex-1 bg-transparent text-foreground outline-none text-right text-sm" placeholder="اسم بحامل البطاقة" />
          </div>
        </div>

        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`w-full glass-card p-4 flex items-center justify-between transition-all active:scale-[0.98] ${
              selectedPlan === plan.id ? 'border-primary/50 shadow-[0_0_15px_hsl(195_100%_50%_/_0.2)]' : ''
            }`}
          >
            <span className="glow-btn px-4 py-1.5 text-sm flex items-center gap-1">
              {plan.price} <DollarSign className="w-3 h-3" />
            </span>
            <div className="text-right">
              <p className="font-bold text-sm">{plan.label}</p>
              <p className="text-[10px] text-muted-foreground">{plan.sub}</p>
            </div>
          </button>
        ))}

        <button onClick={handlePay} disabled={submitting} className="w-full glow-btn py-3.5 text-lg animate-pulse-glow active:scale-95 transition-transform">
          دفع {currentPrice}
        </button>
        <p className="text-center text-muted-foreground text-xs">آمن ومشفر</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default PaymentPage;
