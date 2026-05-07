import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import { Search, Plus, Trash2, Calculator, LogOut, Clock, Check, X, Leaf, Dumbbell, BookOpen, Star, Sparkles, User as UserIcon, Settings, Save, Image, ChevronLeft, ChevronRight, Menu, Sun, Moon, Info, Flame, TrendingUp, TrendingDown, RefreshCw, BarChart2, Pencil, Bot, MessageSquareText, Droplet, CookingPot, Scale, Ruler, ClipboardList, Calendar, Layers, Target, GlassWater,} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { foods, foodCategories, searchFoods, getFoodsByCategory, type Food } from '../../../data/foods';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Progress } from '../../components/ui/progress';
import { popularDiets, Diet, DietDay } from '../../../data/diets';
import { Textarea } from '../../components/ui/textarea';
import { motion, AnimatePresence, cubicBezier } from 'framer-motion';
import axios from 'axios';
import type { Recipe, Exercise } from '../../../data/mockContent';
import  { mockRecipes, exercises } from '../../../data/mockContent';
import { BatteryCharging, CloudLightning, Activity, Heart, MessageCircle,Coffee, Pizza, Fish, Slice } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Bar, PieChart, Pie, Cell,Legend,Area } from 'recharts';


// axios.defaults.baseURL = 'http://localhost:5000'; // Silindi
axios.defaults.withCredentials = true;
const API_BASE_URL = ''; // Boş bırakıldı, proxy kullanılacak


// Güvenli numeric dönüşüm helper'ı
const toNumber = (v: any) => {
  // hem null/undefined hem de "200 kcal" gibi string'leri güvenli parse eder
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  // strip non-digit except dot and minus
  const s = String(v).replace(/[^\d.-]/g, '');
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
};


// Cinsiyet tipi tanımlaması
type Gender = 'male' | 'female';
// Aktivite seviyesi anahtarı tipi tanımlaması
type ActivityKey =
  | 'sedentary'
  | 'lightlyActive'
  | 'moderatelyActive'
  | 'veryActive'
  | 'extraActive';

// Aktivite faktörleri
const ACTIVITY_FACTOR: Record<ActivityKey, number> = {
  sedentary: 1.2,
  lightlyActive: 1.375,
  moderatelyActive: 1.55,
  veryActive: 1.725,
  extraActive: 1.9,
};

// Mifflin-St Jeor BMR (Bazal Metabolizma Hızı) hesaplama fonksiyonu
export function calcBMR(
  gender: Gender,
  age: number,
  height: number, // cm
  weight: number  // kg
): number {
  const bmr =
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  return Math.round(bmr);
}

// Günlük Kalori Hedefi hesaplama fonksiyonu
export function calcDailyGoal(
  gender: Gender,
  age: number,
  height: number,
  weight: number,
  activity: ActivityKey
): number {
  const bmr = calcBMR(gender, age, height, weight);
  const factor = ACTIVITY_FACTOR[activity] ?? 1.2;
  return Math.round(bmr * factor);
}

// Tüketilen yiyecekleri takip etmek için arayüz
interface ConsumedFood extends Food {
  amount: number;
  totalCalories: number;
  mealTime: string;
  date: string;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

// Yakılan egzersizleri takip etmek için arayüz
interface BurnedExercise {
  id: string; // Benzersiz ID eklendi
  name: string;
  minutes: number;
  totalCaloriesBurned: number;
  date: string;
}

// Kullanıcı profili için arayüz
interface User {
  name: string;
  email: string;
  loggedIn: boolean;
  dailyCalorieGoal: number;
  age?: number;
  weight?: number;
  height?: number;
  weightUnit: string;
  heightUnit: string;
  gender?: 'male' | 'female';
  activityLevel?: 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'veryActive' | 'extraActive';
  // YENİ EKLENTİLER
  packageInfo?: {
    PackageID: number;
    PackageName: 'Basic' | 'Normal' | 'Premium';
    SubscriptionEnds?: string | null;
    Limits: {
      PhotoAnalysis: { used: number; limit: number | null };
      MealSuggestion: { used: number; limit: number | null };
      BloodTest: { used: number; limit: number | null };
    };
  };
}

// Günlük istatistikleri takip etmek için arayüz (şu an kullanılmıyor ama gelecekte kullanılabilir)
interface DailyStats {
  date: string;
  dayName: string;
  totalCalories: number;
  totalBurned: number;
  netCalories: number;
  meals: { time: string; foods: ConsumedFood[] }[];
  goal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalWater: number;
}



// Fotoğraf analizi için besin değerleri arayüzü
interface AnalyzedNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  grams: number;
}

// Food log için reducer action tipleri
type FoodAction =
  | { type: "ADD_FOOD"; payload: ConsumedFood }
  | { type: "REMOVE_FOOD"; payload: number }
  | { type: "LOAD_FOODS"; payload: ConsumedFood[] }
  | { type: "CLEAR_FOODS" };

  type RecipeSuggestion = {
  recipe: string;
  ingredients: {
    name: string;
    isUserIngredient: boolean;
  }[];
};

// Food log için reducer fonksiyonu
function foodLogReducer(state: ConsumedFood[], action: FoodAction): ConsumedFood[] {
  switch (action.type) {
    case "ADD_FOOD":
      return [...state, action.payload];
    case "REMOVE_FOOD":
      return state.filter((f) => f.id !== action.payload);
    case "LOAD_FOODS":
      return action.payload;
    case "CLEAR_FOODS":
      return [];
    default:
      return state;
  }
}

// Egzersiz log için reducer action tipleri
type ExerciseAction =
  | { type: "ADD_EXERCISE"; payload: BurnedExercise }
  | { type: "REMOVE_EXERCISE"; payload: string } // payload artık id
  | { type: "LOAD_EXERCISES"; payload: BurnedExercise[] }
  | { type: "CLEAR_EXERCISES" };

// Egzersiz log için reducer fonksiyonu
function exerciseLogReducer(state: BurnedExercise[], action: ExerciseAction): BurnedExercise[] {
  switch (action.type) {
    case "ADD_EXERCISE":
      return [...state, action.payload];
    case "REMOVE_EXERCISE":
      return state.filter((entry) => entry.id !== action.payload);
    case "LOAD_EXERCISES":
      return action.payload;
    case "CLEAR_EXERCISES":
      return [];
    default:
      return state;
  }
}

// Öğün zamanları listesi
const mealTimes = ['Kahvaltı', 'Ara Öğün', 'Öğle Yemeği', 'Akşam Yemeği', 'Gece'];

// Aktivite seviyeleri ve faktörleri
const activityLevels = {
  sedentary: { label: 'Hareketsiz (çok az egzersiz)', factor: 1.2 },
  lightlyActive: { label: 'Hafif Aktif (haftada 1-3 gün spor)', factor: 1.375 },
  moderatelyActive: { label: 'Orta Derecede Aktif (haftada 3-5 gün spor)', factor: 1.55 },
  veryActive: { label: 'Çok Aktif (haftada 6-7 gün spor)', factor: 1.725 },
  extraActive: { label: 'Ekstra Aktif (günde iki kez antrenman)', factor: 1.9 },
};

// Günlük ipuçları listesi (genişletilmiş)
const dailyTips = [
  "Yeterli su içmek metabolizmanızı hızlandırır ve kilo vermenize yardımcı olur. Günde en az 8 bardak su içmeyi hedefleyin.",
  "Güne protein ağırlıklı bir kahvaltıyla başlamak, tokluk hissini artırır ve gün boyu atıştırma isteğinizi azaltır.",
  "Her gün en az 30 dakika orta yoğunlukta egzersiz yapmaya özen gösterin. Yürüyüş, koşu veya bisiklet harika seçeneklerdir.",
  "Uyku kalitesi, kilo kontrolü ve genel sağlık için kritik öneme sahiptir. Düzenli uyku saatleri belirlemeye çalışın.",
  "İşlenmiş gıdalar yerine tam tahıllı ürünler, taze sebze ve meyveler gibi doğal besinler tercih edin.",
  "Duygusal açlık ile fiziksel açlık arasındaki farkı anlamaya çalışın. Stresli veya sıkıldığınız zamanlarda yemek yemek yerine farklı aktivitelere yönelin.",
  "Yemeklerinizi yavaş ve farkındalıkla yiyin, bu sindirimi iyileştirir ve daha çabuk doygunluk hissetmenizi sağlar.",
  "Her öğüne bir sebze veya salata eklemek, lif alımınızı artırır ve tokluk sürenizi uzatır.",
  "Kas kazanımı ve korunması için protein alımınıza dikkat edin. Her öğünde yeterli miktarda protein bulundurun.",
  "Antrenman öncesi kompleks karbonhidratlar, sonrası ise protein tüketimi performansı artırır ve kas toparlanmasını hızlandırır.",
  "Stres yönetimi, kortizol seviyelerini düşürerek kilo kontrolüne ve genel sağlığa olumlu katkıda bulunur. Meditasyon veya yoga deneyebilirsiniz.",
  "Günlük adım hedefinizi belirleyin ve ona ulaşmaya çalışın. Bir adımsayar veya akıllı saat kullanmak motive edici olabilir.",
  "Şekerli içecekler yerine su, maden suyu, şekersiz bitki çayları veya taze sıkılmış meyve suları tercih edin.",
  "Evde yemek yapmak, porsiyon kontrolü sağlamanın ve sağlıklı beslenme alışkanlıkları kazanmanın en iyi yollarından biridir.",
  "Alkol tüketimini sınırlamak, boş kalori alımını azaltır ve karaciğer sağlığınızı korur.",
  "Sağlıklı atıştırmalıklar (kuruyemiş, meyve, yoğurt) her zaman elinizin altında olsun, böylece sağlıksız seçeneklere yönelmezsiniz.",
  "Lifli gıdalar (sebze, meyve, tam tahıllar, baklagiller) sindirim sağlığı için çok önemlidir ve uzun süre tok kalmanızı sağlar.",
  "Dışarıda yemek yerken salata, ızgara veya buharda pişirilmiş seçenekleri tercih edin. Sosları ayrı istemeyi unutmayın.",
  "Egzersiz rutininizi çeşitlendirin, böylece vücudunuz alışmasın ve sürekli gelişim sağlasın. Farklı kas gruplarını çalıştırmaya özen gösterin.",
  "Kendinizi bir günde çok zorlamayın, dinlenmeye de zaman ayırın. Dinlenme, kasların onarılması ve büyümesi için hayati öneme sahiptir.",
  "Sabahları bir bardak limonlu ılık su içmek sindiriminizi canlandırabilir.",
  "Yeşil çay, antioksidanlar açısından zengindir ve metabolizmayı hızlandırmaya yardımcı olabilir.",
  "Porsiyonlarınızı küçültmek için daha küçük tabaklar kullanmayı deneyin.",
  "Yemeklerinizi hazırlarken tuz yerine baharat ve otları tercih edin.",
  "Haftada en az iki kez balık tüketmek omega-3 alımınızı artırır.",
  "Şekerli atıştırmalıklar yerine taze meyve veya kuru yemişleri tercih edin.",
  "Yemeklerden önce bir bardak su içmek, daha az yemenize yardımcı olabilir.",
  "Masa başında çalışanlar için her saat başı kısa molalar verip hareket etmek kan dolaşımını hızlandırır.",
  "Sebzeleri farklı pişirme yöntemleriyle (fırında, buharda, ızgarada) deneyerek çeşitlilik sağlayın.",
  "Gıda etiketlerini okumayı öğrenin ve besin değerlerine dikkat edin.",
  "Vitamin ve mineral takviyelerini doktor kontrolünde kullanın.",
  "Duygusal yeme tetikleyicilerinizi belirleyin ve bunlarla başa çıkma stratejileri geliştirin.",
  "Uzun süreli açlıklardan kaçının, düzenli ve dengeli öğünler tüketin.",
  "Akşam yemeklerinde hafif ve sindirimi kolay besinler tercih edin.",
  "Bağırsak sağlığı için probiyotik içeren gıdaları (yoğurt, kefir) beslenmenize ekleyin.",
  "Açık havada egzersiz yapmak hem fiziksel hem de zihinsel sağlığınız için faydalıdır.",
  "Yemek planlaması yapmak, sağlıklı beslenme hedeflerinize ulaşmanıza yardımcı olur.",
  "Yemek hazırlıklarını önceden yapmak, yoğun günlerde sağlıklı seçeneklere yönelmenizi sağlar.",
  "Meditasyon ve derin nefes egzersizleri stres seviyesini düşürmede etkilidir.",
  "Günlük kafein alımınızı takip edin ve akşam saatlerinde aşırıya kaçmamaya özen gösterin.",
  "Sosyal medyada sağlıklı yaşam topluluklarını takip etmek motivasyonunuzu artırabilir.",
  "Yeni tarifler denemek ve sağlıklı beslenmeyi eğlenceli hale getirmek için mutfakta yaratıcı olun.",
  "Vücudunuzun sinyallerini dinleyin; açlık ve tokluk hislerinize dikkat edin.",
  "Öğün aralarında sağlıklı atıştırmalıklar tercih edin, ancak porsiyon kontrolünü unutmayın.",
  "Kaslarınızı güçlendirmek için ağırlık antrenmanlarını rutininize ekleyin.",
  "Egzersiz yaparken doğru form ve tekniğe dikkat edin, gerekirse bir uzmandan yardım alın.",
  "Düzenli sağlık kontrollerinizi yaptırmayı ihmal etmeyin.",
  "Kişisel hedeflerinizi belirleyin ve küçük, ulaşılabilir adımlarla ilerleyin.",
  "Kendinize karşı sabırlı ve nazik olun, sağlıklı yaşam bir süreçtir.",
  "Tatil ve özel günlerde de dengeli beslenmeye özen gösterin, ancak kendinizi aşırı kısıtlamayın."
];

// Temel Fotoğraf Analizi için arayüz (genişlik, yükseklik vb.)
type PhotoMetadata = {
  width: number;
  height: number;
  sizeKB: number;
  avgRGB: [number, number, number];
};


