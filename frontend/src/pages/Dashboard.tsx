import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import { Search, Plus, Trash2, Calculator, LogOut, Clock, Check, X, Leaf, Dumbbell, BookOpen, Star, Sparkles, User as UserIcon, Settings, Save, Image, ChevronLeft, ChevronRight, Menu, Sun, Moon, Info, Flame, TrendingUp, TrendingDown, RefreshCw, BarChart2, Pencil, Bot, MessageSquareText, Droplet, CookingPot, Scale, Ruler, ClipboardList, Calendar, Layers, Target, GlassWater, Crown, ShieldCheck, Zap, Lock, HelpCircle, ChevronDown, CheckCircle2, XCircle, Gift, Award, Bell, Globe, Database, Apple, Camera } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
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
import { BatteryCharging, CloudLightning, Activity, Heart, MessageCircle,Coffee, Pizza, Fish, Slice, Timer } from "lucide-react"
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
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<{id: number, name: string, priceDisplay: string, numericPrice: number} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  if (!user || !user.packageInfo) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="font-semibold text-lg">Paket bilgileri yükleniyor...</span>
      </div>
    </div>
  );

  const currentPackage = user.packageInfo.PackageName || 'Basic';
  const limits = user.packageInfo.Limits;

  const handleOpenCheckout = (pkgId: number, pkgName: string, priceDisplay: string, numericPrice: number) => {
    if (pkgId === 1) {
      toast.info("Basic (Ücretsiz) başlangıç paketi zaten ücretsiz kullanım hakkınızdır.");
      return;
    }
    setSelectedPkg({ id: pkgId, name: pkgName, priceDisplay, numericPrice });
    setCheckoutOpen(true);
  };

  const handleSubscribe = async () => {
    if (!selectedPkg) return;
    setIsProcessing(true);
    
    // Yönlendirmeyi gerçekleştir (iyzico ödeme sayfasına gidecek)
    setTimeout(() => {
      navigate('/checkout', { 
        state: { 
          packageId: selectedPkg.id, 
          price: selectedPkg.numericPrice, 
          packageName: selectedPkg.name 
        } 
      });
      setIsProcessing(false);
      setCheckoutOpen(false);
    }, 400);
  };

  const packageData = [
    { 
      id: 1, 
      name: 'Basic Paket', 
      badge: 'Başlangıç',
      icon: Leaf,
      priceMonthly: 'Ücretsiz', 
      priceYearly: 'Ücretsiz',
      numericPriceMonthly: 0,
      numericPriceYearly: 0,
      subText: 'Sınırlı deneme sürümü.', 
      features: [
        { text: 'Fotoğraf Analizi: 5 kez/ay', included: true },
        { text: 'Yemek Önerisi: 5 kez/ay', included: true },
        { text: 'Kan Tahlili Analizi: 1 kez/ay', included: true },
        { text: 'Temel Kalori Takibi', included: true },
        { text: 'Sınırsız DiyetGPT Chat', included: false },
        { text: '7/24 Öncelikli VIP Desteği', included: false },
        { text: 'PDF Rapor Dışa Aktarma', included: false },
      ],
      buttonText: currentPackage === 'Basic' ? 'Mevcut Paketiniz' : 'Ücretsiz Başla',
      isCurrent: currentPackage === 'Basic',
      accentColor: 'border-slate-200 dark:border-slate-800',
      badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      buttonVariant: 'outline' as const,
      popular: false
    },
    { 
      id: 2, 
      name: 'Normal Paket', 
      badge: 'Bireysel Takip',
      icon: Zap,
      priceMonthly: '49 ₺', 
      priceYearly: '39 ₺',
      numericPriceMonthly: 49,
      numericPriceYearly: 468,
      subText: 'Düzenli diyet & kalori takibi yapanlar için ideal.', 
      features: [
        { text: 'Fotoğraf Analizi: 20 kez/ay', included: true },
        { text: 'Yemek Önerisi: 20 kez/ay', included: true },
        { text: 'Kan Tahlili Analizi: 5 kez/ay', included: true },
        { text: 'Gelişmiş Kalori & Makro Takibi', included: true },
        { text: 'DiyetGPT Chat: 50 Mesaj/ay', included: true },
        { text: '7/24 Öncelikli VIP Desteği', included: false },
        { text: 'PDF Rapor Dışa Aktarma', included: false },
      ],
      buttonText: currentPackage === 'Normal' ? 'Mevcut Paketiniz' : 'Normal Pakete Geç',
      isCurrent: currentPackage === 'Normal',
      accentColor: 'border-teal-400 dark:border-teal-600',
      badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
      buttonVariant: 'default' as const,
      popular: false
    },
    { 
      id: 3, 
      name: 'Premium VIP', 
      badge: '👑 En Popüler Seçim',
      icon: Crown,
      priceMonthly: '99 ₺', 
      priceYearly: '79 ₺',
      numericPriceMonthly: 99,
      numericPriceYearly: 948,
      subText: 'Sınırsız AI imkanları, sıfır limit ve tam destek.', 
      features: [
        { text: 'Sınırsız Fotoğraf Analizi', included: true, highlight: true },
        { text: 'Sınırsız Yemek & Diyet Önerisi', included: true, highlight: true },
        { text: 'Sınırsız Kan Tahlili Yorumlama', included: true, highlight: true },
        { text: 'Sınırsız DiyetGPT Chat & Koçluk', included: true, highlight: true },
        { text: 'Kişiselleştirilmiş Detaylı Makro Hesabı', included: true },
        { text: 'PDF Sağlık & İlerleme Raporu Export', included: true },
        { text: '7/24 VIP Öncelikli Destek Hattı', included: true },
      ],
      buttonText: currentPackage === 'Premium' ? 'Mevcut VIP Paketiniz' : 'VIP Ayrıcalıklarını Başlat',
      isCurrent: currentPackage === 'Premium',
      accentColor: 'border-amber-400 dark:border-amber-500 shadow-2xl shadow-amber-500/20',
      badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md',
      buttonVariant: 'default' as const,
      popular: true
    },
  ];

  const faqs = [
    {
      q: 'İstediğim zaman aboneliğimi iptal edebilir miyim?',
      a: 'Evet! Hiçbir taahhüt veya gizli ücret yoktur. Profilinizden veya destek ekibimiz üzerinden dilediğiniz an tek tıkla iptal gerçekleştirebilirsiniz.'
    },
    {
      q: 'Ödeme işlemlerim ne kadar güvenli?',
      a: 'Tüm ödemeler 256-Bit SSL şifreleme ve 3D Secure güvenlik altyapısı ile İyzico güvencesinde gerçekleşmektedir. Kart bilgileriniz asla sunucularımızda tutulmaz.'
    },
    {
      q: 'Daha sonra üst pakete geçiş yapabilir miyim?',
      a: 'Kesinlikle. İstediğiniz an paketler arasında yükseltme yapabilirsiniz. Kalan kullanımınız yeni paketinize otomatik aktarılır.'
    },
    {
      q: 'Yapay zeka (AI) fotoğraf ve kan analizi ne kadar doğru?',
      a: 'DiyetGPT gelişmiş yapay zeka modelleri kullanır. Yemek fotoğraflarındaki gramaj ve besin değerlerini yüksek hassasiyetle tahmin eder ve kan tahlillerinde genel referans rehberliği sağlar.'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="p-4 md:p-8 space-y-12 max-w-7xl mx-auto"
    >
      {/* 1. Header & Intro */}
      <div className="text-center space-y-4 relative">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm font-bold shadow-sm">
          <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span>DİYETGPT VIP & PREMIUM AYRICALIKLARI</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
          Sağlık Yolculuğunuza <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent">
            Yapay Zeka Gücü Katın
          </span>
        </h1>
        
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Hedeflerinize göre tasarlanmış paketler. Sınırsız AI fotoğraf analizi, kişisel koçluk ve detaylı kan tahlili yorumlaması ile hemen başlayın.
        </p>

        {/* Dynamic Billing Toggle Switch */}
        <div className="pt-6 flex justify-center items-center space-x-4">
          <span className={`text-sm font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            Aylık Ödeme
          </span>
          
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded-full p-1 transition-colors duration-300 focus:outline-none shadow-inner"
          >
            <motion.div 
              className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-md"
              animate={{ x: billingCycle === 'yearly' ? 32 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>

          <div className="flex items-center space-x-2">
            <span className={`text-sm font-semibold transition-colors ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              Yıllık Ödeme
            </span>
            <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-700 animate-pulse">
              %20 İndirim + 2 Ay Hediye
            </span>
          </div>
        </div>
      </div>

      {/* 2. Mevcut Paket Status Kartı */}
      <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-700/60 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-2xl ${currentPackage === 'Premium' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950' : 'bg-emerald-500 text-white'}`}>
                {currentPackage === 'Premium' ? <Crown className="h-6 w-6" /> : <Leaf className="h-6 w-6" />}
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Aktif Aboneliğiniz</span>
                <h3 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
                  {currentPackage} Paket
                  {currentPackage === 'Premium' && (
                    <span className="text-xs font-bold bg-amber-400/20 border border-amber-400/40 text-amber-300 px-2 py-0.5 rounded-md">
                      VIP Statü
                    </span>
                  )}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-6 w-full md:w-auto border-t md:border-t-0 border-slate-700/60 pt-4 md:pt-0">
            <div className="space-y-1 min-w-[120px]">
              <span className="text-xs text-slate-400 font-medium">Fotoğraf Analizi</span>
              <div className="text-lg font-bold text-emerald-400">
                {currentPackage === 'Premium' ? 'Sınırsız ∞' : `${limits?.PhotoAnalysisRemaining ?? 0} Kalan`}
              </div>
              <Progress value={currentPackage === 'Premium' ? 100 : ((limits?.PhotoAnalysisRemaining ?? 0) / 20) * 100} className="h-1.5 bg-slate-700" />
            </div>

            <div className="space-y-1 min-w-[120px]">
              <span className="text-xs text-slate-400 font-medium">DiyetGPT Asistan</span>
              <div className="text-lg font-bold text-amber-400">
                {currentPackage === 'Premium' ? 'Sınırsız ∞' : `${limits?.MealSuggestionRemaining ?? 0} Kalan`}
              </div>
              <Progress value={currentPackage === 'Premium' ? 100 : ((limits?.MealSuggestionRemaining ?? 0) / 20) * 100} className="h-1.5 bg-slate-700" />
            </div>

            <div className="space-y-1 min-w-[120px]">
              <span className="text-xs text-slate-400 font-medium">Kan Analizi</span>
              <div className="text-lg font-bold text-teal-400">
                {currentPackage === 'Premium' ? 'Sınırsız ∞' : `${limits?.BloodTestRemaining ?? 0} Kalan`}
              </div>
              <Progress value={currentPackage === 'Premium' ? 100 : ((limits?.BloodTestRemaining ?? 0) / 5) * 100} className="h-1.5 bg-slate-700" />
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Paket Kartları (3 Columns Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
        {packageData.map((pkg) => {
          const Icon = pkg.icon;
          const displayPrice = billingCycle === 'yearly' ? pkg.priceYearly : pkg.priceMonthly;
          const numericPrice = billingCycle === 'yearly' ? pkg.numericPriceYearly : pkg.numericPriceMonthly;

          return (
            <motion.div 
              key={pkg.id} 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className={`relative flex flex-col rounded-3xl transition-all duration-300 ${
                pkg.popular 
                  ? 'bg-gradient-to-b from-amber-500/10 via-slate-900/5 to-transparent p-1' 
                  : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                  <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 fill-current" />
                    {pkg.badge}
                  </span>
                </div>
              )}

              <Card className={`flex-1 flex flex-col justify-between rounded-3xl border-2 overflow-hidden shadow-xl ${
                pkg.isCurrent 
                  ? 'border-emerald-500 shadow-emerald-500/10' 
                  : pkg.popular 
                    ? 'border-amber-400 dark:border-amber-500 bg-slate-900 text-white' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}>
                {/* Card Header */}
                <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${pkg.badgeBg}`}>
                      {pkg.badge}
                    </span>
                    <Icon className={`h-7 w-7 ${pkg.popular ? 'text-amber-400' : 'text-emerald-500'}`} />
                  </div>

                  <h3 className={`text-2xl font-black ${pkg.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {pkg.name}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className={`text-5xl font-black tracking-tight ${pkg.popular ? 'text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                      {displayPrice}
                    </span>
                    {displayPrice !== 'Ücretsiz' && (
                      <span className={`text-sm font-semibold ${pkg.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                        {billingCycle === 'yearly' ? '/ ay (yıllık)' : '/ ay'}
                      </span>
                    )}
                  </div>

                  <p className={`mt-3 text-xs leading-relaxed ${pkg.popular ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    {pkg.subText}
                  </p>
                </div>

                {/* Features List */}
                <CardContent className="p-8 flex-1 flex flex-col justify-between space-y-8">
                  <ul className="space-y-4">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start text-sm gap-3">
                        {feat.included ? (
                          <div className={`mt-0.5 p-1 rounded-full flex-shrink-0 ${
                            feat.highlight 
                              ? 'bg-amber-400/20 text-amber-400' 
                              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                          }`}>
                            <Check className="h-3.5 w-3.5 font-bold" />
                          </div>
                        ) : (
                          <div className="mt-0.5 p-1 rounded-full flex-shrink-0 bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600">
                            <X className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <span className={`font-medium ${
                          !feat.included 
                            ? 'text-slate-400 dark:text-slate-600 line-through' 
                            : feat.highlight 
                              ? 'font-bold text-amber-400 dark:text-amber-300' 
                              : pkg.popular 
                                ? 'text-slate-200' 
                                : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <Button 
                    disabled={pkg.isCurrent}
                    onClick={() => pkg.isCurrent ? null : handleOpenCheckout(pkg.id, pkg.name, displayPrice, numericPrice)}
                    className={`w-full py-6 text-base font-bold rounded-2xl shadow-lg transition-all duration-300 ${
                      pkg.isCurrent 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 cursor-default opacity-80' 
                        : pkg.popular 
                          ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-amber-500/30 hover:shadow-amber-500/50' 
                          : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
                    }`}
                  >
                    {pkg.isCurrent ? (
                      <span className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-emerald-600" /> Mevcut Paketiniz
                      </span>
                    ) : (
                      pkg.buttonText
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* 4. Detailed Comparison Table */}
      <div className="pt-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            Detaylı Özellik Karşılaştırması
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            İhtiyacınıza en uygun planın sunduğu tüm avantajları inceleyin.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="p-4 md:p-6 font-bold text-slate-700 dark:text-slate-300">Özellikler</th>
                <th className="p-4 md:p-6 font-bold text-center text-slate-700 dark:text-slate-300">Basic</th>
                <th className="p-4 md:p-6 font-bold text-center text-teal-600 dark:text-teal-400">Normal</th>
                <th className="p-4 md:p-6 font-bold text-center text-amber-500 dark:text-amber-400 bg-amber-500/5">Premium VIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              <tr>
                <td className="p-4 md:p-6 font-medium text-slate-800 dark:text-slate-200">AI Fotoğraf Analizi</td>
                <td className="p-4 text-center text-slate-500">5 kez / ay</td>
                <td className="p-4 text-center text-slate-700 dark:text-slate-300 font-semibold">20 kez / ay</td>
                <td className="p-4 text-center font-bold text-amber-500 bg-amber-500/5">Sınırsız ∞</td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 font-medium text-slate-800 dark:text-slate-200">DiyetGPT Asistan Sohbeti</td>
                <td className="p-4 text-center text-slate-500">Sınırlı</td>
                <td className="p-4 text-center text-slate-700 dark:text-slate-300">50 Mesaj / ay</td>
                <td className="p-4 text-center font-bold text-amber-500 bg-amber-500/5">Sınırsız 7/24 ∞</td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 font-medium text-slate-800 dark:text-slate-200">Kan Tahlili Yorumlama</td>
                <td className="p-4 text-center text-slate-500">1 kez / ay</td>
                <td className="p-4 text-center text-slate-700 dark:text-slate-300">5 kez / ay</td>
                <td className="p-4 text-center font-bold text-amber-500 bg-amber-500/5">Sınırsız ∞</td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 font-medium text-slate-800 dark:text-slate-200">Akıllı Yemek Önerileri</td>
                <td className="p-4 text-center text-slate-500">5 kez / ay</td>
                <td className="p-4 text-center text-slate-700 dark:text-slate-300">20 kez / ay</td>
                <td className="p-4 text-center font-bold text-amber-500 bg-amber-500/5">Sınırsız ∞</td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 font-medium text-slate-800 dark:text-slate-200">Kişiselleştirilmiş Makro Hesabı</td>
                <td className="p-4 text-center"><Check className="h-5 w-5 mx-auto text-emerald-500" /></td>
                <td className="p-4 text-center"><Check className="h-5 w-5 mx-auto text-emerald-500" /></td>
                <td className="p-4 text-center bg-amber-500/5"><Check className="h-5 w-5 mx-auto text-amber-500" /></td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 font-medium text-slate-800 dark:text-slate-200">PDF Rapor Dışa Aktarma</td>
                <td className="p-4 text-center"><X className="h-5 w-5 mx-auto text-slate-300" /></td>
                <td className="p-4 text-center"><X className="h-5 w-5 mx-auto text-slate-300" /></td>
                <td className="p-4 text-center bg-amber-500/5"><Check className="h-5 w-5 mx-auto text-amber-500" /></td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 font-medium text-slate-800 dark:text-slate-200">7/24 Öncelikli Destek</td>
                <td className="p-4 text-center"><X className="h-5 w-5 mx-auto text-slate-300" /></td>
                <td className="p-4 text-center"><X className="h-5 w-5 mx-auto text-slate-300" /></td>
                <td className="p-4 text-center bg-amber-500/5"><Check className="h-5 w-5 mx-auto text-amber-500 font-bold" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Trust & Guarantee Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3 shadow-sm">
          <ShieldCheck className="h-8 w-8 text-emerald-500 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-xs md:text-sm text-slate-800 dark:text-white">256-Bit SSL</h4>
            <p className="text-xs text-slate-500">Güvenli Ödeme</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3 shadow-sm">
          <Zap className="h-8 w-8 text-amber-500 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-xs md:text-sm text-slate-800 dark:text-white">Anında Aktivasyon</h4>
            <p className="text-xs text-slate-500">Saniyeler içinde hazır</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3 shadow-sm">
          <Clock className="h-8 w-8 text-teal-500 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-xs md:text-sm text-slate-800 dark:text-white">Taahhütsüz İptal</h4>
            <p className="text-xs text-slate-500">İstediğin an vazgeç</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-3 shadow-sm">
          <Gift className="h-8 w-8 text-indigo-500 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-xs md:text-sm text-slate-800 dark:text-white">14 Gün İade</h4>
            <p className="text-xs text-slate-500">%100 Memnuniyet</p>
          </div>
        </div>
      </div>

      {/* 6. FAQ Accordion Section */}
      <div className="pt-8 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-emerald-500" /> Sıkça Sorulan Sorular
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Aklınıza takılan soruların yanıtlarını aşağıda bulabilirsiniz.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-5 text-left font-bold text-slate-800 dark:text-white flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${openFaqIndex === idx ? 'transform rotate-180 text-emerald-500' : ''}`} />
              </button>

              <AnimatePresence>
                {openFaqIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Modern Payment Modal */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-3xl overflow-hidden p-0">
          <div className="h-3 bg-gradient-to-r from-emerald-400 via-teal-500 to-amber-500" />
          
          <div className="p-6 md:p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-center text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <Lock className="h-5 w-5 text-emerald-500" /> Güvenli Ödemeye Yönlendiriliyorsunuz
              </DialogTitle>
              <DialogDescription className="text-center text-slate-500 text-sm mt-1">
                İyzico 256-bit korumalı ödeme altyapısı kullanılmaktadır.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl flex justify-between items-center border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-600 dark:text-slate-300 text-sm">Seçilen Paket:</span>
                <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">{selectedPkg?.name}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl flex justify-between items-center border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-600 dark:text-slate-300 text-sm">Faturalandırma Dönemi:</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {billingCycle === 'yearly' ? 'Yıllık (2 Ay Hediye)' : 'Aylık'}
                </span>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-4 rounded-2xl flex justify-between items-center border border-emerald-200 dark:border-emerald-800/60">
                <span className="font-bold text-slate-800 dark:text-slate-200">Toplam Tutar:</span>
                <span className="font-black text-2xl text-emerald-600 dark:text-emerald-400">
                  {selectedPkg?.priceDisplay}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>İyzico 3D Secure Güvenlik Sertifikalı</span>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setCheckoutOpen(false)} 
                className="w-full sm:w-auto rounded-xl text-slate-500 font-semibold"
              >
                Vazgeç
              </Button>
              <Button 
                type="button" 
                onClick={handleSubscribe} 
                disabled={isProcessing}
                className="w-full sm:flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-6 shadow-xl shadow-emerald-500/25 transition-all text-base"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin" /> İyzico Hazırlanıyor...
                  </span>
                ) : (
                  'Güvenli Ödemeye Geç ➔'
                )}
              </Button>
            </DialogFooter>
          </div>
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
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') !== 'light'); // Koyu mod durumu (varsayılan koyu)
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
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      return localStorage.getItem('activeTab') || 'personal-screen';
    } catch {
      return 'personal-screen';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('activeTab', activeTab);
    } catch {}
  }, [activeTab]);

  const [foodDisplayLimit, setFoodDisplayLimit] = useState(18);
  const [recipeDisplayLimit, setRecipeDisplayLimit] = useState(18);
  const [exerciseDisplayLimit, setExerciseDisplayLimit] = useState(18);
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
  const [fastingStartTime, setFastingStartTime] = useState<string | null>(() => {
    return localStorage.getItem('fastingStartTime');
  });

  const toggleFasting = () => {
    if (fastingStartTime) {
      setFastingStartTime(null);
      localStorage.removeItem('fastingStartTime');
      toast.success("Aralıklı oruç seansı tamamlandı! Tebrikler 🎉");
    } else {
      const nowStr = new Date().toISOString();
      setFastingStartTime(nowStr);
      localStorage.setItem('fastingStartTime', nowStr);
      toast.success("16/8 Aralıklı Oruç sayacı başlatıldı! ⏳");
    }
  };

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

    const localWater = Number(localStorage.getItem(`waterIntake-${currentDate}`)) || 0;
    const finalWater = Math.max(totalWaterIntake || 0, localWater);
    setTotalWaterIntake(finalWater);
    localStorage.setItem(`waterIntake-${currentDate}`, String(finalWater));
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
    if (!localStorage.getItem('selectedDietStartDate')) {
      localStorage.setItem('selectedDietStartDate', new Date().toISOString());
    }
    toast.success(`${diet.name} diyetine başarıyla başladınız! Kontrol Paneline yönlendiriliyorsunuz.`);
    setIsDietDialogOpen(false);
    setActiveTab('personal-screen');
  };

  // Diyeti Durdur handler
  const handleStopDiet = () => {
    setSelectedDietPlan(null);
    localStorage.removeItem('selectedDiet');
    localStorage.removeItem('selectedDietStartDate');
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

  // Kalori hedefine göre ilerleme yüzdesini hesaplar (NaN Güvenli)
  const rawGoal = user?.dailyCalorieGoal || 2000;
  const rawProgress = rawGoal > 0 ? ((totalConsumedCalories || 0) / rawGoal) * 100 : 0;
  const calorieProgressPercentage = isNaN(rawProgress) || !isFinite(rawProgress) ? 0 : rawProgress;

  // Türkçe karakter duyarlı metin dönüştürücü
  const normalizeText = (str: string): string => {
    if (!str) return '';
    return str
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .replace(/Ğ/g, 'ğ')
      .replace(/Ü/g, 'ü')
      .replace(/Ş/g, 'ş')
      .replace(/Ö/g, 'ö')
      .replace(/Ç/g, 'ç')
      .toLocaleLowerCase('tr-TR')
      .trim();
  };

  // Seçilen kategori ve arama sorgusuna göre yiyecekleri filtreler
  const filteredFoods = useMemo(() => {
    let result = foods;
    if (selectedFoodCategory && selectedFoodCategory !== 'Tüm Kategoriler') {
      const normCat = normalizeText(selectedFoodCategory);
      result = result.filter(food => normalizeText(food.category) === normCat);
    }
    if (foodQuery && foodQuery.trim() !== '') {
      const q = normalizeText(foodQuery);
      result = result.filter(food => 
        normalizeText(food.name).includes(q) || 
        normalizeText(food.category).includes(q)
      );
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
    if (exerciseSearchQuery && exerciseSearchQuery.trim() !== '') {
      const q = normalizeText(exerciseSearchQuery);
      result = result.filter(ex => normalizeText(ex.name).includes(q));
    }
    return result;
  }, [exerciseSearchQuery, selectedExerciseType, selectedExerciseDifficulty]);

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

  // Tarifleri arama sorgusuna göre filtreler
  const filteredRecipes = useMemo(() => {
    if (!foodQuery || foodQuery.trim() === '') return mockRecipes;
    const q = normalizeText(foodQuery);
    return mockRecipes.filter(recipe =>
      normalizeText(recipe.name).includes(q) ||
      normalizeText(recipe.description || '').includes(q) ||
      recipe.ingredients.some(ing => {
        const text = typeof ing === 'string' ? ing : ((ing as any)?.name || '');
        return normalizeText(text).includes(q);
      })
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
    const response = await fetch("/api/chat", {
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
          <motion.div key="personal-screen" {...animationVariants} className="space-y-6 w-full max-w-7xl mx-auto pb-6">
            {/* 1. En Üst: Paket Bilgisi, Karşılama ve Tarih Seçici Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white shadow-2xl border border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-1.5 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" /> {user?.packageInfo?.PackageName || 'Basic'} Paket Aktivasyonu
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                  Hoş Geldin, {user?.name || 'Kullanıcı'} 👋
                </h2>
                <p className="text-xs text-slate-300 font-medium">Günlük beslenme, su tüketimi ve egzersiz özetinizi takip edin.</p>
              </div>

              {/* Tarih Gezinme Butonları (Gelecek Tarih Engelli & Şık Geçişli) */}
              {(() => {
                const todayStr = new Date().toISOString().slice(0, 10);
                const isToday = currentDate >= todayStr;
                return (
                  <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 p-2 rounded-2xl backdrop-blur-md relative z-10 shadow-lg">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setCurrentDate(new Date(new Date(currentDate).getTime() - 86400000).toISOString().slice(0,10))} 
                      className="h-8 w-8 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-all transform active:scale-90"
                      title="Önceki Gün"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <button 
                      onClick={() => setCurrentDate(todayStr)}
                      className="font-black text-xs px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 transform active:scale-95"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      {currentDate === todayStr ? 'Bugün' : new Date(currentDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled={isToday}
                      onClick={() => {
                        if (!isToday) {
                          setCurrentDate(new Date(new Date(currentDate).getTime() + 86400000).toISOString().slice(0,10));
                        }
                      }} 
                      title={isToday ? "Gelecek tarihlere geçilemez" : "Sonraki Gün"}
                      className={`h-8 w-8 rounded-xl transition-all ${
                        isToday 
                          ? 'opacity-25 cursor-not-allowed text-slate-600' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800 transform active:scale-90'
                      }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })()}
            </div>
            
            {/* Aktif Diyet Programı Banner & Akıllı Öğün Saat Hatırlatıcısı */}
            {selectedDietPlan && (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 text-white shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <BookOpen className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const dietStartStr = localStorage.getItem('selectedDietStartDate') || new Date().toISOString();
                          const startDateObj = new Date(dietStartStr);
                          const nowObj = new Date();
                          const diffDays = Math.max(1, Math.floor((nowObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1);
                          return (
                            <span className="text-xs font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-amber-400" /> {diffDays}. Gününüz
                            </span>
                          );
                        })()}
                        {selectedDietPlan.target && (
                          <span className="text-xs text-slate-300 font-semibold">• {selectedDietPlan.target}</span>
                        )}
                      </div>
                      <h3 className="text-xl font-black tracking-tight mt-0.5">{selectedDietPlan.name} Diyet Programı</h3>
                    </div>
                  </div>

                  <Button onClick={handleStopDiet} variant="ghost" size="sm" className="text-rose-300 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold h-9 rounded-xl">
                    <X className="h-4 w-4 mr-1" /> Programı Bitir
                  </Button>
                </div>

                {/* Öğün Hatırlatma & Saat Bazlı Menü Tavsiyesi */}
                {(() => {
                  const currentHour = new Date().getHours();
                  let mealLabel = 'Öğle Yemeği Vakti 🍱';
                  let mealAdvice = 'Şu an Öğle Yemeği Vakti! Dengeli ve besleyici tabağınızı hazırlayın.';
                  let targetMealKey = 'Öğle';

                  if (currentHour >= 6 && currentHour < 11) {
                    mealLabel = 'Kahvaltı Vakti 🍳';
                    mealAdvice = 'Güne harika ve enerjik bir başlangıç yapmak için Kahvaltı Vakti!';
                    targetMealKey = 'Kahvaltı';
                  } else if (currentHour >= 11 && currentHour < 15) {
                    mealLabel = 'Öğle Yemeği Vakti 🍱';
                    mealAdvice = 'Şu an Öğle Yemeği Vakti! Protein ağırlıklı tabağınızı tüketin.';
                    targetMealKey = 'Öğle';
                  } else if (currentHour >= 15 && currentHour < 18.5) {
                    mealLabel = 'Ara Öğün Vakti 🍏';
                    mealAdvice = 'Metabolizmanızı canlı tutmak için taze bir meyve veya kuruyemiş vakti.';
                    targetMealKey = 'Ara';
                  } else if (currentHour >= 18.5 && currentHour < 22) {
                    mealLabel = 'Akşam Yemeği Vakti 🥗';
                    mealAdvice = 'Şu an Akşam Yemeği Vakti! Hafif ve sindirimi kolay bir yemek tercih edin.';
                    targetMealKey = 'Akşam';
                  } else {
                    mealLabel = 'Gece Dinlenme Vakti 🌙';
                    mealAdvice = 'Gece Dinlenme Zamanı! Metabolizmanız için bol su tüketimine ağırlık verin.';
                    targetMealKey = 'Gece';
                  }

                  const todayProgram = selectedDietPlan.weeklyProgram?.[0]?.program;
                  const matchingMeal = todayProgram?.find(m => m.meal?.includes(targetMealKey));

                  return (
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 backdrop-blur-md">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-emerald-400 animate-pulse" />
                          <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">{mealLabel}</span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium">{mealAdvice}</p>
                      </div>

                      {matchingMeal && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs max-w-sm shrink-0">
                          <span className="font-bold text-emerald-300 block text-[11px]">Tavsiye Edilen Menü:</span>
                          <span className="text-slate-200 text-[11px] font-medium">{matchingMeal.foods.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 2. Önemli Metrik Kartları (Hedef, Tüketilen, Yakılan, Kalan) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`${cardBgClass} p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md flex items-center justify-between hover:border-orange-500/40 transition-all group`}>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-extrabold block uppercase tracking-wider">Günlük Hedef</span>
                  <span className="text-2xl font-black text-orange-500">{user?.dailyCalorieGoal || 2000} <span className="text-xs text-slate-400 font-bold">kcal</span></span>
                </div>
                <div className="p-3.5 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 group-hover:scale-110 transition-transform">
                  <Flame className="h-6 w-6" />
                </div>
              </div>

              <div className={`${cardBgClass} p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md flex items-center justify-between hover:border-emerald-500/40 transition-all group`}>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-extrabold block uppercase tracking-wider">Tüketilen</span>
                  <span className="text-2xl font-black text-emerald-500">{Math.round(totalConsumedCalories)} <span className="text-xs text-slate-400 font-bold">kcal</span></span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <CookingPot className="h-6 w-6" />
                </div>
              </div>

              <div className={`${cardBgClass} p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md flex items-center justify-between hover:border-rose-500/40 transition-all group`}>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-extrabold block uppercase tracking-wider">Yakılan</span>
                  <span className="text-2xl font-black text-rose-500">{Math.round(totalBurnedCalories)} <span className="text-xs text-slate-400 font-bold">kcal</span></span>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 group-hover:scale-110 transition-transform">
                  <Activity className="h-6 w-6" />
                </div>
              </div>

              <div className={`${cardBgClass} p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md flex items-center justify-between hover:border-indigo-500/40 transition-all group`}>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-extrabold block uppercase tracking-wider">Kalan Bütçe</span>
                  <span className="text-2xl font-black text-indigo-500">
                    {Math.max(0, (user?.dailyCalorieGoal || 2000) - Math.round(totalConsumedCalories))} <span className="text-xs text-slate-400 font-bold">kcal</span>
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* 3. Kalori İlerlemesi, Makrolar, Su ve Günlük Kayıtlar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sol Sütun: Kalori İlerlemesi & Makrolar & Su Takibi */}
              <div className="lg:col-span-6 space-y-6">
                {/* Kalori İlerleme Çubuğu */}
                <Card className={`p-6 shadow-md rounded-3xl ${cardBgClass} border border-slate-200/80 dark:border-slate-800 space-y-3.5`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-base font-black ${textClass} flex items-center gap-2`}>
                      <Activity className="h-5 w-5 text-emerald-500" /> Kalori İlerlemesi
                    </h3>
                    <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      %{Math.min(100, Math.round(calorieProgressPercentage))} Tamamlandı
                    </span>
                  </div>
                  <Progress value={calorieProgressPercentage} className="h-3.5 rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div className="flex justify-between text-xs font-extrabold text-slate-400">
                    <span>{Math.round(totalConsumedCalories)} kcal alındı</span>
                    <span>Hedef: {user?.dailyCalorieGoal || 2000} kcal</span>
                  </div>
                </Card>

                {/* Günlük Makrolar (Dinamik Hedef Gramlar) */}
                <Card className={`p-6 shadow-md rounded-3xl ${cardBgClass} border border-slate-200/80 dark:border-slate-800 space-y-4`}>
                  {(() => {
                    const goalCal = user?.dailyCalorieGoal || 2000;
                    const targetProtein = Math.round((goalCal * 0.25) / 4);
                    const targetCarbs = Math.round((goalCal * 0.50) / 4);
                    const targetFat = Math.round((goalCal * 0.25) / 9);

                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <h3 className={`text-base font-black ${textClass} flex items-center gap-2`}>
                            <PieChart className="h-5 w-5 text-amber-500" /> Günlük Makro Dağılımı
                          </h3>
                          <span className="text-xs font-bold text-slate-400">Hedef Bütçenize Göre</span>
                        </div>
                        <div className="space-y-3.5">
                          <div>
                            <div className="flex justify-between text-xs font-extrabold mb-1.5">
                              <span className="text-emerald-500 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Protein (%25)</span>
                              <span className={textClass}>{Math.round(totalProtein)}g / {targetProtein}g</span>
                            </div>
                            <Progress value={Math.min(100, (totalProtein / targetProtein) * 100)} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs font-extrabold mb-1.5">
                              <span className="text-amber-500 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Karbonhidrat (%50)</span>
                              <span className={textClass}>{Math.round(totalCarbs)}g / {targetCarbs}g</span>
                            </div>
                            <Progress value={Math.min(100, (totalCarbs / targetCarbs) * 100)} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs font-extrabold mb-1.5">
                              <span className="text-rose-500 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500"></span> Yağ (%25)</span>
                              <span className={textClass}>{Math.round(totalFat)}g / {targetFat}g</span>
                            </div>
                            <Progress value={Math.min(100, (totalFat / targetFat) * 100)} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800" />
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </Card>

                {/* Hızlı Su Takip Çubuğu */}
                <Card className={`p-6 shadow-md rounded-3xl ${cardBgClass} border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      <Droplet className="h-6 w-6 animate-pulse" />
                    </div>
                    <div>
                      <span className={`text-sm font-black block ${textClass}`}>Günlük Su Takibi</span>
                      <span className="text-xs text-blue-500 font-extrabold">{totalWaterIntake} ml / {dailyWaterGoal} ml</span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    {[250, 500, 750].map((amount) => (
                      <Button 
                        key={amount}
                        size="sm"
                        onClick={async () => {
                          const newTotal = totalWaterIntake + amount;
                          setTotalWaterIntake(newTotal);
                          localStorage.setItem(`waterIntake-${currentDate}`, String(newTotal));
                          try {
                            await axios.post('/api/add-water', { amount, date: currentDate }, { withCredentials: true });
                            toast.success(`+${amount} ml su kaydedildi!`);
                          } catch {
                            toast.success(`+${amount} ml su eklendi!`);
                          }
                        }}
                        className="flex-1 sm:flex-initial bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-xl text-xs font-black py-2 px-3.5 h-9"
                      >
                        + {amount}ml
                      </Button>
                    ))}
                  </div>
                </Card>

                {/* 16/8 Aralıklı Oruç (Intermittent Fasting) Takip Kartı */}
                <Card className={`p-6 shadow-md rounded-3xl ${cardBgClass} border border-slate-200/80 dark:border-slate-800 space-y-4`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                        <Timer className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className={`text-sm font-black ${textClass}`}>16/8 Aralıklı Oruç Sayaç</h3>
                        <span className="text-xs text-slate-400 font-bold">Yeme & Oruç Penceresi Takibi</span>
                      </div>
                    </div>
                    <Button 
                      onClick={toggleFasting} 
                      className={fastingStartTime ? "bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs h-9 px-4" : "bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs h-9 px-4"}
                    >
                      {fastingStartTime ? 'Orucu Bitir' : 'Orucu Başlat'}
                    </Button>
                  </div>

                  {(() => {
                    if (!fastingStartTime) {
                      return (
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Son yemeğinizi yedikten sonra 16 saatlik yağ yakım sürecini başlatmak için <b>Orucu Başlat</b> butonuna tıklayın.
                          </p>
                        </div>
                      );
                    }

                    const startObj = new Date(fastingStartTime);
                    const nowObj = new Date();
                    const diffMs = Math.max(0, nowObj.getTime() - startObj.getTime());
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    const progress = Math.min(100, (diffMs / (16 * 60 * 60 * 1000)) * 100);

                    return (
                      <div className="space-y-3 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                        <div className="flex justify-between items-center text-xs font-black">
                          <span className="text-purple-600 dark:text-purple-300">
                            {hours >= 16 ? '🎉 16 Saat Doldu - Yeme Penceresi Açık!' : `⏳ Geçen Süre: ${hours} sa ${minutes} dk`}
                          </span>
                          <span className="text-purple-500 font-bold">%{Math.round(progress)}</span>
                        </div>
                        <Progress value={progress} className="h-2.5 rounded-full bg-purple-950/30" />
                        <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                          <span>Başlangıç: {startObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>Hedef: 16 Saat (Yağ Yakım Modu)</span>
                        </div>
                      </div>
                    );
                  })()}
                </Card>
              </div>

              {/* Sağ Sütun: Bugün Tüketilen Besinler & Yapılan Egzersizler */}
              <div className="lg:col-span-6 space-y-6">
                {/* Bugün Tüketilen Besinler */}
                <Card className={`p-6 shadow-md rounded-3xl ${cardBgClass} border border-slate-200/80 dark:border-slate-800 space-y-4`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-base font-black ${textClass} flex items-center gap-2`}>
                      <CookingPot className="h-5 w-5 text-emerald-500" /> Tüketilen Besinler
                    </h3>
                    <Button onClick={() => setActiveTab('food-category')} size="sm" className={`${buttonPrimaryClass} rounded-xl font-bold text-xs h-8 px-3.5 shadow-md shadow-emerald-500/20`}>
                      <Plus className="h-4 w-4 mr-1" /> Besin Ekle
                    </Button>
                  </div>
                  {todayConsumedFoods.length > 0 ? (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                      {todayConsumedFoods.map((food) => (
                        <div key={food.id} className={`flex justify-between items-center p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800 ${darkMode ? 'bg-slate-800/40' : 'bg-slate-50'}`}>
                          <div>
                            <span className={`font-bold ${textClass} text-xs sm:text-sm block`}>{food.name} ({food.amount}g)</span>
                            <span className="text-[11px] text-slate-400 font-semibold">{food.mealTime || 'Öğün'}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-black text-emerald-500 text-xs sm:text-sm">{Math.round(food.totalCalories)} kcal</span>
                            <button onClick={() => handleDeleteFoodLogEntry(food.id)} className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-500/10 transition-all">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
                      <p className={`text-xs ${subTextClass} font-semibold`}>Henüz bugün için besin eklenmedi.</p>
                    </div>
                  )}
                </Card>

                {/* Bugün Yapılan Egzersizler */}
                <Card className={`p-6 shadow-md rounded-3xl ${cardBgClass} border border-slate-200/80 dark:border-slate-800 space-y-4`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-base font-black ${textClass} flex items-center gap-2`}>
                      <Dumbbell className="h-5 w-5 text-rose-500" /> Yapılan Egzersizler
                    </h3>
                    <Button onClick={() => setActiveTab('exercises')} size="sm" className={`${buttonPrimaryClass} rounded-xl font-bold text-xs h-8 px-3.5 shadow-md shadow-emerald-500/20`}>
                      <Plus className="h-4 w-4 mr-1" /> Egzersiz Ekle
                    </Button>
                  </div>
                  {todayBurnedExercises.length > 0 ? (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                      {todayBurnedExercises.map((exercise) => (
                        <div key={exercise.id} className={`flex justify-between items-center p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800 ${darkMode ? 'bg-slate-800/40' : 'bg-slate-50'}`}>
                          <div>
                            <span className={`font-bold ${textClass} text-xs sm:text-sm block`}>{exercise.name}</span>
                            <span className="text-[11px] text-slate-400 font-semibold">{exercise.minutes} dakika antrenman</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-black text-rose-500 text-xs sm:text-sm">{Math.round(exercise.totalCaloriesBurned)} kcal</span>
                            <button onClick={() => handleDeleteExercise(exercise.id)} className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-500/10 transition-all">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
                      <p className={`text-xs ${subTextClass} font-semibold`}>Henüz bugün için egzersiz eklenmedi.</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </motion.div>
        );

      case 'photo-analysis':
        return (
          <motion.div key="photo-analysis" {...animationVariants} className="space-y-6 w-full max-w-5xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white shadow-xl border border-emerald-500/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Gemini 2.5 Flash AI Engine
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                  AI Fotoğraf Analizi
                </h2>
                <p className="text-xs text-slate-300">Yemek tabağınızın fotoğrafını çekin, yapay zeka kalori ve besin değerlerini saniyeler içinde çıkarsın.</p>
              </div>
              <Label htmlFor="upload-photo" className={`cursor-pointer ${buttonPrimaryClass} px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/30 shrink-0`}>
                <Camera className="h-4 w-4" /> Fotoğraf Çek / Yükle
              </Label>
            </div>

            {/* Main Upload & Scanner Card */}
            <Card className={`p-6 sm:p-8 shadow-xl rounded-3xl ${cardBgClass} relative overflow-hidden border border-slate-200 dark:border-slate-800 space-y-6`}>
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

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
                    handleAnalyzePhotoMetadata(file);
                  }
                }}
                className="hidden"
                id="upload-photo"
              />

              {!photoPreview ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-3xl p-10 transition-all duration-300 text-center space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                    <Image className="h-10 w-10 animate-bounce" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${textClass}`}>Yemek Fotoğrafınızı Yükleyin</h3>
                    <p className={`text-xs ${subTextClass} mt-1 max-w-md`}>Tabağınızın net bir fotoğrafını yükleyerek porsiyon, kalori ve makro değerlerini anında öğrenin.</p>
                  </div>
                  <Label htmlFor="upload-photo" className={`cursor-pointer ${buttonPrimaryClass} px-8 py-3.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xl shadow-emerald-500/25`}>
                    <Sparkles className="h-4 w-4" /> Görsel Yükle
                  </Label>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Image Scanner Box */}
                  <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl bg-slate-950 max-h-96 flex items-center justify-center group">
                    <img src={photoPreview} alt="Yüklenen Yemek" className="max-h-96 object-contain w-full" />
                    
                    {/* Laser Scanner Animation Overlay */}
                    {isAnalyzingPhoto && (
                      <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px] flex flex-col items-center justify-center space-y-3">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2 shadow-lg shadow-emerald-500" />
                        <div className="p-4 rounded-2xl bg-slate-900/90 text-white border border-emerald-500/50 flex items-center gap-3 backdrop-blur-md">
                          <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
                          <span className="font-extrabold text-sm text-emerald-300">AI Porsiyon ve Kalori Taraması Yapılıyor...</span>
                        </div>
                      </div>
                    )}

                    {!isAnalyzingPhoto && (
                      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-emerald-400 font-bold px-3.5 py-1.5 rounded-full text-xs border border-emerald-500/40 flex items-center gap-2 shadow-lg">
                        <Check className="h-4 w-4 text-emerald-400" /> AI Taraması Tamamlandı
                      </div>
                    )}
                  </div>

                  {/* Analiz Sonuç Kartları */}
                  {analyzedNutrients && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-black ${textClass} flex items-center gap-2`}>
                          <Sparkles className="h-5 w-5 text-amber-400" /> Tespit Edilen Besin Değerleri
                        </h3>
                        <Button
                          onClick={() => {
                            if (analyzedNutrients) {
                              dispatchConsumedFoods({
                                type: "ADD_FOOD",
                                payload: {
                                  id: Date.now(),
                                  name: "AI Fotoğraf Analizi Öğünü",
                                  amount: analyzedNutrients.grams,
                                  mealTime: "Öğle Yemeği",
                                  date: currentDate,
                                  totalCalories: analyzedNutrients.calories,
                                  totalProtein: analyzedNutrients.protein,
                                  totalCarbs: analyzedNutrients.carbs,
                                  totalFat: analyzedNutrients.fat
                                }
                              });
                              toast.success("Fotoğraf analizi günlüğünüze başarıyla aktarıldı!");
                            }
                          }}
                          className={`${buttonPrimaryClass} rounded-2xl text-xs font-black px-5 py-2.5 shadow-lg shadow-emerald-500/20`}
                        >
                          <Plus className="h-4 w-4 mr-1.5" /> Günlüğüme Aktar
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                          <span className="text-[11px] text-emerald-500 font-extrabold uppercase block mb-1">Miktar</span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white">{analyzedNutrients.grams}g</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-center">
                          <span className="text-[11px] text-orange-500 font-extrabold uppercase block mb-1">Kalori</span>
                          <span className="text-2xl font-black text-orange-500">{analyzedNutrients.calories} kcal</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                          <span className="text-[11px] text-blue-500 font-extrabold uppercase block mb-1">Protein</span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white">{analyzedNutrients.protein}g</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                          <span className="text-[11px] text-amber-500 font-extrabold uppercase block mb-1">Karbonhidrat</span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white">{analyzedNutrients.carbs}g</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center col-span-2 sm:col-span-1">
                          <span className="text-[11px] text-rose-500 font-extrabold uppercase block mb-1">Yağ</span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white">{analyzedNutrients.fat}g</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        );

      case 'food-category': 
        const allFoodResults = filteredFoods;
        const displayedFoods = allFoodResults.slice(0, foodDisplayLimit);

        return (
          <motion.div key="food-category" {...animationVariants} className="space-y-6 w-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-3xl font-black ${textClass}`}>Yemek Kütüphanesi</h2>
                <p className={subTextClass}>Kategorilere göre veya isimle yiyecek arayın, günlüğünüze ekleyin.</p>
              </div>
              <Badge className={badgeClass}>{allFoodResults.length} Çeşit Yiyecek</Badge>
            </div>

            <Card className={`p-6 shadow-sm rounded-3xl ${cardBgClass}`}>
              <CardContent className="p-0 space-y-6">
                {/* Category Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  <Button 
                    onClick={() => { setSelectedFoodCategory(null); setFoodQuery(''); setSearchResults(foods); setFoodDisplayLimit(18); }} 
                    variant={!selectedFoodCategory ? 'default' : 'outline'} 
                    className={`rounded-xl text-xs font-bold px-4 py-2 flex-shrink-0 ${!selectedFoodCategory ? buttonPrimaryClass : buttonOutlineClass}`}
                  >
                    <Layers className="h-4 w-4 mr-1.5" /> Tümü
                  </Button>
                  {foodCategories.map(category => (
                    <Button 
                      key={category} 
                      onClick={() => { setSelectedFoodCategory(category); setFoodQuery(''); setSearchResults(getFoodsByCategory(category)); setFoodDisplayLimit(18); }} 
                      variant={selectedFoodCategory === category ? 'default' : 'outline'} 
                      className={`rounded-xl text-xs font-bold px-4 py-2 flex-shrink-0 ${selectedFoodCategory === category ? buttonPrimaryClass : buttonOutlineClass}`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${subTextClass}`} />
                  <Input
                    type="text"
                    placeholder="Örn: Elma, Tavuk Göğsü, Yulaf Ezmesi..."
                    value={foodQuery}
                    onChange={(e) => { setFoodQuery(e.target.value); setFoodDisplayLimit(18); }}
                    className={`w-full pl-12 pr-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-gray-200' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>

                {/* Grid without laggy max-h-96 scroll constraint */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedFoods.map((food) => (
                    <div key={food.id} className={`${cardBgClass} p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-bold ${textClass} text-lg`}>{food.name}</h3>
                          <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {food.category}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-center py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-3 border border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Kalori</span>
                            <span className="text-xs font-bold text-orange-500">{food.calories}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Protein</span>
                            <span className="text-xs font-bold text-emerald-500">{food.protein}g</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Karb</span>
                            <span className="text-xs font-bold text-amber-500">{food.carbs}g</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Yağ</span>
                            <span className="text-xs font-bold text-rose-500">{food.fat}g</span>
                          </div>
                        </div>
                      </div>

                      <Dialog open={isFoodDialogOpen && foodDialogContent?.id === food.id} onOpenChange={(open) => {
                        setIsFoodDialogOpen(open);
                        if (!open) setFoodDialogContent(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`w-full mt-2 rounded-xl font-bold ${buttonOutlineClass}`}
                            onClick={() => { setFoodDialogContent(food); setIsFoodDialogOpen(true);
                           setFoodQuantity(parseFloat(food.serving.replace('g', '').replace('ml', '').replace('adet', '').trim()) || 100); }}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Günlüğe Ekle
                          </Button>
                        </DialogTrigger>
                        <DialogContent className={`sm:max-w-[480px] rounded-3xl ${darkMode ? 'bg-slate-900 border-slate-800 text-gray-50' : 'bg-white'} border shadow-2xl p-6`}>
                          <DialogHeader className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5">
                                {foodDialogContent?.category || 'Besin Ekle'}
                              </Badge>
                            </div>
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                              <CookingPot className="h-6 w-6 text-emerald-500" /> {foodDialogContent?.name}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-400">
                              Yiyeceğin gramajını ve tüketildiği öğünü seçin.
                            </DialogDescription>
                          </DialogHeader>

                          {/* Canlı Hesaplama Kartı */}
                          {foodDialogContent && (
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 my-2 space-y-2">
                              <div className="flex justify-between items-baseline">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Hesaplanan Besin Değerleri</span>
                                <span className="text-xl font-black text-emerald-500">
                                  {Math.round(((foodDialogContent.calories || 0) * (foodQuantity || 100)) / 100)} <span className="text-xs font-bold text-slate-400">kcal</span>
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  <span className="text-[10px] block font-bold">Protein</span>
                                  <span className="font-black text-sm">{((foodDialogContent.protein || 0) * (foodQuantity || 100) / 100).toFixed(1)}g</span>
                                </div>
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                  <span className="text-[10px] block font-bold">Karb</span>
                                  <span className="font-black text-sm">{((foodDialogContent.carbs || 0) * (foodQuantity || 100) / 100).toFixed(1)}g</span>
                                </div>
                                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                  <span className="text-[10px] block font-bold">Yağ</span>
                                  <span className="font-black text-sm">{((foodDialogContent.fat || 0) * (foodQuantity || 100) / 100).toFixed(1)}g</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="space-y-4 py-2">
                            {/* Gramaj Girişi & Presets */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label htmlFor="food-quantity" className="font-extrabold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider">Miktar (Gram)</Label>
                                <span className="text-xs font-bold text-emerald-500">{foodQuantity || 100}g</span>
                              </div>
                              <Input
                                id="food-quantity"
                                type="number"
                                value={foodQuantity || ''}
                                onChange={(e) => setFoodQuantity(parseFloat(e.target.value) || 0)}
                                className={`rounded-xl py-3 font-bold text-center text-lg ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                                placeholder="Gram girin..."
                              />
                              <div className="flex gap-1.5 pt-1">
                                {[50, 100, 150, 200, 300].map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setFoodQuantity(preset)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all border ${
                                      foodQuantity === preset 
                                        ? 'bg-emerald-500 text-white border-emerald-500' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                                    }`}
                                  >
                                    {preset}g
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Öğün Zamanı Seçimi */}
                            <div className="space-y-2">
                              <Label className="font-extrabold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider block">Öğün Zamanı</Label>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { name: 'Kahvaltı', icon: '🍳' },
                                  { name: 'Ara Öğün', icon: '🍎' },
                                  { name: 'Öğle Yemeği', icon: '🥗' },
                                  { name: 'Akşam Yemeği', icon: '🍲' },
                                  { name: 'Gece', icon: '🥛' }
                                ].map((meal) => (
                                  <button
                                    key={meal.name}
                                    type="button"
                                    onClick={() => setSelectedMeal(meal.name as typeof selectedMeal)}
                                    className={`p-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                                      selectedMeal === meal.name
                                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                                    }`}
                                  >
                                    <span>{meal.icon}</span>
                                    <span>{meal.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <DialogFooter className="pt-2">
                            <Button 
                              onClick={handleAddFoodToLog} 
                              disabled={!selectedMeal || !foodQuantity || foodQuantity <= 0} 
                              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-black py-4 text-base shadow-lg shadow-emerald-500/30 transition-all"
                            >
                              <Check className="h-5 w-5 mr-2" /> Besini Günlüğe Kaydet
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>

                {allFoodResults.length > foodDisplayLimit && (
                  <div className="text-center pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      onClick={() => setFoodDisplayLimit(prev => prev + 18)}
                      className={`px-8 py-3 rounded-2xl font-bold ${buttonOutlineClass}`}
                    >
                      Daha Fazla Yiyecek Yükle ({allFoodResults.length - foodDisplayLimit} Kaldı)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'recipes':
        const displayedRecipes = filteredRecipes.slice(0, recipeDisplayLimit);

        return (
          <motion.div key="recipes" {...animationVariants} className="space-y-6 w-full max-w-7xl mx-auto">
            {/* 1. Üst Şef Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white shadow-2xl border border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Gününün Öne Çıkan Seçimi
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Sağlıklı & Lezzetli Şef Tarifler 🥗
                </h2>
                <p className="text-xs text-slate-300 max-w-xl">
                  Diyetisyenin onayladığı, kalori ve makro değerleri hesaplanmış fit tariflerle beslenmenize renk ve lezzet katın.
                </p>
              </div>
              <Badge className="bg-emerald-500 text-white font-black text-sm px-4 py-2 rounded-2xl shadow-lg shadow-emerald-500/30 shrink-0">
                {filteredRecipes.length} Özel Tarif
              </Badge>
            </div>

            {/* 2. Tarif Arama & Kart Listesi */}
            <Card className={`p-6 shadow-sm rounded-3xl ${cardBgClass} border border-slate-200/80 dark:border-slate-800 space-y-6`}>
              <CardContent className="p-0 space-y-6">
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${subTextClass}`} />
                  <Input
                    type="text"
                    placeholder="Örn: Yulaf lapası, Fırın Somon, Fit Brownie..."
                    value={foodQuery}
                    onChange={(e) => { setFoodQuery(e.target.value); setRecipeDisplayLimit(18); }}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-semibold ${darkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'} focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedRecipes.map(recipe => (
                    <div key={recipe.id} className={`${cardBgClass} rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-md flex flex-col justify-between hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1.5 group`}>
                      <div>
                        <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img 
                            src={recipe.image} 
                            alt={recipe.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            onError={(e) => {
                              e.currentTarget.src = `https://placehold.co/400x300/10b981/ffffff?text=DiyetGPT+Tarif`;
                            }}
                          />
                          <span className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md text-emerald-400 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-500/30 shadow-lg">
                            🔥 {recipe.caloriesPerServing} kcal
                          </span>
                        </div>
                        <div className="p-5 space-y-2">
                          <h3 className={`font-black ${textClass} text-lg group-hover:text-emerald-500 transition-colors`}>{recipe.name}</h3>
                          <p className={`text-xs ${subTextClass} line-clamp-2 leading-relaxed`}>{recipe.description}</p>
                          
                          <div className="flex items-center gap-2 pt-2 text-xs font-bold">
                            <span className="flex items-center text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                              <Clock className="h-3.5 w-3.5 mr-1 text-blue-500" /> {recipe.prepTime}
                            </span>
                            <span className="flex items-center text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                              <Flame className="h-3.5 w-3.5 mr-1 text-orange-500" /> {recipe.cookTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                        <Dialog open={isRecipeDialogOpen && recipeDialog?.id === recipe.id} onOpenChange={(open) => {
                          setIsRecipeDialogOpen(open);
                          if (!open) setRecipeDialog(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              className={`w-full rounded-2xl font-black text-xs py-3.5 ${buttonPrimaryClass} shadow-lg shadow-emerald-500/20`}
                              onClick={() => { setRecipeDialog(recipe); setIsRecipeDialogOpen(true); }}
                            >
                              <BookOpen className="h-4 w-4 mr-2" /> Tarifi İncele & Hazırla
                            </Button>
                          </DialogTrigger>
                          <DialogContent className={`sm:max-w-[620px] rounded-3xl ${darkMode ? 'bg-slate-900 border-slate-800 text-gray-50' : 'bg-white'} border shadow-2xl p-6`}>
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <CookingPot className="h-6 w-6 text-emerald-500" /> {recipeDialog?.name}
                              </DialogTitle>
                              <DialogDescription className="text-xs text-slate-400 mt-1">
                                {recipeDialog?.description}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-5 custom-scrollbar py-2">
                              {recipeDialog?.image && (
                                <img 
                                  src={recipeDialog.image} 
                                  alt={recipeDialog.name} 
                                  className="w-full h-56 object-cover rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800" 
                                  onError={(e) => {
                                    e.currentTarget.src = `https://placehold.co/600x400/10b981/ffffff?text=DiyetGPT+Tarif`;
                                  }}
                                />
                              )}
                              
                              <div className="grid grid-cols-4 gap-2 text-center p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                                <div>
                                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Hazırlık</span>
                                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">{recipeDialog?.prepTime}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Pişirme</span>
                                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">{recipeDialog?.cookTime}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Porsiyon</span>
                                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">{recipeDialog?.servings}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Kalori</span>
                                  <span className="text-xs font-black text-orange-500">{recipeDialog?.caloriesPerServing} kcal</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <Check className="h-4 w-4 text-emerald-500" /> Gerekli Malzemeler:
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  {recipeDialog?.ingredients.map((ing, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                      <span>{ing.quantity} {ing.unit} {ing.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <Sparkles className="h-4 w-4 text-amber-400" /> Adım Adım Hazırlanışı:
                                </h4>
                                <ol className="space-y-3 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  {recipeDialog?.instructions.map((inst, idx) => (
                                    <li key={idx} className="pl-1 font-medium">{inst}</li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredRecipes.length > recipeDisplayLimit && (
                  <div className="text-center pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      onClick={() => setRecipeDisplayLimit(prev => prev + 18)}
                      className={`px-8 py-3 rounded-2xl font-bold ${buttonOutlineClass}`}
                    >
                      Daha Fazla Tarif Göster ({filteredRecipes.length - recipeDisplayLimit} Kaldı)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'diets':
        return (
          <motion.div key="diets" {...animationVariants} className="space-y-6 w-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-3xl font-black ${textClass}`}>Diyet Programları</h2>
                <p className={subTextClass}>Hedefinize en uygun beslenme ve diyet programını seçin.</p>
              </div>
            </div>

            <Card className={`p-6 shadow-sm rounded-3xl ${cardBgClass}`}>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularDiets.map(diet => (
                    <div key={diet.id} className={`${cardBgClass} p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className={`font-black ${textClass} text-xl`}>{diet.name}</h3>
                          {selectedDietPlan?.id === diet.id && (
                            <Badge className="bg-emerald-500 text-white font-bold px-2.5 py-1">
                              Aktif Diyetiniz
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs ${subTextClass} mb-4 line-clamp-3 leading-relaxed`}>{diet.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {diet.caloriesPerDay && (
                            <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200">
                              <Flame className="h-3 w-3 mr-1" /> {diet.caloriesPerDay} kcal/gün
                            </Badge>
                          )}
                          {diet.difficulty && (
                            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200">
                              <Dumbbell className="h-3 w-3 mr-1" /> {diet.difficulty}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Dialog open={isDietDialogOpen && selectedDiet?.id === diet.id} onOpenChange={(open) => {
                        setIsDietDialogOpen(open);
                        if (!open) {
                          setTimeout(() => setSelectedDiet(null), 300);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            className={`w-full rounded-2xl font-bold py-3 ${selectedDietPlan?.id === diet.id ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : buttonPrimaryClass}`}
                            onClick={() => { setSelectedDiet(diet); setIsDietDialogOpen(true); }}
                          >
                            <BookOpen className="h-4 w-4 mr-2" /> Programı İncele
                          </Button>
                        </DialogTrigger>
                        <DialogContent className={`sm:max-w-[700px] rounded-3xl ${darkMode ? 'bg-slate-900 border-slate-800 text-gray-50' : 'bg-white'}`}>
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">{selectedDiet?.name || ''}</DialogTitle>
                            <DialogDescription className={subTextClass}>
                              {selectedDiet?.description || ''}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                              <div>
                                <span className="text-xs text-slate-400 block font-medium">Hedef</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-white">{selectedDiet?.target || '-'}</span>
                              </div>
                              <div>
                                <span className="text-xs text-slate-400 block font-medium">Günlük Kalori</span>
                                <span className="text-sm font-bold text-orange-500">{selectedDiet?.caloriesPerDay || 0} kcal</span>
                              </div>
                            </div>

                            <h4 className="font-bold text-slate-900 dark:text-white pt-2">Haftalık Menü Takvimi:</h4>
                            {(selectedDiet?.weeklyProgram || []).map(dayProgram => (
                              <div key={dayProgram.day} className={`p-4 rounded-2xl border border-slate-100 dark:border-slate-800 ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                <h5 className="font-extrabold text-emerald-600 dark:text-emerald-400 mb-2 text-sm">{dayProgram.day}</h5>
                                <ul className="space-y-2">
                                  {(dayProgram.program || []).map((meal, index) => (
                                    <li key={index} className="text-xs text-slate-700 dark:text-slate-300">
                                      <span className="font-bold text-slate-900 dark:text-white">{meal.hour} - {meal.meal}:</span> {(meal.foods || []).join(', ')}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                          <DialogFooter>
                            <Button onClick={() => handleStartDiet(selectedDiet!)} className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold py-3 px-6 text-white shadow-lg shadow-emerald-500/20">
                              <Check className="h-5 w-5 mr-2" /> Bu Programla Başla
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'exercises':
        const displayedExercises = filteredExercises.slice(0, exerciseDisplayLimit);

        return (
          <motion.div key="exercises" {...animationVariants} className="space-y-6 w-full max-w-6xl mx-auto">
            {/* Üst Banner Kartı */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white shadow-xl border border-rose-500/20">
              <div className="flex items-center space-x-4">
                <div className="p-3.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Dumbbell className="h-8 w-8 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">Egzersiz & Fitness Kataloğu</h2>
                  <p className="text-slate-300 text-xs sm:text-sm">Yakılan kaloriyi hesaplayın, antrenmanlarınızı kaydedin ve günlük hedefinize ulaşın.</p>
                </div>
              </div>
              <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold px-4 py-2 text-sm rounded-xl">
                {filteredExercises.length} Egzersiz Mevcut
              </Badge>
            </div>

            <Card className={`p-6 shadow-xl rounded-3xl ${cardBgClass} border border-slate-200 dark:border-slate-800 space-y-6`}>
              <CardContent className="p-0 space-y-6">
                {/* Egzersiz Filtreleri & Arama */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  {/* Kategori Çipleri */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'Tüm Tipler' },
                      { id: 'cardio', label: 'Kardiyo' },
                      { id: 'strength', label: 'Kuvvet' },
                      { id: 'flexibility', label: 'Esneklik' },
                      { id: 'other', label: 'Diğer' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedExerciseType(cat.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          selectedExerciseType === cat.id
                            ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Zorluk & Arama */}
                  <div className="flex items-center gap-3">
                    <Select onValueChange={setSelectedExerciseDifficulty} value={selectedExerciseDifficulty}>
                      <SelectTrigger className={`w-[140px] rounded-xl font-bold text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                        <SelectValue placeholder="Zorluk" />
                      </SelectTrigger>
                      <SelectContent className={`${darkMode ? 'bg-slate-900 border-slate-700 text-gray-50' : 'bg-white'}`}>
                        <SelectItem value="all">Tüm Zorluklar</SelectItem>
                        <SelectItem value="beginner">Başlangıç</SelectItem>
                        <SelectItem value="intermediate">Orta</SelectItem>
                        <SelectItem value="advanced">İleri</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="relative flex-1 min-w-[180px]">
                      <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${subTextClass}`} />
                      <Input
                        type="text"
                        placeholder="Egzersiz ara..."
                        value={exerciseSearchQuery}
                        onChange={(e) => { setExerciseSearchQuery(e.target.value); setExerciseDisplayLimit(18); }}
                        className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-gray-200' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-rose-500`}
                      />
                    </div>
                  </div>
                </div>

                {/* Egzersiz Kartları Izgarası */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayedExercises.map(exercise => (
                    <div 
                      key={exercise.id} 
                      className={`${cardBgClass} p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-rose-500/30 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className={`font-black ${textClass} text-lg group-hover:text-rose-500 transition-colors`}>
                            {exercise.name}
                          </h3>
                          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold px-2.5 py-1">
                            🔥 {exercise.caloriesPerMinute} kcal/dk
                          </Badge>
                        </div>
                        <p className={`text-xs ${subTextClass} line-clamp-2 leading-relaxed`}>{exercise.description}</p>
                        
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md">
                            {exercise.type === 'cardio' ? 'Kardiyo' : exercise.type === 'strength' ? 'Kuvvet' : 'Esneklik'}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md">
                            {exercise.difficulty === 'beginner' ? 'Başlangıç' : exercise.difficulty === 'intermediate' ? 'Orta' : 'İleri'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 mt-2">
                        <Dialog open={isExerciseDialogOpen && selectedExercise?.id === exercise.id} onOpenChange={(open) => {
                          setIsExerciseDialogOpen(open);
                          if (!open) {
                            setTimeout(() => setSelectedExercise(null), 300);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold rounded-2xl py-2.5 text-xs shadow-md shadow-rose-500/20 transition-all"
                              onClick={() => { setSelectedExercise(exercise); setIsExerciseDialogOpen(true); }}
                            >
                              <Plus className="h-4 w-4 mr-1.5" /> Antrenmana Ekle
                            </Button>
                          </DialogTrigger>
                          <DialogContent className={`sm:max-w-[460px] rounded-3xl ${darkMode ? 'bg-slate-900 border-slate-800 text-gray-50' : 'bg-white'} border shadow-2xl p-6`}>
                            <DialogHeader className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold px-2.5 py-0.5">
                                  🔥 {selectedExercise?.caloriesPerMinute} kcal/dk
                                </Badge>
                              </div>
                              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Dumbbell className="h-6 w-6 text-rose-500" /> {selectedExercise?.name}
                              </DialogTitle>
                              <DialogDescription className="text-xs text-slate-400">
                                Antrenman sürenizi girin veya süre butonlarından birini seçin.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-3">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label htmlFor="exercise-minutes" className="font-extrabold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider">Antrenman Süresi (Dakika)</Label>
                                  <span className="text-xs font-bold text-rose-500">{exerciseMinutes || 0} dk</span>
                                </div>
                                <Input
                                  id="exercise-minutes"
                                  type="number"
                                  value={exerciseMinutes}
                                  onChange={(e) => setExerciseMinutes(e.target.value)}
                                  className={`rounded-xl py-3 font-bold text-center text-lg ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                                  placeholder="Süre girin..."
                                />
                                <div className="flex gap-1.5 pt-1">
                                  {[15, 30, 45, 60, 90].map((mins) => (
                                    <button
                                      key={mins}
                                      type="button"
                                      onClick={() => setExerciseMinutes(String(mins))}
                                      className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all border ${
                                        exerciseMinutes === String(mins)
                                          ? 'bg-rose-500 text-white border-rose-500'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                                      }`}
                                    >
                                      {mins} dk
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {exerciseMinutes && parseFloat(exerciseMinutes) > 0 && (
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/30 text-center space-y-1">
                                  <span className="text-xs text-rose-500 font-bold block uppercase tracking-wider">Tahmini Yakılan Toplam Kalori</span>
                                  <span className="text-3xl font-black text-rose-500">
                                    {Math.round((selectedExercise?.caloriesPerMinute || 0) * parseFloat(exerciseMinutes))} <span className="text-sm font-bold">kcal</span>
                                  </span>
                                </div>
                              )}
                            </div>
                            <DialogFooter className="pt-2">
                              <Button 
                                onClick={handleAddExercise} 
                                disabled={!exerciseMinutes || parseFloat(exerciseMinutes) <= 0} 
                                className="w-full bg-gradient-to-r from-rose-500 via-orange-500 to-rose-600 hover:from-rose-600 hover:to-orange-600 text-white rounded-2xl font-black py-4 text-base shadow-lg shadow-rose-500/30 transition-all"
                              >
                                <Check className="h-5 w-5 mr-2" /> Antrenmanı Günlüğe Kaydet
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredExercises.length > exerciseDisplayLimit && (
                  <div className="text-center pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      onClick={() => setExerciseDisplayLimit(prev => prev + 18)}
                      className={`px-8 py-3 rounded-2xl font-bold ${buttonOutlineClass}`}
                    >
                      Daha Fazla Egzersiz Göster ({filteredExercises.length - exerciseDisplayLimit} Kaldı)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'recipe-suggest':
        return (
          <motion.div key="recipe-suggest" {...animationVariants} className="space-y-6 w-full max-w-5xl mx-auto">
            {/* Üst Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-900 text-white shadow-xl border border-emerald-500/30">
              <div className="flex items-center space-x-4">
                <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CookingPot className="h-8 w-8 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">AI Şef & Yemek Öneri Sihirbazı</h2>
                  <p className="text-emerald-200/80 text-xs sm:text-sm">Buzdolabınızdaki malzemeleri yazın, yapay zeka şef size özel gurme ve sağlıklı tarif üretsin.</p>
                </div>
              </div>
            </div>

            <Card className={`p-8 shadow-xl rounded-3xl ${cardBgClass} border border-slate-200 dark:border-slate-800 space-y-6`}>
              <CardContent className="p-0 space-y-6">
                {/* Malzeme Ekleme Alanı */}
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-wider text-emerald-500 block">MALZEME EKLENİZ</Label>
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      placeholder="Örn: Tavuk göğsü, yumurta, ıspanak, avokado..."
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') handleAddIngredient(); }}
                      className={`flex-1 rounded-2xl py-3 border text-sm font-semibold ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`}
                      disabled={isRecommending}
                    />
                    <Button onClick={handleAddIngredient} className={`${buttonPrimaryClass} rounded-2xl px-6 font-bold text-xs shadow-md shadow-emerald-500/20`} disabled={isRecommending}>
                      <Plus className="h-4 w-4 mr-1.5" /> Malzeme Ekle
                    </Button>
                  </div>
                </div>

                {/* Hızlı Öneri Malzemeleri */}
                <div className="space-y-2">
                  <span className={`text-xs font-bold ${subTextClass}`}>Hızlı Malzeme Seçin:</span>
                  <div className="flex flex-wrap gap-2">
                    {['Tavuk Göğsü', 'Yumurta', 'Yulaf Ezmesi', 'Ispanak', 'Somon', 'Avokado', 'Yoğurt', 'Zeytinyağı', 'Pirinç', 'Domates', 'Mantarlar', 'Peynir'].map((suggestedIng) => (
                      <button
                        key={suggestedIng}
                        onClick={() => {
                          if (!ingredients.includes(suggestedIng)) {
                            setIngredients([...ingredients, suggestedIng]);
                          }
                        }}
                        disabled={isRecommending || ingredients.includes(suggestedIng)}
                        className={`text-xs px-3.5 py-2 rounded-xl border transition-all font-bold ${
                          ingredients.includes(suggestedIng)
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 opacity-70 cursor-default'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        }`}
                      >
                        + {suggestedIng}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eklenen Malzemeler Listesi */}
                {ingredients.length > 0 && (
                  <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      SEÇİLİ MALZEMELERİNİZ ({ingredients.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ingredients.map((ingredient, index) => (
                        <Badge key={index} className="py-1.5 px-3.5 text-xs rounded-xl bg-emerald-600 text-white font-bold flex items-center shadow-md">
                          {ingredient}
                          <button onClick={() => handleRemoveIngredient(ingredient)} className="ml-2 text-white/80 hover:text-white" disabled={isRecommending}>
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* TARİF OLUŞTURMA BUTONLARI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <Button
                    onClick={() => handleGetRecipes('strict')}
                    className="w-full text-sm h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black shadow-xl shadow-blue-500/20 rounded-2xl transition-all"
                    disabled={isRecommending || ingredients.length === 0}
                  >
                    <Sparkles className="mr-2 h-5 w-5" /> Sadece Bu Malzemelerle Tarif
                  </Button>
                  <Button
                    onClick={() => handleGetRecipes('flexible')}
                    className="w-full text-sm h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black shadow-xl shadow-emerald-500/20 rounded-2xl transition-all"
                    disabled={isRecommending || ingredients.length === 0}
                  >
                    <Plus className="mr-2 h-5 w-5" /> Eksik Malzemeleri Tamamla
                  </Button>
                </div>

                {isRecommending && (
                  <div className="flex justify-center items-center py-10">
                    <RefreshCw className="h-8 w-8 animate-spin text-emerald-500 mr-3" />
                    <span className={`font-black text-base ${textClass}`}>AI Şef Gurme Tarif Hazırlıyor...</span>
                  </div>
                )}

                {/* TARİF SONUÇ KARTI */}
                {recipes && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 space-y-6 p-6 rounded-3xl border ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-50 border-slate-200'} shadow-xl`}
                  >
                    <div>
                      <h3 className={`text-base font-black mb-3 ${textClass} flex items-center gap-2`}>
                        <Check className="h-5 w-5 text-emerald-500" /> Kullanılan & Önerilen Malzeme Dağılımı
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {recipes.ingredients.map((ing, index) => (
                          <Badge key={index} className={`font-bold py-1.5 px-3 text-xs rounded-xl ${ing.isUserIngredient
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {ing.isUserIngredient ? <Check className="h-3.5 w-3.5 mr-1 inline"/> : <Plus className="h-3.5 w-3.5 mr-1 inline"/>}
                            {ing.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-base font-black mb-3 ${textClass} flex items-center gap-2`}>
                        <CookingPot className="h-5 w-5 text-teal-500" /> Şefin Tarif Hazırlanışı & Talimatlar
                      </h3>
                      <div className={`text-sm whitespace-pre-wrap leading-relaxed ${subTextClass} p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner font-medium`}>
                        {recipes.recipe}
                      </div>
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
          <motion.div key="profile" {...animationVariants} className="space-y-4 w-full max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-black ${textClass}`}>Profilim & Metriklerim</h2>
                <p className={`text-xs ${subTextClass}`}>Kişisel vücut ölçülerinizi yönetin ve metabolizma verilerinizi görün.</p>
              </div>
            </div>

            <Card className={`p-6 shadow-xl rounded-3xl ${cardBgClass} border border-slate-200 dark:border-slate-800`}>
              <CardContent className="p-0 space-y-5">
                {/* Profil Header Kartı */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl">
                    {profileForm.name ? profileForm.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{profileForm.name || 'Kullanıcı'}</h3>
                    <p className="text-emerald-100 text-xs">{profileForm.email || 'kullanici@example.com'}</p>
                  </div>
                  <div className="ml-auto">
                    <Badge className="bg-white/20 backdrop-blur-md text-white font-bold text-xs px-2.5 py-0.5 border border-white/30">
                      {user?.packageInfo?.PackageName || 'Basic'} Üyelik
                    </Badge>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <h4 className={`text-sm font-black ${textClass}`}>Vücut & Aktivite Bilgileri</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="profile-name" className="text-xs font-bold">Ad Soyad</Label>
                      <Input id="profile-name" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className={`rounded-xl py-2 text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-gray-200' : 'bg-gray-50 border-gray-200'}`} />
                    </div>
                    <div>
                      <Label htmlFor="profile-email" className="text-xs font-bold">E-posta</Label>
                      <Input id="profile-email" type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className={`rounded-xl py-2 text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-gray-200' : 'bg-gray-50 border-gray-200'}`} />
                    </div>
                    <div>
                      <Label htmlFor="profile-age" className="text-xs font-bold">Yaş</Label>
                      <Input id="profile-age" type="number" value={profileForm.age} onChange={e => setProfileForm({...profileForm, age: e.target.value})} className={`rounded-xl py-2 text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-gray-200' : 'bg-gray-50 border-gray-200'}`} />
                    </div>
                    <div>
                      <Label htmlFor="profile-weight" className="text-xs font-bold">Kilo (kg)</Label>
                      <Input id="profile-weight" type="number" step="0.1" value={profileForm.weight} onChange={e => setProfileForm({...profileForm, weight: e.target.value})} className={`rounded-xl py-2 text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-gray-200' : 'bg-gray-50 border-gray-200'}`} />
                    </div>
                    <div>
                      <Label htmlFor="profile-height" className="text-xs font-bold">Boy (cm)</Label>
                      <Input id="profile-height" type="number" step="0.1" value={profileForm.height} onChange={e => setProfileForm({...profileForm, height: e.target.value})} className={`rounded-xl py-2 text-xs ${darkMode ? 'bg-slate-800 border-slate-700 text-gray-200' : 'bg-gray-50 border-gray-200'}`} />
                    </div>
                    <div>
                      <Label htmlFor="profile-gender" className="text-xs font-bold">Cinsiyet</Label>
                      <Select name="profile-gender" value={profileForm.gender} onValueChange={(value) => setProfileForm({...profileForm, gender: value})}>
                        <SelectTrigger className={`rounded-xl h-9 text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                          <SelectValue placeholder="Cinsiyet Seç" />
                        </SelectTrigger>
                        <SelectContent className={`${darkMode ? 'bg-slate-900 border-slate-700 text-gray-50' : 'bg-white'}`}>
                          <SelectItem value="male">Erkek</SelectItem>
                          <SelectItem value="female">Kadın</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className={`${buttonPrimaryClass} rounded-xl font-bold py-2 px-6 text-xs shadow-md shadow-emerald-500/20`}>
                    <Save className="h-3.5 w-3.5 mr-1.5" /> Bilgileri Güncelle
                  </Button>
                </form>

                {/* Sağlık Göstergeleri */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[11px] text-slate-400 font-bold block mb-0.5">VKİ (İndeks)</span>
                    <span className="text-xl font-black text-indigo-500">{profileBMI}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {profileBMI !== 'N/A' && parseFloat(profileBMI as string) < 18.5 && 'Zayıf'}
                      {profileBMI !== 'N/A' && parseFloat(profileBMI as string) >= 18.5 && parseFloat(profileBMI as string) < 24.9 && 'Normal'}
                      {profileBMI !== 'N/A' && parseFloat(profileBMI as string) >= 25 && parseFloat(profileBMI as string) < 29.9 && 'Fazla kilolu'}
                      {profileBMI !== 'N/A' && parseFloat(profileBMI as string) >= 30 && 'Obez'}
                    </span>
                  </div>
                  <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[11px] text-slate-400 font-bold block mb-0.5">BMR (Bazal)</span>
                    <span className="text-xl font-black text-emerald-500">{profileBMR !== undefined ? `${profileBMR} kcal` : 'N/A'}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Dinlenme harcaması</span>
                  </div>
                  <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[11px] text-slate-400 font-bold block mb-0.5">Kalori Hedefi</span>
                    <span className="text-xl font-black text-orange-500">{profileDailyGoal !== undefined ? `${profileDailyGoal} kcal` : 'N/A'}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">İdeal harcama</span>
                  </div>
                  <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[11px] text-slate-400 font-bold block mb-0.5">Su Hedefi</span>
                    <span className="text-xl font-black text-blue-500">{recommendedWater} ml</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Sıvı ihtiyacı</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aktif Abonelik Paket Bilgisi & Kullanım Hakları Kartı */}
            {(() => {
              const pkgName = user?.packageInfo?.PackageName || user?.subscriptionStatus || 'Free';
              const isPremium = pkgName === 'Premium' || pkgName === 'VIP' || pkgName === 'PRO' || user?.packageId === 3 || user?.packageId === 2;

              let remainingDaysText = 'Süresiz Plan';
              if (user?.subscriptionEndDate) {
                const endMs = new Date(user.subscriptionEndDate).getTime();
                const nowMs = Date.now();
                const days = Math.max(0, Math.ceil((endMs - nowMs) / (1000 * 60 * 60 * 24)));
                remainingDaysText = `${days} Gün Kaldı ⏳`;
              }

              const limits = user?.packageInfo?.Limits || {
                PhotoAnalysis: { used: 0, limit: 5 },
                MealSuggestion: { used: 0, limit: 5 },
                BloodTest: { used: 0, limit: 1 }
              };

              return (
                <Card className={`p-6 shadow-xl rounded-3xl ${cardBgClass} border border-emerald-500/40 space-y-5`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 text-white shadow-md">
                        <Crown className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-black text-xs px-2.5 py-0.5">
                            {isPremium ? '🟢 VIP Premium Üyelik' : '⚪ Standart Ücretsiz Plan'}
                          </Badge>
                          <span className="text-xs text-slate-400 font-bold">• {remainingDaysText}</span>
                        </div>
                        <h3 className={`text-xl font-black ${textClass} mt-0.5`}>
                          {isPremium ? 'DiyetGPT VIP Premium Paketi' : 'Standart Ücretsiz Paket'}
                        </h3>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setActiveTab('packages')} 
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs rounded-2xl px-5 py-2.5 shadow-md shadow-emerald-500/20"
                    >
                      <Zap className="h-4 w-4 mr-1.5" /> {isPremium ? 'Paketi Değiştir' : 'VIP Pakete Yükselt'}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                      AYLIK KALAN AI & KULLANIM HAKLARINIZ
                    </span>

                    {/* Fotoğraf Analiz Hakları */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 space-y-1.5">
                      <div className="flex justify-between text-xs font-extrabold">
                        <span className={textClass}>📸 AI Fotoğraf Kalori Analizi</span>
                        <span className="text-emerald-500">
                          {limits.PhotoAnalysis.limit === null ? 'Sınırsız ✨' : `${limits.PhotoAnalysis.used} / ${limits.PhotoAnalysis.limit} (${Math.max(0, limits.PhotoAnalysis.limit - limits.PhotoAnalysis.used)} Hak Kaldı)`}
                        </span>
                      </div>
                      {limits.PhotoAnalysis.limit !== null && (
                        <Progress value={Math.min(100, (limits.PhotoAnalysis.used / limits.PhotoAnalysis.limit) * 100)} className="h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                      )}
                    </div>

                    {/* Kan Tahlili Hakları */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 space-y-1.5">
                      <div className="flex justify-between text-xs font-extrabold">
                        <span className={textClass}>🩸 Kan Tahlili & Biyobelirteç Analizi</span>
                        <span className="text-rose-500">
                          {limits.BloodTest.limit === null ? 'Sınırsız ✨' : `${limits.BloodTest.used} / ${limits.BloodTest.limit} (${Math.max(0, limits.BloodTest.limit - limits.BloodTest.used)} Hak Kaldı)`}
                        </span>
                      </div>
                      {limits.BloodTest.limit !== null && (
                        <Progress value={Math.min(100, (limits.BloodTest.used / limits.BloodTest.limit) * 100)} className="h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                      )}
                    </div>

                    {/* Şef & Öğün Önerisi Hakları */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 space-y-1.5">
                      <div className="flex justify-between text-xs font-extrabold">
                        <span className={textClass}>🍳 AI Şef & Tarif Öneri Sihirbazı</span>
                        <span className="text-amber-500">
                          {limits.MealSuggestion.limit === null ? 'Sınırsız ✨' : `${limits.MealSuggestion.used} / ${limits.MealSuggestion.limit} (${Math.max(0, limits.MealSuggestion.limit - limits.MealSuggestion.used)} Hak Kaldı)`}
                        </span>
                      </div>
                      {limits.MealSuggestion.limit !== null && (
                        <Progress value={Math.min(100, (limits.MealSuggestion.used / limits.MealSuggestion.limit) * 100)} className="h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                      )}
                    </div>
                  </div>
                </Card>
              );
            })()}
          </motion.div>
        );

      case 'ai-chat':
        return (
          <motion.div key="ai-chat" {...animationVariants} className="space-y-6 w-full h-full flex flex-col max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-3xl font-black ${textClass}`}>DiyetGPT Akıllı Asistan</h2>
                <p className={subTextClass}>Yapay zeka beslenme uzmanınıza merak ettiğiniz her şeyi sorun.</p>
              </div>
            </div>

            <Card className={`flex-1 p-6 shadow-xl rounded-3xl ${cardBgClass} flex flex-col border border-slate-200 dark:border-slate-800 min-h-[500px]`}>
              <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-4 space-y-4">
                  {aiChatMessages.length === 0 && (
                    <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
                      <Bot className="h-12 w-12 text-emerald-500 mx-auto" />
                      <h3 className={`font-bold text-lg ${textClass}`}>DiyetGPT'ye Hoş Geldiniz!</h3>
                      <p className={`text-xs max-w-md mx-auto ${subTextClass}`}>"Akşam ne yemeliyim?", "Yağ yakmak için ne yapmalıyım?" veya "Kahve metabolizmayı hızlandırır mı?" gibi sorular sorabilirsiniz.</p>
                      
                      {/* Örnek Soru Çipleri */}
                      <div className="flex flex-wrap justify-center gap-2 pt-2">
                        {['Örnek 1500 kcal diyet menüsü verir misin?', 'Spordan sonra ne yemeliyim?', 'Su içmenin kilo vermeye etkisi nedir?'].map((quickQuery) => (
                          <button
                            key={quickQuery}
                            onClick={() => { setAiInput(quickQuery); }}
                            className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium hover:border-emerald-500 transition-all shadow-sm"
                          >
                            💡 {quickQuery}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiChatMessages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-emerald-600 text-white rounded-br-none font-medium' 
                            : `${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100 border border-slate-200'} ${textClass} rounded-bl-none`
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <span className={`block text-[10px] mt-1.5 text-right ${msg.role === 'user' ? 'text-emerald-100' : subTextClass}`}>
                          {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-100'} p-4 rounded-2xl rounded-bl-none flex items-center space-x-2`}>
                        <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
                        <span className={`text-xs font-bold ${textClass}`}>DiyetGPT düşünüyor...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Input
                    type="text"
                    placeholder="DiyetGPT'ye bir soru sorun..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSendAiMessage(); }}
                    className={`flex-1 rounded-2xl py-3 border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-emerald-500`}
                    disabled={aiLoading}
                  />
                  <Button onClick={handleSendAiMessage} className={`${buttonPrimaryClass} rounded-2xl px-6 font-bold`} disabled={!aiInput.trim() || aiLoading}>
                    <MessageSquareText className="h-5 w-5" />
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
            className="space-y-6 max-w-5xl mx-auto"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/20">
                <Droplet className="h-7 w-7" />
              </div>
              <div>
                <h2 className={`text-3xl font-black ${textClass}`}>Kan Testi & Biyobelirteç Analizi</h2>
                <p className={subTextClass}>Laboratuvar tahlil sonuçlarınızı yükleyin veya yazın, AI sağlık tavsiyesi versin.</p>
              </div>
            </div>

            <Card className="bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-3xl">
              <CardContent className="space-y-6 p-8">
                {/* Hızlı Örnek Doldurma Butonları */}
                <div className="space-y-2">
                  <span className={`text-xs font-bold ${subTextClass}`}>Hızlı Test Örnekleri (Tıklayın):</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setBloodTestResults("Hemoglobin: 14.2 g/dL, B12: 450 pg/mL, Demir: 90 mcg/dL, D Vitamini: 35 ng/mL, Kolesterol: 180 mg/dL, Glukoz: 88 mg/dL")}
                      className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 font-semibold"
                    >
                      ✓ İdeal Kan Değerleri Örneği
                    </button>
                    <button
                      onClick={() => setBloodTestResults("Hemoglobin: 10.5 g/dL (Düşük), B12: 180 pg/mL (Düşük), Demir: 35 mcg/dL, D Vitamini: 14 ng/mL (Eksik), Kolesterol: 210 mg/dL, Glukoz: 92 mg/dL")}
                      className="text-xs px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 font-semibold"
                    >
                      ⚠️ B12 ve D Vitamini Eksikliği Örneği
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                  {/* Fotoğraf Yükleme Bölümü */}
                  <div className="flex-1 w-full relative">
                    <Label
                      htmlFor="image-upload"
                      className={`flex flex-col items-center justify-center space-y-4 cursor-pointer p-8 rounded-3xl transition-all duration-300 border-2 ${imageUrl ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50' : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500'}`}
                    >
                      {imageUrl ? (
                        <div className="text-center">
                          <img src={imageUrl} alt="Kan Testi Önizlemesi" className="max-h-48 w-auto rounded-2xl shadow-xl object-contain mb-3" />
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {imageFile?.name}
                          </span>
                        </div>
                      ) : (
                        <>
                          <Image className="h-12 w-12 text-slate-400 mb-1" />
                          <div className="text-center">
                            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">Kan Tahlili Görseli Yükle</span>
                            <p className="text-xs text-slate-400 mt-1">Sürükle bırak veya tıklayarak dosya seçin</p>
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

                  <div className="flex-shrink-0 font-black text-slate-400 text-sm">VEYA</div>

                  {/* Metin Giriş Bölümü */}
                  <div className="flex-1 w-full relative">
                    <Textarea
                      id="blood-test-text"
                      placeholder="Kan testindeki değerlerinizi yazın. Örn: Hemoglobin 13.5, B12 320, D Vitamini 25..."
                      value={bloodTestResults}
                      onChange={(e) => {
                        setBloodTestResults(e.target.value);
                        setImageFile(null);
                        setImageUrl(null);
                      }}
                      rows={7}
                      className="resize-none border-2 rounded-3xl p-4 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500"
                      disabled={!!imageUrl || isAnalyzing}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAnalyzeBloodTest}
                  className="w-full text-base h-14 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black shadow-xl shadow-rose-500/20 rounded-2xl transition-all"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Laboratuvar Analizi Yapılıyor...
                    </>
                  ) : (
                    <>
                      <Flame className="mr-2 h-5 w-5" /> Tahlili Analiz Et & Raporla
                    </>
                  )}
                </Button>

                {bloodTestAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4"
                  >
                    <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold">
                      <Bot className="h-6 w-6" /> DiyetGPT Medikal Değerlendirmesi
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {bloodTestAnalysis}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'tips':
        return (
          <motion.div key="tips" {...animationVariants} className="space-y-6 w-full max-w-5xl mx-auto">
            {/* Üst Banner Kartı */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 text-white shadow-xl">
              <div className="flex items-center space-x-4">
                <div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30">
                  <Sparkles className="h-8 w-8 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">Beslenme & Yaşam İpuçları</h2>
                  <p className="text-amber-100 text-xs sm:text-sm">Yapay zeka ve uzman diyetisyenlerin günlük önerileriyle yaşam kalitenizi artırın.</p>
                </div>
              </div>
              <Button 
                onClick={() => setRandomTip(dailyTips[Math.floor(Math.random() * dailyTips.length)])} 
                className="bg-white text-slate-900 hover:bg-slate-100 font-black rounded-2xl px-5 py-2.5 text-xs shadow-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Yeni İpucu Çek
              </Button>
            </div>

            {/* Günün Ana İpucu Kartı */}
            <Card className={`p-8 shadow-xl rounded-3xl ${cardBgClass} border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <CardContent className="p-0 flex flex-col items-center justify-center py-4 space-y-4">
                <div className="px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black uppercase tracking-wider">
                  💡 GÜNÜN ÖNE ÇIKAN SEÇİMİ
                </div>
                <blockquote className={`text-2xl sm:text-3xl font-black max-w-3xl leading-relaxed ${textClass}`}>
                  "{randomTip || dailyTips[0]}"
                </blockquote>
              </CardContent>
            </Card>

            {/* Kategori Bazlı Rehber Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className={`${cardBgClass} p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3`}>
                <div className="p-3 w-fit rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <Apple className="h-6 w-6" />
                </div>
                <h3 className={`font-black text-lg ${textClass}`}>Beslenme & Öğünler</h3>
                <p className={`text-xs ${subTextClass} leading-relaxed`}>
                  İşlenmiş gıdalardan uzak durun, tabağınızın yarısını sebzelerle doldurarak lif alımını maksimuma çıkarın.
                </p>
              </div>

              <div className={`${cardBgClass} p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3`}>
                <div className="p-3 w-fit rounded-2xl bg-blue-500/10 text-blue-500">
                  <Droplet className="h-6 w-6" />
                </div>
                <h3 className={`font-black text-lg ${textClass}`}>Hidrasyon & Su</h3>
                <p className={`text-xs ${subTextClass} leading-relaxed`}>
                  Güne 1 büyük bardak ılık su ile başlayın. Gün içinde kilogram başına en az 35 ml su içmeyi ihmal etmeyin.
                </p>
              </div>

              <div className={`${cardBgClass} p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3`}>
                <div className="p-3 w-fit rounded-2xl bg-purple-500/10 text-purple-500">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className={`font-black text-lg ${textClass}`}>Hareket & Metabolizma</h3>
                <p className={`text-xs ${subTextClass} leading-relaxed`}>
                  Yemeklerden sonra 10 dakikalık hafif tempolu yürüyüşler kan şekeri dalgalanmalarını engelleyerek yağ yakımını hızlandırır.
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 'settings':
        return (
          <motion.div key="settings" {...animationVariants} className="space-y-6 w-full max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-3xl font-black ${textClass}`}>Ayarlar & Tercihler</h2>
                <p className={subTextClass}>Uygulama tercihlerinizi, bildirimlerinizi ve hesabınızı özelleştirin.</p>
              </div>
            </div>

            <Card className={`p-8 shadow-xl rounded-3xl ${cardBgClass} border border-slate-200 dark:border-slate-800 space-y-6`}>
              <CardContent className="p-0 space-y-6">
                {/* 1. Bildirim & Hatırlatıcılar */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-black ${textClass} flex items-center gap-2`}>
                    <Bell className="h-5 w-5 text-emerald-500" /> Bildirim & Hatırlatıcı Tercihleri
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                      <div>
                        <Label htmlFor="notifications" className={`text-sm font-bold block ${textClass}`}>Öğün & Su Bildirimleri</Label>
                        <p className={`text-xs ${subTextClass}`}>Günlük su ve öğün zamanlayıcıları</p>
                      </div>
                      <input 
                        type="checkbox" 
                        id="notifications" 
                        checked={appSettings.notifications} 
                        onChange={(e) => setAppSettings(prev => ({ ...prev, notifications: e.target.checked }))} 
                        className="h-5 w-5 rounded accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                      <div>
                        <Label htmlFor="ai-tips" className={`text-sm font-bold block ${textClass}`}>DiyetGPT Akıllı Tavsiyeleri</Label>
                        <p className={`text-xs ${subTextClass}`}>Kişisel AI motivasyon iletileri</p>
                      </div>
                      <input 
                        type="checkbox" 
                        id="ai-tips" 
                        defaultChecked={true}
                        className="h-5 w-5 rounded accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Dil ve Bölge */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className={`text-lg font-black ${textClass} flex items-center gap-2`}>
                    <Globe className="h-5 w-5 text-blue-500" /> Dil & Bölgesel Ayarlar
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                      <div>
                        <Label htmlFor="language" className={`text-sm font-bold block ${textClass}`}>Arayüz Dili</Label>
                        <p className={`text-xs ${subTextClass}`}>Uygulama genel dili</p>
                      </div>
                      <Select value={appSettings.language} onValueChange={(value: 'tr' | 'en') => setAppSettings(prev => ({ ...prev, language: value }))}>
                        <SelectTrigger className={`w-[130px] rounded-xl font-bold text-xs ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={`${darkMode ? 'bg-slate-900 border-slate-700 text-gray-50' : 'bg-white'}`}>
                          <SelectItem value="tr">Türkçe 🇹🇷</SelectItem>
                          <SelectItem value="en">English 🇬🇧</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                      <div>
                        <Label className={`text-sm font-bold block ${textClass}`}>Ölçü Birimleri</Label>
                        <p className={`text-xs ${subTextClass}`}>Metrik (kg/cm) veya İmparyal (lbs/in)</p>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 text-xs">
                        Metrik (kg/cm)
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 3. Aktif Abonelik Paket Bilgisi & Kullanım Hakları */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-black ${textClass} flex items-center gap-2`}>
                      <Crown className="h-5 w-5 text-amber-500" /> Aktif Abonelik & Kullanım Hakları
                    </h3>
                    <Button 
                      onClick={() => setActiveTab('packages')}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl px-4 py-1.5"
                    >
                      <Zap className="h-3.5 w-3.5 mr-1" /> Paketi Yükselt
                    </Button>
                  </div>

                  {(() => {
                    const pkgName = user?.packageInfo?.PackageName || user?.subscriptionStatus || 'Free';
                    const isPremium = pkgName === 'Premium' || pkgName === 'VIP' || pkgName === 'PRO' || user?.packageId === 3 || user?.packageId === 2;

                    let daysRemainingStr = 'Süresiz';
                    if (user?.subscriptionEndDate) {
                      const endMs = new Date(user.subscriptionEndDate).getTime();
                      const days = Math.max(0, Math.ceil((endMs - Date.now()) / (1000 * 60 * 60 * 24)));
                      daysRemainingStr = `${days} Gün Kaldı`;
                    }

                    const limits = user?.packageInfo?.Limits || {
                      PhotoAnalysis: { used: 0, limit: 5 },
                      MealSuggestion: { used: 0, limit: 5 },
                      BloodTest: { used: 0, limit: 1 }
                    };

                    return (
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                          <div>
                            <span className="text-xs font-bold text-slate-400 block uppercase">Mevcut Paketeniz</span>
                            <span className={`text-base font-black ${textClass}`}>
                              {isPremium ? '🌟 VIP Premium Paketi' : '⚪ Standart Ücretsiz Paket'}
                            </span>
                          </div>
                          <Badge className={isPremium ? "bg-emerald-500 text-white font-extrabold text-xs px-3 py-1" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs px-3 py-1"}>
                            {daysRemainingStr}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] text-slate-400 font-extrabold block mb-1">📸 Fotoğraf Analiz Hakkı</span>
                            <span className="text-sm font-black text-emerald-500 block">
                              {limits.PhotoAnalysis.limit === null ? 'Sınırsız ✨' : `${Math.max(0, limits.PhotoAnalysis.limit - limits.PhotoAnalysis.used)} / ${limits.PhotoAnalysis.limit} Hak`}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] text-slate-400 font-extrabold block mb-1">🩸 Kan Tahlili Analiz Hakkı</span>
                            <span className="text-sm font-black text-rose-500 block">
                              {limits.BloodTest.limit === null ? 'Sınırsız ✨' : `${Math.max(0, limits.BloodTest.limit - limits.BloodTest.used)} / ${limits.BloodTest.limit} Hak`}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] text-slate-400 font-extrabold block mb-1">🍳 AI Tarif Öneri Hakkı</span>
                            <span className="text-sm font-black text-amber-500 block">
                              {limits.MealSuggestion.limit === null ? 'Sınırsız ✨' : `${Math.max(0, limits.MealSuggestion.limit - limits.MealSuggestion.used)} / ${limits.MealSuggestion.limit} Hak`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 4. Veri ve Önbellek Yönetimi */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className={`text-lg font-black ${textClass} flex items-center gap-2`}>
                    <Database className="h-5 w-5 text-purple-500" /> Veri & Önbellek Yönetimi
                  </h3>

                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                    <div>
                      <Label className={`text-sm font-bold block ${textClass}`}>Önbelleği & Yerel Verileri Temizle</Label>
                      <p className={`text-xs ${subTextClass}`}>Performansı artırmak için geçici önbelleği sıfırlayın.</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast.success("Uygulama önbelleği başarıyla temizlendi.");
                      }}
                      className="rounded-xl font-bold text-xs"
                    >
                      Önbelleği Temizle
                    </Button>
                  </div>
                </div>

                {/* 4. Oturumu Kapat */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50">
                    <div>
                      <Label className="text-base font-black text-rose-600 dark:text-rose-400 block">Oturumu Kapat</Label>
                      <p className="text-xs text-rose-500/80 dark:text-rose-400/70">Hesabınızdan güvenli bir şekilde çıkış yapın.</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        localStorage.clear();
                        toast.info("Hesabınızdan çıkış yapıldı.");
                        navigate('/login');
                      }} 
                      className="rounded-2xl font-bold px-6 bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Güvenli Çıkış Yap
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };


  // Ana render alanı
  return (
    <div className={`flex h-screen ${mainBgClass} font-inter overflow-hidden`}>
      {/* Sol Kenar Çubuğu (Sabit & Sığdırılmış) */}
      <aside className={`w-64 flex-shrink-0 border-r ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'} hidden md:flex flex-col p-3.5 h-full overflow-hidden`}>
        {/* 1. Logo ve Tema Butonu */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Diyet<span className="text-emerald-500">GPT</span>
              </h1>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold tracking-widest uppercase block -mt-0.5">AI Beslenme Koçu</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl">
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
          </Button>
        </div>

        {/* 2. Kaydırılabilir Navigasyon Butonları */}
        <nav className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
          <button 
            onClick={() => setActiveTab('personal-screen')} 
            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'personal-screen' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ClipboardList className="h-4 w-4 mr-2.5 shrink-0" /> Kontrol Paneli
          </button>

          <button 
            onClick={() => setActiveTab('food-category')} 
            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'food-category' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CookingPot className="h-4 w-4 mr-2.5 shrink-0" /> Yiyecekler
          </button>

          <button 
            onClick={() => setActiveTab('photo-analysis')} 
            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'photo-analysis' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Image className="h-4 w-4 mr-2.5 shrink-0" /> Fotoğraf Analizi
          </button>

          <button 
            onClick={() => setActiveTab('recipes')} 
            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recipes' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="h-4 w-4 mr-2.5 shrink-0" /> Tarifler
          </button>

          <button 
            onClick={() => setActiveTab('diets')} 
            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'diets' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Target className="h-4 w-4 mr-2.5 shrink-0" /> Diyet Programları
          </button>

          <button 
            onClick={() => setActiveTab('blood-test')} 
            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'blood-test' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Droplet className="h-4 w-4 mr-2.5 shrink-0 text-rose-500" /> Kan Sonuçları
          </button>

          <button 
            onClick={() => setActiveTab('recipe-suggest')} 
            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recipe-suggest' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CookingPot className="h-4 w-4 mr-2.5 shrink-0 text-amber-500" /> Yemek Öner
          </button>

          <button 
            onClick={() => setActiveTab('exercises')} 
            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'exercises' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Dumbbell className="h-4 w-4 mr-2.5 shrink-0 text-orange-500" /> Egzersizler
          </button>

          <button 
            onClick={() => setActiveTab('ai-chat')} 
            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ai-chat' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bot className="h-4 w-4 mr-2.5 shrink-0 text-teal-400" /> DiyetGPT AI
          </button>

          <button 
            onClick={() => setActiveTab('packages')} 
            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'packages' 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-md shadow-amber-500/20' 
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <Star className="h-4 w-4 mr-2.5 shrink-0 fill-current text-amber-400" /> Premium Paketler
          </button>

          <button 
            onClick={() => setActiveTab('tips')} 
            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tips' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="h-4 w-4 mr-2.5 shrink-0 text-amber-400" /> İpuçları
          </button>
        </nav>

        {/* 3. Sabit Görünür Kullanıcı Profili, Ayarlar ve Çıkış */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 shrink-0">
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserIcon className="h-4 w-4 mr-2.5 shrink-0 text-blue-400" /> Profilim
          </button>

          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="h-4 w-4 mr-2.5 shrink-0 text-purple-400" /> Ayarlar
          </button>

          {user && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 mt-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-500 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate">{user.name}</span>
              </div>
              <button 
                onClick={() => { 
                  localStorage.clear(); 
                  toast.info("Hesabınızdan çıkış yapıldı.");
                  navigate('/login'); 
                }} 
                title="Çıkış Yap"
                className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Ana İçerik Alanı */}
      <main className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      {/* Mobil Menü Butonu */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
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
            <div className="flex items-center justify-between mb-4">
              <h1 className={`text-xl font-black ${textClass} flex items-center gap-1.5`}>
                <Sparkles className="h-5 w-5 text-emerald-500" /> DiyetGPT
              </h1>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className={`${subTextClass}`}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
              <Button variant={activeTab === 'personal-screen' ? 'secondary' : 'ghost'} className={`w-full justify-start rounded-xl text-xs font-bold ${activeTab === 'personal-screen' ? 'bg-emerald-500 text-white' : ''}`} onClick={() => { setActiveTab('personal-screen'); setIsMobileMenuOpen(false); }}> <ClipboardList className="h-4 w-4 mr-2.5" /> Kontrol Paneli </Button>
              <Button variant={activeTab === 'food-category' ? 'secondary' : 'ghost'} className={`w-full justify-start rounded-xl text-xs font-bold ${activeTab === 'food-category' ? 'bg-emerald-500 text-white' : ''}`} onClick={() => { setActiveTab('food-category'); setIsMobileMenuOpen(false); }}> <CookingPot className="h-4 w-4 mr-2.5" /> Yiyecekler </Button>
              <Button variant={activeTab === 'photo-analysis' ? 'secondary' : 'ghost'} className={`w-full justify-start rounded-xl text-xs font-bold ${activeTab === 'photo-analysis' ? 'bg-emerald-500 text-white' : ''}`} onClick={() => { setActiveTab('photo-analysis'); setIsMobileMenuOpen(false); }}> <Image className="h-4 w-4 mr-2.5" /> Fotoğraf Analizi </Button>
              <Button variant={activeTab === 'recipes' ? 'secondary' : 'ghost'} className={`w-full justify-start rounded-xl text-xs font-bold ${activeTab === 'recipes' ? 'bg-emerald-500 text-white' : ''}`} onClick={() => { setActiveTab('recipes'); setIsMobileMenuOpen(false); }}> <BookOpen className="h-4 w-4 mr-2.5" /> Tarifler </Button>
              <Button variant={activeTab === 'diets' ? 'secondary' : 'ghost'} className={`w-full justify-start rounded-xl text-xs font-bold ${activeTab === 'diets' ? 'bg-emerald-500 text-white' : ''}`} onClick={() => { setActiveTab('diets'); setIsMobileMenuOpen(false); }}> <Target className="h-4 w-4 mr-2.5" /> Diyet Programları </Button>
              <Button variant={activeTab === 'recipe-suggest' ? 'secondary' : 'ghost'} className={`w-full justify-start rounded-xl text-xs font-bold ${activeTab === 'recipe-suggest' ? 'bg-emerald-500 text-white' : ''}`} onClick={() => { setActiveTab('recipe-suggest'); setIsMobileMenuOpen(false); }}> <CookingPot className="h-4 w-4 mr-2.5" /> Yemek Öner </Button>
              <Button variant={activeTab === 'exercises' ? 'secondary' : 'ghost'} className={`w-full justify-start rounded-xl text-xs font-bold ${activeTab === 'exercises' ? 'bg-emerald-500 text-white' : ''}`} onClick={() => { setActiveTab('exercises'); setIsMobileMenuOpen(false); }}> <Dumbbell className="h-4 w-4 mr-2.5" /> Egzersizler </Button>
              <Button variant={activeTab === 'ai-chat' ? 'secondary' : 'ghost'} className={`w-full justify-start rounded-xl text-xs font-bold ${activeTab === 'ai-chat' ? 'bg-emerald-500 text-white' : ''}`} onClick={() => { setActiveTab('ai-chat'); setIsMobileMenuOpen(false); }}> <Bot className="h-4 w-4 mr-2.5" /> DiyetGPT AI </Button>
              <Button variant={activeTab === 'packages' ? 'secondary' : 'ghost'} className={`w-full justify-start rounded-xl text-xs font-extrabold ${activeTab === 'packages' ? 'bg-amber-500 text-white' : 'text-amber-400'}`} onClick={() => { setActiveTab('packages'); setIsMobileMenuOpen(false); }}> <Star className="h-4 w-4 mr-2.5 fill-current" /> Premium Paketler </Button>
              <Button variant={activeTab === 'tips' ? 'secondary' : 'ghost'} className={`w-full justify-start rounded-xl text-xs font-bold ${activeTab === 'tips' ? 'bg-emerald-500 text-white' : ''}`} onClick={() => { setActiveTab('tips'); setIsMobileMenuOpen(false); }}> <Sparkles className="h-4 w-4 mr-2.5" /> İpuçları </Button>
            </nav>

            <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
              <Button variant={activeTab === 'profile' ? 'secondary' : 'ghost'} className={`w-full justify-start rounded-xl text-xs font-bold ${activeTab === 'profile' ? 'bg-emerald-500 text-white' : ''}`} onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}> <UserIcon className="h-4 w-4 mr-2.5" /> Profilim </Button>
              <Button variant={activeTab === 'settings' ? 'secondary' : 'ghost'} className={`w-full justify-start rounded-xl text-xs font-bold ${activeTab === 'settings' ? 'bg-emerald-500 text-white' : ''}`} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}> <Settings className="h-4 w-4 mr-2.5" /> Ayarlar </Button>
              <Button onClick={() => { localStorage.clear(); navigate('/login'); setIsMobileMenuOpen(false); }} className="w-full mt-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-bold py-2">
                <LogOut size={16} className="mr-2" /> Çıkış Yap
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

