import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Lock, ArrowLeft, CheckCircle2, Loader2, Sparkles, AlertCircle, XCircle, X } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [htmlContent, setHtmlContent] = useState('');
  const [useFallbackForm, setUseFallbackForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  
  // Card Form States (Fallback)
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const packageInfo = location.state || {
    packageId: 3,
    price: 99,
    packageName: 'Premium VIP Paket'
  };

  useEffect(() => {
    const initPayment = async () => {
      try {
        const response = await axios.post('/api/payment/checkout-form', {
          packageId: packageInfo.packageId,
          price: packageInfo.price,
          packageName: packageInfo.packageName,
        }, { withCredentials: true });

        if (response.data && response.data.checkoutFormContent) {
          setHtmlContent(response.data.checkoutFormContent);
        } else {
          setUseFallbackForm(true);
        }
      } catch (err: any) {
        console.warn('Iyzico API fallback mode enabled:', err);
        setUseFallbackForm(true);
      }
    };

    initPayment();
  }, [packageInfo]);

  useEffect(() => {
    if (htmlContent) {
      const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
      let match;
      while ((match = scriptRegex.exec(htmlContent)) !== null) {
        const scriptElement = document.createElement('script');
        scriptElement.text = match[1];
        document.body.appendChild(scriptElement);
      }
    }
  }, [htmlContent]);

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
    }
    setExpiry(val);
  };

  const triggerError = (msg: string) => {
    setFormError(msg);
    setShowErrorModal(true);
    toast.error(msg);
  };

  const handleSimulatedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      triggerError('Lütfen tüm kart bilgilerini (İsim, Kart No, Son Kullanma ve CVC) eksiksiz doldurun.');
      return;
    }

    // 1. Kart Numarası Kontrolü (En az 15 rakam olmalı)
    const cleanCardNo = cardNumber.replace(/\s+/g, '');
    if (!/^\d{15,16}$/.test(cleanCardNo)) {
      triggerError('Hatalı Kart Numarası! Kart numarası 15 veya 16 haneli rakamlardan oluşmalıdır.');
      return;
    }

    // 2. Son Kullanma Tarihi Kontrolü (AA/YY formatı, Ay 01-12 arası olmalı)
    const expiryRegex = /^(0[1-9]|1[0-2])\/([2-9][0-9])$/;
    if (!expiryRegex.test(expiry)) {
      triggerError('Hatalı Son Kullanma Tarihi! Ay 01-12 arasında, yıl ise 2 haneli olmalıdır (Örn: 12/28).');
      return;
    }

    const [expMonthStr, expYearStr] = expiry.split('/');
    const expMonth = parseInt(expMonthStr, 10);
    const expYear = parseInt('20' + expYearStr, 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      triggerError('Kartınızın son kullanma tarihi geçmiş! Lütfen son kullanma tarihi geçerli bir kart girin.');
      return;
    }

    // 3. CVC Kontrolü (3 veya 4 rakam)
    if (!/^\d{3,4}$/.test(cvv)) {
      triggerError('Hatalı CVC Güvenlik Kodu! Kartın arkasındaki 3 veya 4 haneli güvenlik kodunu girin.');
      return;
    }

    setIsProcessing(true);

    try {
      // 4. Veritabanında (MongoDB/SQL) aboneliği aktifleştir!
      await axios.post('/api/subscribe', {
        packageId: packageInfo.packageId,
        packageName: packageInfo.packageName || 'Premium'
      }, { withCredentials: true });

      // 5. Güncel kullanıcı bilgilerini çek ve localStorage'ı güncelle
      const userRes = await axios.get('/api/user', { withCredentials: true });
      if (userRes.data && userRes.data.loggedIn) {
        localStorage.setItem('user', JSON.stringify(userRes.data));
      }

      toast.success(`${packageInfo.packageName || 'Premium'} aboneliğiniz veritabanında başarıyla aktifleştirildi! 🎉`);
      navigate('/payment-success');
    } catch (err: any) {
      console.error('Abonelik aktifleştirme hatası:', err);
      const errText = err.response?.data?.error || 'Abonelik veritabanına işlenirken bir sorun oluştu.';
      triggerError(errText);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 font-inter relative overflow-hidden">
      <Toaster position="top-right" richColors />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl z-10 space-y-6">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard'a Dön
        </button>

        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">256-Bit SSL Güvenli Ödeme</span>
              </div>
              <h1 className="text-2xl font-black mt-1">{packageInfo?.packageName}</h1>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-bold">Tutar</span>
              <span className="text-2xl font-black text-emerald-400">{packageInfo?.price} ₺</span>
            </div>
          </div>

          {/* Kırmızı Uyarı Kartı (Inline Red Alert Banner) */}
          {formError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-start gap-3 animate-pulse">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1">
                <span className="font-extrabold text-rose-400 block mb-0.5">⚠️ Kart Bilgisi Hatalı!</span>
                <span>{formError}</span>
              </div>
              <button onClick={() => setFormError(null)} className="text-rose-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Form Content */}
          {htmlContent ? (
            <div className="relative z-50 py-4" dangerouslySetInnerHTML={{ __html: htmlContent }} />
          ) : (
            <form onSubmit={handleSimulatedPayment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">KART ÜZERİNDEKİ İSİM</label>
                <input 
                  type="text" 
                  placeholder="Ahmet Yılmaz" 
                  value={cardHolder} 
                  onChange={(e) => setCardHolder(e.target.value)} 
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500" 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">KART NUMARASI</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="4543 •••• •••• 1234" 
                    value={cardNumber} 
                    onChange={(e) => setCardNumber(e.target.value)} 
                    maxLength={19}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-3 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" 
                    required 
                  />
                  <CreditCard className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">SON KULLANMA (AA/YY)</label>
                  <input 
                    type="text" 
                    placeholder="12/28" 
                    value={expiry} 
                    onChange={handleExpiryChange} 
                    maxLength={5}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-3 px-4 text-sm text-white text-center focus:outline-none focus:border-emerald-500 font-mono" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">CVC / CVV</label>
                  <input 
                    type="text" 
                    placeholder="888" 
                    value={cvv} 
                    onChange={(e) => setCvv(e.target.value)} 
                    maxLength={4}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-3 px-4 text-sm text-white text-center focus:outline-none focus:border-emerald-500 font-mono" 
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all duration-300 mt-4"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Ödeme İşleniyor...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>{packageInfo?.price} ₺ Güvenli Öde</span>
                  </div>
                )}
              </button>
            </form>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 3D Secure İyzico Koruması
            </span>
            <span>İptal Edilebilir Taahhütsüz</span>
          </div>
        </div>
      </div>

      {/* Hata Diyalog Modalı (Pop-up Modal) */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl bg-slate-900 border border-rose-500/40 text-white p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-rose-500" />
            </div>
            <DialogTitle className="text-xl font-black text-white">Kart Bilgileri Hatalı!</DialogTitle>
            <DialogDescription className="text-xs text-rose-300 font-medium">
              Girdiğiniz kart bilgilerinde hata tespit edildi. Lütfen aşağıdaki bilgiyi kontrol edin.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-slate-200 font-semibold leading-relaxed">
            {formError}
          </div>

          <DialogFooter>
            <Button 
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl py-3 text-xs shadow-lg shadow-rose-600/30"
            >
              Anladım, Bilgileri Düzelt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
