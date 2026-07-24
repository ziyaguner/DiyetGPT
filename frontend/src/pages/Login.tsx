import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2, Leaf, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, Activity, Bot } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const backgroundImageUrl = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Geçerli bir e-posta adresi giriniz.');
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const response = await axios.post('/login', { email, password }, { withCredentials: true });
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success("DiyetGPT'ye Hoş Geldiniz!");
      navigate('/dashboard');
    } catch (error) {
      console.error('Giriş hatası:', error);
      let errorMessage = 'Giriş başarısız oldu. Lütfen bilgilerinizi kontrol edin.';
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = 'E-posta veya şifre hatalı.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      setLoginError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Lütfen e-posta adresinizi girin.');
      return;
    }
    
    setIsResetting(true);
    setTimeout(() => {
      setIsResetting(false);
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setResetEmail('');
        setForgotPasswordOpen(false);
        toast.success(`Şifre sıfırlama bağlantısı ${resetEmail} adresine gönderildi.`);
      }, 2000);
    }, 1500);
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-cover bg-center relative overflow-hidden font-inter" 
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      {/* Dark Overlay & Gradient Glows */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Sol Taraf: Marka & Özellikler */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 text-white space-y-6 hidden lg:block pr-6"
        >
          <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full backdrop-blur-md">
            <Leaf className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-300">Yapay Zeka Destekli Beslenme Asistanı</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
            Sağlıklı Yaşam <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              DiyetGPT ile Başlar
            </span>
          </h1>

          <p className="text-slate-300 text-base leading-relaxed">
            Kalori takibi, yapay zeka tabağı analizi, kişiselleştirilmiş diyetler ve kan tahlili yorumlama ile hedeflerinize en hızlı şekilde ulaşın.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-slate-200">Fotoğraftan Anında Besin Değeri Analizi</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <Bot className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-slate-200">Kişiye Özel Akıllı Tarif Sihirbazı</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-slate-200">Detaylı Kalori & Makro Takibi</span>
            </div>
          </div>
        </motion.div>

        {/* Sağ Taraf: Giriş Kartı */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="lg:col-span-6 w-full"
        >
          <Card className="bg-slate-900/80 backdrop-blur-2xl border-slate-700/60 text-white shadow-2xl rounded-3xl overflow-hidden">
            <div className="p-8 sm:p-10 space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-2">
                  <Leaf className="h-8 w-8 text-emerald-400 animate-pulse" />
                </div>
                <h2 className="text-3xl font-black tracking-tight">Tekrar Hoş Geldiniz</h2>
                <p className="text-slate-400 text-sm">Hesabınıza giriş yaparak hedeflerinize devam edin.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 font-semibold text-xs">E-POSTA ADRESİ</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="ornek@diyetgpt.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="pl-12 py-3 bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-slate-300 font-semibold text-xs">ŞİFRE</Label>
                    <button 
                      type="button" 
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold"
                    >
                      Şifremi Unuttum?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="pl-12 pr-12 py-3 bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3.5 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-medium">
                    ⚠️ {loginError}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02]" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Giriş Yapılıyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Giriş Yap</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center pt-2 border-t border-slate-800">
                <span className="text-slate-400 text-sm">Hesabınız yok mu? </span>
                <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold text-sm">
                  Hemen Kaydolun
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Şifre Sıfırlama Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-emerald-400">
                {resetSuccess ? 'Bağlantı Gönderildi' : 'Şifremi Unuttum'}
              </h3>
              {!resetSuccess && (
                <button 
                  onClick={() => setForgotPasswordOpen(false)}
                  className="text-slate-400 hover:text-white text-xl font-bold"
                >
                  ✕
                </button>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {resetSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                  <CheckCircle2 className="h-14 w-14 text-emerald-400 animate-bounce" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Şifre sıfırlama bağlantısı <br />
                    <span className="text-emerald-400 font-bold">{resetEmail}</span> adresine gönderildi.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Kayıtlı e-posta adresinizi girin. Size sıfırlama bağlantısı göndereceğiz.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-slate-300 text-xs">E-POSTA</Label>
                    <Input 
                      id="reset-email" 
                      type="email" 
                      placeholder="ornek@diyetgpt.com" 
                      value={resetEmail} 
                      onChange={(e) => setResetEmail(e.target.value)} 
                      className="bg-slate-800 border-slate-700 text-white rounded-2xl py-3" 
                      required 
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-3" 
                      disabled={isResetting}
                    >
                      {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gönder'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl"
                      onClick={() => setForgotPasswordOpen(false)}
                    >
                      İptal
                    </Button>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  );
}