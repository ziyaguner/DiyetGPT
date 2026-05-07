
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle, Leaf, Weight, TrendingUp, UserCog, Bot } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const backgroundImageUrl = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop';

// Aktivite seviyeleri için bir obje oluşturalım
const activityLevels = {
  sedentary: 'Hareketsiz (çok az egzersiz)',
  lightlyActive: 'Hafif Aktif (haftada 1-3 gün spor)',
  moderatelyActive: 'Orta Derecede Aktif (haftada 3-5 gün spor)',
  veryActive: 'Çok Aktif (haftada 6-7 gün spor)',
  extraActive: 'Ekstra Aktif (günde iki kez antrenman)',
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
    gender: '',
    activityLevel: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    e.preventDefault(); // Bu satır en üstte olmalı!
    console.log("Butona tıklandı! Form verileri:", formData); // Bunu mutlaka ekleyin

    // HTML required'ları sildiğimiz için manuel kontrol şart:
    // Boş alan kontrolü
    for (const key in formData) {
        if (!formData[key as keyof typeof formData]) {
            console.log("Boş alan yakalandı:", key); // Hangi alanın boş olduğunu görün
            toast.error(`Lütfen ${key} alanını doldurun.`);
            return;
        }
    }

    if (formData.password !== formData.confirmPassword) {
        toast.error('Şifreler eşleşmiyor');
        return;
    }

    setIsLoading(true);

    // Sayısal dönüşümler
    const payload = {
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height)
    };

    try {
        console.log("İstek gönderiliyor...", payload);
        const response = await axios.post('/register', payload);
        
        if (response.status === 201) {
            toast.success('Kayıt başarıyla tamamlandı!');
            setRegistrationSuccess(true);
            
            // 2 saniye sonra giriş sayfasına yönlendir
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    } catch (error: any) {
        console.error("Hata oluştu:", error);
        const errorMsg = error.response?.data?.message || 'Kayıt sırasında bir hata oluştu.';
        toast.error(errorMsg);
    } finally {
        setIsLoading(false);
    }
  };
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg border-white/20 text-white shadow-2xl rounded-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <Leaf className="h-7 w-7 text-emerald-400" />
              <CardTitle className="text-2xl font-bold">DiyetGpt'ye Katıl</CardTitle>
            </div>
            <CardDescription className="text-gray-300">
              Sağlıklı yaşam hedeflerinize ulaşmak için ilk adımı atın.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {registrationSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
                  <h3 className="text-xl font-bold text-center mb-2">Harika! Kayıt Başarılı!</h3>
                  <p className="text-gray-300 text-center">
                    Giriş sayfasına yönlendiriliyorsunuz...
                  </p>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleRegister} 
                  className="space-y-3"
                >
                  {/* HESAP BİLGİLERİ */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-xs">İsim</Label>
                      <Input name="name" placeholder="Ad Soyad" value={formData.name} onChange={handleInputChange} className="bg-white/10 border-white/20"  />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-xs">E-posta</Label>
                      <Input name="email" type="email" placeholder="ornek@mail.com" value={formData.email} onChange={handleInputChange} className="bg-white/10 border-white/20"  />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-xs">Şifre</Label>
                      <Input name="password" type="password" placeholder="min. 6 karakter" value={formData.password} onChange={handleInputChange} className="bg-white/10 border-white/20"  />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-xs">Şifre Tekrar</Label>
                      <Input name="confirmPassword" type="password" placeholder="Şifreyi onayla" value={formData.confirmPassword} onChange={handleInputChange} className="bg-white/10 border-white/20"  />
                    </div>
                  </div>
                  
                  {/* FİZİKSEL BİLGİLER */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-xs">Yaş</Label>
                      <Input name="age" type="number" placeholder="25" value={formData.age} onChange={handleInputChange} className="bg-white/10 border-white/20"  />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-xs">Kilo (kg)</Label>
                      <Input name="weight" type="number" step="0.1" placeholder="70.5" value={formData.weight} onChange={handleInputChange} className="bg-white/10 border-white/20"  />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-300 text-xs">Boy (cm)</Label>
                      <Input name="height" type="number" placeholder="175" value={formData.height} onChange={handleInputChange} className="bg-white/10 border-white/20"  />
                    </div>
                  </div>
                  
                  {/* YAŞAM TARZI */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                        <Label className="text-gray-300 text-xs">Cinsiyet</Label>
                        <Select name="gender" onValueChange={(value) => handleSelectChange('gender', value)}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-gray-300">
                                <SelectValue placeholder="Seçiniz..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-white/20">
                                <SelectItem value="male">Erkek</SelectItem>
                                <SelectItem value="female">Kadın</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-gray-300 text-xs">Aktivite Seviyesi</Label>
                        <Select name="activityLevel" onValueChange={(value) => handleSelectChange('activityLevel', value)}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-gray-300">
                                <SelectValue placeholder="Seçiniz..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-white/20">
                                {Object.entries(activityLevels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-base py-3 rounded-md mt-4" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Hesabımı Oluştur'}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-300">Zaten hesabın var mı? </span>
              <Link to="/login" className="text-emerald-400 font-medium hover:underline">
                Giriş Yap
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}