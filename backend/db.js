import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'SuperSecretPass123!',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'DiyetGPT',
    options: {
        encrypt: false, // For local dev
        trustServerCertificate: true
    }
};

let poolPromise;

export const connectToDatabase = async () => {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config)
            .connect()
            .then(pool => {
                console.log('Connected to MSSQL Database!');
                return pool;
            })
            .catch(err => {
                console.error('Database Connection Failed! Bad Config: ', err);
                poolPromise = null;
                throw err;
            });
    }
    return poolPromise;
};

export const ensureDatabaseExists = async () => {
    try {
        // Connect without a specific database to create the database if it doesn't exist
        const initConfig = { ...config, database: 'master' };
        const pool = await new sql.ConnectionPool(initConfig).connect();
        
        const dbName = config.database;
        const result = await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${dbName}')
            BEGIN
                CREATE DATABASE [${dbName}];
            END
        `);
        console.log(`Database '${dbName}' ensured.`);
        pool.close();
    } catch (err) {
        console.error('Failed to ensure database exists:', err);
    }
};

export const ensureTableExists = async () => {
    try {
        const pool = await connectToDatabase();
        
        console.log('Veritabanı şeması kontrol ediliyor (MSSQL)...');

        // 1. Packages Tablosu
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Packages' AND xtype='U')
            CREATE TABLE Packages (
                PackageID INT PRIMARY KEY,
                Name NVARCHAR(100) NOT NULL,
                PhotoAnalysisLimit INT,
                MealSuggestionLimit INT,
                BloodTestLimit INT
            )
        `);

        // Varsayılan paketleri ekle (yoksa)
        const packagesCountResult = await pool.request().query('SELECT COUNT(*) as count FROM Packages');
        if (packagesCountResult.recordset[0].count === 0) {
            await pool.request().query(`
                INSERT INTO Packages (PackageID, Name, PhotoAnalysisLimit, MealSuggestionLimit, BloodTestLimit) VALUES
                (1, 'Free', 5, 5, 1),
                (2, 'Normal', 20, 20, 5),
                (3, 'Premium', NULL, NULL, NULL)
            `);
            console.log('Varsayılan paketler eklendi.');
        }

        // 2. Users Tablosu
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
            CREATE TABLE Users (
                ID INT PRIMARY KEY IDENTITY(1,1),
                Name NVARCHAR(255) NOT NULL,
                Email NVARCHAR(255) UNIQUE NOT NULL,
                PasswordHash NVARCHAR(255) NOT NULL,
                Age INT,
                Weight FLOAT,
                Height FLOAT,
                Gender NVARCHAR(50),
                ActivityLevel NVARCHAR(50),
                SubscriptionStatus NVARCHAR(50) NOT NULL DEFAULT 'free',
                SubscriptionEndDate DATETIME,
                PackageID INT DEFAULT 1,
                PhotoAnalysisUsed INT DEFAULT 0,
                MealSuggestionUsed INT DEFAULT 0,
                BloodTestUsed INT DEFAULT 0,
                LastUsageReset DATETIME DEFAULT GETDATE(),
                dailyCalorieGoal INT,
                weightUnit NVARCHAR(10) DEFAULT 'kg',
                heightUnit NVARCHAR(10) DEFAULT 'cm',
                CreatedAt DATETIME DEFAULT GETDATE()
            )
        `);

        // 3. ConsumedFoods Tablosu
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ConsumedFoods' AND xtype='U')
            CREATE TABLE ConsumedFoods (
                ID INT PRIMARY KEY IDENTITY(1,1),
                UserID INT NOT NULL,
                FoodID NVARCHAR(255),
                Name NVARCHAR(255) NOT NULL,
                Calories FLOAT NOT NULL,
                Protein FLOAT,
                Carbs FLOAT,
                Fat FLOAT,
                Amount FLOAT,
                MealTime NVARCHAR(50),
                Date NVARCHAR(50) NOT NULL,
                CreatedAt DATETIME DEFAULT GETDATE()
            )
        `);

        // 4. BurnedExercises Tablosu
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BurnedExercises' AND xtype='U')
            CREATE TABLE BurnedExercises (
                ID INT PRIMARY KEY IDENTITY(1,1),
                UserID INT NOT NULL,
                ExerciseID NVARCHAR(255),
                Name NVARCHAR(255) NOT NULL,
                Minutes INT NOT NULL,
                TotalCaloriesBurned INT NOT NULL,
                Date NVARCHAR(50) NOT NULL,
                CreatedAt DATETIME DEFAULT GETDATE()
            )
        `);

        // 5. WaterIntake Tablosu
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WaterIntake' AND xtype='U')
            CREATE TABLE WaterIntake (
                ID INT PRIMARY KEY IDENTITY(1,1),
                UserID INT NOT NULL,
                Amount INT NOT NULL,
                Date NVARCHAR(50) NOT NULL,
                CreatedAt DATETIME DEFAULT GETDATE()
            )
        `);

        console.log('Veritabanı şeması başarıyla güncellendi (MSSQL).');
    } catch (error) {
        console.error('Tablo oluşturma/kontrol hatası (MSSQL):', error);
    }
};

export default {
    connectToDatabase,
    ensureDatabaseExists,
    ensureTableExists
};
