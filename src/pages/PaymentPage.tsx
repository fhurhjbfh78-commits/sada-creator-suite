import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Menu, CreditCard, Calendar, Eye, EyeOff, User, DollarSign } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import BottomNav from '@/components/BottomNav';

const PaymentPage = () => {
  const { setPaid, profile } = useAppStore();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [showCvv, setShowCvv] = useState(false);

  const plans = [
    { id: 'monthly', label: 'اشتراك شهري', sub: 'شهري', price: '$1' },
    { id: 'yearly', label: 'اشتراك سنوي', sub: 'السنوي', price: '$0' },
    { id: 'pro', label: 'باقة Pro تفصيلية', sub: '$5', price: '$5' },
  ];

  const handlePay = () => {
    setPaid(true);
    navigate('/chat');
  };

  return (
    <div className="flex flex-col min-h-screen gradient-bg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <button><Menu className="w-5 h-5 text-foreground" /></button>
        <h1 className="text-xl font-bold">الدفع</h1>
        <button onClick={() => navigate(-1)}><ChevronRight className="w-5 h-5 text-foreground" /></button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {/* Card info */}
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
              <p className="text-xs text-muted-foreground text-right mb-1">CVV</p>
              <div className="glass-input flex items-center gap-2 px-3 py-2.5">
                <button onClick={() => setShowCvv(!showCvv)}>
                  {showCvv ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </button>
                <input className="flex-1 bg-transparent text-foreground outline-none text-right text-sm" placeholder="CVV" type={showCvv ? 'text' : 'password'} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground text-right mb-1">تاريخ الاختئوار</p>
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

        {/* Plans */}
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`w-full glass-card p-4 flex items-center justify-between transition-all ${
              selectedPlan === plan.id ? 'border-primary/50 shadow-[0_0_15px_hsl(var(--glow))]' : ''
            }`}
          >
            <span className="glow-btn px-4 py-1.5 text-sm flex items-center gap-1">
              {plan.price} <DollarSign className="w-3 h-3" />
            </span>
            <div className="text-right">
              <p className="font-bold">{plan.label}</p>
              <p className="text-xs text-muted-foreground">{plan.sub}</p>
            </div>
          </button>
        ))}

        <button onClick={handlePay} className="w-full glow-btn py-3.5 text-lg animate-pulse-glow">
          دفع $5
        </button>
        <p className="text-center text-muted-foreground text-xs">آمن ومشفر</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default PaymentPage;
