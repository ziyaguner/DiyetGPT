import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle2, Leaf, Activity, Flame, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const backgroundImageUrl = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop';

const activityLevels = {
  sedentary: 'Hareketsiz (Masa başı iş, az hareket)',
  lightlyActive: 'Hafif Aktif (Haftada 1-3 gün spor)',
  moderatelyActive: 'Orta Aktif (Haftada 3-5 gün spor)',
  veryActive: 'Çok Aktif (Haftada 6-7 gün spor)',
  extraActive: 'Ekstra Aktif (Ağır egzersiz / sporcu)',
};

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    activityLevel: 'sedentary'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const key in formData) {
      if (!formData[key as keyof typeof formData]) {
        toast.error('Lütfen tüm alanları doldurun.');
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor.');
      return;
    }

    const age = parseInt(formData.age);
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);

    if (isNaN(age) || age < 10 || age > 100) {
      toast.error('Lütfen geçerli bir yaş girin (10-100).');
      return;
    }

    if (isNaN(weight) || weight < 30 || weight > 300) {
      toast.error('Lütfen geçerli bir kilo girin (30-300).');
      return;
    }

    if (isNaN(height) || height < 100 || height > 250) {
      toast.error('Lütfen geçerli bir boy girin (100-250).');
      return;
    }

    setIsLoading(true);

    const payload = {
      ...formData,
      age,
      weight,
      height
    };

    try {
      let response;
      try {
        response = await axios.post('/register', payload);
      } catch (err: any) {
        if (err.response?.status === 404) {
          response = await axios.post('/api/register', payload);
        } else {
          throw err;
        }
      }
      if (response.status === 201 || response.status === 200) {
        localStorage.setItem('activeTab', 'personal-screen');
        toast.success('Kayıt başarıyla tamamlandı!');
        setRegistrationSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 1800);
      }
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      const errorMsg = error.response?.data?.message || 'Kayıt sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edin.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-cover bg-center relative overflow-hidden font-inter"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl z-10"
      >
        <Card className="bg-slate-900/90 backdrop-blur-2xl border-slate-700/60 text-white shadow-2xl rounded-3xl overflow-hidden p-6 sm:p-8">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <Leaf className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">DiyetGPT'ye Katılın</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Kişiselleştirilmiş beslenme & kalori takibine ilk adımı atın.</p>
          </div>

          <AnimatePresence mode="wait">
            {registrationSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-12 text-center space-y-4"
              >
                <CheckCircle2 className="h-16 w-16 text-emerald-400 animate-bounce" />
                <h3 className="text-2xl font-black">Tebrikler! Kayıt Başarılı</h3>
                <p className="text-slate-300 text-sm">Giriş sayfasına yönlendiriliyorsunuz...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* HESAP BİLGİLERİ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-slate-300 text-xs font-bold">AD SOYAD</Label>
                    <Input name="name" placeholder="Ahmet Yılmaz" value={formData.name} onChange={handleInputChange} className="bg-slate-800/80 border-slate-700 rounded-xl py-2.5 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-300 text-xs font-bold">E-POSTA</Label>
                    <Input name="email" type="email" placeholder="ahmet@example.com" value={formData.email} onChange={handleInputChange} className="bg-slate-800/80 border-slate-700 rounded-xl py-2.5 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-300 text-xs font-bold">ŞİFRE</Label>
                    <Input name="password" type="password" placeholder="En az 6 karakter" value={formData.password} onChange={handleInputChange} className="bg-slate-800/80 border-slate-700 rounded-xl py-2.5 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-300 text-xs font-bold">ŞİFRE TEKRAR</Label>
                    <Input name="confirmPassword" type="password" placeholder="Şifreyi doğrula" value={formData.confirmPassword} onChange={handleInputChange} className="bg-slate-800/80 border-slate-700 rounded-xl py-2.5 text-sm" />
                  </div>
                </div>

                {/* FİZİKSEL BİLGİLER */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-emerald-400 block mb-2">VÜCUT BİLGİLERİNİZ</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-slate-300 text-xs">YAŞ</Label>
                      <Input name="age" type="number" placeholder="25" value={formData.age} onChange={handleInputChange} className="bg-slate-800/80 border-slate-700 rounded-xl text-center py-2.5 text-sm font-bold" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-slate-300 text-xs">KİLO (KG)</Label>
                      <Input name="weight" type="number" step="0.1" placeholder="70" value={formData.weight} onChange={handleInputChange} className="bg-slate-800/80 border-slate-700 rounded-xl text-center py-2.5 text-sm font-bold" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-slate-300 text-xs">BOY (CM)</Label>
                      <Input name="height" type="number" placeholder="175" value={formData.height} onChange={handleInputChange} className="bg-slate-800/80 border-slate-700 rounded-xl text-center py-2.5 text-sm font-bold" />
                    </div>
                  </div>
                </div>

                {/* CİNSİYET & AKTİVİTE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <Label className="text-slate-300 text-xs font-bold">CİNSİYET</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectChange('gender', 'male')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                          formData.gender === 'male' 
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <User className="h-4 w-4" /> Erkek
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectChange('gender', 'female')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                          formData.gender === 'female' 
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <User className="h-4 w-4" /> Kadın
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-slate-300 text-xs font-bold">AKTİVİTE SEVİYESİ</Label>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                      {Object.entries(activityLevels).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectChange('activityLevel', key)}
                          className={`w-full p-2 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                            formData.activityLevel === key
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <Activity className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 mt-4 transition-all duration-300" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Hesabımı Oluştur</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>
            )}
          </AnimatePresence>

          <div className="mt-4 text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            Zaten bir hesabınız var mı?{' '}
            <Link to="/login" className="text-emerald-400 font-bold hover:underline">
              Giriş Yapın
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}