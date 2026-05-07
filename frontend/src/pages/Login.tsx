import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2, Leaf, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Arka plan için modern ve canlı bir görsel
const backgroundImageUrl = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop';

interface UserData {
  email: string;
  name?: string;
  dailyCalorieGoal?: number;
  loggedIn?: boolean;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loginError, setLoginError] = useState(''); // Yeni state: giriş hatası
  const navigate = useNavigate();

  // Mock Login Fonksiyonu
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }
    
    setIsLoading(true);
    setLoginError(''); // Hata durumunu sıfırla

    try {
      const response = await axios.post('/login', { email, password }, { withCredentials: true });


      
      // API'den gelen veriyi kontrol edin ve kullanıcı verilerini local storage'a kaydedin
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success("Giriş başarılı!");
      navigate('/dashboard');
    } catch (error) {
      console.error('Giriş hatası:', error);
      
      let errorMessage = 'Giriş başarısız oldu. Lütfen tekrar deneyin.';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = 'E-posta veya parola yanlış.';
          } else if (error.response.data && typeof error.response.data.message === 'string') {
            errorMessage = error.response.data.message;
          } else if (error.response.status === 404) {
            errorMessage = 'Sonuç bulunamadı. Lütfen bilgilerinizi kontrol edin.';
          } else if (error.response.status >= 500) {
            errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
          }
        } else if (error.request) {
          errorMessage = 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Hata mesajının kesinlikle string olduğundan emin ol
      const safeErrorMessage = String(errorMessage);
      setLoginError(safeErrorMessage);
      toast.error(safeErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Şifre sıfırlama fonksiyonu
  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Lütfen e-posta adresinizi girin.');
      return;
    }
    
    setIsResetting(true);
    
    // Şifre sıfırlama simülasyonu
    setTimeout(() => {
      setIsResetting(false);
      setResetSuccess(true);
      
      // 2 saniye sonra modalı kapat
      setTimeout(() => {
        setResetSuccess(false);
        setResetEmail('');
        setForgotPasswordOpen(false);
        toast.success(`Şifre sıfırlama bağlantısı ${resetEmail} adresine gönderildi.`);
      }, 2000);
    }, 1500);
  };

  // Modal kapandığında state'leri sıfırla
  const handleOpenChange = (open: boolean) => {
    setForgotPasswordOpen(open);
    if (!open) {
      setResetSuccess(false);
      setResetEmail('');
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center relative" 
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10 relative"
      >
        <Card className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg border-white/20 text-white shadow-2xl rounded-2xl">
          <CardHeader className="space-y-2 text-center">
            <div className="inline-flex items-center justify-center gap-3">
               <Leaf className="h-8 w-8 text-emerald-400" />
               <CardTitle className="text-3xl font-bold">DiyetGpt</CardTitle>
            </div>
            <CardDescription className="text-gray-300">
              Hesabınıza giriş yaparak sağlıklı yaşam yolculuğunuza devam edin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="ornek@mail.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="pl-10 bg-white/10 border-white/20 focus:bg-white/20 focus:ring-emerald-500 rounded-md" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="pl-10 pr-10 bg-white/10 border-white/20 focus:bg-white/20 focus:ring-emerald-500 rounded-md" 
                    required 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-white">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {/* Hata mesajı gösterimi */}
              {loginError && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md">
                  <p className="text-red-300 text-sm">{loginError}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center text-sm pt-2">
                  <button 
                    type="button" 
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-emerald-400 hover:underline font-medium"
                  >
                    Şifremi Unuttum?
                  </button>
                  <Link to="/register" className="text-gray-300 hover:underline">Hesabın yok mu? Kaydol</Link>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-base py-3 rounded-md transition-all duration-300 transform hover:scale-105" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Giriş Yap'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Şifremi Unuttum Modal - Ön plana çıkması için yüksek z-index */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-900 border border-white/20 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-emerald-600">
                  {resetSuccess ? 'Başarılı!' : 'Şifremi Unuttum'}
                </h2>
                {!resetSuccess && (
                  <button 
                    onClick={() => setForgotPasswordOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {resetSuccess 
                  ? 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' 
                  : 'E-posta adresinizi girerek şifre sıfırlama bağlantısı alabilirsiniz.'}
              </p>
              
              <AnimatePresence mode="wait">
                {resetSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center py-4"
                  >
                    <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
                    <p className="text-lg font-medium text-center text-gray-700 dark:text-gray-300">
                      Şifre sıfırlama bağlantısı <br />
                      <span className="text-emerald-500 font-semibold">{resetEmail}</span> <br />
                      adresine gönderildi.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handlePasswordReset} 
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-gray-700 dark:text-gray-300">E-posta</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input 
                          id="reset-email" 
                          type="email" 
                          placeholder="ornek@mail.com" 
                          value={resetEmail} 
                          onChange={(e) => setResetEmail(e.target.value)} 
                          className="pl-10 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700 focus:ring-emerald-500 rounded-md" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                      <Button 
                        type="submit" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-base py-3 rounded-md transition-all duration-300" 
                        disabled={isResetting}
                      >
                        {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Şifre Sıfırlama Bağlantısı Gönder'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setForgotPasswordOpen(false)}
                      >
                        İptal
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}