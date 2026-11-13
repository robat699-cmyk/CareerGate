import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Zap, ShieldCheck, ArrowRight, Sparkles, CreditCard, Lock, X, CheckCircle, AlertCircle } from "lucide-react";
import { getUserPlan, setUserPlan, addPayment, getPricing } from "../lib/store";

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({ plan, price, onClose, onSuccess, userId }: {
  plan: string;
  price: string;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}) {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    email: '',
  });

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 4);
    if (digits.length >= 3) return digits.substring(0, 2) + '/' + digits.substring(2);
    return digits;
  };

  const getCardBrand = (num: string) => {
    const n = num.replace(/\s/g, '');
    if (n.startsWith('4')) return 'VISA';
    if (n.startsWith('5') || n.startsWith('2')) return 'MC';
    if (n.startsWith('3')) return 'AMEX';
    return '';
  };

  const validateForm = () => {
    const num = form.cardNumber.replace(/\s/g, '');
    if (!form.email.includes('@')) return 'Please enter a valid email address.';
    if (!form.cardName.trim()) return 'Please enter the cardholder name.';
    if (num.length < 16) return 'Please enter a valid 16-digit card number.';
    if (form.expiry.length < 5) return 'Please enter a valid expiry date (MM/YY).';
    if (form.cvv.length < 3) return 'Please enter a valid CVV.';
    return null;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateForm();
    if (err) { setError(err); return; }
    setError('');
    setStep('processing');
    // Simulate payment processing
    setTimeout(() => {
      setUserPlan(userId, plan.toLowerCase() as any);
      addPayment({
        userId,
        userEmail: form.email,
        plan,
        amount: price,
        status: 'success'
      });
      setStep('success');
      setTimeout(onSuccess, 1500);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#111111] w-full max-w-md rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - High Contrast Crimson */}
        <div className="bg-gradient-to-br from-red-600 to-red-900 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-30" />
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-white/80 text-[10px] uppercase font-black tracking-[0.3em] mb-1.5 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Upgrading to
              </p>
              <h2 className="text-4xl font-serif italic font-bold text-white tracking-tight leading-none mb-3">{plan} Plan</h2>
              <p className="text-white text-2xl font-black">{price}<span className="text-white/60 text-xs font-normal ml-2 uppercase tracking-widest">/month</span></p>
            </div>
            <button onClick={onClose} className="p-3 bg-black/20 hover:bg-black/40 rounded-2xl transition-all border border-white/10 backdrop-blur-sm group">
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>

        <div className="p-8 bg-white dark:bg-[#111111]">
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handlePay} className="space-y-5">
                <div className="flex items-center gap-2.5 text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.25em] mb-6">
                  <Lock className="w-4 h-4 text-emerald-500" /> Secure 256-bit SSL encrypted
                </div>

                {error && (
                  <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                  </motion.div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Email Address</label>
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-red-500/10 focus:border-red-500/30 outline-none transition-all dark:text-white dark:placeholder:text-white/10"
                    placeholder="you@careergate.ai"
                  />
                </div>

                {/* Card Number */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Card Details</label>
                  <div className="relative group">
                    <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      type="text" required
                      value={form.cardNumber}
                      onChange={e => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-20 py-4 text-base font-mono focus:ring-4 focus:ring-red-500/10 focus:border-red-500/30 outline-none transition-all dark:text-white dark:placeholder:text-white/10"
                      placeholder="•••• •••• •••• ••••"
                    />
                    {getCardBrand(form.cardNumber) && (
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-1 rounded-md tracking-widest border border-red-500/20">
                        {getCardBrand(form.cardNumber)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Cardholder Name</label>
                  <input
                    type="text" required
                    value={form.cardName}
                    onChange={e => setForm({ ...form, cardName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-4 focus:ring-red-500/10 focus:border-red-500/30 outline-none transition-all dark:text-white dark:placeholder:text-white/10"
                    placeholder="FULL NAME ON CARD"
                  />
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Expiry Date</label>
                    <input
                      type="text" required
                      value={form.expiry}
                      onChange={e => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-mono focus:ring-4 focus:ring-red-500/10 focus:border-red-500/30 outline-none transition-all dark:text-white dark:placeholder:text-white/10"
                      placeholder="MM / YY"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">CVV</label>
                    <input
                      type="password" required
                      value={form.cvv}
                      onChange={e => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-mono focus:ring-4 focus:ring-red-500/10 focus:border-red-500/30 outline-none transition-all dark:text-white dark:placeholder:text-white/10"
                      placeholder="•••"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-5 bg-gradient-to-r from-red-600 to-red-800 text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_20px_40px_-5px_rgba(220,38,38,0.4)] hover:shadow-[0_25px_50px_-5px_rgba(220,38,38,0.6)] transition-all flex items-center justify-center gap-3 mt-4"
                >
                  <ShieldCheck className="w-5 h-5" /> Activate Premium
                </motion.button>

                <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] pt-2">
                  Encrypted & Secure. Terms apply.
                </p>
              </motion.form>
            )}

            {step === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-16 flex flex-col items-center gap-8">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 border-[6px] border-red-500/10 border-t-red-600 rounded-full"
                  />
                  <Lock className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 text-red-600" />
                </div>
                <div className="text-center">
                  <p className="font-serif italic font-bold text-2xl text-ink">Authorizing Transaction</p>
                  <p className="text-muted text-sm mt-2">Connecting to secure banking gateway...</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-16 flex flex-col items-center gap-8">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="w-24 h-24 bg-emerald-500 text-white rounded-3xl shadow-2xl shadow-emerald-500/30 flex items-center justify-center"
                >
                  <CheckCircle className="w-12 h-12" />
                </motion.div>
                <div className="text-center">
                  <p className="font-serif italic font-bold text-3xl text-ink">Subscription Active!</p>
                  <p className="text-muted text-sm mt-3 max-w-[240px] mx-auto leading-relaxed">Your premium journey starts now. Welcome aboard the Pro network.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Subscription Page ───────────────────────────────────────────────────────
export default function Subscription({ user }: { user: any }) {
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>(() => user ? getUserPlan(user.uid) : 'basic');
  const [upgradeSuccess, setUpgradeSuccess] = useState('');

  const handleSelectPlan = (name: string, price: string) => {
    if (!user) { alert('Please sign in to upgrade your plan.'); return; }
    if (name.toLowerCase() === currentPlan) return;
    setSelectedPlan({ name, price });
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    if (!selectedPlan || !user) return;
    setCurrentPlan(selectedPlan.name.toLowerCase());
    setUpgradeSuccess(`🎉 Successfully upgraded to ${selectedPlan.name} plan!`);
    setShowPayment(false);
    setSelectedPlan(null);
    setTimeout(() => setUpgradeSuccess(''), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Success Toast */}
      <AnimatePresence>
        {upgradeSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-[300] bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl text-sm font-bold"
          >
            {upgradeSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[7px] font-bold uppercase tracking-widest mb-2.5"
        >
          <Sparkles className="w-2 h-2" /> Premium Access
        </motion.div>
        <h2 className="text-2xl lg:text-3xl font-serif italic font-bold mb-2.5 leading-tight tracking-tight text-primary">
          Upgrade your <span className="text-secondary underline decoration-primary/20">career</span>.
        </h2>
        <p className="text-xs text-primary/60 font-serif italic max-w-xs mx-auto font-medium">
          Unlock premium AI features, priority matching, and exclusive industry insights.
        </p>
        
        {currentPlan !== 'basic' && (
          <div className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
            <CheckCircle className="w-3 h-3 text-red-500" /> Current Plan: <span className="text-primary font-black ml-1">{currentPlan}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 perspective-[2000px]">
        {(() => {
           const currentPricing = getPricing();
           return (
             <>
                <PricingCard
                  title="Basic"
                  price="Free"
                  features={["AI Resume Builder", "5 Job Applications/month", "Basic Analytics", "Community Newsfeed"]}
                  icon={<Zap className="w-4 h-4" />}
                  onSelect={() => handleSelectPlan('Basic', 'Free')}
                  current={currentPlan === 'basic'}
                  delay={0.1}
                />
                <PricingCard
                  title="Pro"
                  price={`${currentPricing.pro.toLocaleString()} BDT`}
                  period="/month"
                  features={["Priority AI Matching", "Unlimited Applications", "Skill Certifications", "Direct Messaging", "Resume AI Boost"]}
                  icon={<Star className="w-4 h-4 text-red-500" />}
                  onSelect={() => handleSelectPlan('Pro', `${currentPricing.pro.toLocaleString()} BDT`)}
                  current={currentPlan === 'pro'}
                  highlight={true}
                  delay={0.2}
                />
                <PricingCard
                  title="Enterprise"
                  price={`${currentPricing.enterprise.toLocaleString()} BDT`}
                  period="/month"
                  features={["Dedicated Career Coach", "Company Branding", "Advanced Analytics", "API Access", "Priority Support"]}
                  icon={<ShieldCheck className="w-4 h-4" />}
                  onSelect={() => handleSelectPlan('Enterprise', `${currentPricing.enterprise.toLocaleString()} BDT`)}
                  current={currentPlan === 'enterprise'}
                  delay={0.3}
                />
             </>
           )
        })()}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && selectedPlan && user && (
          <PaymentModal
            plan={selectedPlan.name}
            price={selectedPlan.price}
            userId={user.uid}
            onClose={() => setShowPayment(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PricingCard({ title, price, period, features, icon, onSelect, highlight, current, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -5, rotateY: highlight ? -2 : 2, rotateX: 1, translateZ: 15, scale: 1.02 }}
      className={`p-7 rounded-[2rem] border transition-all relative overflow-hidden flex flex-col perspective-[1000px] shadow-xl ${
        highlight
          ? 'surface-card border-primary/50 ring-2 ring-primary/10'
          : 'surface-card border-line translate-y-2'
      }`}
    >
      {highlight && (
        <div className="absolute top-0 right-0 bg-primary text-white text-[7px] font-bold uppercase tracking-widest px-4 py-1 rounded-bl-2xl shadow-lg">
          Most Popular
        </div>
      )}
      {current && (
        <div className="absolute top-0 left-0 bg-red-500 text-white text-[7px] font-bold uppercase tracking-widest px-4 py-1 rounded-br-2xl">
          ✓ Active
        </div>
      )}
      
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-inner text-primary">
        {icon}
      </div>

      <h3 className="text-xl font-serif italic font-extrabold text-primary mb-1 tracking-tight">{title}</h3>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-2xl font-black text-primary tracking-tighter">{price}</span>
        {period && <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-primary/40">{period}</span>}
      </div>

      <ul className="space-y-4 mb-10 flex-1">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-2.5 text-[11px] font-semibold text-primary/80 group">
            <div className="p-1 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <CheckIcon className="w-1.5 h-1.5 flex-shrink-0" />
            </div>
            {f}
          </li>
        ))}
      </ul>

      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSelect}
        disabled={current}
        className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2 shadow-2xl ${
          highlight
            ? 'btn-premium'
            : 'bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10'
        } disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
      >
        {current ? 'Your Membership' : 'Select Plan'}
        {!current && <ArrowRight className="w-3 h-3" />}
      </motion.button>
    </motion.div>
  );
}

function CheckIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