// Yardımcı Bileşenler
// Besin kartı bileşeni
const NutrientCard = ({
  title,
  value,
  unit,
  icon,
  color,
  bgColor,
}: {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) => (
  <Card className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center">
    <div className={`p-3 rounded-full mr-4 ${bgColor}`}>
      {React.cloneElement(icon as React.ReactElement, { className: `h-6 w-6 ${color}` })}
    </div>
    <div>
      <CardDescription className="text-sm text-gray-500 dark:text-gray-400">{title}</CardDescription>
      <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
        {value} <span className="text-lg font-medium text-gray-600 dark:text-gray-300">{unit}</span>
      </CardTitle>
    </div>
  </Card>
);

const PackagesScreen = ({ user, setUser }: { user: User | null, setUser: React.Dispatch<React.SetStateAction<User | null>> }) => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<{id: number, name: string, price: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  if (!user || !user.packageInfo) return <div className="p-6">Paket bilgileri yükleniyor...</div>;

  const currentPackage = user.packageInfo.PackageName;
  const limits = user.packageInfo.Limits;

  const handleOpenCheckout = (pkgId: number, pkgName: string, pkgPrice: string) => {
    setSelectedPkg({ id: pkgId, name: pkgName, price: pkgPrice });
    setCheckoutOpen(true);
  };

  const handleSubscribe = async () => {
    if (!selectedPkg) return;
    setIsProcessing(true);
    
    // Satın alma simülasyonu (Gerçekte Stripe vb. entegre edilir)
    setTimeout(async () => {
      try {
        const response = await axios.post('/api/subscribe', { packageId: selectedPkg.id, packageName: selectedPkg.name });
        toast.success(response.data.message || "Ödeme başarılı! Paketiniz yükseltildi.");
        
        setUser(prevUser => {
          if (prevUser) {
             const newPackageInfo = {
               ...prevUser.packageInfo,
               PackageID: selectedPkg.id,
               PackageName: selectedPkg.name as 'Basic' | 'Normal' | 'Premium',
               Limits: { 
                  PhotoAnalysis: { used: 0, limit: selectedPkg.id === 1 ? 1 : selectedPkg.id === 2 ? 15 : null },
                  MealSuggestion: { used: 0, limit: selectedPkg.id === 1 ? 1 : selectedPkg.id === 2 ? 5 : null },
                  BloodTest: { used: 0, limit: selectedPkg.id === 1 ? 1 : selectedPkg.id === 2 ? 1 : null },
               }
             };
             return { ...prevUser, packageInfo: newPackageInfo };
          }
          return null;
        });
        setCheckoutOpen(false);
        setCardNumber('');
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Abonelik işlemi başarısız oldu.');
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  const packageData = [
    { 
      id: 1, 
      name: 'Basic Paket', 
      price: 'Ücretsiz', 
      desc: 'Sınırlı deneme sürümü.', 
      features: [
        `Tüm özellikler: 1 kez/ay kullanım`,
        'Aylık yenilenir.',
        'Sınırlı destek.'
      ],
      buttonText: currentPackage === 'Basic' ? 'Mevcut Paketiniz' : 'Bu Pakete Geç',
      isCurrent: currentPackage === 'Basic',
      color: 'text-slate-600 dark:text-slate-300',
      bg: 'bg-slate-50 dark:bg-slate-800',
      buttonVariant: 'outline' as const,
      popular: false
    },
    { 
      id: 2, 
      name: 'Normal Paket', 
      price: '$1 / ay', 
      desc: 'Temel analizler için ideal.', 
      features: [
        `Fotoğraf Analizi: 15 kez/ay`,
        `Yemek Önerisi: 5 kez/ay`,
        `Kan Tahlili Analizi: 1 kez/ay`,
        'Aylık otomatik yenilenir.',
      ],
      buttonText: currentPackage === 'Normal' ? 'Mevcut Paketiniz' : '$1 ile Satın Al',
      isCurrent: currentPackage === 'Normal',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      buttonVariant: 'default' as const,
      popular: false
    },
    { 
      id: 3, 
      name: 'Premium Paket', 
      price: '$2 / ay', 
      desc: 'Sınırsız özellikler ve tam destek.', 
      features: [
        'Tüm AI özellikleri sınırsız kullanım!',
        '7/24 Öncelikli destek.',
        'Yeni özelliklere erken erişim.'
      ],
      buttonText: currentPackage === 'Premium' ? 'Mevcut Paketiniz' : '$2 ile Satın Al',
      isCurrent: currentPackage === 'Premium',
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      buttonVariant: 'default' as const,
      popular: true
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 space-y-8">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-center">
          <Star className="h-10 w-10 mr-4 text-yellow-500 fill-yellow-500" /> Premium Deneyim
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Sağlık hedeflerinize daha hızlı ulaşın. İhtiyaçlarınıza en uygun paketi seçin ve DiyetGPT'nin tam potansiyelini keşfedin.
          <br/><span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-2 block">Mevcut paketiniz: {currentPackage}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {packageData.map((pkg) => (
          <div key={pkg.id} className={`relative flex flex-col ${pkg.popular ? 'transform md:-translate-y-4' : ''}`}>
            {pkg.popular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  En Popüler
                </span>
              </div>
            )}
            <Card 
              className={`flex-1 flex flex-col overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl ${pkg.isCurrent ? 'border-emerald-500 shadow-emerald-500/20 shadow-xl' : pkg.popular ? 'border-amber-400 shadow-xl' : 'border-transparent dark:border-slate-700 hover:-translate-y-2'}`}
            >
              <div className={`text-center p-8 ${pkg.isCurrent ? 'bg-emerald-500 text-white' : pkg.popular ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white' : pkg.bg}`}>
                <h3 className={`text-2xl font-bold mb-2 ${pkg.isCurrent || pkg.popular ? 'text-white' : pkg.color}`}>{pkg.name}</h3>
                <div className="flex justify-center items-baseline mb-4">
                  <span className={`text-5xl font-extrabold ${pkg.isCurrent || pkg.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{pkg.price.split(' ')[0]}</span>
                  {pkg.price.includes('/') && <span className={`text-lg ml-1 ${pkg.isCurrent || pkg.popular ? 'text-white/80' : 'text-gray-500'}`}>/ ay</span>}
                </div>
                <p className={`text-sm ${pkg.isCurrent || pkg.popular ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>{pkg.desc}</p>
              </div>
              
              <CardContent className="p-8 flex flex-col flex-1 bg-white dark:bg-slate-900">
                <ul className="space-y-4 mb-8 flex-1">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                      <div className={`mt-1 mr-3 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${pkg.popular ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        <Check className="h-3 w-3 font-bold" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full py-6 text-lg font-bold shadow-lg transition-all rounded-xl ${pkg.isCurrent ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-default' : pkg.popular ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white hover:shadow-amber-500/50' : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200'}`}
                  variant={pkg.isCurrent ? 'secondary' : 'default'}
                  disabled={pkg.isCurrent}
                  onClick={() => pkg.isCurrent ? null : handleOpenCheckout(pkg.id, pkg.name, pkg.price)}
                >
                  {pkg.buttonText}
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Satın Alma / Ödeme Modalı */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <DialogHeader className="pt-6">
            <DialogTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">Güvenli Ödeme</DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              {selectedPkg?.name} için ödeme işlemini tamamlayın.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4 px-2">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex justify-between items-center border border-slate-100 dark:border-slate-700">
              <span className="font-medium text-slate-700 dark:text-slate-300">Seçilen Paket</span>
              <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{selectedPkg?.name}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex justify-between items-center border border-slate-100 dark:border-slate-700">
              <span className="font-medium text-slate-700 dark:text-slate-300">Ödenecek Tutar</span>
              <span className="font-bold text-2xl text-gray-900 dark:text-white">{selectedPkg?.price}</span>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                <Label htmlFor="card-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Kart Üzerindeki İsim</Label>
                <Input id="card-name" placeholder="Ad Soyad" className="rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-emerald-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-number" className="text-sm font-medium text-slate-700 dark:text-slate-300">Kart Numarası (Test)</Label>
                <Input 
                  id="card-number" 
                  placeholder="0000 0000 0000 0000" 
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  className="rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-emerald-500 font-mono" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card-expiry" className="text-sm font-medium text-slate-700 dark:text-slate-300">Son Kullanma</Label>
                  <Input id="card-expiry" placeholder="AA/YY" maxLength={5} className="rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-emerald-500 font-mono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-cvc" className="text-sm font-medium text-slate-700 dark:text-slate-300">CVC</Label>
                  <Input id="card-cvc" placeholder="123" maxLength={3} type="password" className="rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-emerald-500 font-mono" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between border-t border-slate-100 dark:border-slate-800 pt-4 pb-2">
            <Button type="button" variant="ghost" onClick={() => setCheckoutOpen(false)} className="rounded-xl text-slate-500">
              İptal
            </Button>
            <Button 
              type="button" 
              onClick={handleSubscribe} 
              disabled={isProcessing}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-lg shadow-emerald-500/30 transition-all"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> İşleniyor...
                </>
              ) : (
                'Şimdi Satın Al'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Ana Dashboard Bileşeni
export default function Dashboard() {
  
  // Uygulama ayarları (yerel olarak saklanır)
  type AppSettings = {
    notifications: boolean;
    weightUnit: 'kg' | 'lb';
    heightUnit: 'cm' | 'in';
    language: 'tr' | 'en';
  };

  const defaultAppSettings: AppSettings = {
    notifications: true,
    weightUnit: 'kg',
    heightUnit: 'cm',
    language: 'tr',
  };

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem('appSettings');
      return raw ? JSON.parse(raw) as AppSettings : defaultAppSettings;
    } catch {
      return defaultAppSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(appSettings));
    } catch {}
  }, [appSettings]);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // --- STATE YÖNETİMİ ---
  
  const [user, setUser] = useState<User | null>(null); // Kullanıcı bilgileri
  const [foodQuery, setFoodQuery] = useState(''); // Yemek arama sorgusu
  const [searchResults, setSearchResults] = useState<Food[]>([]); // Yemek arama sonuçları
  const [selectedMeal, setSelectedMeal] = useState<'Kahvaltı' | 'Ara Öğün' | 'Öğle Yemeği' | 'Akşam Yemeği' | 'Gece' | ''>(''); // Seçilen öğün zamanı
  const [isFoodDialogOpen, setIsFoodDialogOpen] = useState(false); // Yemek ekleme diyaloğu açık mı
  const [foodDialogContent, setFoodDialogContent] = useState<Food | null>(null); // Diyalogda gösterilecek yemek
  const [foodQuantity, setFoodQuantity] = useState(100); // Eklenen yiyecek miktarı
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark'); // Koyu mod durumu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobil menü açık mı
  const [selectedDiet, setSelectedDiet] = useState<Diet | null>(null); // Seçilen diyet
  const [isDietDialogOpen, setIsDietDialogOpen] = useState(false); // Diyet detayı diyaloğu açık mı
  const [recipeDialog, setRecipeDialog] = useState<Recipe | null>(null); // Seçilen tarif
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false); // Tarif detayı diyaloğu açık mı
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState(''); // Egzersiz arama sorgusu
  const [selectedExerciseType, setSelectedExerciseType] = useState<string>('all'); // Egzersiz tipi filtresi
  const [selectedExerciseDifficulty, setSelectedExerciseDifficulty] = useState<string>('all'); // Egzersiz zorluk filtresi
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null); // Seçilen egzersiz
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false); // Egzersiz ekleme diyaloğu açık mı
  const [exerciseMinutes, setExerciseMinutes] = useState(''); // Egzersiz süresi (dakika)
  const [waterAmount, setWaterAmount] = useState(''); // Su miktarı (ml)
  const [isWaterDialogOpen, setIsWaterDialogOpen] = useState(false); // Su ekleme diyaloğu açık mı
  const [totalWaterIntake, setTotalWaterIntake] = useState(0); // SQL'den gelecek toplam su
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().slice(0, 10)); // Mevcut tarih
  const [dailyNote, setDailyNote] = useState(''); // Günlük not
  const [aiChatMessages, setAiChatMessages] = useState<{ role: 'user' | 'bot', message: string, timestamp: Date }[]>([]); // AI sohbet mesajları
  const [aiInput, setAiInput] = useState(''); // AI sohbet giriş alanı
  const [aiLoading, setAiLoading] = useState(false); // AI yükleme durumu
  const [activeTab, setActiveTab] = useState('personal-screen'); // Aktif sekme: 'dashboard' -> 'personal-screen'
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string | null>(null); // Yemek kategorisi seçimi
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const navigate = useNavigate(); // React Router navigasyon
  const [photoMetadata, setPhotoMetadata] = useState<PhotoMetadata | null>(null); // Fotoğraf metadata bilgileri
  const [analyzedNutrients, setAnalyzedNutrients] = useState<AnalyzedNutrients | null>(null); // AI ile analiz edilen besin değerleri
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [selectedDietPlan, setSelectedDietPlan] = useState<Diet | null>(null);
  const [dailyWaterGoal, setDailyWaterGoal] = useState(2000); // Varsayılan değer
  const [randomTip, setRandomTip] = useState('');
  const [bloodTestResults, setBloodTestResults] = useState(''); // Kan sonuçları için input alanı
  const [bloodTestAnalysis, setBloodTestAnalysis] = useState<string | null>(null); // Analiz sonucu
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Yüklenme durumu
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeSuggestion | null>(null);
  const [isRecommending, setIsRecommending] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '', email: '', age: '', weight: '', height: '', gender: 'male', activityLevel: 'sedentary'
  });

  // Profil verilerini state ile eşleştir
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        age: user.age ? String(user.age) : '',
        weight: user.weight ? String(user.weight) : '',
        height: user.height ? String(user.height) : '',
        gender: user.gender || 'male',
        activityLevel: user.activityLevel || 'sedentary'
      });
    }
  }, [user]);
 
   // Verileri backend'den çekmek için kullanılacak fetch fonksiyonu
const fetchDailyLogs = useCallback(async () => {
  if (!user) return;
  try {
    const response = await axios.get('/api/daily-logs', { params: { date: currentDate } });
    const { consumedFoods: rawFoods = [], burnedExercises: rawExercises = [], totalWaterIntake = 0 } = response.data;

    // Map DB recordset -> frontend beklenen şekle
    const mappedFoods = (rawFoods || []).map((f: any) => ({
      id: f.ID ?? f.id ?? Date.now(),
      name: f.Name ?? f.name ?? '',
      amount: toNumber(f.Amount ?? f.amount),
      mealTime: f.MealTime ?? f.mealTime ?? '',
      date: (f.Date ?? currentDate).toString().slice(0,10),
      // frontend beklediği alanlar:
      totalCalories: toNumber(f.Calories ?? f.calories),
      totalProtein: toNumber(f.Protein ?? f.protein),
      totalCarbs: toNumber(f.Carbs ?? f.carbs),
      totalFat: toNumber(f.Fat ?? f.fat),
      // orijinal ham alanları da koru istersen
      // raw: f
    }));

    const mappedExercises = (rawExercises || []).map((e: any) => ({
      id: String(e.ID ?? e.id ?? crypto?.randomUUID?.() ?? Date.now()),
      name: e.Name ?? e.name ?? '',
      minutes: toNumber(e.Minutes ?? e.minutes),
      totalCaloriesBurned: toNumber(e.TotalCaloriesBurned ?? e.totalCaloriesBurned ?? e.CaloriesBurned),
      date: (e.Date ?? currentDate).toString().slice(0,10),
    }));

    dispatchConsumedFoods({ type: "LOAD_FOODS", payload: mappedFoods });
    dispatchBurnedExercises({ type: "LOAD_EXERCISES", payload: mappedExercises });

    setTotalWaterIntake(totalWaterIntake || 0);
    toast.success('Günlük veriler yüklendi!');
  } catch (error) {
    console.error('Günlük veriler çekilirken hata oluştu:', error);
    toast.error('Günlük veriler yüklenemedi.');
  }
}, [user, currentDate]);
const fetchUserInfo = useCallback(async () => {
  try {
    // Sunucudan tam kullanıcı verisini (packageInfo dahil) çek
    const response = await axios.get('/api/user');
    const fullUserData = response.data;
    
    if (fullUserData && fullUserData.loggedIn) {
      // 1. State'i en güncel veriyle (paket bilgisi dahil) güncelle
      setUser(fullUserData); 
      // 2. localStorage'ı da bu tam veriyle güncelle
      localStorage.setItem('user', JSON.stringify(fullUserData));
    } else {
      // Sunucu 'loggedIn: false' dönerse (örn. session süresi dolmuşsa)
      localStorage.removeItem('user');
      navigate('/login');
    }
  } catch (error) {
    console.error('Kullanıcı bilgileri çekilirken hata oluştu:', error);
    // 401 (Unauthorized) hatası gelirse (session yoksa) login'e at
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  }
}, [navigate]); // navigate'i dependency olarak ekle



