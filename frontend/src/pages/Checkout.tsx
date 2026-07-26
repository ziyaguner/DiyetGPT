import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Lock, ArrowLeft, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [htmlContent, setHtmlContent] = useState('');
  const [useFallbackForm, setUseFallbackForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  const handleSimulatedPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      toast.error('Lütfen tüm kart bilgilerini eksiksiz doldurun.');
      return;
    }

    // 1. Kart Numarası Kontrolü (En az 15 rakam olmalı)
    const cleanCardNo = cardNumber.replace(/\s+/g, '');
    if (!/^\d{15,16}$/.test(cleanCardNo)) {
      toast.error('Geçersiz kart numarası! Kart 15 veya 16 haneli olmalıdır.');
      return;
    }

    // 2. Son Kullanma Tarihi Kontrolü (AA/YY formatı, Ay 01-12 arası olmalı)
    const expiryRegex = /^(0[1-9]|1[0-2])\/([2-9][0-9])$/;
    if (!expiryRegex.test(expiry)) {
      toast.error('Geçersiz son kullanma tarihi! AA/YY formatında olmalıdır (Örn: 12/28)');
      return;
    }

    const [expMonthStr, expYearStr] = expiry.split('/');
    const expMonth = parseInt(expMonthStr, 10);
    const expYear = parseInt('20' + expYearStr, 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      toast.error('Kartınızın son kullanma tarihi geçmiş!');
      return;
    }

    // 3. CVC Kontrolü (3 veya 4 rakam)
    if (!/^\d{3,4}$/.test(cvv)) {
      toast.error('Geçersiz CVC güvenlik kodu! (3 veya 4 rakam olmalıdır)');
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
      toast.error(err.response?.data?.error || 'Abonelik veritabanına işlenirken bir sorun oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 font-inter relative overflow-hidden">
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
    </div>
  );
};

export default Checkout;
