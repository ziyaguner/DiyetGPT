import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diyetgpt';

// --- MONGOOSE SCHEMAS ---

// 1. Package Schema
const packageSchema = new mongoose.Schema({
  packageId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  photoAnalysisLimit: { type: Number, default: null },
  mealSuggestionLimit: { type: Number, default: null },
  bloodTestLimit: { type: Number, default: null }
}, { timestamps: true });

// 2. User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  age: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  gender: { type: String },
  activityLevel: { type: String },
  subscriptionStatus: { type: String, default: 'free' },
  subscriptionEndDate: { type: Date },
  packageId: { type: Number, default: 1 },
  photoAnalysisUsed: { type: Number, default: 0 },
  mealSuggestionUsed: { type: Number, default: 0 },
  bloodTestUsed: { type: Number, default: 0 },
  lastUsageReset: { type: Date, default: Date.now },
  dailyCalorieGoal: { type: Number, default: 2000 },
  weightUnit: { type: String, default: 'kg' },
  heightUnit: { type: String, default: 'cm' }
}, { timestamps: true });

// 3. ConsumedFood Schema
const consumedFoodSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  foodId: { type: String },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  amount: { type: Number, default: 100 },
  mealTime: { type: String },
  date: { type: String, required: true, index: true }
}, { timestamps: true });

// 4. BurnedExercise Schema
const burnedExerciseSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  exerciseId: { type: String },
  name: { type: String, required: true },
  minutes: { type: Number, required: true },
  totalCaloriesBurned: { type: Number, required: true },
  date: { type: String, required: true, index: true }
}, { timestamps: true });

// 5. WaterIntake Schema
const waterIntakeSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true, index: true }
}, { timestamps: true });

// --- MODELS ---
export const Package = mongoose.models.Package || mongoose.model('Package', packageSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const ConsumedFood = mongoose.models.ConsumedFood || mongoose.model('ConsumedFood', consumedFoodSchema);
export const BurnedExercise = mongoose.models.BurnedExercise || mongoose.model('BurnedExercise', burnedExerciseSchema);
export const WaterIntake = mongoose.models.WaterIntake || mongoose.model('WaterIntake', waterIntakeSchema);

// --- SEED DEFAULT PACKAGES ---
async function seedDefaultPackages() {
  try {
    const count = await Package.countDocuments();
    if (count === 0) {
      await Package.insertMany([
        { packageId: 1, name: 'Free', photoAnalysisLimit: 5, mealSuggestionLimit: 5, bloodTestLimit: 1 },
        { packageId: 2, name: 'Normal', photoAnalysisLimit: 20, mealSuggestionLimit: 20, bloodTestLimit: 5 },
        { packageId: 3, name: 'Premium', photoAnalysisLimit: null, mealSuggestionLimit: null, bloodTestLimit: null }
      ]);
      console.log('MongoDB: Varsayılan paketler oluşturuldu.');
    }
  } catch (err) {
    console.error('MongoDB paket tohumlama hatası:', err);
  }
}

// --- CONNECT FUNCTION ---
export async function connectToMongoDB() {
  try {
    console.log(`MongoDB bağlantısı kuruluyor... (${MONGO_URI})`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // 5s timeout
    });
    console.log('MongoDB Veritabanı Bağlantısı Başarılı! 🚀');
    await seedDefaultPackages();
  } catch (err) {
    console.warn('MongoDB bağlantı uyarısı (Local MongoDB sunucusu çalışmıyor olabilir):', err.message);
    console.log('MongoDB fallback modunda devam ediliyor...');
  }
}

export default {
  connectToMongoDB,
  User,
  Package,
  ConsumedFood,
  BurnedExercise,
  WaterIntake
};