// Food Log için useReducer kullanımı
const [consumedFoods, dispatchConsumedFoods] = useReducer(foodLogReducer, []);

// Burned Exercises için useReducer kullanımı
const [burnedExercises, dispatchBurnedExercises] = useReducer(exerciseLogReducer, []);

useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
         
         localStorage.removeItem('user');
         navigate('/login');
         return;
      }
      
      fetchUserInfo(); 
      
    } else {
      
      navigate('/login');
    }

    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setDarkMode(storedTheme === 'dark');
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }
    
  }, [fetchUserInfo, navigate]); 

  useEffect(() => {
    
    if (user) {
      fetchDailyLogs();
    }
  }, [user, currentDate, fetchDailyLogs]); 
  

  useEffect(() => {
    document.documentElement.className = darkMode ? 'dark' : '';
  }, [darkMode]);

  
  
  // Fotoğraf metadata analizi fonksiyonu (önceki hali, AI entegrasyonu aşağıda)
  const handleAnalyzePhotoMetadata = async (file: File) => {
    setIsAnalyzingPhoto(true);
    setAnalyzedNutrients(null); // Clear previous AI analysis

    const img = new window.Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 64; // Küçültülmüş boyut
        canvas.height = 64; // Küçültülmüş boyut
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, 64, 64);
        const data = ctx.getImageData(0, 0, 64, 64).data;

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        const avgRGB: [number, number, number] = [
          Math.round(r / count),
          Math.round(g / count),
          Math.round(b / count),
        ];

        setPhotoMetadata({
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeKB: Math.round(file.size / 1024),
          avgRGB,
        });
        
        // AI analizi için çağrı
        handleAnalyzePhotoWithAI(file);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: any) => {
  const file = e.target.files[0];
  if (file) {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setBloodTestResults('');
  } else {
    setImageFile(null);
    setImageUrl(null);
  }
};

const handleAnalyzeBloodTest = async () => {
  if (bloodTestResults.trim() && imageFile) {
    toast.error("Lütfen sadece bir yöntem seçin: ya metin girin ya da fotoğraf yükleyin.");
    return;
  }
  if (!bloodTestResults.trim() && !imageFile) {
    toast.error("Lütfen kan sonuçlarınızı girin veya bir fotoğraf yükleyin.");
    return;
  }

  setIsAnalyzing(true);
  setBloodTestAnalysis(null);

  if (bloodTestResults.trim()) {
    try {
      // payload'ı burada oluşturuyoruz
      const payload = { bloodTestResults };
      const response = await axios.post(`${API_BASE_URL}/api/analyze-blood-test`, payload);
      setBloodTestAnalysis(response.data.reply);
      toast.success("Kan sonuçlarınız başarıyla analiz edildi.");
    } catch (error) {
      console.error("Kan analizi frontend hatası:", error);
      toast.error("Kan analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      setBloodTestAnalysis("Analiz yapılamadı. Lütfen sunucu hatası için konsolu kontrol edin.");
    } finally {
      setIsAnalyzing(false);
    }
  } else if (imageFile) {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = async () => {
      try {
        if (typeof reader.result !== 'string') {
          toast.error("Resim verisi okunamadı. Lütfen geçerli bir resim dosyası yükleyin.");
          return;
        }

        const base64Image = reader.result.split(',')[1];
        // payload'ı burada oluşturuyoruz
        const payload = { imageData: base64Image };

        const response = await axios.post(`/api/analyze-blood-test`, payload);
        setBloodTestAnalysis(response.data.reply);
        toast.success("Kan sonuçlarınız başarıyla analiz edildi.");
      } catch (error) {
        console.error("Kan analizi frontend hatası:", error);
        toast.error("Kan analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
        setBloodTestAnalysis("Analiz yapılamadı. Lütfen sunucu hatası için konsolu kontrol edin.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.onerror = (error) => {
      console.error("Resim okuma hatası:", error);
      toast.error("Resim yüklenirken bir hata oluştu.");
      setIsAnalyzing(false);
    };
  }
};

  
  // AI ile fotoğraf analizi
  const handleAnalyzePhotoWithAI = async (file: File) => {
    setIsAnalyzingPhoto(true);
    setAnalyzedNutrients(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
        // Backend'e istek atıyoruz (Direkt Google'a değil)
        const response = await axios.post('/api/analyze-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // Backend'den gelen veri string JSON olabilir, parse edelim
        let data = response.data.analysis;
        
        if (typeof data === 'string') {
            try {
                // Temizlik yapalım (bazı durumlarda markdown kalabilir)
                data = data.replace(/```json|```/g, "").trim();
                data = JSON.parse(data);
            } catch (e) {
                console.error("JSON parse edilemedi, raw veri:", data);
                toast.error("AI yanıtı okunamadı, tekrar deneyin.");
                setIsAnalyzingPhoto(false);
                return;
            }
        }

        // Veri kontrolü
        if (data && (data.calories || data.grams)) {
             setAnalyzedNutrients(data);
             toast.success("Fotoğraf başarıyla analiz edildi!");
        } else {
            throw new Error("Geçersiz veri formatı");
        }

    } catch (error: any) {
        console.error("Analiz hatası:", error);
        
        // Hata mesajını göster
        if (error.response?.data?.error) {
             toast.error(error.response.data.error); // Limit aşımı vb.
        } else {
             toast.error("Fotoğraf analizi başarısız oldu.");
        }
        
        // ÖNEMLİ: Rastgele veri (fallback) set etmiyoruz!
        setAnalyzedNutrients(null); 
    } finally {
        setIsAnalyzingPhoto(false);
    }
  };

  // İpuçları her sekme değişiminde rastgele seçilecek
  useEffect(() => {
    setRandomTip(dailyTips[Math.floor(Math.random() * dailyTips.length)]);
  }, [activeTab]);

  // Kilo bilgisi değiştiğinde günlük su hedefi hesaplama
  useEffect(() => {
    if (user?.weight) {
      // Vücut ağırlığının her kg'ı için 35 ml su önerilir
      const calculatedWaterGoal = Math.round(user.weight * 35);
      setDailyWaterGoal(calculatedWaterGoal);
    }
  }, [user?.weight]);

  // Verileri ilk açılışta ve tarih değişiminde yükle
  useEffect(() => {
    fetchDailyLogs();
  }, [currentDate, fetchDailyLogs]);

  // Seçili diyet planını localStorage'dan yükle
  useEffect(() => {
    const savedDiet = localStorage.getItem('selectedDiet');
    if (savedDiet) {
      setSelectedDietPlan(JSON.parse(savedDiet));
    }
  }, []);

  // Diyete Başla handler
  const handleStartDiet = (diet: Diet) => {
    setSelectedDietPlan(diet);
    localStorage.setItem('selectedDiet', JSON.stringify(diet));
    toast.success(`${diet.name} diyetine başladınız!`);
    setIsDietDialogOpen(false);
    setActiveTab('personal-screen');
  };

  // Diyeti Durdur handler
  const handleStopDiet = () => {
    setSelectedDietPlan(null);
    localStorage.removeItem('selectedDiet');
    toast.info("Diyet programından çıkış yapıldı.");
  };

  // Su doluluk yüzdesi
  const waterProgressPercentage = useMemo(() => {
    return dailyWaterGoal > 0 ? (totalWaterIntake / dailyWaterGoal) * 100 : 0;
  }, [totalWaterIntake, dailyWaterGoal]);


  


  
   


  // --- useEffect Kancaları ---


  // Dark mode ayarını localStorage'a kaydet ve body class'ına uygula
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Günlük notu localStorage'a kaydet (Bu kalabilir veya bunu da DB'ye taşıyabiliriz)
  useEffect(() => {
    localStorage.setItem(`dailyNote-${currentDate}`, dailyNote);
  }, [dailyNote, currentDate]);


  // Kullanıcı bilgileri güncellendiğinde günlük kalori hedefini yeniden hesapla ve kaydet
  useEffect(() => {
    if (user && user.weight && user.height && user.age && user.gender && user.activityLevel) {
      const newCalculatedGoal = calcDailyGoal(user.gender,user.age,user.height,user.weight,user.activityLevel ?? "sedentary");
      if (user.dailyCalorieGoal !== newCalculatedGoal) {
        setUser(prevUser => {
          if (!prevUser) return null;
          const updatedUser = { ...prevUser, dailyCalorieGoal: newCalculatedGoal };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
    }
  }, [user?.weight, user?.height, user?.age, user?.gender, user?.activityLevel]);


  // --- Yardımcı Fonksiyonlar ---

  // Toplam tüketilen kaloriyi hesaplar
  const totalConsumedCalories = useMemo(() => {
    return consumedFoods.reduce((sum, food) => sum + food.totalCalories, 0);
  }, [consumedFoods]);

  // Toplam yakılan kaloriyi hesaplar
  const totalBurnedCalories = useMemo(() => {
    return burnedExercises.reduce((sum, exercise) => sum + exercise.totalCaloriesBurned, 0);
  }, [burnedExercises]);

  // Günlük net kaloriyi hesaplar
  const netCalories = useMemo(() => {
    return totalConsumedCalories - totalBurnedCalories;
  }, [totalConsumedCalories, totalBurnedCalories]);

  // Kalori hedefine göre ilerleme yüzdesini hesaplar
  const calorieProgressPercentage = user ? (totalConsumedCalories / user.dailyCalorieGoal) * 100 : 0;

  // Makro besinleri hesaplar
  const totalProtein = useMemo(() => {
    return consumedFoods.reduce((sum, food) => sum + food.totalProtein, 0);
  }, [consumedFoods]);

  const totalCarbs = useMemo(() => {
    return consumedFoods.reduce((sum, food) => sum + food.totalCarbs, 0); 
  }, [consumedFoods]);

  const totalFat = useMemo(() => {
    return consumedFoods.reduce((sum, food) => sum + food.totalFat, 0); 
  }, [consumedFoods]);
  
  const macroData = useMemo(() => {
    const totalMacros = totalProtein + totalCarbs + totalFat;
    if (totalMacros === 0) {
      return [
        { name: 'Protein', value: 1, color: '#10B981' },
        { name: 'Karbonhidrat', value: 1, color: '#F59E0B' },
        { name: 'Yağ', value: 1, color: '#EF4444' }
      ];
    }
    return [
      { name: 'Protein', value: totalProtein, color: '#10B981' },
      { name: 'Karbonhidrat', value: totalCarbs, color: '#F59E0B' },
      { name: 'Yağ', value: totalFat, color: '#EF4444' }
    ];
  }, [totalProtein, totalCarbs, totalFat]);


  // Seçilen kategori ve arama sorgusuna göre yiyecekleri filtreler
  const filteredFoods = useMemo(() => {
    let result = foods;
    if (selectedFoodCategory && selectedFoodCategory !== 'Tüm Kategoriler') {
      result = getFoodsByCategory(selectedFoodCategory);
    }
    if (foodQuery) {
      result = searchFoods(foodQuery); 
    }
    return result;
  }, [foodQuery, selectedFoodCategory]); 

  // Seçilen tip, zorluk ve arama sorgusuna göre egzersizleri filtreler
  const filteredExercises = useMemo(() => {
    let result = exercises;
    if (selectedExerciseType !== 'all') {
      result = result.filter(ex => ex.type === selectedExerciseType);
    }
    if (selectedExerciseDifficulty !== 'all') {
      result = result.filter(ex => ex.difficulty === selectedExerciseDifficulty);
    }
    if (exerciseSearchQuery) {
      result = result.filter(ex => ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()));
    }
    return result;
  }, [exerciseSearchQuery, selectedExerciseType, selectedExerciseDifficulty]);

  // Tarifleri arama sorgusuna göre filtreler
  const filteredRecipes = useMemo(() => {
    if (!foodQuery) return mockRecipes;
    const lowerCaseQuery = foodQuery.toLowerCase();
    return mockRecipes.filter(recipe =>
      recipe.name.toLowerCase().includes(lowerCaseQuery) ||
      recipe.description.toLowerCase().includes(lowerCaseQuery) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(lowerCaseQuery))
    );
  }, [foodQuery]);

  // BMI hesaplama
  const calculateBMI = useCallback((weight: number | undefined, height: number | undefined) => {
    if (!weight || !height || height === 0) return 'N/A';
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters));
    if (isNaN(bmi)) return 'N/A'; 
    return bmi.toFixed(2);
  }, []);

  // UI Stilleri için Ortak Sınıflar (Şık ve Canlı)
  const mainBgClass = `${darkMode ? 'bg-[#0f172a] text-gray-100' : 'bg-[#f8fafc] text-gray-900'}`;
  const cardBgClass = `${darkMode ? 'bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl' : 'bg-white/90 border border-slate-100 backdrop-blur-xl shadow-xl'}`;
  const textClass = `${darkMode ? 'text-slate-50' : 'text-slate-800'}`;
  const subTextClass = `${darkMode ? 'text-slate-400' : 'text-slate-500'}`;
  const placeholderClass = `${darkMode ? 'placeholder-slate-500' : 'placeholder-slate-400'}`;
  const badgeClass = `${darkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm' : 'bg-emerald-100/80 text-emerald-700 border border-emerald-200 shadow-sm'}`;
  const buttonPrimaryClass = 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5';
  const buttonOutlineClass = `${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800 shadow-sm' : 'border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`;


  // --- Handler Fonksiyonları ---

  // Yiyecek ekleme
 const handleAddFoodToLog = async () => {
  if (!foodDialogContent || !selectedMeal || !(Number(foodQuantity) > 0)) {
    toast.error('Lütfen bir öğün seçin ve geçerli bir miktar girin.');
    return;
  }

  // normalize kaynak alanlar
  const servingAmount = toNumber(foodDialogContent.servingAmount ?? foodDialogContent.serving ?? 100);
  const baseCalories = toNumber(foodDialogContent.calories ?? 0);
  const baseProtein = toNumber(foodDialogContent.protein ?? foodDialogContent.protein ?? 0);
  const baseCarbs = toNumber(foodDialogContent.carbs ?? foodDialogContent.carbs ?? 0);
  const baseFat = toNumber(foodDialogContent.fat ?? foodDialogContent.fat ?? 0);
  const amount = toNumber(foodQuantity);

  const factor = servingAmount > 0 ? (amount / servingAmount) : 0;
  const totalCalories = Math.round(baseCalories * factor);
  const totalProtein = Number((baseProtein * factor).toFixed(1));
  const totalCarbs = Number((baseCarbs * factor).toFixed(1));
  const totalFat = Number((baseFat * factor).toFixed(1));

  const newLogEntry = {
    id: Date.now(),
    name: foodDialogContent.name ?? foodDialogContent.name ?? '',
    amount,
    mealTime: selectedMeal,
    date: currentDate,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat
  };

  // UI'ı hemen güncelle (local)
  dispatchConsumedFoods({ type: 'ADD_FOOD', payload: newLogEntry as any});

  // Backend'e gönder
  try {
   await axios.post('/api/add-food', {
      foodId: String(foodDialogContent.id ?? newLogEntry.id),
      name: newLogEntry.name,
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      amount: amount,
      meal: selectedMeal,
      date: currentDate
    });
    // isteğe bağlı success toast
  } catch (err) {
    console.error('Besin ekleme (backend) hatası:', err);
    toast.error('Sunucuya eklenirken hata oluştu.');
    // istersen dispatch ile geri alabilirsin
  }

  toast.success(`${newLogEntry.name} günlüğe eklendi!`);
  setIsFoodDialogOpen(false);
  setFoodDialogContent(null);
  setSelectedMeal('');
  setFoodQuantity(100);
};



  // Yemek kaydını silme
  const handleDeleteFoodLogEntry = async (id: number) => { // async ekleyin
  // Optimistic UI: Önce arayüzü güncelle
  dispatchConsumedFoods({ type: 'REMOVE_FOOD', payload: id });
  
  try {
    await axios.delete(`/api/delete-food/${id}`);
    toast.info('Yemek kaydı veritabanından silindi.');
  } catch (error) {
    console.error("Yemek kaydı silinirken hata oluştu:", error);
    toast.error('Kayıt sunucudan silinemedi. Lütfen sayfayı yenileyin.');
    // Hata durumunda, silinen öğeyi geri yüklemek için verileri yeniden çekebilirsiniz.
    fetchDailyLogs(); 
  }
};

  
  // Egzersiz ekleme
  const handleAddExercise = async () => {
  if (!selectedExercise || !(toNumber(exerciseMinutes) > 0)) {
    toast.error("Lütfen bir egzersiz seçin ve geçerli bir süre girin.");
    return;
  }
  const minutes = Math.round(toNumber(exerciseMinutes));
  const caloriesPerMinute = toNumber(selectedExercise.caloriesPerMinute ?? 0);

  const totalCaloriesBurned = Math.round(caloriesPerMinute * minutes);

  const newBurnedExercise = {
    id: crypto?.randomUUID?.() ?? String(Date.now()),
    name: selectedExercise.name,
    minutes,
    totalCaloriesBurned,
    date: currentDate
  };

  dispatchBurnedExercises({ type: 'ADD_EXERCISE', payload: newBurnedExercise });

  try {
    await axios.post('/api/add-exercise', {
      exerciseId: newBurnedExercise.id,
      name: newBurnedExercise.name,
      minutes: newBurnedExercise.minutes,
      totalCaloriesBurned: newBurnedExercise.totalCaloriesBurned,
      date: newBurnedExercise.date
    });
  } catch (err) {
    console.error('Egzersiz ekleme (backend) hatası:', err);
    toast.error('Sunucuya egzersiz eklenirken hata oluştu.');
  }

  toast.success(`${newBurnedExercise.name} (${minutes} dk) eklendi!`);
  setIsExerciseDialogOpen(false);
  setSelectedExercise(null);
  setExerciseMinutes('');
};

const handleAddIngredient = () => {
  if (ingredientInput.trim() !== '') {
    setIngredients([...ingredients, ingredientInput.trim()]);
    setIngredientInput('');
  }
};



const handleGetRecipes = async (mode: 'strict' | 'flexible') => {
  if (ingredients.length === 0) {
    toast.error("Lütfen en az bir malzeme girin.");
    return;
  }

  setIsRecommending(true);
  setRecipes(null);

  try {
    const payload = {
      ingredients: ingredients,
      mode: mode // Butondan gelen modu API'ye gönderiyoruz
    };

    const response = await axios.post<RecipeSuggestion>(`${API_BASE_URL}/api/generate-recipe`, payload);
    setRecipes(response.data); // Gelen yapılandırılmış veriyi state'e kaydediyoruz
    toast.success("İşte sana özel tarifler!");

  } catch (error) {
    console.error("API'den yemek önerisi alınırken hata:", error);
    toast.error("Yemek önerileri alınırken bir hata oluştu.");
  } finally {
    setIsRecommending(false);
  }
};

const handleRemoveIngredient = (ingredientToRemove: string) => {
  setIngredients(ingredients.filter(ingredient => ingredient !== ingredientToRemove));
};



  // Egzersiz kaydını silme
  const handleDeleteExercise = async (id: string) => { // async ekleyin
  // Optimistic UI: Önce arayüzü güncelle
  dispatchBurnedExercises({ type: 'REMOVE_EXERCISE', payload: id });

  try {
    await axios.delete(`/api/delete-exercise/${id}`);
    toast.info('Egzersiz kaydı veritabanından silindi.');
  } catch (error) {
    console.error("Egzersiz kaydı silinirken hata oluştu:", error);
    toast.error('Kayıt sunucudan silinemedi. Lütfen sayfayı yenileyin.');
    // Hata durumunda verileri yeniden çek
    fetchDailyLogs();
  }
};

  // Su ekleme
  const handleAddWater = async () => {
  if (!waterAmount || parseFloat(waterAmount) <= 0) {
    toast.error("Lütfen geçerli bir su miktarı girin.");
    return;
  }
  const amountNum = Math.round(parseFloat(waterAmount));

  // UI hızlı güncellemesi
  setTotalWaterIntake(prev => prev + amountNum);
  toast.success(`${amountNum} ml su eklendi! Toplam: ${totalWaterIntake + amountNum} ml`);
  setIsWaterDialogOpen(false);
  setWaterAmount('');

  // Backend'e gönder
  try {
    await axios.post('/api/add-water', { amount: amountNum, date: currentDate });
  } catch (err) {
    console.error('Su ekleme (backend) hatası:', err);
    toast.error('Sunucuya su eklenirken hata oluştu.');
    // opsiyonel: geri alma işlemi
  }
};



  // Kullanıcı profili güncelleme
  const handleUpdateProfile = async (e: React.FormEvent) => { 
    e.preventDefault();
    if (user) {
        const newName = profileForm.name;
        const newEmail = profileForm.email;
        const newAge = parseInt(profileForm.age);
        const newWeight = parseFloat(profileForm.weight);
        const newHeight = parseFloat(profileForm.height);
        const newGender = profileForm.gender as 'male' | 'female';
        const newActivityLevel = profileForm.activityLevel as keyof typeof activityLevels;

        if (!newName || !newEmail || isNaN(newAge) || isNaN(newWeight) || isNaN(newHeight) || !newGender || !newActivityLevel) {
            toast.error('Lütfen tüm alanları geçerli değerlerle doldurun.');
            return;
        }

        const dailyGoal = calcDailyGoal(newGender, newAge, newHeight, newWeight, newActivityLevel);

        const updatedUser: User = {
            ...user,
            name: newName,
            email: newEmail,
            age: newAge,
            weight: newWeight,
            height: newHeight,
            gender: newGender,
            activityLevel: newActivityLevel,
            dailyCalorieGoal: dailyGoal
        };

        try {
            // YENİ KISIM: Veriyi backend'e gönder
            const response = await axios.put('/api/user/profile', updatedUser);

            if (response.status === 200) {
                // Sadece backend'de işlem başarılı olursa state'i ve localStorage'ı güncelle
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success("Profil başarıyla veritabanına kaydedildi!");
                setActiveTab('personal-screen');
            }
        } catch (error: any) {
            console.error("Profil güncelleme hatası:", error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(`Hata: ${error.response.data.message}`);
            } else {
                toast.error("Profil güncellenirken bir sunucu hatası oluştu.");
            }
        }

    } else {
        toast.error("Kullanıcı bilgileri yüklenemedi.");
    }
};
  // ---- Type Tanımları ----
type ChatMessage = { 
  role: "user" | "bot"; 
  message: string; 
  timestamp: Date 
};

type AiPayloadMessage = { 
  role: "user" | "model"; 
  parts: { text: string }[] 
};

// ---- AI Chat Mesaj Gönderme ----
// AI Chat mesaj gönderme
const handleSendAiMessage = async () => {
  if (!aiInput.trim()) return;

  const userMessage: ChatMessage = { 
    role: "user", 
    message: aiInput.trim(), 
    timestamp: new Date() 
  };

  setAiChatMessages(prev => [...prev, userMessage]);
  setAiInput("");
  setAiLoading(true);

  try {
    // Backend'e istek
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage.message }),
    });

    const data = await response.json();

    const botMessage: ChatMessage = { 
      role: "bot", 
      message: data.reply || "Üzgünüm, bir yanıt alamadım.", 
      timestamp: new Date() 
    };

    setAiChatMessages(prev => [...prev, botMessage]);
  } catch (error) {
    console.error("AI hatası:", error);
    const errorMessage: ChatMessage = { 
      role: "bot", 
      message: "Üzgünüm, bir sorun oluştu. Lütfen tekrar deneyin.", 
      timestamp: new Date() 
    };
    setAiChatMessages(prev => [...prev, errorMessage]);
  } finally {
    setAiLoading(false);
  }
};


  // Tema değiştirme
  const toggleTheme = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    localStorage.setItem('theme', darkMode ? 'light' : 'dark'); 
    document.documentElement.classList.toggle('dark', !darkMode);
    setDarkMode(!darkMode);
    toast.info(`Tema "${newTheme}" olarak değiştirildi.`);
  };

  // --- JSX Render Fonksiyonları ---

  // Ana içeriği render eden fonksiyon
  const renderContent = () => {
    const animationVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3, ease: cubicBezier(0.0, 0.0, 0.2, 1) }
    };

    const currentWaterIntake = parseFloat(localStorage.getItem(`waterIntake-${currentDate}`) || '0');

    // Bugünün yiyecekleri ve egzersizleri
    const todayConsumedFoods = consumedFoods.filter(f => f.date === currentDate);
    const todayBurnedExercises = burnedExercises.filter(e => e.date === currentDate);

    // BMI ve BMR için anlık hesaplamalar
    const currentBMI = calculateBMI(user?.weight, user?.height);
    const currentBMR =
      user?.gender && user?.age && user?.height && user?.weight
        ? calcBMR(
            (user.gender ?? 'male') as Gender,
            Number(user.age),
            Number(user.height),
            Number(user.weight)
          )
        : undefined;

    switch (activeTab) {
      case 'personal-screen':
        return (
          <motion.div key="personal-screen" {...animationVariants} className="space-y-6 w-full">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className={`text-3xl font-bold ${textClass}`}>Hoş Geldin, {user?.name || 'Kullanıcı'}!</h2>
                <p className={subTextClass}>İşte bugünün özeti. Harika bir gün geçir!</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(new Date(currentDate).getTime() - 86400000).toISOString().slice(0,10))} className={buttonOutlineClass}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className={`font-semibold text-sm px-3 py-2 rounded-md ${badgeClass}`}>
                  {new Date(currentDate).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(new Date(currentDate).getTime() + 86400000).toISOString().slice(0,10))} className={buttonOutlineClass}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Aktif Diyet Programı */}
            {selectedDietPlan && (
              <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass}`}>
                <CardHeader className="p-0 mb-4 flex-row justify-between items-center">
                  <CardTitle className={`text-lg font-semibold ${textClass}`}>Aktif Diyet Programım: {selectedDietPlan.name}</CardTitle>
                  <Button onClick={handleStopDiet} variant="destructive" size="sm" className="rounded-lg">
                    <X className="h-4 w-4 mr-1" /> Diyeti Durdur
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <p className={subTextClass}>{selectedDietPlan.description}</p>
                  <div className="mt-4 space-y-2">
                    {selectedDietPlan.weeklyProgram.find(d => d.day === new Date(currentDate).toLocaleDateString('tr-TR', { weekday: 'long' }))?.program.map((meal, index) => (
                      <div key={index} className={`p-3 rounded-md ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                        <h4 className={`text-md font-semibold text-emerald-600 dark:text-emerald-400`}>{meal.hour} - {meal.meal}</h4>
                        <ul className="list-disc list-inside text-sm mt-1">
                          {meal.foods.map((food, foodIndex) => (
                            <li key={foodIndex} className={subTextClass}>{food}</li>
                          ))}
                        </ul>
                        {meal.notes && <p className={`text-xs italic mt-1 ${subTextClass}`}>{meal.notes}</p>}
                         {meal.nutrition && (
                          <div className={`flex flex-wrap gap-2 text-xs mt-2 ${subTextClass}`}>
                            <Badge variant="secondary" className={badgeClass}>
                              <Flame className="h-3 w-3 mr-1" /> {meal.nutrition.calories} kcal
                            </Badge>
                            <Badge variant="secondary" className={badgeClass}>
                              <Coffee className="h-3 w-3 mr-1" /> {meal.nutrition.protein}g Protein
                            </Badge>
                            <Badge variant="secondary" className={badgeClass}>
                              <Pizza className="h-3 w-3 mr-1" /> {meal.nutrition.carbs}g Karbonhidrat
                            </Badge>
                            <Badge variant="secondary" className={badgeClass}>
                              <Fish className="h-3 w-3 mr-1" /> {meal.nutrition.fat}g Yağ
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Özet Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <NutrientCard
                title="Günlük Hedef"
                value={user?.dailyCalorieGoal || 0}
                unit="kcal"
                icon={<Flame />}
                color="text-orange-500"
                bgColor="bg-orange-100 dark:bg-orange-900/50"
              />
              <NutrientCard
                title="Tüketilen"
                value={Math.round(totalConsumedCalories)}
                unit="kcal"
                icon={<CookingPot />}
                color="text-emerald-500"
                bgColor="bg-emerald-100 dark:bg-emerald-900/50"
              />
              <NutrientCard
                title="Yakılan"
                value={Math.round(totalBurnedCalories)}
                unit="kcal"
                icon={<Activity />}
                color="text-rose-500"
                bgColor="bg-rose-100 dark:bg-rose-900/50"
              />
              <NutrientCard
                title="Net Kalori"
                value={Math.round(netCalories)}
                unit="kcal"
                icon={<TrendingUp />}
                color="text-indigo-500"
                bgColor="bg-indigo-100 dark:bg-indigo-900/50"
              />
            </div>

            {/* Kalori ve Makro Grafikler */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className={`p-6 shadow-sm rounded-2xl lg:col-span-2 ${cardBgClass}`}>
                <CardHeader className="p-0 mb-4 flex-row justify-between items-center">
                  <CardTitle className={`text-lg font-semibold ${textClass}`}>Kalori Dengesi</CardTitle>
                  <Badge variant="secondary" className={`${badgeClass}`}>Kalan: {Math.max(0, (user?.dailyCalorieGoal || 0) - Math.round(totalConsumedCalories))} kcal</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <Progress value={calorieProgressPercentage} className="h-3 rounded-full mb-2" />
                  <div className="flex justify-between text-sm font-medium">
                    <span className={textClass}>{Math.round(totalConsumedCalories)} kcal Tüketildi</span>
                    <span className={subTextClass}>Hedef: {user?.dailyCalorieGoal || 0} kcal</span>
                  </div>
                   {/* Eklenen Besinler ve Makro Detayları */}
                  {todayConsumedFoods.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      <h4 className={`text-sm font-semibold mb-2 ${textClass}`}>Tüketilen Besinler:</h4>
                      {todayConsumedFoods.map(food => (
                        <div key={food.id} className={`flex justify-between items-center text-sm p-2 rounded-md ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                          <div>
                            <span className={`font-medium ${textClass}`}>{food.name} ({food.amount}g)</span>
                            <div className={`text-xs ${subTextClass} flex flex-wrap gap-x-2`}>
                              <span>{Math.round(toNumber(food.totalCalories ?? (food.calories ?? food.calories)))} kcal</span>
                              <span>{(toNumber(food.totalProtein ?? (food.protein ?? food.protein))).toFixed(1)}g P</span>
                              <span>{(toNumber(food.totalCarbs ?? (food.carbs ?? food.carbs))).toFixed(1)}g K</span>
                              <span>{(toNumber(food.totalFat ?? (food.fat ?? food.fat))).toFixed(1)}g Y</span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteFoodLogEntry(food.id)}
                            className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass}`}>
                <CardHeader className="p-0 mb-4">
                  <CardTitle className={`text-lg font-semibold ${textClass}`}>Makro Dağılımı</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex items-center justify-center h-24">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={macroData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} innerRadius={25} paddingAngle={5}>
                           {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`, borderRadius: '0.5rem' }} formatter={(value, name) => [`${Math.round(Number(value))}g`, name]} />
                      </PieChart>
                  </ResponsiveContainer>
                   <div className="flex flex-col text-xs space-y-1">
                      <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#10B981] mr-2"></div>Protein: {Math.round(totalProtein)}g</div>
                      <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#F59E0B] mr-2"></div>Karbs: {Math.round(totalCarbs)}g</div>
                      <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#EF4444] mr-2"></div>Yağ: {Math.round(totalFat)}g</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Su Tüketimi ve Günlük Not */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass}`}>
                <CardHeader className="p-0 mb-4 flex justify-between items-center">
                  <div>
                    <CardTitle className={`text-lg font-semibold ${textClass}`}>Su Tüketimi</CardTitle>
                    <CardDescription className={subTextClass}>Günlük hedefin {dailyWaterGoal} ml</CardDescription>
                  </div>
                   <Dialog open={isWaterDialogOpen} onOpenChange={setIsWaterDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className={`${buttonPrimaryClass} rounded-lg`}>
                        <Plus className="h-4 w-4 mr-1" /> Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className={`sm:max-w-[425px] rounded-lg ${darkMode ? 'bg-slate-900 border-slate-800 text-gray-50' : 'bg-white'}`}>
                      <DialogHeader>
                        <DialogTitle>Su Ekle</DialogTitle>
                        <DialogDescription>Kaç ml su içtiğinizi girin.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="water-amount" className="text-right">Miktar (ml)</Label>
                          <Input
                            id="water-amount"
                            type="number"
                            step="100"
                            value={waterAmount}
                            onChange={(e) => setWaterAmount(e.target.value)}
                            className={`col-span-3 rounded-md ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}
                            placeholder="Örn: 250"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddWater} disabled={!waterAmount} className="bg-emerald-600 hover:bg-emerald-700">
                          <Check className="h-4 w-4 mr-2" /> Ekle
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12">
                      <Droplet size={48} className="text-blue-400 opacity-30" />
                      <Droplet 
                        size={48} 
                        className="absolute bottom-0 left-0 text-blue-400" 
                        style={{ clipPath: `inset(${100 - waterProgressPercentage}% 0 0 0)` }} 
                      />
                    </div>
                    <div>
                      <span className={`text-2xl font-bold ${textClass}`}>{totalWaterIntake} ml</span> / {dailyWaterGoal} ml
                      <Progress 
    value={waterProgressPercentage} 
    className="h-2 rounded-full mt-1 bg-blue-600" 
/>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass}`}>
                <CardHeader className="p-0 mb-4">
                  <CardTitle className={`text-lg font-semibold ${textClass}`}>Günlük Not</CardTitle>
                  <CardDescription className={subTextClass}>Günün nasıl geçtiğini not al.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Textarea placeholder="Bugün nasıldı? Antrenmanların, beslenmen ve hislerin..." value={dailyNote} onChange={(e) => setDailyNote(e.target.value)} className={`w-full h-20 rounded-md border ${darkMode ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-gray-50 border-gray-200'} focus-visible:ring-emerald-500 resize-none`} />
                </CardContent>
              </Card>
            </div>

            {/* Günlük Yemek ve Egzersiz Listeleri */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass}`}>
                <CardHeader className="p-0 mb-4 flex-row justify-between items-center">
                  <CardTitle className={`text-lg font-semibold ${textClass}`}>Bugün Tüketilenler</CardTitle>
                  <Button onClick={() => setActiveTab('food-category')} size="sm" className={`${buttonPrimaryClass} rounded-lg`}>
                    <Plus className="h-4 w-4 mr-1" /> Ekle
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {todayConsumedFoods.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {mealTimes.map(mealTime => {
                        const mealFoods = todayConsumedFoods.filter(f => f.mealTime === mealTime);
                        if (mealFoods.length === 0) return null;
                        return (
                          <div key={mealTime} >
                            <h4 className={`text-sm font-semibold mb-1 mt-2 text-emerald-600 dark:text-emerald-400`}>{mealTime}</h4>
                            <ul className="space-y-1">
                              {mealFoods.map(food => (
                                <li key={food.id} className={`flex justify-between items-center text-sm p-2 rounded-md ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                                  <span className={subTextClass}>{food.name} ({food.amount}g)</span>
                                  <span className={`font-medium ${textClass}`}>{Math.round(food.totalCalories)} kcal</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleDeleteFoodLogEntry(food.id)}
                                    className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`text-center py-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                      <p className={subTextClass}>Bugün henüz bir şey tüketmediniz.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass}`}>
                <CardHeader className="p-0 mb-4 flex-row justify-between items-center">
                  <CardTitle className={`text-lg font-semibold ${textClass}`}>Bugün Yapılan Egzersizler</CardTitle>
                  <Button onClick={() => setActiveTab('exercises')} size="sm" className={`${buttonPrimaryClass} rounded-lg`}>
                    <Plus className="h-4 w-4 mr-1" /> Ekle
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {todayBurnedExercises.length > 0 ? (
                    <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {todayBurnedExercises.map((exercise) => (
                        <li key={exercise.id} className={`flex justify-between items-center p-2 rounded-md ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                          <div>
                            <span className={`font-medium ${textClass}`}>{exercise.name}</span>
                            <p className={`text-xs ${subTextClass}`}>{exercise.minutes} dakika</p>
                          </div>
                          <div className="text-right">
                            <span className={`font-medium text-rose-500`}>{exercise.totalCaloriesBurned.toFixed(0)} kcal</span>
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteExercise(exercise.id)}
                                className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 ml-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={`text-center py-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                      <p className={subTextClass}>Bugün henüz egzersiz eklenmedi.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      case 'photo-analysis':
        return (
          <motion.div key="photo-analysis" {...animationVariants} className="space-y-6 w-full">
            <h2 className={`text-3xl font-bold ${textClass}`}>Fotoğraf Analizi</h2>
            <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass}`}>
              <CardHeader className="p-0 mb-4">
                <CardTitle className={`text-lg font-semibold ${textClass}`}>Yemek Fotoğrafı Analizi</CardTitle>
                <CardDescription className={subTextClass}>
                  Yemek fotoğrafınızı yükleyin ve yapay zeka ile besin değerlerini tahmin edin.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPhotoFile(file);
                        setPhotoPreview(URL.createObjectURL(file));
                        setPhotoMetadata(null);
                        setAnalyzedNutrients(null);
                        handleAnalyzePhotoMetadata(file); // Start analysis immediately
                      }
                    }}
                    className="hidden"
                    id="upload-photo"
                  />
                  <Label htmlFor="upload-photo" className={`cursor-pointer ${buttonPrimaryClass} px-6 py-3 rounded-lg flex items-center`}>
                    <Image className="h-5 w-5 mr-2" /> Fotoğraf Yükle
                  </Label>
                  <p className={`text-sm mt-3 ${subTextClass}`}>veya sürükleyip bırakın</p>
                </div>

                {isAnalyzingPhoto && (
                  <div className="flex justify-center items-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin text-emerald-500 mr-2" />
                    <span className={textClass}>Fotoğraf analiz ediliyor...</span>
                  </div>
                )}

                {photoPreview && (
                  <div className="mt-6">
                    <h3 className={`text-xl font-semibold ${textClass} mb-4`}>Yüklenen Görsel</h3>
                    <img src={photoPreview} alt="Yüklenen Yemek" className="w-full h-64 object-contain rounded-lg mb-4 border border-gray-200 dark:border-slate-700" />

                    {photoMetadata && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <Card className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                          <CardTitle className={`text-lg font-semibold ${textClass} mb-2`}>Görsel Detayları</CardTitle>
                          <p className={subTextClass}>Genişlik: {photoMetadata.width} px</p>
                          <p className={subTextClass}>Yükseklik: {photoMetadata.height} px</p>
                          <p className={subTextClass}>Boyut: {photoMetadata.sizeKB} KB</p>
                          <p className={subTextClass}>Ort. RGB: ({photoMetadata.avgRGB.join(', ')})</p>
                        </Card>
                        {analyzedNutrients && (
                          <Card className={`p-4 rounded-xl ${darkMode ? 'bg-emerald-900/50' : 'bg-emerald-50'}`}>
                            <CardTitle className={`text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-2`}>Tahmini Besin Değerleri (AI)</CardTitle>
                            <p className={subTextClass}><Scale className="h-4 w-4 inline-block mr-2 text-emerald-500" /> Gram: <span className="font-bold">{analyzedNutrients.grams}g</span></p>
                            <p className={subTextClass}><Flame className="h-4 w-4 inline-block mr-2 text-orange-500" /> Kalori: <span className="font-bold">{analyzedNutrients.calories} kcal</span></p>
                            <p className={subTextClass}><Coffee className="h-4 w-4 inline-block mr-2 text-blue-500" /> Protein: <span className="font-bold">{analyzedNutrients.protein}g</span></p>
                            <p className={subTextClass}><Pizza className="h-4 w-4 inline-block mr-2 text-yellow-500" /> Karbonhidrat: <span className="font-bold">{analyzedNutrients.carbs}g</span></p>
                            <p className={subTextClass}><Fish className="h-4 w-4 inline-block mr-2 text-red-500" /> Yağ: <span className="font-bold">{analyzedNutrients.fat}g</span></p>
                          </Card>
                        )}
                      </div>
                    )}
                    
                  </div>
                )}
                {!photoPreview && !isAnalyzingPhoto && (
                  <div className={`text-center py-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                    <p className={subTextClass}>Lütfen analiz etmek için bir fotoğraf yükleyin.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );


      case 'food-category': 
        return (
          <motion.div key="food-category" {...animationVariants} className="space-y-6 w-full">
            <h2 className={`text-3xl font-bold ${textClass}`}>Yemek Kütüphanesi</h2>
            <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass}`}>
              <CardHeader className="p-0 mb-4">
                <CardTitle className={`text-lg font-semibold ${textClass}`}>Kategori Seçerek Yiyecek Bul</CardTitle>
                <CardDescription className={subTextClass}>
                  İlgilendiğiniz kategoriye göre yiyecekleri listeleyin veya arama yapın.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Kategori Seçim Alanı */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                  <Button onClick={() => { setSelectedFoodCategory(null); setFoodQuery(''); setSearchResults(foods); }} 
                    variant={!selectedFoodCategory ? 'default' : 'outline'} 
                    className={`h-20 flex flex-col items-center justify-center rounded-lg shadow-sm transition-all ${!selectedFoodCategory ? buttonPrimaryClass : buttonOutlineClass}`}
                  >
                    <Layers className="h-6 w-6 mb-1" />
                    <span className="text-xs">Tümü</span>
                  </Button>
                  {foodCategories.map(category => (
                    <Button key={category} onClick={() => { setSelectedFoodCategory(category); setFoodQuery(''); setSearchResults(getFoodsByCategory(category)); }} 
                      variant={selectedFoodCategory === category ? 'default' : 'outline'} 
                      className={`h-20 flex flex-col items-center justify-center rounded-lg shadow-sm transition-all ${selectedFoodCategory === category ? buttonPrimaryClass : buttonOutlineClass}`}
                    >
                      {category === 'Meyveler' && <Leaf className="h-6 w-6 mb-1 text-green-500" />}
                      {category === 'Sebzeler' && <CookingPot className="h-6 w-6 mb-1 text-lime-500" />}
                      {category === 'Et ve Et Ürünleri' && <Flame className="h-6 w-6 mb-1 text-red-500" />}
                      {category === 'Süt ve Süt Ürünleri' && <Droplet className="h-6 w-6 mb-1 text-blue-400" />}
                      {category === 'Tahıllar' && <Layers className="h-6 w-6 mb-1 text-yellow-500" />}
                      {category === 'Baklagiller' && <ClipboardList className="h-6 w-6 mb-1 text-purple-500" />}
                      {category === 'İçecekler' && <GlassWater className="h-6 w-6 mb-1 text-cyan-500" />}
                      {category === 'Deniz Ürünleri' && <Fish className="h-6 w-6 mb-1 text-blue-500" />}
                      {category === 'Atıştırmalıklar' && <Pizza className="h-6 w-6 mb-1 text-orange-400" />}
                      {category === 'Kuruyemişler' && <Star className="h-6 w-6 mb-1 text-yellow-600" />}
                      {category === 'Yağlar' && <Droplet className="h-6 w-6 mb-1 text-amber-600" />}
                      {category === 'Tatlılar' && <Heart className="h-6 w-6 mb-1 text-pink-500" />}
                      {category === 'Fast Food' && <Slice className="h-6 w-6 mb-1 text-red-600" />}
                      {category === 'Baharatlar' && <Sparkles className="h-6 w-6 mb-1 text-fuchsia-500" />}
                      <span className="text-xs">{category}</span>
                    </Button>
                  ))}
                </div>

                {/* Arama Çubuğu */}
                <div className="relative mb-6">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${subTextClass}`} />
                  <Input
                    type="text"
                    placeholder="Yiyecek ara..."
                    value={foodQuery}
                    onChange={(e) => setFoodQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  />
                </div>

                {/* Yiyecek Listesi */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {(foodQuery || selectedFoodCategory ? searchResults : foods).map((food) => (
                    <li key={food.id} className={`${cardBgClass} p-4 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200`}>
                      <div>
                        <h3 className={`font-semibold ${textClass} text-lg mb-1`}>{food.name}</h3>
                        <p className={`text-sm ${subTextClass} mb-2`}>{food.category}</p>
                        <div className="flex flex-wrap gap-x-3 text-xs font-medium mb-3">
                           <span className={`${subTextClass}`}>
                            <Flame className="h-3 w-3 inline-block mr-1 text-orange-400" />
                            {food.calories} kcal
                          </span>
                          <span className={`${subTextClass}`}>
                            <Coffee className="h-3 w-3 inline-block mr-1 text-emerald-400" />
                            {food.protein}g P
                          </span>
                          <span className={`${subTextClass}`}>
                            <Pizza className="h-3 w-3 inline-block mr-1 text-yellow-400" />
                            {food.carbs}g K
                          </span>
                          <span className={`${subTextClass}`}>
                            <Fish className="h-3 w-3 inline-block mr-1 text-red-400" />
                            {food.fat}g Y
                          </span>
                        </div>
                      </div>
                      <Dialog open={isFoodDialogOpen && foodDialogContent?.id === food.id} onOpenChange={(open) => {
                        setIsFoodDialogOpen(open);
                        if (!open) setFoodDialogContent(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`w-full mt-2 ${buttonOutlineClass}`}
                            onClick={() => { setFoodDialogContent(food); setIsFoodDialogOpen(true);
                           setFoodQuantity(parseFloat(food.serving.replace('g', '').replace('ml', '').replace('adet', '').trim()) || 100); }}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Ekle
                          </Button>
                        </DialogTrigger>
                        <DialogContent className={`sm:max-w-[425px] rounded-lg ${darkMode ? 'bg-slate-900 border-slate-800 text-gray-50' : 'bg-white'}`}>
                          <DialogHeader>
                            <DialogTitle className={textClass}>{foodDialogContent?.name} Ekle</DialogTitle>
                            <DialogDescription className={subTextClass}>
                              Bu yiyeceği günlüğünüze ekleyin. Miktarını ve öğün zamanını belirtin.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="food-quantity" className="text-right">Miktar ({foodDialogContent?.serving.replace(/[\d.]/g, '') || 'g'})</Label>
                              <Input
                                id="food-quantity"
                                type="number"
                                value={foodQuantity}
                                onChange={(e) => setFoodQuantity(parseFloat(e.target.value))}
                                className={`col-span-3 rounded-md ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}
                                placeholder="Örn: 100"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="meal-time" className="text-right">Öğün</Label>
                              <Select onValueChange={(value) => setSelectedMeal(value as typeof selectedMeal)} value={selectedMeal} >
                                <SelectTrigger className={`col-span-3 rounded-md ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                                  <SelectValue placeholder="Öğün Zamanı Seç" />
                                </SelectTrigger>
                                <SelectContent className={`${darkMode ? 'bg-slate-900 border-slate-700 text-gray-50' : 'bg-white'}`}>
                                  {mealTimes.map(time => (
                                    <SelectItem key={time} value={time} className={`hover:bg-emerald-100 dark:hover:bg-slate-700 ${darkMode ? 'text-gray-50' : ''}`}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAddFoodToLog} disabled={!selectedMeal || foodQuantity <= 0} className="bg-emerald-600 hover:bg-emerald-700">
                              <Check className="h-4 w-4 mr-2" /> Günlüğe Ekle
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'recipes':
        return (
          <motion.div key="recipes" {...animationVariants} className="space-y-6 w-full">
            <h2 className={`text-3xl font-bold ${textClass}`}>Tarifler</h2>
            <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass}`}>
              <CardHeader className="p-0 mb-4">
                <CardTitle className={`text-lg font-semibold ${textClass}`}>Lezzetli Tarifleri Keşfet</CardTitle>
                <CardDescription className={subTextClass}>
                  Sağlıklı ve pratik tariflerle beslenmene lezzet kat.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative mb-6">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${subTextClass}`} />
                  <Input
                    type="text"
                    placeholder="Tarif ara..."
                    value={foodQuery}
                    onChange={(e) => setFoodQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  />
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {filteredRecipes.map(recipe => (
                    <li key={recipe.id} className={`${cardBgClass} p-4 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200`}>
                      <div>
                        <img 
                          src={recipe.image} 
                          alt={recipe.name} 
                          className="w-full h-32 object-cover rounded-md mb-3" 
                          onError={(e) => {
                            e.currentTarget.src = `https://placehold.co/400x300/e0e0e0/000000?text=Yemek`; // Fallback image
                          }}
                        />
                        <h3 className={`font-semibold ${textClass} text-lg mb-1`}>{recipe.name}</h3>
                        <p className={`text-sm ${subTextClass} mb-2 line-clamp-2`}>{recipe.description}</p>
                        <div className="flex flex-wrap gap-x-3 text-xs font-medium mb-3">
                          <Badge variant="secondary" className={badgeClass}>
                            <Clock className="h-3 w-3 inline-block mr-1 text-blue-400" />
                            {recipe.prepTime} Haz.
                          </Badge>
                          <Badge variant="secondary" className={badgeClass}>
                            <Clock className="h-3 w-3 inline-block mr-1 text-orange-400" />
                            {recipe.cookTime} Piş.
                          </Badge>
                          <Badge variant="secondary" className={badgeClass}>
                            <Flame className="h-3 w-3 inline-block mr-1 text-red-400" />
                            {recipe.caloriesPerServing} kcal
                          </Badge>
                        </div>
                      </div>
                      <Dialog open={isRecipeDialogOpen && recipeDialog?.id === recipe.id} onOpenChange={(open) => {
                        setIsRecipeDialogOpen(open);
                        if (!open) setRecipeDialog(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`w-full mt-2 ${buttonOutlineClass}`}
                            onClick={() => { setRecipeDialog(recipe); setIsRecipeDialogOpen(true); }}
                          >
                            <BookOpen className="h-4 w-4 mr-2" /> Tarifi Gör
                          </Button>
                        </DialogTrigger>
                        <DialogContent className={`sm:max-w-[600px] rounded-lg ${darkMode ? 'bg-slate-900 border-slate-800 text-gray-50' : 'bg-white'}`}>
                          <DialogHeader>
                            <DialogTitle className={textClass}>{recipeDialog?.name}</DialogTitle>
                            <DialogDescription className={subTextClass}>
                              {recipeDialog?.description}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                            {recipeDialog?.image && (
                              <img 
                                src={recipeDialog.image} 
                                alt={recipeDialog.name} 
                                className="w-full h-48 object-cover rounded-md mb-4" 
                                onError={(e) => {
                                  e.currentTarget.src = `https://placehold.co/600x400/e0e0e0/000000?text=Yemek`; // Fallback image
                                }}
                              />
                            )}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className={`font-semibold ${textClass} mb-2`}>Hazırlık Süresi</h4>
                                <Badge variant="secondary" className={badgeClass}>
                                  <Clock className="h-3 w-3 mr-1" /> {recipeDialog?.prepTime}
                                </Badge>
                              </div>
                              <div>
                                <h4 className={`font-semibold ${textClass} mb-2`}>Pişirme Süresi</h4>
                                <Badge variant="secondary" className={badgeClass}>
                                  <Clock className="h-3 w-3 mr-1" /> {recipeDialog?.cookTime}
                                </Badge>
                              </div>
                              <div>
                                <h4 className={`font-semibold ${textClass} mb-2`}>Porsiyon</h4>
                                <Badge variant="secondary" className={badgeClass}>
                                  <Scale className="h-3 w-3 mr-1" /> {recipeDialog?.servings}
                                </Badge>
                              </div>
                              <div>
                                <h4 className={`font-semibold ${textClass} mb-2`}>Kalori</h4>
                                <Badge variant="secondary" className={badgeClass}>
                                  <Flame className="h-3 w-3 mr-1" /> {recipeDialog?.caloriesPerServing} kcal
                                </Badge>
                              </div>
                            </div>
                            
                            <h4 className={`font-semibold ${textClass} mb-2`}>Malzemeler:</h4>
                            <ul className={`list-disc list-inside text-sm ${subTextClass} mb-4`}>
                              {recipeDialog?.ingredients.map((ingredient, index) => (
                                <li key={index}>{ingredient.quantity} {ingredient.unit} {ingredient.name}</li>
                              ))}
                            </ul>

                            <h4 className={`font-semibold ${textClass} mb-2`}>Talimatlar:</h4>
                            <ol className={`list-decimal list-inside text-sm ${subTextClass} space-y-2`}>
                              {recipeDialog?.instructions.map((instruction, index) => (
                                <li key={index}>{instruction}</li>
                              ))}
                            </ol>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'diets':
        return (
          <motion.div key="diets" {...animationVariants} className="space-y-6 w-full">
            <h2 className={`text-3xl font-bold ${textClass}`}>Diyet Programları</h2>
            <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass}`}>
              <CardHeader className="p-0 mb-4">
                <CardTitle className={`text-lg font-semibold ${textClass}`}>Sana Uygun Diyeti Bul</CardTitle>
                <CardDescription className={subTextClass}>
                  Farklı diyet programlarını keşfet ve hedeflerine ulaşmak için birini seç.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularDiets.map(diet => (
                    <li key={diet.id} className={`${cardBgClass} p-4 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200`}>
                      <div>
                        <h3 className={`font-semibold ${textClass} text-lg mb-1`}>{diet.name}</h3>
                        <p className={`text-sm ${subTextClass} mb-2 line-clamp-2`}>{diet.description}</p>
                        <div className="flex flex-wrap gap-x-3 text-xs font-medium mb-3">
                          {diet.caloriesPerDay && (
                            <Badge variant="secondary" className={badgeClass}>
                              <Flame className="h-3 w-3 inline-block mr-1 text-orange-400" />
                              {diet.caloriesPerDay} kcal/gün
                            </Badge>
                          )}
                          {diet.difficulty && (
                            <Badge variant="secondary" className={badgeClass}>
                              <Dumbbell className="h-3 w-3 inline-block mr-1 text-purple-400" />
                              {diet.difficulty}
                            </Badge>
                          )}
                          {diet.eatingWindow && (
                            <Badge variant="secondary" className={badgeClass}>
                              <Clock className="h-3 w-3 inline-block mr-1 text-blue-400" />
                              {diet.eatingWindow}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Dialog open={isDietDialogOpen && selectedDiet?.id === diet.id} onOpenChange={(open) => {
                        setIsDietDialogOpen(open);
                        if (!open) setSelectedDiet(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`w-full mt-2 ${buttonOutlineClass}`}
                            onClick={() => { setSelectedDiet(diet); setIsDietDialogOpen(true); }}
                          >
                            <BookOpen className="h-4 w-4 mr-2" /> Diyeti İncele
                          </Button>
                        </DialogTrigger>
                        <DialogContent className={`sm:max-w-[700px] rounded-lg ${darkMode ? 'bg-slate-900 border-slate-800 text-gray-50' : 'bg-white'}`}>
                          <DialogHeader>
                            <DialogTitle className={textClass}>{selectedDiet?.name}</DialogTitle>
                            <DialogDescription className={subTextClass}>
                              {selectedDiet?.description}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {selectedDiet?.target && (
                                <div>
                                  <h4 className={`font-semibold ${textClass} mb-2`}>Hedef:</h4>
                                  <Badge variant="secondary" className={badgeClass}>
                                    <Target className="h-3 w-3 mr-1" /> {selectedDiet.target}
                                  </Badge>
                                </div>
                              )}
                              {selectedDiet?.caloriesPerDay && (
                                <div>
                                  <h4 className={`font-semibold ${textClass} mb-2`}>Ort. Kalori/Gün:</h4>
                                  <Badge variant="secondary" className={badgeClass}>
                                    <Flame className="h-3 w-3 mr-1" /> {selectedDiet.caloriesPerDay} kcal
                                  </Badge>
                                </div>
                              )}
                              {selectedDiet?.macronutrients && (
                                <div>
                                  <h4 className={`font-semibold ${textClass} mb-2`}>Makrolar:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className={badgeClass}>P: {selectedDiet.macronutrients.protein}</Badge>
                                    <Badge variant="secondary" className={badgeClass}>K: {selectedDiet.macronutrients.carbs}</Badge>
                                    <Badge variant="secondary" className={badgeClass}>Y: {selectedDiet.macronutrients.fat}</Badge>
                                  </div>
                                </div>
                              )}
                              {selectedDiet?.fastingPeriod && (
                                <div>
                                  <h4 className={`font-semibold ${textClass} mb-2`}>Oruç Süresi:</h4>
                                  <Badge variant="secondary" className={badgeClass}>
                                    <Clock className="h-3 w-3 mr-1" /> {selectedDiet.fastingPeriod}
                                  </Badge>
                                </div>
                              )}
                              {selectedDiet?.eatingWindow && (
                                <div>
                                  <h4 className={`font-semibold ${textClass} mb-2`}>Yemek Penceresi:</h4>
                                  <Badge variant="secondary" className={badgeClass}>
                                    <Clock className="h-3 w-3 mr-1" /> {selectedDiet.eatingWindow}
                                  </Badge>
                                </div>
                              )}
                              {selectedDiet?.duration && (
                                <div>
                                  <h4 className={`font-semibold ${textClass} mb-2`}>Süre:</h4>
                                  <Badge variant="secondary" className={badgeClass}>
                                    <Calendar className="h-3 w-3 mr-1" /> {selectedDiet.duration}
                                  </Badge>
                                </div>
                              )}
                            </div>

                            <h4 className={`font-semibold ${textClass} mb-2`}>Haftalık Program:</h4>
                            {selectedDiet?.weeklyProgram.map(dayProgram => (
                              <div key={dayProgram.day} className={`mb-4 p-3 rounded-md ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                                <h5 className={`font-bold text-emerald-600 dark:text-emerald-400 mb-2`}>{dayProgram.day}</h5>
                                <ul className="space-y-1">
                                  {dayProgram.program.map((meal, index) => (
                                    <li key={index} className="text-sm">
                                      <span className="font-semibold">{meal.hour} - {meal.meal}:</span> {meal.foods.join(', ')}
                                      {meal.notes && <span className={`text-xs italic ${subTextClass}`}> ({meal.notes})</span>}
                                      {meal.nutrition && (
                                        <div className={`flex flex-wrap gap-x-2 text-xs mt-1 ${subTextClass}`}>
                                          <Badge variant="secondary" className={badgeClass}>
                                            <Flame className="h-3 w-3 mr-1" /> {meal.nutrition.calories} kcal
                                          </Badge>
                                          <Badge variant="secondary" className={badgeClass}>
                                            <Coffee className="h-3 w-3 mr-1" /> {meal.nutrition.protein}g P
                                          </Badge>
                                          <Badge variant="secondary" className={badgeClass}>
                                            <Pizza className="h-3 w-3 mr-1" /> {meal.nutrition.carbs}g K
                                          </Badge>
                                          <Badge variant="secondary" className={badgeClass}>
                                            <Fish className="h-3 w-3 mr-1" /> {meal.nutrition.fat}g Y
                                          </Badge>
                                        </div>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                          <DialogFooter>
                            <Button onClick={() => handleStartDiet(selectedDiet!)} className="bg-emerald-600 hover:bg-emerald-700">
                              <Check className="h-4 w-4 mr-2" /> Diyete Başla
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'exercises':
        return (
          <motion.div key="exercises" {...animationVariants} className="space-y-6 w-full">
            <h2 className={`text-3xl font-bold ${textClass}`}>Egzersiz Kütüphanesi</h2>
            <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass}`}>
              <CardHeader className="p-0 mb-4">
                <CardTitle className={`text-lg font-semibold ${textClass}`}>Egzersizleri Keşfet</CardTitle>
                <CardDescription className={subTextClass}>
                  Farklı egzersiz türlerini ve zorluk seviyelerini filtreleyerek sana uygun olanı bul.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Egzersiz Filtreleri */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <Select onValueChange={setSelectedExerciseType} value={selectedExerciseType}>
                    <SelectTrigger className={`w-[180px] rounded-md ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                      <SelectValue placeholder="Tüm Tipler" />
                    </SelectTrigger>
                    <SelectContent className={`${darkMode ? 'bg-slate-900 border-slate-700 text-gray-50' : 'bg-white'}`}>
                      <SelectItem value="all">Tüm Tipler</SelectItem>
                      <SelectItem value="cardio">Kardiyo</SelectItem>
                      <SelectItem value="strength">Kuvvet</SelectItem>
                      <SelectItem value="flexibility">Esneklik</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={setSelectedExerciseDifficulty} value={selectedExerciseDifficulty}>
                    <SelectTrigger className={`w-[180px] rounded-md ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                      <SelectValue placeholder="Tüm Zorluklar" />
                    </SelectTrigger>
                    <SelectContent className={`${darkMode ? 'bg-slate-900 border-slate-700 text-gray-50' : 'bg-white'}`}>
                      <SelectItem value="all">Tüm Zorluklar</SelectItem>
                      <SelectItem value="beginner">Başlangıç</SelectItem>
                      <SelectItem value="intermediate">Orta</SelectItem>
                      <SelectItem value="advanced">İleri</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-grow">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${subTextClass}`} />
                    <Input
                      type="text"
                      placeholder="Egzersiz ara..."
                      value={exerciseSearchQuery}
                      onChange={(e) => setExerciseSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                {/* Egzersiz Listesi */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {filteredExercises.map(exercise => (
                    <li key={exercise.id} className={`${cardBgClass} p-4 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200`}>
                      <div>
                        <h3 className={`font-semibold ${textClass} text-lg mb-1`}>{exercise.name}</h3>
                        <p className={`text-sm ${subTextClass} mb-2 line-clamp-2`}>{exercise.description}</p>
                        <div className="flex flex-wrap gap-x-3 text-xs font-medium mb-3">
                          <Badge variant="secondary" className={badgeClass}>
                            <Dumbbell className="h-3 w-3 inline-block mr-1 text-purple-400" />
                            {exercise.type}
                          </Badge>
                          <Badge variant="secondary" className={badgeClass}>
                            <TrendingUp className="h-3 w-3 inline-block mr-1 text-red-400" />
                            {exercise.difficulty}
                          </Badge>
                          <Badge variant="secondary" className={badgeClass}>
                            <Flame className="h-3 w-3 inline-block mr-1 text-orange-400" />
                            {exercise.caloriesPerMinute} kcal/dk
                          </Badge>
                        </div>
                      </div>
                      <Dialog open={isExerciseDialogOpen && selectedExercise?.id === exercise.id} onOpenChange={(open) => {
                        setIsExerciseDialogOpen(open);
                        if (!open) setSelectedExercise(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`w-full mt-2 ${buttonOutlineClass}`}
                            onClick={() => { setSelectedExercise(exercise); setIsExerciseDialogOpen(true); }}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Egzersiz Ekle
                          </Button>
                        </DialogTrigger>
                        <DialogContent className={`sm:max-w-[425px] rounded-lg ${darkMode ? 'bg-slate-900 border-slate-800 text-gray-50' : 'bg-white'}`}>
                          <DialogHeader>
                            <DialogTitle className={textClass}>{selectedExercise?.name} Ekle</DialogTitle>
                            <DialogDescription className={subTextClass}>
                              Bu egzersizi günlüğünüze ekleyin. Ne kadar süre yaptığınızı belirtin.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="exercise-minutes" className="text-right">Süre (dakika)</Label>
                              <Input
                                id="exercise-minutes"
                                type="number"
                                value={exerciseMinutes}
                                onChange={(e) => setExerciseMinutes(e.target.value)}
                                className={`col-span-3 rounded-md ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}
                                placeholder="Örn: 30"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAddExercise} disabled={!exerciseMinutes || parseFloat(exerciseMinutes) <= 0} className="bg-emerald-600 hover:bg-emerald-700">
                              <Check className="h-4 w-4 mr-2" /> Ekle
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        );
        case 'recipe-suggest':
  return (
    <motion.div key="recipe-suggest" {...animationVariants} className="space-y-6 w-full">
      <h2 className={`text-3xl font-bold ${textClass}`}>Malzemeye Göre Tarif Sihirbazı</h2>
      <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass}`}>
        <CardHeader className="p-0 mb-4">
          <CardTitle className={`text-lg font-semibold ${textClass}`}>Elinizdeki Malzemeleri Girin</CardTitle>
          <CardDescription className={subTextClass}>
            Malzemelerini ekle ve sihirbazın senin için ne pişireceğini gör!
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          {/* Malzeme Ekleme Alanı */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Örn: Tavuk, domates, pirinç..."
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleAddIngredient(); }}
              className={`flex-1 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
              disabled={isRecommending}
            />
            <Button onClick={handleAddIngredient} className={buttonPrimaryClass} disabled={isRecommending}>
              <Plus className="h-4 w-4 mr-2" /> Ekle
            </Button>
          </div>

          {/* Eklenen Malzemeler */}
          {ingredients.length > 0 && (
            <div className="p-3 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <Badge key={index} variant="secondary" className={`py-1 px-3 text-sm rounded-full ${badgeClass} flex items-center`}>
                    {ingredient}
                    <button onClick={() => handleRemoveIngredient(ingredient)} className="ml-2 text-red-500 hover:text-red-700" disabled={isRecommending}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* İKİ YENİ BUTON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Button
              onClick={() => handleGetRecipes('strict')}
              className="w-full text-md h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg rounded-xl transition-all"
              disabled={isRecommending || ingredients.length === 0}
            >
              <Sparkles className="mr-2 h-5 w-5" /> Sadece Bu Malzemelerle
            </Button>
            <Button
              onClick={() => handleGetRecipes('flexible')}
              className="w-full text-md h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg rounded-xl transition-all"
              disabled={isRecommending || ingredients.length === 0}
            >
              <Plus className="mr-2 h-5 w-5" /> Malzemeleri Tamamla
            </Button>
          </div>

          {isRecommending && (
             <div className="flex justify-center items-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin text-emerald-500 mr-2" />
                <span className={textClass}>Tarif sihirbazı çalışıyor...</span>
              </div>
          )}

          {/* YENİ SONUÇ ALANI */}
          {recipes && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 space-y-4 p-4 rounded-lg border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
            >
              <div>
                <h3 className={`text-xl font-semibold mb-2 ${textClass}`}>Kullanılan Malzemeler</h3>
                <div className="flex flex-wrap gap-2">
                  {recipes.ingredients.map((ing, index) => (
                    <Badge key={index} className={`font-semibold ${ing.isUserIngredient
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border-rose-300'
                      }`}
                    >
                      {ing.isUserIngredient ? <Check className="h-4 w-4 mr-1"/> : <Plus className="h-4 w-4 mr-1"/>}
                      {ing.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className={`text-xl font-semibold mb-2 ${textClass}`}>Tarif</h3>
                <div className={`text-sm whitespace-pre-wrap leading-relaxed ${subTextClass}`}>{recipes.recipe}</div>
              </div>
            </motion.div>
          )}

        </CardContent>
      </Card>
    </motion.div>
  );
  
      

      case 'profile':
        const currentWeight = parseFloat(profileForm.weight) || 0;
        const currentHeight = parseFloat(profileForm.height) || 0;
        const currentAge = parseInt(profileForm.age) || 0;
        const currentGender = profileForm.gender as Gender;
        const currentActivity = profileForm.activityLevel as keyof typeof activityLevels;

        const profileBMI = calculateBMI(currentWeight, currentHeight);
        const profileBMR = currentGender && currentAge && currentHeight && currentWeight
          ? calcBMR(currentGender, currentAge, currentHeight, currentWeight)
          : undefined;
        const profileDailyGoal = currentGender && currentAge && currentHeight && currentWeight && currentActivity
          ? calcDailyGoal(currentGender, currentAge, currentHeight, currentWeight, currentActivity)
          : undefined;
        const recommendedWater = currentWeight ? Math.round(currentWeight * 35) : 'N/A';
        
        return (
          <motion.div key="profile" {...animationVariants} className="space-y-6 w-full">
            <h2 className={`text-3xl font-bold ${textClass}`}>Profilim</h2>
            <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass}`}>
              <CardHeader className="p-0 mb-4">
                <CardTitle className={`text-lg font-semibold ${textClass}`}>Kişisel Bilgiler</CardTitle>
                <CardDescription className={subTextClass}>
                  Profil bilgilerinizi düzenleyin ve sağlık metriklerinizi görün.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="profile-name" className={subTextClass}>Adınız</Label>
                      <Input id="profile-name" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className={`${darkMode ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-gray-50 border-gray-200'} ${placeholderClass}`} />
                    </div>
                    <div>
                      <Label htmlFor="profile-email" className={subTextClass}>E-posta</Label>
                      <Input id="profile-email" type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className={`${darkMode ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-gray-50 border-gray-200'} ${placeholderClass}`} />
                    </div>
                    <div>
                      <Label htmlFor="profile-age" className={subTextClass}>Yaş</Label>
                      <Input id="profile-age" type="number" value={profileForm.age} onChange={e => setProfileForm({...profileForm, age: e.target.value})} className={`${darkMode ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-gray-50 border-gray-200'} ${placeholderClass}`} />
                    </div>
                    <div>
                      <Label htmlFor="profile-weight" className={subTextClass}>Kilo (kg)</Label>
                      <Input id="profile-weight" type="number" step="0.1" value={profileForm.weight} onChange={e => setProfileForm({...profileForm, weight: e.target.value})} className={`${darkMode ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-gray-50 border-gray-200'} ${placeholderClass}`} />
                    </div>
                    <div>
                      <Label htmlFor="profile-height" className={subTextClass}>Boy (cm)</Label>
                      <Input id="profile-height" type="number" step="0.1" value={profileForm.height} onChange={e => setProfileForm({...profileForm, height: e.target.value})} className={`${darkMode ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-gray-50 border-gray-200'} ${placeholderClass}`} />
                    </div>
                    <div>
                      <Label htmlFor="profile-gender" className={subTextClass}>Cinsiyet</Label>
                      <Select name="profile-gender" value={profileForm.gender} onValueChange={(value) => setProfileForm({...profileForm, gender: value})}>
                        <SelectTrigger className={`${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                          <SelectValue placeholder="Cinsiyet Seç" />
                        </SelectTrigger>
                        <SelectContent className={`${darkMode ? 'bg-slate-900 border-slate-700 text-gray-50' : 'bg-white'}`}>
                          <SelectItem value="male">Erkek</SelectItem>
                          <SelectItem value="female">Kadın</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="profile-activity" className={subTextClass}>Aktivite Seviyesi</Label>
                      <Select name="profile-activity" value={profileForm.activityLevel} onValueChange={(value) => setProfileForm({...profileForm, activityLevel: value})}>
                        <SelectTrigger className={`${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                          <SelectValue placeholder="Aktivite Seviyesi Seç" />
                        </SelectTrigger>
                        <SelectContent className={`${darkMode ? 'bg-slate-900 border-slate-700 text-gray-50' : 'bg-white'}`}>
                          {Object.entries(activityLevels).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className={buttonPrimaryClass}>
                    <Save className="h-4 w-4 mr-2" /> Profili Güncelle
                  </Button>
                </form>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mevcut Paket Kartı eklendi */}
                  <div className={`col-span-1 sm:col-span-2 p-5 rounded-xl border-2 ${user?.packageInfo?.PackageName === 'Premium' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold ${textClass} text-lg mb-1 flex items-center`}>
                          <Star className={`h-6 w-6 mr-2 ${user?.packageInfo?.PackageName === 'Premium' ? 'text-amber-500 fill-amber-500' : 'text-emerald-500 fill-emerald-500'}`} /> Mevcut Aboneliğiniz
                        </h3>
                        <p className={`text-3xl font-extrabold ${user?.packageInfo?.PackageName === 'Premium' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {user?.packageInfo?.PackageName || 'Basic'} Paket
                        </p>
                      </div>
                      <Button onClick={() => setActiveTab('packages')} className="bg-white text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 shadow-sm rounded-xl transition-all">
                        Paketleri İncele
                      </Button>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                    <h3 className={`font-semibold ${textClass} text-lg mb-2 flex items-center`}>
                      <Ruler className="h-5 w-5 mr-2 text-indigo-500" /> VKİ (Vücut Kitle İndeksi)
                    </h3>
                    <p className={`text-2xl font-bold ${textClass}`}>{profileBMI}</p>
                    <p className={`text-sm ${subTextClass}`}>
                      {profileBMI !== 'N/A' && parseFloat(profileBMI as string) < 18.5 && 'Zayıf'}
                      {profileBMI !== 'N/A' && parseFloat(profileBMI as string) >= 18.5 && parseFloat(profileBMI as string) < 24.9 && 'Normal kilolu'}
                      {profileBMI !== 'N/A' && parseFloat(profileBMI as string) >= 25 && parseFloat(profileBMI as string) < 29.9 && 'Fazla kilolu'}
                      {profileBMI !== 'N/A' && parseFloat(profileBMI as string) >= 30 && 'Obez'}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                    <h3 className={`font-semibold ${textClass} text-lg mb-2 flex items-center`}>
                      <BatteryCharging className="h-5 w-5 mr-2 text-green-500" /> BMR (Bazal Metabolizma Hızı)
                    </h3>
                    <p className={`text-2xl font-bold ${textClass}`}>{profileBMR !== undefined ? `${profileBMR} kcal` : 'N/A'}</p>
                    <p className={`text-sm ${subTextClass}`}>Dinlenirken vücudunuzun yaktığı kalori miktarı.</p>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                    <h3 className={`font-semibold ${textClass} text-lg mb-2 flex items-center`}>
                      <Flame className="h-5 w-5 mr-2 text-orange-500" /> Günlük Kalori İhtiyacı
                    </h3>
                    <p className={`text-2xl font-bold ${textClass}`}>{profileDailyGoal !== undefined ? `${profileDailyGoal} kcal` : 'N/A'}</p>
                    <p className={`text-sm ${subTextClass}`}>Günlük aktivite seviyenize göre önerilen kalori.</p>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                    <h3 className={`font-semibold ${textClass} text-lg mb-2 flex items-center`}>
                      <GlassWater className="h-5 w-5 mr-2 text-blue-500" /> Önerilen Su Tüketimi
                    </h3>
                    <p className={`text-2xl font-bold ${textClass}`}>{recommendedWater} ml</p>
                    <p className={`text-sm ${subTextClass}`}>Vücut ağırlığınıza göre günlük su hedefi.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'ai-chat':
        return (
          <motion.div key="ai-chat" {...animationVariants} className="space-y-6 w-full h-full flex flex-col">
            <h2 className={`text-3xl font-bold ${textClass}`}>DiyetGPT</h2>
            <Card className={`flex-1 p-6 shadow-sm rounded-2xl ${cardBgClass} flex flex-col`}>
              <CardHeader className="p-0 mb-4">
                <CardTitle className={`text-lg font-semibold ${textClass}`}>Akıllı Asistanınızla Sohbet Edin</CardTitle>
                <CardDescription className={subTextClass}>
                  Beslenme, egzersiz veya genel sağlık hakkında sorular sorun.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar mb-4 space-y-4">
                  {aiChatMessages.length === 0 && (
                    <div className={`text-center py-8 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                      <p className={subTextClass}>Henüz bir sohbet başlatmadınız. Bir şeyler yazın ve DiyetGPT'den yardım alın!</p>
                    </div>
                  )}
                  {aiChatMessages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[70%] p-3 rounded-xl ${
                          msg.role === 'user' 
                            ? 'bg-emerald-600 text-white rounded-br-none' 
                            : `${darkMode ? 'bg-slate-700' : 'bg-gray-200'} ${textClass} rounded-bl-none`
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <span className={`block text-xs mt-1 ${msg.role === 'user' ? 'text-emerald-100' : subTextClass}`}>
                          {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className={`${darkMode ? 'bg-slate-700' : 'bg-gray-200'} ${textClass} p-3 rounded-xl rounded-bl-none`}>
                        <p className="text-sm">Yazıyor...</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-auto">
                  <Input
                    type="text"
                    placeholder="Mesajınızı yazın..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSendAiMessage(); }}
                    className={`flex-1 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                    disabled={aiLoading}
                  />
                  <Button onClick={handleSendAiMessage} className={buttonPrimaryClass} disabled={!aiInput.trim() || aiLoading}>
                    <MessageSquareText className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
        case 'packages':
        return (
          <motion.div key="packages" {...animationVariants} className="space-y-6 w-full">
            <PackagesScreen user={user} setUser={setUser} />
          </motion.div>
        );
       case 'blood-test':
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-slate-800 dark:to-slate-950 shadow-xl border-emerald-300 dark:border-slate-700 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            <Droplet className="h-8 w-8 text-emerald-600 dark:text-emerald-400 animate-pulse" /> Kan Sonuçları Analizi
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
            Kan testi sonuçlarınızı görsel olarak analiz ederek kişiselleştirilmiş beslenme önerileri alın.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Fotoğraf Yükleme Bölümü */}
            <div className="flex-1 w-full relative">
              <Label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center space-y-4 cursor-pointer p-8 rounded-3xl transition-all duration-300 border-4 ${imageUrl ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50' : 'border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500'}`}
              >
                {imageUrl ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }} className="text-center">
                    <img src={imageUrl} alt="Kan Testi Önizlemesi" className="max-h-80 w-auto rounded-xl shadow-2xl object-contain mb-4" />
                    <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                      Yüklendi: {imageFile?.name}
                    </span>
                  </motion.div>
                ) : (
                  <>
                    <Image className="h-16 w-16 text-gray-400 mb-2" />
                    <div className="text-center">
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Fotoğraf yükle</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sürükle & bırak veya tıklayarak dosya seçin</p>
                    </div>
                  </>
                )}
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isAnalyzing}
                />
              </Label>
            </div>
            {/* VEYA yazısı */}
            <div className="flex-shrink-0 text-2xl font-extrabold text-gray-400 dark:text-gray-500 hidden md:block">VEYA</div>
            <div className="flex-shrink-0 text-2xl font-extrabold text-gray-400 dark:text-gray-500 block md:hidden"></div>
            {/* Metin Giriş Bölümü - Daha modern dosya stili */}
            <div className="flex-1 w-full relative">
              <Label htmlFor="blood-test-text" className="sr-only">Kan Sonuçlarını Yazın</Label>
              <Textarea
                id="blood-test-text"
                placeholder="Örnek: Hemoglobin: 14.5 g/dL, Glukoz: 95 mg/dL, Kolesterol: 205 mg/dL..."
                value={bloodTestResults}
                onChange={(e) => {
                  setBloodTestResults(e.target.value);
                  setImageFile(null);
                  setImageUrl(null);
                }}
                rows={12}
                className={`resize-none transition-all duration-300 border-2 rounded-2xl p-4 text-base focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-400
                  ${imageUrl ? 'opacity-50 pointer-events-none' : 'opacity-100'}
                  bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-800 dark:text-gray-200
                  shadow-md`}
                disabled={!!imageUrl || isAnalyzing}
              />
            </div>
          </div>

          <Button
            onClick={handleAnalyzeBloodTest}
            className="w-full text-lg h-14 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-bold shadow-lg rounded-xl transition-all duration-300 transform hover:scale-105"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="mr-3 h-6 w-6 animate-spin" /> Analiz Ediliyor...
              </>
            ) : (
              <>
                <Flame className="mr-3 h-6 w-6" /> Sonuçları Analiz Et
              </>
            )}
          </Button>

          {bloodTestAnalysis && (
            <AnimatePresence>
              <motion.div
                key="analysis"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Card className="mt-6 bg-slate-50 dark:bg-slate-800 shadow-inner border border-gray-200 dark:border-slate-700 rounded-xl">
                  <CardHeader className="flex flex-row items-center space-x-3">
                    <Bot className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    <CardTitle className="text-xl font-semibold">DiyetGPT Analizi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{bloodTestAnalysis}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );


      
      case 'tips':
        return (
          <motion.div key="tips" {...animationVariants} className="space-y-6 w-full">
            <h2 className={`text-3xl font-bold ${textClass}`}>Günlük İpuçları</h2>
            <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass} min-h-[200px] flex flex-col justify-center items-center`}>
              <CardContent className="p-0 text-center">
                <Sparkles className="h-12 w-12 text-yellow-500 mb-4" />
                <p className={`text-xl font-medium ${textClass}`}>{randomTip}</p>
              </CardContent>
            </Card>
            <Button onClick={() => setRandomTip(dailyTips[Math.floor(Math.random() * dailyTips.length)])} className={buttonPrimaryClass}>
              <RefreshCw className="h-4 w-4 mr-2" /> Yeni İpucu Göster
            </Button>
          </motion.div>
        );

      case 'settings':
        return (
          <motion.div key="settings" {...animationVariants} className="space-y-6 w-full">
            <h2 className={`text-3xl font-bold ${textClass}`}>Ayarlar</h2>
            <Card className={`p-6 shadow-sm rounded-2xl ${cardBgClass}`}>
              <CardHeader className="p-0 mb-4">
                <CardTitle className={`text-lg font-semibold ${textClass}`}>Uygulama Ayarları</CardTitle>
                <CardDescription className={subTextClass}>
                  Uygulama deneyiminizi kişiselleştirin.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className={textClass}>Bildirimler</Label>
                  <input 
                    type="checkbox" 
                    id="notifications" 
                    checked={appSettings.notifications} 
                    onChange={(e) => setAppSettings(prev => ({ ...prev, notifications: e.target.checked }))} 
                    className="h-5 w-5 rounded focus:ring-emerald-500 text-emerald-600 dark:bg-slate-700 dark:border-slate-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="weight-unit" className={textClass}>Kilo Birimi</Label>
                  <Select value={appSettings.weightUnit} onValueChange={(value: 'kg' | 'lb') => setAppSettings(prev => ({ ...prev, weightUnit: value }))}>
                    <SelectTrigger className={`w-[120px] rounded-md ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={`${darkMode ? 'bg-slate-900 border-slate-700 text-gray-50' : 'bg-white'}`}>
                      <SelectItem value="kg">KG</SelectItem>
                      <SelectItem value="lb">LB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="height-unit" className={textClass}>Boy Birimi</Label>
                  <Select value={appSettings.heightUnit} onValueChange={(value: 'cm' | 'in') => setAppSettings(prev => ({ ...prev, heightUnit: value }))}>
                    <SelectTrigger className={`w-[120px] rounded-md ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={`${darkMode ? 'bg-slate-900 border-slate-700 text-gray-50' : 'bg-white'}`}>
                      <SelectItem value="cm">CM</SelectItem>
                      <SelectItem value="in">İNÇ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="language" className={textClass}>Dil</Label>
                  <Select value={appSettings.language} onValueChange={(value: 'tr' | 'en') => setAppSettings(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger className={`w-[120px] rounded-md ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={`${darkMode ? 'bg-slate-900 border-slate-700 text-gray-50' : 'bg-white'}`}>
                      <SelectItem value="tr">Türkçe</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode" className={textClass}>Koyu Mod</Label>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleTheme} 
                    className="text-gray-500 dark:text-gray-400"
                  >
                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Diğer ayarlar burada olabilir */}
          </motion.div>
        );


      default:
        return null;
    }
  };


  // Ana render alanı
  return (
    <div className={`flex h-screen ${mainBgClass} font-inter overflow-hidden`}>
      {/* Sol Kenar Çubuğu (Sabit) */}
      <aside className={`w-64 flex-shrink-0 border-r ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'} hidden md:flex flex-col p-4`}>
        {/* Logo ve Başlık */}
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-2xl font-bold ${textClass} flex items-center`}>
            <Leaf className="h-6 w-6 mr-2 text-emerald-500" /> DiyetGPT
          </h1>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className=" text-gray-500 dark:text-gray-400">
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button>
        </div>

        {/* Navigasyon Butonları */}
        <nav className="flex-1 space-y-1">
          <Button variant={activeTab === 'personal-screen' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'personal-screen' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => setActiveTab('personal-screen')}> <ClipboardList className="h-5 w-5 mr-3" /> Kontrol Paneli </Button>
          <Button variant={activeTab === 'food-category' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'food-category' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => setActiveTab('food-category')}> <CookingPot className="h-5 w-5 mr-3" /> Yiyecekler </Button>
          <Button variant={activeTab === 'photo-analysis' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'photo-analysis' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => setActiveTab('photo-analysis')}> <Image className="h-5 w-5 mr-3" /> Fotoğraf Analizi </Button>
          <Button variant={activeTab === 'recipes' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'recipes' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => setActiveTab('recipes')}> <BookOpen className="h-5 w-5 mr-3" /> Tarifler </Button>
          <Button variant={activeTab === 'diets' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'diets' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => setActiveTab('diets')}> <Target className="h-5 w-5 mr-3" /> Diyet Programları </Button>
          <Button variant={activeTab === 'blood-test' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'blood-test' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => { setActiveTab('blood-test'); setIsMobileMenuOpen(false); }}> <Droplet className="h-5 w-5 mr-3" /> Kan Sonuçları </Button>
          <Button
  variant={activeTab === 'recipe-suggest' ? 'secondary' : 'ghost'}
  className={`w-full justify-start mb-1.5 ${activeTab === 'recipe-suggest' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`}
  onClick={() => { setActiveTab('recipe-suggest'); setIsMobileMenuOpen(false); }}
>
  <CookingPot className="h-5 w-5 mr-3" /> Yemek Öner
</Button>

          <Button variant={activeTab === 'exercises' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'exercises' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => setActiveTab('exercises')}> <Dumbbell className="h-5 w-5 mr-3" /> Egzersizler </Button>
          <Button variant={activeTab === 'ai-chat' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'ai-chat' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => setActiveTab('ai-chat')}> <Bot className="h-5 w-5 mr-3" /> DiyetGPT </Button>
          <Button 
    variant={activeTab === 'packages' ? 'secondary' : 'ghost'} 
    className={`w-full justify-start mb-1.5 ${activeTab === 'packages' ? 'bg-yellow-100 dark:bg-slate-700 text-yellow-700 dark:text-yellow-400 font-bold' : 'text-gray-600 dark:text-gray-300'}`} 
    onClick={() => { setActiveTab('packages'); setIsMobileMenuOpen(false); }}> 
    <Star className="h-5 w-5 mr-3 fill-current" /> Premium Paketler 
</Button>
          <Button variant={activeTab === 'tips' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'tips' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => setActiveTab('tips')}> <Sparkles className="h-5 w-5 mr-3" /> İpuçları </Button>
        </nav>

        {/* Kullanıcı Profili ve Ayarlar */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant={activeTab === 'profile' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'profile' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => setActiveTab('profile')}> <UserIcon className="h-5 w-5 mr-3" /> Profil </Button>
    
            <Button variant={activeTab === 'settings' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'settings' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => setActiveTab('settings')}> <Settings className="h-5 w-5 mr-3" /> Ayarlar </Button>
            {user && (
                <div className="flex items-center gap-2 text-sm mt-4">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <UserIcon size={16} className={subTextClass} />
                </div>
                <span className={`font-semibold ${textClass}`}>{user.name}</span>
                </div>
            )}
             <Button onClick={() => { localStorage.clear(); navigate('/login'); }} className="w-full mt-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                <LogOut size={16} className="mr-2" /> Çıkış Yap
            </Button>
        </div>
      </aside>

      {/* Ana İçerik Alanı */}
      <main className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      {/* Mobil Menü Butonu */}
      <div className="md:hidden fixed bottom-4 right-4">
        <Button size="icon" className={buttonPrimaryClass} onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobil Kenar Çubuğu (Overlay) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className={`fixed inset-y-0 right-0 w-64 ${darkMode ? 'bg-slate-900 border-l border-slate-700' : 'bg-white border-l border-gray-200'} z-50 p-4 flex flex-col`}
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className={`text-2xl font-bold ${textClass} flex items-center`}>
                <Leaf className="h-6 w-6 mr-2 text-emerald-500" /> DiyetGPT
              </h1>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className={`${subTextClass}`}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1">
              <Button variant={activeTab === 'personal-screen' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'personal-screen' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => { setActiveTab('personal-screen'); setIsMobileMenuOpen(false); }}> <ClipboardList className="h-5 w-5 mr-3" /> Kontrol Paneli </Button>
              <Button variant={activeTab === 'food-category' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'food-category' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => { setActiveTab('food-category'); setIsMobileMenuOpen(false); }}> <CookingPot className="h-5 w-5 mr-3" /> Yiyecekler </Button>
              <Button variant={activeTab === 'photo-analysis' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'photo-analysis' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => { setActiveTab('photo-analysis'); setIsMobileMenuOpen(false); }}> <Image className="h-5 w-5 mr-3" /> Fotoğraf Analizi </Button>
              <Button variant={activeTab === 'recipes' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'recipes' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => { setActiveTab('recipes'); setIsMobileMenuOpen(false); }}> <BookOpen className="h-5 w-5 mr-3" /> Tarifler </Button>
              <Button variant={activeTab === 'diets' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'diets' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => { setActiveTab('diets'); setIsMobileMenuOpen(false); }}> <Target className="h-5 w-5 mr-3" /> Diyet Programları </Button>
              <Button variant={activeTab === 'profile' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'profile' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}> <UserIcon className="h-5 w-5 mr-3" /> Profil </Button>

<Button variant={activeTab === 'settings' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'settings' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}> <Settings className="h-5 w-5 mr-3" /> Ayarlar </Button>



              <Button variant={activeTab === 'exercises' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'exercises' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => { setActiveTab('exercises'); setIsMobileMenuOpen(false); }}> <Dumbbell className="h-5 w-5 mr-3" /> Egzersizler </Button>
              
              <Button variant={activeTab === 'ai-chat' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'ai-chat' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => { setActiveTab('ai-chat'); setIsMobileMenuOpen(false); }}> <Bot className="h-5 w-5 mr-3" /> DiyetGPT </Button>

              <Button variant={activeTab === 'tips' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'tips' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => { setActiveTab('tips'); setIsMobileMenuOpen(false); }}> <Sparkles className="h-5 w-5 mr-3" /> İpuçları </Button>
            </nav>
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-slate-700">
              <Button variant={activeTab === 'profile' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'profile' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}> <UserIcon className="h-5 w-5 mr-3" /> Profil </Button>
               {/* YENİ EKLENEN: PREMIUM PAKETLER SEKMESİ */}
    <Button 
        // Sekme aktifse 'secondary' görünümünü al, değilse 'ghost'
        variant={activeTab === 'packages' ? 'secondary' : 'ghost'} 
        className={`w-full justify-start mb-1.5 ${activeTab === 'packages' 
            // Aktif olduğunda özel sarı/altın renkler
            ? 'bg-yellow-100 dark:bg-slate-700 text-yellow-700 dark:text-yellow-400 font-bold' 
            : 'text-gray-600 dark:text-gray-300'}`} 
        
        // Tıklandığında aktif sekmeyi 'packages' olarak ayarla
        onClick={() => { setActiveTab('packages'); setIsMobileMenuOpen(false); }}> 
        
        {/* Star simgesini ekledik ve aktif olduğunda içini doldurmasını sağladık (fill-current) */}
        <Star className="h-5 w-5 mr-3 fill-current" /> Premium Paketler 
    </Button>
              <Button variant={activeTab === 'settings' ? 'secondary' : 'ghost'} className={`w-full justify-start mb-1.5 ${activeTab === 'settings' ? 'bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-white' : ''}`} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}> <Settings className="h-5 w-5 mr-3" /> Ayarlar </Button>
              
              {user && (
                <div className="flex items-center gap-2 text-sm mt-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <UserIcon size={16} className={subTextClass} />
                  </div>
                  <span className={`font-semibold ${textClass}`}>{user.name}</span>
                </div>
              )}
              <Button onClick={() => { localStorage.clear(); navigate('/login'); setIsMobileMenuOpen(false); }} className="w-full mt-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                <LogOut size={16} className="mr-2" /> Çıkış Yap
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

