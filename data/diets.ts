export interface Diet {
  id: string;
  name: string;
  description: string;
  weeklyProgram: DietDay[];
  caloriesPerDay?: number;
  macronutrients?: { protein: string; fat: string; carbs: string };
  target?: string;
  fastingPeriod?: string; 
  duration?: string;
  eatingWindow?: string;
  calorieRange?: string;
  averageCalories?: number;
  difficulty?: 'Kolay' | 'Orta' | 'Zor';}

  export interface DietDay {
  day: string;
  program : { 
    hour: string;
    meal: string;
    foods: string[];
    notes?: string;
    nutrition?: { calories: number; protein: number; fat: number ; carbs: number };
  }[];
}
   export const popularDiets: Diet[] = [
  {
    id: 'mediterranean',
    name: 'Akdeniz Diyeti',
    description: 'Sebze, meyve, zeytinyağı, tam tahıl ve balık ağırlıklı sağlıklı beslenme programı. Kalp sağlığı için idealdir ve kronik hastalıklara karşı koruyucu etkilere sahiptir.',
    target: 'Genel sağlık, kilo kontrolü, kalp sağlığını iyileştirme.',
    caloriesPerDay: 1800,
    macronutrients: { protein: '15-20%', carbs: '50-55%', fat: '30-35%' },
    weeklyProgram: [
      {
        day: 'Pazartesi',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Domates, salatalık, biber (birer orta boy)', 'Az tuzlu beyaz peynir (60g)', 'Tam buğday ekmeği (1 dilim)', '5-6 adet siyah zeytin', 'Taze nane ve maydanoz'],
            notes: 'Bol su içerek güne başlayın.',
            nutrition: { calories: 350, protein: 15, carbs: 40, fat: 15 }
          },
          {
            hour: '10:30',
            meal: 'Ara Öğün',
            foods: ['1 adet yeşil elma', 'Bir avuç çiğ badem (10-12 adet)'],
            nutrition: { calories: 150, protein: 5, carbs: 20, fat: 8 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Izgara levrek veya somon (150g)', 'Bol zeytinyağlı Akdeniz salatası (domates, salatalık, marul, soğan, zeytin, limon suyu)', '1 kase yoğurt (yağsız)'],
            notes: 'Salataya 1 yemek kaşığı sızma zeytinyağı ekleyin.',
            nutrition: { calories: 500, protein: 45, carbs: 25, fat: 25 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 avuç ceviz', '2 adet incir'],
            nutrition: { calories: 180, protein: 4, carbs: 25, fat: 9 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['1 kase mercimek çorbası', 'Izgara hindi göğsü (120g)', 'Buharda pişirilmiş brokoli ve havuç (1 kase)'],
            notes: 'Akşam yemeğinden sonra bitki çayı tercih edin.',
            nutrition: { calories: 420, protein: 35, carbs: 40, fat: 10 }
          }
        ]
      },
      {
        day: 'Salı',
        program: [
          {
            hour: '09:00',
            meal: 'Kahvaltı',
            foods: ['Menemen (2 yumurta, bol domates ve biberle)', 'Az tuzlu beyaz peynir (30g)', '5-6 adet zeytin'],
            notes: 'Kahvaltıyı atlamadan yapın.',
            nutrition: { calories: 400, protein: 20, carbs: 25, fat: 25 }
          },
          {
            hour: '11:30',
            meal: 'Ara Öğün',
            foods: ['1 adet muz', '10 adet fındık'],
            nutrition: { calories: 160, protein: 3, carbs: 25, fat: 6 }
          },
          {
            hour: '14:00',
            meal: 'Öğle Yemeği',
            foods: ['Zeytinyağlı enginar (2-3 adet)', '1 kase yağsız yoğurt', '1 dilim tam buğday ekmeği'],
            notes: 'Öğle yemeği için hafif ve doyurucu bir seçenek.',
            nutrition: { calories: 450, protein: 15, carbs: 50, fat: 20 }
          },
          {
            hour: '17:00',
            meal: 'Ara Öğün',
            foods: ['1 kase çilek (veya mevsim meyvesi)', '1 yemek kaşığı kabak çekirdeği'],
            nutrition: { calories: 120, protein: 4, carbs: 18, fat: 5 }
          },
          {
            hour: '20:00',
            meal: 'Akşam Yemeği',
            foods: ['Izgara tavuk göğsü (150g)', 'Karışık yeşil salata (limonlu)'],
            notes: 'Salatanın üzerine az miktarda zeytinyağı ve balsamik sos ekleyebilirsiniz.',
            nutrition: { calories: 480, protein: 40, carbs: 15, fat: 25 }
          }
        ]
      },
      {
        day: 'Çarşamba',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Süzme peynir (60g)', '2 dilim tam buğday ekmeği', 'Taze nane, dereotu, maydanoz', '4 adet zeytin'],
            notes: 'Kahvaltınıza bol yeşillik ekleyerek lif alımını artırın.',
            nutrition: { calories: 380, protein: 20, carbs: 35, fat: 15 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 avuç badem', '1 adet armut'],
            nutrition: { calories: 170, protein: 6, carbs: 20, fat: 9 }
          },
          {
            hour: '12:30',
            meal: 'Öğle Yemeği',
            foods: ['Pirinç pilavı (yarım kase)', 'Et sote (120g, bol sebzeli)'],
            notes: 'Et soteyi az yağda pişirin.',
            nutrition: { calories: 520, protein: 30, carbs: 45, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt', '1 yemek kaşığı keten tohumu'],
            nutrition: { calories: 150, protein: 10, carbs: 15, fat: 5 }
          },
          {
            hour: '18:30',
            meal: 'Akşam Yemeği',
            foods: ['Balık buğulama (levrek veya çupra, 150g)', 'Fırınlanmış mevsim sebzeleri (brokoli, karnabahar, havuç)'],
            notes: 'Sebzeleri fırında pişirirken üzerine kekik serpin.',
            nutrition: { calories: 480, protein: 40, carbs: 25, fat: 20 }
          }
        ]
      },
      {
        day: 'Perşembe',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Domates, salatalık', 'Beyaz peynir (60g)', 'Tam buğday ekmeği (1 dilim)'],
            notes: 'Güne taze sebzelerle başlayın.',
            nutrition: { calories: 350, protein: 15, carbs: 40, fat: 15 }
          },
          {
            hour: '10:30',
            meal: 'Ara Öğün',
            foods: ['1 adet portakal', '5-6 adet ceviz'],
            nutrition: { calories: 160, protein: 4, carbs: 20, fat: 8 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Izgara balık (150g)', 'Bol zeytinyağlı salata'],
            notes: 'Salatanızın içine farklı yeşillikler ekleyin.',
            nutrition: { calories: 500, protein: 45, carbs: 25, fat: 25 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt', '1 yemek kaşığı yulaf'],
            nutrition: { calories: 150, protein: 10, carbs: 15, fat: 5 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Mercimek çorbası (1 kase)', 'Hindi göğsü (120g)'],
            notes: 'Çorbanıza pul biber ve nane ekleyebilirsiniz.',
            nutrition: { calories: 420, protein: 35, carbs: 40, fat: 10 }
          }
        ]
      },
      {
        day: 'Cuma',
        program: [
          {
            hour: '09:00',
            meal: 'Kahvaltı',
            foods: ['Menemen (2 yumurta)', 'Zeytin (5-6 adet)', 'Tam buğday ekmeği (1 dilim)'],
            notes: 'Zeytinleri doğal, salamura tercih edin.',
            nutrition: { calories: 400, protein: 20, carbs: 25, fat: 25 }
          },
          {
            hour: '11:30',
            meal: 'Ara Öğün',
            foods: ['1 avuç fındık', '1 adet nar'],
            nutrition: { calories: 160, protein: 4, carbs: 25, fat: 6 }
          },
          {
            hour: '14:00',
            meal: 'Öğle Yemeği',
            foods: ['Zeytinyağlı enginar (2-3 adet)', '1 kase yoğurt'],
            notes: 'Enginar yerine baklagillerle yapılmış bir yemek de tercih edilebilir.',
            nutrition: { calories: 450, protein: 15, carbs: 50, fat: 20 }
          },
          {
            hour: '17:00',
            meal: 'Ara Öğün',
            foods: ['1 adet muz', '10 adet badem'],
            nutrition: { calories: 170, protein: 5, carbs: 20, fat: 8 }
          },
          {
            hour: '20:00',
            meal: 'Akşam Yemeği',
            foods: ['Izgara tavuk (150g)', 'Karışık salata'],
            notes: 'Salatayı mevsim yeşillikleriyle zenginleştirin.',
            nutrition: { calories: 480, protein: 40, carbs: 15, fat: 25 }
          }
        ]
      },
      {
        day: 'Cumartesi',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Süzme peynir (60g)', 'Tam buğday ekmeği (1 dilim)', 'Taze nane', 'Domates, salatalık'],
            notes: 'Hafta sonu kahvaltınızı daha keyifli hale getirin.',
            nutrition: { calories: 380, protein: 20, carbs: 35, fat: 15 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet kivi', '1 avuç kabak çekirdeği'],
            nutrition: { calories: 150, protein: 5, carbs: 20, fat: 6 }
          },
          {
            hour: '12:30',
            meal: 'Öğle Yemeği',
            foods: ['Pirinç pilavı (yarım kase)', 'Et sote (120g, sebzeli)'],
            notes: 'Pirinç yerine bulgur pilavı tercih edilebilir.',
            nutrition: { calories: 520, protein: 30, carbs: 45, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 adet avokado', '2 dilim tam buğday ekmeği'],
            nutrition: { calories: 250, protein: 7, carbs: 30, fat: 10 }
          },
          {
            hour: '18:30',
            meal: 'Akşam Yemeği',
            foods: ['Balık buğulama (150g)', 'Fırınlanmış sebzeler'],
            notes: 'Sebzelerin üzerine bir miktar kekik serpin.',
            nutrition: { calories: 480, protein: 40, carbs: 25, fat: 20 }
          }
        ]
      },
      {
        day: 'Pazar',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Domates, salatalık', 'Beyaz peynir (60g)', 'Tam buğday ekmeği (1 dilim)'],
            notes: 'Haftanın son gününe hafif bir başlangıç yapın.',
            nutrition: { calories: 350, protein: 15, carbs: 40, fat: 15 }
          },
          {
            hour: '10:30',
            meal: 'Ara Öğün',
            foods: ['1 adet nar', '1 avuç fındık'],
            nutrition: { calories: 160, protein: 4, carbs: 25, fat: 6 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Izgara balık (150g)', 'Bol zeytinyağlı salata'],
            notes: 'Haftalık omega-3 alımını tamamlayın.',
            nutrition: { calories: 500, protein: 45, carbs: 25, fat: 25 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt', '1 adet şeftali'],
            nutrition: { calories: 150, protein: 10, carbs: 20, fat: 4 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Mercimek çorbası (1 kase)', 'Hindi göğsü (120g)'],
            notes: 'Hafif bir akşam yemeğiyle haftayı tamamlayın.',
            nutrition: { calories: 420, protein: 35, carbs: 40, fat: 10 }
          }
        ]
      }
    ]
  },
  {
    id: 'keto',
    name: 'Ketojenik Diyet',
    description: 'Vücudu ketozise sokarak yağ yakımını hedefleyen düşük karbonhidrat, yüksek yağlı plan. Beyin sağlığı için de faydalı olabilir.',
    target: 'Kilo kaybı, enerji seviyelerini artırma, zihinsel berraklık.',
    caloriesPerDay: 2000,
    macronutrients: { protein: '20-25%', carbs: '5-10%', fat: '70-75%' },
    weeklyProgram: [
      {
        day: 'Pazartesi',
        program: [
          {
            hour: '09:00',
            meal: 'Kahvaltı',
            foods: ['Pastırmalı yumurta (2 yumurta)', 'Avokado (yarım)', 'Taze yeşillikler'],
            notes: 'Güne yüksek yağ ve proteinle başlayarak tokluk hissini artırın.',
            nutrition: { calories: 500, protein: 25, carbs: 5, fat: 40 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Zeytinyağlı kuzu eti (150g)', 'Roka salatası (bol limonlu)'],
            notes: 'Kuzu etini tereyağında pişirin.',
            nutrition: { calories: 600, protein: 40, carbs: 5, fat: 45 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç badem veya ceviz', 'Şekersiz kahve'],
            nutrition: { calories: 200, protein: 5, carbs: 5, fat: 18 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Somon fileto (150g)', 'Sotelenmiş ıspanak (tereyağlı)'],
            notes: 'Omega-3 alımı için somon idealdir.',
            nutrition: { calories: 700, protein: 40, carbs: 5, fat: 55 }
          }
        ]
      },
      {
        day: 'Salı',
        program: [
          {
            hour: '09:00',
            meal: 'Kahvaltı',
            foods: ['Peynirli omlet (2 yumurta, 50g çedar peyniri)'],
            notes: 'Omlete mantar veya biber ekleyebilirsiniz.',
            nutrition: { calories: 450, protein: 25, carbs: 5, fat: 35 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Tavuk salatası (ızgara tavuk parçaları, marul, domates, salatalık)', 'Zeytinyağı ve elma sirkesi sosu'],
            notes: 'Salataya avokado ekleyerek sağlıklı yağları artırın.',
            nutrition: { calories: 550, protein: 35, carbs: 10, fat: 40 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Tam yağlı yoğurt (1 kase)', 'Chia tohumu (1 yemek kaşığı)'],
            nutrition: { calories: 200, protein: 10, carbs: 10, fat: 15 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Izgara köfte (150g)', 'Yoğurt (tam yağlı, 1 kase)'],
            notes: 'Köfteleri fırında veya ızgarada pişirin.',
            nutrition: { calories: 650, protein: 45, carbs: 10, fat: 45 }
          }
        ]
      },
      {
        day: 'Çarşamba',
        program: [
          {
            hour: '09:00',
            meal: 'Kahvaltı',
            foods: ['Avokadolu omlet (2 yumurta, yarım avokado)'],
            notes: 'Güne sağlıklı yağlarla başlayın.',
            nutrition: { calories: 500, protein: 20, carbs: 5, fat: 40 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Somon (150g)', 'Kuşkonmaz (tereyağlı)'],
            notes: 'Somonu fırında veya tavada pişirebilirsiniz.',
            nutrition: { calories: 600, protein: 40, carbs: 10, fat: 45 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç macadamia fındığı', 'Şekersiz yeşil çay'],
            nutrition: { calories: 250, protein: 5, carbs: 5, fat: 23 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Tavuk göğsü (150g)', 'Fırınlanmış brokoli (peynirli)'],
            notes: 'Brokoli üzerine parmesan peyniri serpin.',
            nutrition: { calories: 650, protein: 45, carbs: 10, fat: 45 }
          }
        ]
      },
      {
        day: 'Perşembe',
        program: [
          {
            hour: '09:00',
            meal: 'Kahvaltı',
            foods: ['Pastırmalı yumurta (2 yumurta)', 'Avokado (yarım)'],
            notes: 'Pastırmayı az yağda kızartın.',
            nutrition: { calories: 500, protein: 25, carbs: 5, fat: 40 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Zeytinyağlı kuzu eti (150g)', 'Roka salatası'],
            notes: 'Kuzu etini dinlendirerek daha lezzetli hale getirin.',
            nutrition: { calories: 600, protein: 40, carbs: 5, fat: 45 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç ceviz', 'Şekersiz kahve'],
            nutrition: { calories: 200, protein: 5, carbs: 5, fat: 18 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Somon fileto (150g)', 'Sotelenmiş ıspanak'],
            notes: 'Somonu fırın kağıdında buğulama yapabilirsiniz.',
            nutrition: { calories: 700, protein: 40, carbs: 5, fat: 55 }
          }
        ]
      },
      {
        day: 'Cuma',
        program: [
          {
            hour: '09:00',
            meal: 'Kahvaltı',
            foods: ['Peynirli omlet (2 yumurta, 50g)'],
            notes: 'Omletin yanına zeytin ekleyebilirsiniz.',
            nutrition: { calories: 450, protein: 25, carbs: 5, fat: 35 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Tavuk salatası (ızgara tavuk)', 'Zeytinyağı sosu'],
            notes: 'Salatanıza kırmızı soğan ve nane ekleyin.',
            nutrition: { calories: 550, protein: 35, carbs: 10, fat: 40 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase tam yağlı yoğurt', '1 yemek kaşığı chia tohumu'],
            nutrition: { calories: 200, protein: 10, carbs: 10, fat: 15 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Izgara köfte (150g)', 'Yoğurt'],
            notes: 'Köfteleri bol baharatla lezzetlendirin.',
            nutrition: { calories: 650, protein: 45, carbs: 10, fat: 45 }
          }
        ]
      },
      {
        day: 'Cumartesi',
        program: [
          {
            hour: '09:00',
            meal: 'Kahvaltı',
            foods: ['Avokadolu omlet (2 yumurta)'],
            notes: 'Hafta sonu kahvaltınızı daha zengin hale getirin.',
            nutrition: { calories: 500, protein: 20, carbs: 5, fat: 40 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Somon (150g)', 'Kuşkonmaz'],
            notes: 'Kuşkonmazı zeytinyağında soteleyin.',
            nutrition: { calories: 600, protein: 40, carbs: 10, fat: 45 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 avuç macadamia fındığı', 'Şekersiz yeşil çay'],
            nutrition: { calories: 250, protein: 5, carbs: 5, fat: 23 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Tavuk göğsü (150g)', 'Fırınlanmış brokoli'],
            notes: 'Brokoli üzerine rendelenmiş peynir ekleyebilirsiniz.',
            nutrition: { calories: 650, protein: 45, carbs: 10, fat: 45 }
          }
        ]
      },
      {
        day: 'Pazar',
        program: [
          {
            hour: '09:00',
            meal: 'Kahvaltı',
            foods: ['Pastırmalı yumurta (2 yumurta)', 'Avokado (yarım)'],
            notes: 'Haftanın son gününe özel bir kahvaltı.',
            nutrition: { calories: 500, protein: 25, carbs: 5, fat: 40 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Zeytinyağlı kuzu eti (150g)', 'Roka salatası'],
            notes: 'Kuzu etinin yanına buharda pişmiş karnabahar ekleyebilirsiniz.',
            nutrition: { calories: 600, protein: 40, carbs: 5, fat: 45 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç badem veya ceviz', 'Şekersiz kahve'],
            nutrition: { calories: 200, protein: 5, carbs: 5, fat: 18 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Somon fileto (150g)', 'Sotelenmiş ıspanak'],
            notes: 'Somon ile birlikte sarımsak ve tereyağı kullanın.',
            nutrition: { calories: 700, protein: 40, carbs: 5, fat: 55 }
          }
        ]
      }
    ]
  },
  {
    id: 'paleo',
    name: 'Paleo Diyeti',
    description: 'İşlenmemiş gıdalar, et, balık, sebze ve meyvelere dayalı "taş devri" beslenme programı. Gluten, süt ve baklagil içermez.',
    target: 'Daha iyi sindirim, iltihaplanmayı azaltma, enerji artışı.',
    caloriesPerDay: 2200,
    macronutrients: { protein: '25-30%', carbs: '30-40%', fat: '30-45%' },
    weeklyProgram: [
      {
        day: 'Pazartesi',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Haşlanmış yumurta (2 adet)', 'Badem ezmesi (2 yemek kaşığı)', 'Taze meyve salatası (çilek, yaban mersini, kivi)'],
            notes: 'Badem ezmesi doğal ve şekersiz olmalıdır.',
            nutrition: { calories: 450, protein: 20, carbs: 40, fat: 20 }
          },
          {
            hour: '13:30',
            meal: 'Öğle Yemeği',
            foods: ['Izgara tavuk göğsü (150g)', 'Buharda pişirilmiş brokoli (1 kase)', 'Haşlanmış tatlı patates (1 orta boy)'],
            notes: 'Tavuk göğsünü bol baharatla lezzetlendirin.',
            nutrition: { calories: 600, protein: 45, carbs: 40, fat: 25 }
          },
          {
            hour: '18:30',
            meal: 'Akşam Yemeği',
            foods: ['Kırmızı et (bonfile, 150g)', 'Fırın patates (1 orta boy)', 'Bol yeşillikli salata (zeytinyağlı)'],
            notes: 'Salataya bol miktarda taze roka ve maydanoz ekleyin.',
            nutrition: { calories: 750, protein: 50, carbs: 50, fat: 30 }
          }
        ]
      },
      {
        day: 'Salı',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Meyve salatası (elma, armut, şeftali)', 'Yumurta (2 adet, haşlanmış veya omlet)'],
            notes: 'Meyve salatasını taze tüketin.',
            nutrition: { calories: 400, protein: 15, carbs: 50, fat: 15 }
          },
          {
            hour: '13:30',
            meal: 'Öğle Yemeği',
            foods: ['Hindi göğsü (150g)', 'Karışık sebzeler (havuç, bezelye, biber)', '1 adet avokado'],
            notes: 'Hindi etini az yağda soteleyin.',
            nutrition: { calories: 650, protein: 40, carbs: 30, fat: 35 }
          },
          {
            hour: '18:30',
            meal: 'Akşam Yemeği',
            foods: ['Somon (150g)', 'Kuşkonmaz (buharda)', 'Yeşil salata'],
            notes: 'Somonu limon suyu ve dereotu ile marine edin.',
            nutrition: { calories: 700, protein: 40, carbs: 25, fat: 45 }
          }
        ]
      },
      {
        day: 'Çarşamba',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Sebzeli omlet (3 yumurta)', 'Mevsim meyvesi (1 porsiyon)'],
            notes: 'Omlete mantar, soğan ve biber ekleyebilirsiniz.',
            nutrition: { calories: 480, protein: 25, carbs: 35, fat: 25 }
          },
          {
            hour: '13:30',
            meal: 'Öğle Yemeği',
            foods: ['Izgara biftek (150g)', 'Brokoli (haşlanmış)', 'Tatlı patates'],
            notes: 'Brokoliyi hafifçe haşlayın.',
            nutrition: { calories: 650, protein: 45, carbs: 40, fat: 30 }
          },
          {
            hour: '18:30',
            meal: 'Akşam Yemeği',
            foods: ['Tavuk sote (150g, bol sebzeli)', 'Avokado salatası (domates, soğan, limon suyu)'],
            notes: 'Avokadoyu salatanızda bolca kullanın.',
            nutrition: { calories: 700, protein: 40, carbs: 30, fat: 45 }
          }
        ]
      },
      {
        day: 'Perşembe',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Haşlanmış yumurta (2 adet)', 'Badem ezmesi (2 yemek kaşığı)', 'Taze meyve salatası'],
            notes: 'Sağlıklı yağlar güne zinde başlamanızı sağlar.',
            nutrition: { calories: 450, protein: 20, carbs: 40, fat: 20 }
          },
          {
            hour: '13:30',
            meal: 'Öğle Yemeği',
            foods: ['Izgara tavuk göğsü (150g)', 'Buharda pişirilmiş brokoli', 'Haşlanmış tatlı patates'],
            notes: 'Tatlı patatesleri fırında pişirerek daha lezzetli hale getirebilirsiniz.',
            nutrition: { calories: 600, protein: 45, carbs: 40, fat: 25 }
          },
          {
            hour: '18:30',
            meal: 'Akşam Yemeği',
            foods: ['Kırmızı et (bonfile, 150g)', 'Fırın patates', 'Bol yeşillikli salata'],
            notes: 'Salataya ekleyeceğiniz zeytinyağı, A, D, E, K vitaminlerinin emilimini artırır.',
            nutrition: { calories: 750, protein: 50, carbs: 50, fat: 30 }
          }
        ]
      },
      {
        day: 'Cuma',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Meyve salatası', 'Yumurta (2 adet)'],
            notes: 'İsteğe göre meyve salatanıza ceviz ekleyin.',
            nutrition: { calories: 400, protein: 15, carbs: 50, fat: 15 }
          },
          {
            hour: '13:30',
            meal: 'Öğle Yemeği',
            foods: ['Hindi göğsü (150g)', 'Karışık sebze', '1 adet avokado'],
            notes: 'Hindi etini pişirirken bol baharat kullanın.',
            nutrition: { calories: 650, protein: 40, carbs: 30, fat: 35 }
          },
          {
            hour: '18:30',
            meal: 'Akşam Yemeği',
            foods: ['Somon (150g)', 'Kuşkonmaz', 'Yeşil salata'],
            notes: 'Somonun yanına kuşkonmazı fırında pişirerek servis edin.',
            nutrition: { calories: 700, protein: 40, carbs: 25, fat: 45 }
          }
        ]
      },
      {
        day: 'Cumartesi',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Sebzeli omlet (3 yumurta)', 'Mevsim meyvesi'],
            notes: 'Hafta sonu kahvaltınızı daha doyurucu yapabilirsiniz.',
            nutrition: { calories: 480, protein: 25, carbs: 35, fat: 25 }
          },
          {
            hour: '13:30',
            meal: 'Öğle Yemeği',
            foods: ['Izgara biftek (150g)', 'Brokoli', 'Tatlı patates'],
            notes: 'Brokoliyi soteleyerek daha fazla lezzet katın.',
            nutrition: { calories: 650, protein: 45, carbs: 40, fat: 30 }
          },
          {
            hour: '18:30',
            meal: 'Akşam Yemeği',
            foods: ['Tavuk sote (150g)', 'Avokado salatası'],
            notes: 'Tavuk sotenin içine renkli biberler ekleyebilirsiniz.',
            nutrition: { calories: 700, protein: 40, carbs: 30, fat: 45 }
          }
        ]
      },
      {
        day: 'Pazar',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Haşlanmış yumurta (2 adet)', 'Badem ezmesi (2 yemek kaşığı)', 'Taze meyve salatası'],
            notes: 'Diyetinizi zenginleştirmek için farklı meyveleri karıştırın.',
            nutrition: { calories: 450, protein: 20, carbs: 40, fat: 20 }
          },
          {
            hour: '13:30',
            meal: 'Öğle Yemeği',
            foods: ['Izgara tavuk göğsü (150g)', 'Buharda pişirilmiş brokoli', 'Haşlanmış tatlı patates'],
            notes: 'Protein alımınızı maksimuma çıkarın.',
            nutrition: { calories: 600, protein: 45, carbs: 40, fat: 25 }
          },
          {
            hour: '18:30',
            meal: 'Akşam Yemeği',
            foods: ['Kırmızı et (bonfile, 150g)', 'Fırın patates', 'Bol yeşillikli salata'],
            notes: 'Hafif bir yürüyüşle günü sonlandırın.',
            nutrition: { calories: 750, protein: 50, carbs: 50, fat: 30 }
          }
        ]
      }
    ]
  },
  {
    id: 'vegan',
    name: 'Vegan Diyet',
    description: 'Hayvansal ürünlerin tüketilmediği, tamamen bitkisel kaynaklara dayalı beslenme programı. Etik ve çevresel faydalarının yanı sıra, lif ve vitamin açısından zengindir.',
    target: 'Bitkisel beslenmeye geçiş, kilo kontrolü, sindirim sağlığını iyileştirme.',
    caloriesPerDay: 1900,
    macronutrients: { protein: '15-20%', carbs: '60-65%', fat: '15-20%' },
    weeklyProgram: [
      {
        day: 'Pazartesi',
        program: [
          {
            hour: '07:00',
            meal: 'Kahvaltı',
            foods: ['Chia pudingi (chia tohumu, badem sütü, vanilya)', 'Meyve (çilek veya muz)', 'Bir avuç ceviz'],
            notes: 'Pudingi bir gece önceden hazırlayın.',
            nutrition: { calories: 350, protein: 10, carbs: 40, fat: 15 }
          },
          {
            hour: '10:00',
            meal: 'Ara Öğün',
            foods: ['1 adet portakal', '5-6 adet çiğ badem'],
            nutrition: { calories: 120, protein: 4, carbs: 20, fat: 3 }
          },
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Mercimek köftesi (5 adet)', 'Quinoa salatası (domates, salatalık, maydanoz)'],
            notes: 'Mercimek köftesini fırında pişirerek daha sağlıklı hale getirin.',
            nutrition: { calories: 450, protein: 25, carbs: 60, fat: 10 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 adet elma', '2 yemek kaşığı fıstık ezmesi'],
            nutrition: { calories: 200, protein: 5, carbs: 30, fat: 8 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Mantar sote (bol soğan ve biberli)', 'Karabuğday pilavı (1 kase)'],
            notes: 'Mantar sotenize baharat ekleyin.',
            nutrition: { calories: 500, protein: 15, carbs: 70, fat: 15 }
          }
        ]
      },
      {
        day: 'Salı',
        program: [
          {
            hour: '07:30',
            meal: 'Kahvaltı',
            foods: ['Yulaf lapası (badem sütü, tarçın)', '1 adet muz'],
            notes: 'Lapanıza kuru üzüm veya hurma ekleyebilirsiniz.',
            nutrition: { calories: 300, protein: 8, carbs: 50, fat: 5 }
          },
          {
            hour: '10:30',
            meal: 'Ara Öğün',
            foods: ['1 kase vegan yoğurt', 'Bir avuç ahududu'],
            nutrition: { calories: 150, protein: 5, carbs: 20, fat: 5 }
          },
          {
            hour: '12:30',
            meal: 'Öğle Yemeği',
            foods: ['Nohut salatası (salatalık, domates, taze soğan, limon suyu)'],
            notes: 'Nohut, yüksek lifli ve doyurucu bir seçenektir.',
            nutrition: { calories: 400, protein: 15, carbs: 50, fat: 12 }
          },
          {
            hour: '16:30',
            meal: 'Ara Öğün',
            foods: ['1 adet armut', '8-10 adet fındık'],
            nutrition: { calories: 180, protein: 5, carbs: 25, fat: 8 }
          },
          {
            hour: '18:30',
            meal: 'Akşam Yemeği',
            foods: ['Sebzeli tofu sote (kırmızı biber, kabak, soğan)', 'Esmer pirinç (1 kase)'],
            notes: 'Tofuyu önce marine edin.',
            nutrition: { calories: 550, protein: 25, carbs: 60, fat: 15 }
          }
        ]
      },
      {
        day: 'Çarşamba',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Tohumlu yulaf (keten, chia)', 'Meyve (üzüm veya şeftali)'],
            notes: 'Tohumlar omega-3 açısından zengindir.',
            nutrition: { calories: 320, protein: 10, carbs: 45, fat: 8 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet yeşil elma'],
            nutrition: { calories: 80, protein: 0, carbs: 20, fat: 0 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Buharda pişmiş sebzeler (brokoli, havuç)', 'Mercimek (1 kase)'],
            notes: 'Mercimek yemeğini bol yeşillikle servis edin.',
            nutrition: { calories: 450, protein: 20, carbs: 60, fat: 5 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase çilek', '1 yemek kaşığı ay çekirdeği'],
            nutrition: { calories: 150, protein: 5, carbs: 25, fat: 4 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Vegan burger (mantar veya nohutlu köfte)', 'Fırınlanmış patates kızartması'],
            notes: 'Vegan burger ekmeğini tam tahıllı seçin.',
            nutrition: { calories: 600, protein: 25, carbs: 80, fat: 20 }
          }
        ]
      },
      {
        day: 'Perşembe',
        program: [
          {
            hour: '07:00',
            meal: 'Kahvaltı',
            foods: ['Chia pudingi', 'Vegan yoğurt'],
            notes: 'Güne hafif ve doyurucu bir kahvaltıyla başlayın.',
            nutrition: { calories: 350, protein: 10, carbs: 40, fat: 15 }
          },
          {
            hour: '10:00',
            meal: 'Ara Öğün',
            foods: ['1 adet muz', 'Bir avuç badem'],
            nutrition: { calories: 170, protein: 5, carbs: 25, fat: 6 }
          },
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Mercimek köftesi', 'Quinoa salatası'],
            notes: 'Öğle yemeğinizi bir gün önceden hazırlayın.',
            nutrition: { calories: 450, protein: 25, carbs: 60, fat: 10 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 adet armut', '2 yemek kaşığı fıstık ezmesi'],
            nutrition: { calories: 200, protein: 5, carbs: 30, fat: 8 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Mantar sote', 'Karabuğday pilavı'],
            notes: 'Karabuğday pilavı yerine esmer pirinç de kullanabilirsiniz.',
            nutrition: { calories: 500, protein: 15, carbs: 70, fat: 15 }
          }
        ]
      },
      {
        day: 'Cuma',
        program: [
          {
            hour: '07:30',
            meal: 'Kahvaltı',
            foods: ['Yulaf lapası', 'Muz'],
            notes: 'Muzu dilimleyerek lapanızın üzerine ekleyin.',
            nutrition: { calories: 300, protein: 8, carbs: 50, fat: 5 }
          },
          {
            hour: '10:30',
            meal: 'Ara Öğün',
            foods: ['1 kase vegan yoğurt', 'Bir avuç çilek'],
            nutrition: { calories: 150, protein: 5, carbs: 20, fat: 5 }
          },
          {
            hour: '12:30',
            meal: 'Öğle Yemeği',
            foods: ['Nohut salatası'],
            notes: 'Nohut salatasına bol miktarda limon suyu ekleyin.',
            nutrition: { calories: 400, protein: 15, carbs: 50, fat: 12 }
          },
          {
            hour: '16:30',
            meal: 'Ara Öğün',
            foods: ['1 adet yeşil elma', '8-10 adet ceviz'],
            nutrition: { calories: 180, protein: 5, carbs: 25, fat: 8 }
          },
          {
            hour: '18:30',
            meal: 'Akşam Yemeği',
            foods: ['Sebzeli tofu sote', 'Esmer pirinç'],
            notes: 'Tofunun üzerine soya sosu gezdirebilirsiniz.',
            nutrition: { calories: 550, protein: 25, carbs: 60, fat: 15 }
          }
        ]
      },
      {
        day: 'Cumartesi',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Tohumlu yulaf', 'Meyve'],
            notes: 'Hafta sonu kahvaltınızı daha çeşitli yapın.',
            nutrition: { calories: 320, protein: 10, carbs: 45, fat: 8 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet muz', '10 adet fındık'],
            nutrition: { calories: 170, protein: 5, carbs: 25, fat: 6 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Buharda sebze', 'Mercimek'],
            notes: 'Mercimeği çorba veya ana yemek olarak hazırlayabilirsiniz.',
            nutrition: { calories: 450, protein: 20, carbs: 60, fat: 5 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase çilek', '1 yemek kaşığı kabak çekirdeği'],
            nutrition: { calories: 150, protein: 5, carbs: 25, fat: 4 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Vegan burger', 'Patates kızartması'],
            notes: 'Patatesleri fırında, az yağlı pişirin.',
            nutrition: { calories: 600, protein: 25, carbs: 80, fat: 20 }
          }
        ]
      },
      {
        day: 'Pazar',
        program: [
          {
            hour: '07:00',
            meal: 'Kahvaltı',
            foods: ['Chia pudingi', 'Vegan yoğurt'],
            notes: 'Güne hafif bir başlangıç yapın.',
            nutrition: { calories: 350, protein: 10, carbs: 40, fat: 15 }
          },
          {
            hour: '10:00',
            meal: 'Ara Öğün',
            foods: ['1 adet portakal', '5-6 adet çiğ badem'],
            nutrition: { calories: 120, protein: 4, carbs: 20, fat: 3 }
          },
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Mercimek köftesi', 'Quinoa salatası'],
            notes: 'Quinoa yerine bulgur da kullanabilirsiniz.',
            nutrition: { calories: 450, protein: 25, carbs: 60, fat: 10 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 adet elma', '2 yemek kaşığı fıstık ezmesi'],
            nutrition: { calories: 200, protein: 5, carbs: 30, fat: 8 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Mantar sote', 'Karabuğday pilavı'],
            notes: 'Haftayı bitkisel bir akşam yemeğiyle tamamlayın.',
            nutrition: { calories: 500, protein: 15, carbs: 70, fat: 15 }
          }
        ]
      }
    ]
  },
  {
    id: 'dash',
    name: 'DASH Diyeti',
    description: 'Hipertansiyonu (yüksek tansiyonu) düşürmek için geliştirilen, sodyum ve yağ oranı düşük, potasyum, kalsiyum ve magnezyum açısından zengin beslenme planı. Kalp ve damar hastalıkları riskini azaltır.',
    target: 'Tansiyonu düşürme, kalp sağlığını koruma, kilo kontrolü.',
    caloriesPerDay: 2100,
    macronutrients: { protein: '15-20%', carbs: '55-60%', fat: '20-25%' },
    weeklyProgram: [
      {
        day: 'Pazartesi',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Yulaf ezmesi (yarım kase)', 'Muz (1 adet)', 'Yağsız süt (1 bardak)', '1 avuç yaban mersini'],
            notes: 'Şeker eklemeden tüketin.',
            nutrition: { calories: 350, protein: 15, carbs: 55, fat: 5 }
          },
          {
            hour: '10:30',
            meal: 'Ara Öğün',
            foods: ['1 adet armut', '5 adet badem'],
            nutrition: { calories: 100, protein: 2, carbs: 20, fat: 2 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Ton balıklı salata (konserve, suda)', 'Tam tahıllı ekmek (2 dilim)', 'Bol yeşillik'],
            notes: 'Salataya bol limon suyu sıkın, tuz eklemeyin.',
            nutrition: { calories: 500, protein: 35, carbs: 50, fat: 15 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase az yağlı yoğurt', '1 yemek kaşığı keten tohumu'],
            nutrition: { calories: 150, protein: 10, carbs: 15, fat: 5 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Fırın tavuk (120g)', 'Esmer pirinç (1 kase)', 'Haşlanmış sebze (brokoli, havuç)'],
            notes: 'Tavukları derisiz ve tuzsuz pişirin.',
            nutrition: { calories: 600, protein: 40, carbs: 60, fat: 10 }
          }
        ]
      },
      {
        day: 'Salı',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Tam buğday ekmeği (2 dilim)', 'Az tuzlu beyaz peynir (60g)', 'Domates, salatalık'],
            notes: 'Peyniri iyice yıkayarak tuzunu azaltın.',
            nutrition: { calories: 300, protein: 15, carbs: 40, fat: 10 }
          },
          {
            hour: '10:30',
            meal: 'Ara Öğün',
            foods: ['1 adet şeftali'],
            nutrition: { calories: 80, protein: 1, carbs: 20, fat: 0 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Sebzeli çorba (tuzsuz)', 'Mercimek salatası (limonlu)'],
            notes: 'Kendi sebze çorbanızı hazırlayarak sodyumu kontrol edin.',
            nutrition: { calories: 450, protein: 20, carbs: 70, fat: 5 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç çiğ badem'],
            nutrition: { calories: 150, protein: 5, carbs: 5, fat: 12 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Hindi sote (120g)', 'Bulgur pilavı (yarım kase)', 'Sotelenmiş mantar ve soğan'],
            notes: 'Hindi etini az yağda pişirin.',
            nutrition: { calories: 550, protein: 35, carbs: 50, fat: 15 }
          }
        ]
      },
      {
        day: 'Çarşamba',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Haşlanmış yumurta (2 adet)', 'Avokado (yarım)', '1 dilim tam buğday ekmeği'],
            notes: 'Yüksek potasyum ve sağlıklı yağlar için avokado tüketin.',
            nutrition: { calories: 400, protein: 20, carbs: 30, fat: 20 }
          },
          {
            hour: '10:30',
            meal: 'Ara Öğün',
            foods: ['1 adet muz'],
            nutrition: { calories: 100, protein: 1, carbs: 25, fat: 0 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Fasulye piyazı (az tuzlu)', 'Tam tahıllı ekmek (1 dilim)'],
            notes: 'Fasulye piyazını limon ve bol yeşillikle hazırlayın.',
            nutrition: { calories: 400, protein: 15, carbs: 60, fat: 5 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase az yağlı yoğurt'],
            nutrition: { calories: 100, protein: 8, carbs: 10, fat: 2 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Izgara levrek (150g)', 'Haşlanmış yeşil fasulye', 'Fırınlanmış kuşkonmaz'],
            notes: 'Balık, kalp sağlığı için önemlidir.',
            nutrition: { calories: 550, protein: 40, carbs: 30, fat: 20 }
          }
        ]
      },
      {
        day: 'Perşembe',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Yulaf ezmesi (yarım kase)', 'Muz (1 adet)', 'Yağsız süt'],
            notes: 'Güne yulaf ezmesi gibi kompleks karbonhidratlarla başlayın.',
            nutrition: { calories: 350, protein: 15, carbs: 55, fat: 5 }
          },
          {
            hour: '10:30',
            meal: 'Ara Öğün',
            foods: ['1 adet mandalina', '5 adet ceviz'],
            nutrition: { calories: 100, protein: 3, carbs: 15, fat: 5 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Ton balıklı salata', 'Tam tahıllı ekmek'],
            notes: 'Ton balığını kendi suyunda konserve olanı tercih edin.',
            nutrition: { calories: 500, protein: 35, carbs: 50, fat: 15 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase az yağlı yoğurt', '1 yemek kaşığı chia tohumu'],
            nutrition: { calories: 150, protein: 10, carbs: 15, fat: 5 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Fırın tavuk (120g)', 'Esmer pirinç', 'Haşlanmış sebze'],
            notes: 'Yemeğinizi bolca sebzeyle tamamlayın.',
            nutrition: { calories: 600, protein: 40, carbs: 60, fat: 10 }
          }
        ]
      },
      {
        day: 'Cuma',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Tam buğday ekmeği (2 dilim)', 'Az tuzlu beyaz peynir (60g)', 'Domates, salatalık'],
            notes: 'Kahvaltınıza tuzsuz lor peyniri de ekleyebilirsiniz.',
            nutrition: { calories: 300, protein: 15, carbs: 40, fat: 10 }
          },
          {
            hour: '10:30',
            meal: 'Ara Öğün',
            foods: ['1 kase çilek'],
            nutrition: { calories: 50, protein: 1, carbs: 12, fat: 0 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Sebzeli çorba (tuzsuz)', 'Mercimek salatası'],
            notes: 'Mercimek salatası için kırmızı mercimek kullanın.',
            nutrition: { calories: 450, protein: 20, carbs: 70, fat: 5 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç çiğ badem'],
            nutrition: { calories: 150, protein: 5, carbs: 5, fat: 12 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Hindi sote (120g)', 'Bulgur pilavı', 'Sotelenmiş mantar ve soğan'],
            notes: 'Akşam yemeğinizi hafif tutmaya özen gösterin.',
            nutrition: { calories: 550, protein: 35, carbs: 50, fat: 15 }
          }
        ]
      },
      {
        day: 'Cumartesi',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Haşlanmış yumurta (2 adet)', 'Avokado (yarım)', '1 dilim tam buğday ekmeği'],
            notes: 'Hafta sonu kahvaltınızı daha zengin hale getirin.',
            nutrition: { calories: 400, protein: 20, carbs: 30, fat: 20 }
          },
          {
            hour: '10:30',
            meal: 'Ara Öğün',
            foods: ['1 adet kivi'],
            nutrition: { calories: 60, protein: 1, carbs: 15, fat: 0 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Fasulye piyazı', 'Tam tahıllı ekmek'],
            notes: 'Fasulye piyazına haşlanmış yumurta ekleyebilirsiniz.',
            nutrition: { calories: 400, protein: 15, carbs: 60, fat: 5 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase az yağlı yoğurt'],
            nutrition: { calories: 100, protein: 8, carbs: 10, fat: 2 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Izgara levrek (150g)', 'Haşlanmış yeşil fasulye', 'Fırınlanmış kuşkonmaz'],
            notes: 'Balığın yanında bol limon suyu kullanın.',
            nutrition: { calories: 550, protein: 40, carbs: 30, fat: 20 }
          }
        ]
      },
      {
        day: 'Pazar',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Yulaf ezmesi (yarım kase)', 'Muz', 'Yağsız süt'],
            notes: 'Hafif bir kahvaltıyla güne başlayın.',
            nutrition: { calories: 350, protein: 15, carbs: 55, fat: 5 }
          },
          {
            hour: '10:30',
            meal: 'Ara Öğün',
            foods: ['1 adet portakal', '5 adet badem'],
            nutrition: { calories: 100, protein: 2, carbs: 20, fat: 2 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Ton balıklı salata', 'Tam tahıllı ekmek'],
            notes: 'Haftalık omega-3 alımınızı tamamlayın.',
            nutrition: { calories: 500, protein: 35, carbs: 50, fat: 15 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase az yağlı yoğurt', '1 yemek kaşığı keten tohumu'],
            nutrition: { calories: 150, protein: 10, carbs: 15, fat: 5 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Fırın tavuk (120g)', 'Esmer pirinç', 'Haşlanmış sebze'],
            notes: 'Akşam yemeğinden sonra bol su içmeyi unutmayın.',
            nutrition: { calories: 600, protein: 40, carbs: 60, fat: 10 }
          }
        ]
      }
    ]
  },
  {
    id: 'intermittent',
    name: 'Aralıklı Oruç (16:8 Modeli)',
    description: 'Belirli saat aralıklarında beslenme ve oruç periyotlarını içeren program. Sindirim sistemini dinlendirir ve metabolizmayı hızlandırır.',
    target: 'Kilo kaybı, insülin hassasiyetini artırma, zihinsel odaklanmayı geliştirme.',
    fastingPeriod: '16 saat',
    eatingWindow: '8 saat',
    weeklyProgram: [
      {
        day: 'Pazartesi',
        program: [
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Avokadolu omlet (2 yumurta, yarım avokado)', 'Tam tahıllı tost (1 dilim)'],
            notes: 'Yemek yemeye başlamadan önce bir bardak su için.',
            nutrition: { calories: 500, protein: 20, carbs: 30, fat: 35 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç badem', '1 adet yeşil elma'],
            nutrition: { calories: 200, protein: 5, carbs: 25, fat: 10 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Izgara biftek (150g)', 'Roka salatası (zeytinyağlı)', 'Haşlanmış kuşkonmaz'],
            notes: 'Yemeğinizin tadını çıkararak yavaş yavaş yiyin.',
            nutrition: { calories: 700, protein: 50, carbs: 20, fat: 40 }
          }
        ]
      },
      {
        day: 'Salı',
        program: [
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Izgara tavuk (150g)', 'Sebzeli pilav (esmer pirinç)', 'Bol yeşillikli salata'],
            notes: 'Öğle yemeğiniz için yüksek proteinli bir ana yemek seçin.',
            nutrition: { calories: 600, protein: 40, carbs: 50, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt', '1 adet şeftali'],
            nutrition: { calories: 150, protein: 10, carbs: 20, fat: 4 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Hindi sote (120g)', 'Haşlanmış sebze (brokoli, karnabahar)'],
            notes: 'Akşam yemeğinizde hafif protein kaynaklarını tercih edin.',
            nutrition: { calories: 550, protein: 35, carbs: 30, fat: 25 }
          }
        ]
      },
      {
        day: 'Çarşamba',
        program: [
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Mercimek çorbası (1 kase)', 'Karışık salata', '2 dilim tam buğday ekmeği'],
            notes: 'Çorbanızı öğle yemeğinizin ana öğesi yapın.',
            nutrition: { calories: 450, protein: 20, carbs: 60, fat: 10 }
          },
          {
            hour: '17:00',
            meal: 'Ara Öğün',
            foods: ['1 adet muz', 'Bir avuç fındık'],
            nutrition: { calories: 180, protein: 5, carbs: 30, fat: 8 }
          },
          {
            hour: '20:00',
            meal: 'Akşam Yemeği',
            foods: ['Balık buğulama (levrek, 150g)', 'Haşlanmış patates (1 orta boy)', 'Yeşil salata'],
            notes: 'Yemek pencerenizin son yemeğini doyurucu tutun.',
            nutrition: { calories: 600, protein: 45, carbs: 40, fat: 20 }
          }
        ]
      },
      {
        day: 'Perşembe',
        program: [
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Avokadolu omlet (2 yumurta, yarım avokado)', 'Tam tahıllı tost (1 dilim)'],
            notes: 'Yüksek yağlar tokluk hissi sağlar.',
            nutrition: { calories: 500, protein: 20, carbs: 30, fat: 35 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç badem', '1 adet elma'],
            nutrition: { calories: 200, protein: 5, carbs: 25, fat: 10 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Izgara biftek (150g)', 'Roka salatası', 'Haşlanmış kuşkonmaz'],
            notes: 'Akşam yemeği sonrası 16 saatlik oruç periyoduna geçin.',
            nutrition: { calories: 700, protein: 50, carbs: 20, fat: 40 }
          }
        ]
      },
      {
        day: 'Cuma',
        program: [
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Izgara tavuk (150g)', 'Sebzeli pilav', 'Bol yeşillikli salata'],
            notes: 'Vücudunuzun ihtiyacı olan enerjiyi protein ve karbonhidrattan alın.',
            nutrition: { calories: 600, protein: 40, carbs: 50, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt', '1 adet kivi'],
            nutrition: { calories: 150, protein: 10, carbs: 20, fat: 4 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Hindi sote (120g)', 'Haşlanmış sebze'],
            notes: 'Yemeklerinizi 8 saatlik pencereniz içerisinde tüketin.',
            nutrition: { calories: 550, protein: 35, carbs: 30, fat: 25 }
          }
        ]
      },
      {
        day: 'Cumartesi',
        program: [
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Mercimek çorbası', 'Karışık salata', '2 dilim tam buğday ekmeği'],
            notes: 'Hafta sonu yemeğinizi biraz daha geç yapabilirsiniz.',
            nutrition: { calories: 450, protein: 20, carbs: 60, fat: 10 }
          },
          {
            hour: '17:00',
            meal: 'Ara Öğün',
            foods: ['1 adet muz', 'Bir avuç fındık'],
            nutrition: { calories: 180, protein: 5, carbs: 30, fat: 8 }
          },
          {
            hour: '20:00',
            meal: 'Akşam Yemeği',
            foods: ['Balık buğulama (levrek, 150g)', 'Haşlanmış patates', 'Yeşil salata'],
            notes: 'Diyetin esnekliğini kullanarak sosyal etkinliklerinize uyum sağlayın.',
            nutrition: { calories: 600, protein: 45, carbs: 40, fat: 20 }
          }
        ]
      },
      {
        day: 'Pazar',
        program: [
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Avokadolu omlet', 'Tam tahıllı tost'],
            notes: 'Orucunuzu yüksek protein ve sağlıklı yağlarla açın.',
            nutrition: { calories: 500, protein: 20, carbs: 30, fat: 35 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç badem', '1 adet elma'],
            nutrition: { calories: 200, protein: 5, carbs: 25, fat: 10 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Izgara biftek (150g)', 'Roka salatası', 'Haşlanmış kuşkonmaz'],
            notes: 'Haftanın son yemeğiyle kendinizi ödüllendirin.',
            nutrition: { calories: 700, protein: 50, carbs: 20, fat: 40 }
          }
        ]
      }
    ]
  },
  {
    id: 'low-carb',
    name: 'Düşük Karbonhidrat Diyeti',
    description: 'Karbonhidratın sınırlandırılarak protein ve sağlıklı yağların artırıldığı diyet. Kan şekerini dengelemeye ve kilo kaybına yardımcı olur.',
    target: 'Kilo kaybı, kan şekeri kontrolü, enerji seviyelerini koruma.',
    caloriesPerDay: 2000,
    macronutrients: { protein: '30-40%', carbs: '20-30%', fat: '30-40%' },
    weeklyProgram: [
      {
        day: 'Pazartesi',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Sebzeli omlet (2 yumurta)', 'Beyaz peynir (60g)'],
            notes: 'Omlete mantar, soğan veya biber ekleyebilirsiniz.',
            nutrition: { calories: 400, protein: 25, carbs: 10, fat: 30 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 avuç badem'],
            nutrition: { calories: 150, protein: 5, carbs: 5, fat: 12 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Tavuk salatası (ızgara tavuk, marul, domates, salatalık)', 'Zeytinyağı sosu'],
            notes: 'Salatanıza farklı yeşillikler ekleyin.',
            nutrition: { calories: 500, protein: 35, carbs: 15, fat: 30 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt', '1 yemek kaşığı chia tohumu'],
            nutrition: { calories: 150, protein: 10, carbs: 10, fat: 5 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Izgara köfte (150g)', 'Yoğurt (1 kase)', 'Haşlanmış brokoli'],
            notes: 'Köfteleri fırında veya ızgarada pişirin.',
            nutrition: { calories: 600, protein: 45, carbs: 20, fat: 30 }
          }
        ]
      },
      {
        day: 'Salı',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Haşlanmış yumurta (2 adet)', 'Avokado (yarım)', 'Taze yeşillikler'],
            notes: 'Avokado, sağlıklı yağlar açısından zengindir.',
            nutrition: { calories: 450, protein: 20, carbs: 10, fat: 35 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet salatalık', '1 adet domates'],
            nutrition: { calories: 50, protein: 1, carbs: 10, fat: 0 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Somon (150g)', 'Haşlanmış kuşkonmaz (zeytinyağlı)'],
            notes: 'Somon, omega-3 açısından zengin bir balıktır.',
            nutrition: { calories: 600, protein: 40, carbs: 10, fat: 45 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç ceviz'],
            nutrition: { calories: 150, protein: 5, carbs: 5, fat: 13 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Hindi sote (120g)', 'Roka salatası (limonlu)'],
            notes: 'Hindi etini bol baharatla lezzetlendirin.',
            nutrition: { calories: 550, protein: 35, carbs: 10, fat: 35 }
          }
        ]
      },
      {
        day: 'Çarşamba',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Pastırmalı yumurta (2 yumurta)'],
            notes: 'Pastırma yerine hindi veya tavuk jambon kullanabilirsiniz.',
            nutrition: { calories: 450, protein: 25, carbs: 5, fat: 35 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt'],
            nutrition: { calories: 100, protein: 8, carbs: 10, fat: 2 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Izgara kuzu pirzola (150g)', 'Haşlanmış brokoli'],
            notes: 'Kuzu pirzolayı az yağda pişirin.',
            nutrition: { calories: 650, protein: 45, carbs: 10, fat: 45 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['10 adet fındık'],
            nutrition: { calories: 100, protein: 3, carbs: 3, fat: 8 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Ton balığı salatası (suda konserve)', 'Bol yeşillik, domates, salatalık'],
            notes: 'Ton balığı, protein açısından zengin ve doyurucudur.',
            nutrition: { calories: 500, protein: 35, carbs: 10, fat: 35 }
          }
        ]
      },
      {
        day: 'Perşembe',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Sebzeli omlet (2 yumurta)', 'Beyaz peynir (60g)'],
            notes: 'Kahvaltıda yüksek protein alımına odaklanın.',
            nutrition: { calories: 400, protein: 25, carbs: 10, fat: 30 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 avuç badem'],
            nutrition: { calories: 150, protein: 5, carbs: 5, fat: 12 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Tavuk salatası (ızgara tavuk)', 'Zeytinyağı sosu'],
            notes: 'Salatanıza renkli biberler ekleyebilirsiniz.',
            nutrition: { calories: 500, protein: 35, carbs: 15, fat: 30 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt', '1 yemek kaşığı keten tohumu'],
            nutrition: { calories: 150, protein: 10, carbs: 10, fat: 5 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Izgara köfte (150g)', 'Yoğurt', 'Haşlanmış brokoli'],
            notes: 'Akşam yemeğinde karbonhidrat alımınızı minimuma indirin.',
            nutrition: { calories: 600, protein: 45, carbs: 20, fat: 30 }
          }
        ]
      },
      {
        day: 'Cuma',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Haşlanmış yumurta (2 adet)', 'Avokado (yarım)', 'Taze yeşillikler'],
            notes: 'Sabah tokluğunuz için sağlıklı yağlar önemlidir.',
            nutrition: { calories: 450, protein: 20, carbs: 10, fat: 35 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet salatalık', '1 adet domates'],
            nutrition: { calories: 50, protein: 1, carbs: 10, fat: 0 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Somon (150g)', 'Haşlanmış kuşkonmaz'],
            notes: 'Somonu fırında pişirerek lezzetini artırın.',
            nutrition: { calories: 600, protein: 40, carbs: 10, fat: 45 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç ceviz'],
            nutrition: { calories: 150, protein: 5, carbs: 5, fat: 13 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Hindi sote (120g)', 'Roka salatası'],
            notes: 'Hindi sotenin yanına mantar sote de ekleyebilirsiniz.',
            nutrition: { calories: 550, protein: 35, carbs: 10, fat: 35 }
          }
        ]
      },
      {
        day: 'Cumartesi',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Pastırmalı yumurta (2 yumurta)'],
            notes: 'Hafta sonu kahvaltınızı daha keyifli hale getirin.',
            nutrition: { calories: 450, protein: 25, carbs: 5, fat: 35 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt'],
            nutrition: { calories: 100, protein: 8, carbs: 10, fat: 2 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Izgara kuzu pirzola (150g)', 'Haşlanmış brokoli'],
            notes: 'Kuzu pirzolayı fırında da pişirebilirsiniz.',
            nutrition: { calories: 650, protein: 45, carbs: 10, fat: 45 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['10 adet fındık'],
            nutrition: { calories: 100, protein: 3, carbs: 3, fat: 8 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Ton balığı salatası', 'Bol yeşillik'],
            notes: 'Ton balıklı salatanıza haşlanmış yumurta ekleyebilirsiniz.',
            nutrition: { calories: 500, protein: 35, carbs: 10, fat: 35 }
          }
        ]
      },
      {
        day: 'Pazar',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Sebzeli omlet (2 yumurta)', 'Beyaz peynir (60g)'],
            notes: 'Güne yüksek proteinle başlayın.',
            nutrition: { calories: 400, protein: 25, carbs: 10, fat: 30 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 avuç badem'],
            nutrition: { calories: 150, protein: 5, carbs: 5, fat: 12 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Tavuk salatası (ızgara tavuk)', 'Zeytinyağı sosu'],
            notes: 'Hafif bir öğle yemeğiyle günü sürdürün.',
            nutrition: { calories: 500, protein: 35, carbs: 15, fat: 30 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt', '1 yemek kaşığı keten tohumu'],
            nutrition: { calories: 150, protein: 10, carbs: 10, fat: 5 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Izgara köfte (150g)', 'Yoğurt', 'Haşlanmış brokoli'],
            notes: 'Haftanın son yemeğiyle kendinizi ödüllendirin.',
            nutrition: { calories: 600, protein: 45, carbs: 20, fat: 30 }
          }
        ]
      }
    ]
  },
  {
    id: 'gluten-free',
    name: 'Glutensiz Diyet',
    description: 'Gluten hassasiyeti veya çölyak hastalığı olanlar için gluten içermeyen plan. Buğday, arpa ve çavdar gibi tahıllar yerine alternatif kaynaklar kullanılır.',
    target: 'Sindirim sorunlarını giderme, enerji seviyelerini artırma, çölyak ve hassasiyet tedavisi.',
    caloriesPerDay: 2000,
    macronutrients: { protein: '20-25%', carbs: '50-55%', fat: '20-25%' },
    weeklyProgram: [
      {
        day: 'Pazartesi',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Glutensiz mısır ekmeği (2 dilim)', 'Labne peyniri (50g)', 'Zeytin (5-6 adet)', 'Domates, salatalık'],
            notes: 'Mısır ekmeği yerine karabuğday ekmeği de kullanabilirsiniz.',
            nutrition: { calories: 400, protein: 15, carbs: 45, fat: 15 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet muz', '10 adet badem'],
            nutrition: { calories: 170, protein: 5, carbs: 25, fat: 8 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Pirinç pilavı (yarım kase)', 'Et sote (120g)'],
            notes: 'Et sotenin içine bolca sebze ekleyin.',
            nutrition: { calories: 550, protein: 35, carbs: 50, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt', 'Bir avuç çilek'],
            nutrition: { calories: 150, protein: 10, carbs: 20, fat: 4 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Balık buğulama (levrek, 150g)', 'Sebze garnitür (buharda brokoli, havuç)'],
            notes: 'Balığın yanında bol limon suyu kullanın.',
            nutrition: { calories: 500, protein: 40, carbs: 30, fat: 20 }
          }
        ]
      },
      {
        day: 'Salı',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Glutensiz yulaf ezmesi (yarım kase)', 'Muz (1 adet)', 'Badem sütü'],
            notes: 'Yulaf ezmesi yerine kinoa da kullanabilirsiniz.',
            nutrition: { calories: 350, protein: 10, carbs: 50, fat: 10 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet elma'],
            nutrition: { calories: 80, protein: 0, carbs: 20, fat: 0 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Quinoa salatası (haşlanmış tavuk, domates, salatalık, maydanoz)'],
            notes: 'Quinoa, glutensiz bir tam tahıl alternatiftir.',
            nutrition: { calories: 500, protein: 35, carbs: 40, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç ceviz', '1 adet şeftali'],
            nutrition: { calories: 200, protein: 5, carbs: 30, fat: 8 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Hindi pirzola (150g)', 'Buharda pişirilmiş brokoli', 'Tatlı patates'],
            notes: 'Hindi pirzolayı az yağda pişirin.',
            nutrition: { calories: 600, protein: 40, carbs: 50, fat: 20 }
          }
        ]
      },
      {
        day: 'Çarşamba',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Omlet (2 yumurta)', 'Meyve salatası (kivi, çilek, portakal)'],
            notes: 'Omletinize bol sebze ekleyebilirsiniz.',
            nutrition: { calories: 450, protein: 20, carbs: 40, fat: 20 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt'],
            nutrition: { calories: 100, protein: 8, carbs: 10, fat: 2 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Mercimek çorbası (1 kase)', 'Karışık salata'],
            notes: 'Mercimek çorbası, glutensiz bir lif kaynağıdır.',
            nutrition: { calories: 400, protein: 15, carbs: 60, fat: 5 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 adet muz', '10 adet fındık'],
            nutrition: { calories: 180, protein: 5, carbs: 30, fat: 8 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Biftek (150g)', 'Fırınlanmış tatlı patates', 'Yeşil salata'],
            notes: 'Tatlı patatesleri küp küp doğrayarak fırında pişirin.',
            nutrition: { calories: 600, protein: 45, carbs: 40, fat: 25 }
          }
        ]
      },
      {
        day: 'Perşembe',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Mısır ekmeği (2 dilim)', 'Labne', 'Zeytin', 'Domates, salatalık'],
            notes: 'Glutensiz ekmekleri güvenilir markalardan temin edin.',
            nutrition: { calories: 400, protein: 15, carbs: 45, fat: 15 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet muz', '10 adet badem'],
            nutrition: { calories: 170, protein: 5, carbs: 25, fat: 8 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Pirinç pilavı', 'Et sote'],
            notes: 'Pirinç pilavına garnitür olarak bezelye ekleyebilirsiniz.',
            nutrition: { calories: 550, protein: 35, carbs: 50, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt', 'Bir avuç çilek'],
            nutrition: { calories: 150, protein: 10, carbs: 20, fat: 4 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Balık buğulama (150g)', 'Sebze garnitür'],
            notes: 'Hafif bir akşam yemeği sindirimi kolaylaştırır.',
            nutrition: { calories: 500, protein: 40, carbs: 30, fat: 20 }
          }
        ]
      },
      {
        day: 'Cuma',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Glutensiz yulaf ezmesi', 'Muz', 'Badem sütü'],
            notes: 'Yulafınızı sıcak veya soğuk hazırlayabilirsiniz.',
            nutrition: { calories: 350, protein: 10, carbs: 50, fat: 10 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet elma'],
            nutrition: { calories: 80, protein: 0, carbs: 20, fat: 0 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Quinoa salatası', 'Haşlanmış tavuk'],
            notes: 'Quinoa salatasını bir gün önceden hazırlayabilirsiniz.',
            nutrition: { calories: 500, protein: 35, carbs: 40, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç ceviz', '1 adet şeftali'],
            nutrition: { calories: 200, protein: 5, carbs: 30, fat: 8 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Hindi pirzola (150g)', 'Buharda pişirilmiş brokoli', 'Tatlı patates'],
            notes: 'Hindi pirzolası yerine balık da tercih edebilirsiniz.',
            nutrition: { calories: 600, protein: 40, carbs: 50, fat: 20 }
          }
        ]
      },
      {
        day: 'Cumartesi',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Omlet (2 yumurta)', 'Meyve salatası'],
            notes: 'Hafta sonu kahvaltınızı daha çeşitli yapın.',
            nutrition: { calories: 450, protein: 20, carbs: 40, fat: 20 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt'],
            nutrition: { calories: 100, protein: 8, carbs: 10, fat: 2 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Mercimek çorbası', 'Salata'],
            notes: 'Salatanıza farklı sebzeler ekleyin.',
            nutrition: { calories: 400, protein: 15, carbs: 60, fat: 5 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 adet muz', '10 adet fındık'],
            nutrition: { calories: 180, protein: 5, carbs: 30, fat: 8 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Biftek (150g)', 'Fırınlanmış tatlı patates', 'Yeşil salata'],
            notes: 'Biftek yerine kırmızı et de tercih edebilirsiniz.',
            nutrition: { calories: 600, protein: 45, carbs: 40, fat: 25 }
          }
        ]
      },
      {
        day: 'Pazar',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Mısır ekmeği (2 dilim)', 'Labne', 'Zeytin'],
            notes: 'Hafif bir kahvaltıyla haftayı sonlandırın.',
            nutrition: { calories: 400, protein: 15, carbs: 45, fat: 15 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet muz', '10 adet badem'],
            nutrition: { calories: 170, protein: 5, carbs: 25, fat: 8 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Pirinç pilavı', 'Et sote'],
            notes: 'Pirinç pilavını bol sebzeyle pişirin.',
            nutrition: { calories: 550, protein: 35, carbs: 50, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt', 'Bir avuç çilek'],
            nutrition: { calories: 150, protein: 10, carbs: 20, fat: 4 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Balık buğulama', 'Sebze garnitür'],
            notes: 'Yeterli sıvı alımını sağlamak için bol su için.',
            nutrition: { calories: 500, protein: 40, carbs: 30, fat: 20 }
          }
        ]
      }
    ]
  },
  {
    id: 'detox',
    name: 'Detoks Diyeti (3 Günlük)',
    description: 'Vücudu dinlendirmeyi amaçlayan kısa süreli, hafif ve sıvı ağırlıklı program. Genellikle özel durumlarda veya diyet öncesinde uygulanır.',
    target: 'Vücudu temizleme, ödem atma, enerji seviyesini canlandırma.',
    duration: '3 gün',
    caloriesPerDay: 1200,
    macronutrients: { protein: '10-15%', carbs: '70-75%', fat: '10-15%' },
    weeklyProgram: [
      {
        day: 'Pazartesi',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Yeşil smoothie (ıspanak, salatalık, zencefil, limon, su)', '1 yemek kaşığı chia tohumu'],
            notes: 'Kahvaltı, detoks diyetinin en önemli öğünlerinden biridir.',
            nutrition: { calories: 250, protein: 5, carbs: 40, fat: 5 }
          },
          {
            hour: '10:00',
            meal: 'Ara Öğün',
            foods: ['Detoks suyu (limon, nane, salatalık dilimli su)'],
            notes: 'Gün boyunca bolca detoks suyu içmeye devam edin.',
            nutrition: { calories: 10, protein: 0, carbs: 2, fat: 0 }
          },
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Haşlanmış sebze (brokoli, karnabahar, havuç)', 'Limonlu su'],
            notes: 'Sebzeleri çok fazla pişirmeyin.',
            nutrition: { calories: 200, protein: 8, carbs: 30, fat: 2 }
          },
          {
            hour: '15:00',
            meal: 'Ara Öğün',
            foods: ['1 adet yeşil elma'],
            nutrition: { calories: 80, protein: 0, carbs: 20, fat: 0 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Sebze çorbası (tuzsuz)', 'Bitki çayı (yeşil çay veya papatya)'],
            notes: 'Çorbanızın içine baharatlar ekleyebilirsiniz.',
            nutrition: { calories: 250, protein: 10, carbs: 40, fat: 5 }
          }
        ]
      },
      {
        day: 'Salı',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Meyve suyu (taze sıkılmış nar ve portakal)', 'Yulaf (1 yemek kaşığı)'],
            notes: 'Meyve sularını taze sıkın.',
            nutrition: { calories: 200, protein: 5, carbs: 40, fat: 2 }
          },
          {
            hour: '10:00',
            meal: 'Ara Öğün',
            foods: ['Detoks suyu (limon, nane, salatalık)'],
            notes: 'Gün boyunca su alımınıza dikkat edin.',
            nutrition: { calories: 10, protein: 0, carbs: 2, fat: 0 }
          },
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Hafif sebzeli salata (marul, roka, salatalık)', 'Limon suyu'],
            notes: 'Salataya ek olarak protein kaynağı (haşlanmış nohut) ekleyebilirsiniz.',
            nutrition: { calories: 250, protein: 10, carbs: 30, fat: 5 }
          },
          {
            hour: '15:00',
            meal: 'Ara Öğün',
            foods: ['1 adet muz'],
            nutrition: { calories: 100, protein: 1, carbs: 25, fat: 0 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Domates çorbası (tuzsuz)', 'Bitki çayı'],
            notes: 'Ev yapımı domates çorbası kullanın.',
            nutrition: { calories: 250, protein: 10, carbs: 40, fat: 5 }
          }
        ]
      },
      {
        day: 'Çarşamba',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Kereviz suyu (taze sıkılmış)', '1 adet elma'],
            notes: 'Kereviz suyu, şişkinliği azaltır.',
            nutrition: { calories: 150, protein: 2, carbs: 35, fat: 0 }
          },
          {
            hour: '10:00',
            meal: 'Ara Öğün',
            foods: ['Detoks suyu (limon, nane, salatalık)'],
            notes: 'Sıvı alımı detoksun temelidir.',
            nutrition: { calories: 10, protein: 0, carbs: 2, fat: 0 }
          },
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Buharda pişmiş sebzeler (kabak, patlıcan, havuç)'],
            notes: 'Sebzelerin üzerine limon suyu gezdirebilirsiniz.',
            nutrition: { calories: 200, protein: 8, carbs: 30, fat: 2 }
          },
          {
            hour: '15:00',
            meal: 'Ara Öğün',
            foods: ['1 adet armut'],
            nutrition: { calories: 90, protein: 1, carbs: 25, fat: 0 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Ispanak çorbası (tuzsuz)', 'Bitki çayı'],
            notes: 'Ispanak çorbası demir açısından zengindir.',
            nutrition: { calories: 250, protein: 10, carbs: 40, fat: 5 }
          }
        ]
      }
    ]
  },
  {
    id: 'bodybuilding',
    name: 'Vücut Geliştirme Diyeti',
    description: 'Kas gelişimi ve performans artışını hedefleyen yüksek proteinli beslenme planı. Sporcuların antrenmanlarına destek olacak şekilde tasarlanmıştır.',
    target: 'Kas kütlesini artırma, yağ oranını azaltma, fiziksel performans artışı.',
    caloriesPerDay: 2500,
    macronutrients: { protein: '35-40%', carbs: '40-45%', fat: '20-25%' },
    weeklyProgram: [
      {
        day: 'Pazartesi',
        program: [
          {
            hour: '07:00',
            meal: 'Kahvaltı',
            foods: ['Yumurta beyazı (4 adet)', 'Yulaf ezmesi (1 kase)', 'Muz (1 adet)', '2 yemek kaşığı fıstık ezmesi'],
            notes: 'Yüksek proteinle güne başlayarak kas onarımını destekleyin.',
            nutrition: { calories: 550, protein: 30, carbs: 60, fat: 20 }
          },
          {
            hour: '10:00',
            meal: 'Ara Öğün',
            foods: ['Protein shake (30g protein)', '1 adet elma'],
            notes: 'Antrenman öncesi enerji için meyve tüketin.',
            nutrition: { calories: 250, protein: 30, carbs: 25, fat: 2 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Izgara tavuk (150g)', 'Esmer pirinç (1 kase)', 'Buharda brokoli'],
            notes: 'Öğle yemeği, antrenman sonrası kas toparlanması için önemlidir.',
            nutrition: { calories: 600, protein: 45, carbs: 60, fat: 10 }
          },
          {
            hour: '16:00',
            meal: 'Antrenman Öncesi',
            foods: ['1 adet muz', '10 adet badem'],
            notes: 'Antrenmandan 30-60 dakika önce tüketin.',
            nutrition: { calories: 200, protein: 5, carbs: 30, fat: 8 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Somon (150g)', 'Haşlanmış tatlı patates (1 orta boy)'],
            notes: 'Somonun sağlıklı yağları kas büyümesi için faydalıdır.',
            nutrition: { calories: 700, protein: 40, carbs: 50, fat: 30 }
          },
          {
            hour: '22:00',
            meal: 'Gece Öğünü',
            foods: ['1 kase süzme peynir', 'Bir avuç ceviz'],
            notes: 'Yavaş sindirilen proteinler gece kas onarımına yardımcı olur.',
            nutrition: { calories: 200, protein: 20, carbs: 10, fat: 10 }
          }
        ]
      },
      {
        day: 'Salı',
        program: [
          {
            hour: '07:00',
            meal: 'Kahvaltı',
            foods: ['Protein shake (30g protein)', 'Bir avuç badem'],
            notes: 'Hızlı bir kahvaltı için ideal.',
            nutrition: { calories: 300, protein: 35, carbs: 15, fat: 10 }
          },
          {
            hour: '10:00',
            meal: 'Ara Öğün',
            foods: ['2 adet haşlanmış yumurta'],
            nutrition: { calories: 150, protein: 12, carbs: 1, fat: 11 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Kırmızı et (bonfile, 150g)', 'Haşlanmış brokoli', 'Esmer pirinç (1 kase)'],
            notes: 'Kırmızı et demir ve B12 vitamini kaynağıdır.',
            nutrition: { calories: 650, protein: 50, carbs: 60, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Antrenman Öncesi',
            foods: ['1 adet muz', 'Bir avuç ceviz'],
            notes: 'Antrenman öncesi karbonhidrat ve sağlıklı yağ alımı önemlidir.',
            nutrition: { calories: 200, protein: 5, carbs: 30, fat: 8 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Hindi göğsü (150g)', 'Bulgur pilavı (yarım kase)', 'Karışık salata'],
            notes: 'Akşam yemeğinizde hafif bir protein tercih edebilirsiniz.',
            nutrition: { calories: 550, protein: 40, carbs: 50, fat: 10 }
          },
          {
            hour: '22:00',
            meal: 'Gece Öğünü',
            foods: ['1 kase süzme peynir'],
            notes: 'Kazein proteini gece kas onarımını destekler.',
            nutrition: { calories: 150, protein: 25, carbs: 5, fat: 5 }
          }
        ]
      },
      {
        day: 'Çarşamba',
        program: [
          {
            hour: '07:00',
            meal: 'Kahvaltı',
            foods: ['Haşlanmış yumurta (3 adet)', 'Avokado (yarım)', '2 dilim tam buğday ekmeği'],
            notes: 'Kahvaltı, günün en önemli öğünüdür.',
            nutrition: { calories: 500, protein: 25, carbs: 40, fat: 25 }
          },
          {
            hour: '10:00',
            meal: 'Ara Öğün',
            foods: ['1 adet protein bar', '1 adet portakal'],
            notes: 'Protein bar, hızlı protein alımı sağlar.',
            nutrition: { calories: 250, protein: 20, carbs: 30, fat: 8 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Izgara balık (levrek, 150g)', 'Haşlanmış patates (1 orta boy)', 'Yeşil salata'],
            notes: 'Balık, kas gelişimi için önemli olan omega-3 yağ asitleri içerir.',
            nutrition: { calories: 600, protein: 40, carbs: 50, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Antrenman Öncesi',
            foods: ['1 kase yoğurt', '1 yemek kaşığı bal'],
            notes: 'Yoğurt, enerji ve protein sağlar.',
            nutrition: { calories: 150, protein: 10, carbs: 20, fat: 4 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Protein bar (30g protein)', 'Süzme peynir (1 kase)', 'Bol su'],
            notes: 'Akşam yemeğinde yüksek proteinli ve hafif bir menü tercih edin.',
            nutrition: { calories: 400, protein: 40, carbs: 30, fat: 15 }
          },
          {
            hour: '22:00',
            meal: 'Gece Öğünü',
            foods: ['1 kase yoğurt'],
            notes: 'Gece öğününde hafif protein kaynakları tercih edin.',
            nutrition: { calories: 100, protein: 8, carbs: 10, fat: 2 }
          }
        ]
      },
      {
        day: 'Perşembe',
        program: [
          {
            hour: '07:00',
            meal: 'Kahvaltı',
            foods: ['Yumurta beyazı (4 adet)', 'Yulaf', 'Muz', 'Fıstık ezmesi'],
            notes: 'Güne yüksek proteinli bir kahvaltıyla başlayın.',
            nutrition: { calories: 550, protein: 30, carbs: 60, fat: 20 }
          },
          {
            hour: '10:00',
            meal: 'Ara Öğün',
            foods: ['Protein shake', '1 adet elma'],
            notes: 'Ara öğünlerde protein ve meyve dengesini kurun.',
            nutrition: { calories: 250, protein: 30, carbs: 25, fat: 2 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Izgara tavuk (150g)', 'Esmer pirinç', 'Brokoli'],
            notes: 'Tavuk göğsünü bol baharatla lezzetlendirin.',
            nutrition: { calories: 600, protein: 45, carbs: 60, fat: 10 }
          },
          {
            hour: '16:00',
            meal: 'Antrenman Öncesi',
            foods: ['1 adet muz', '10 adet badem'],
            notes: 'Antrenman performansını artırmak için karbonhidrat alımınızı planlayın.',
            nutrition: { calories: 200, protein: 5, carbs: 30, fat: 8 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Somon (150g)', 'Haşlanmış tatlı patates'],
            notes: 'Somonu fırında veya ızgarada pişirin.',
            nutrition: { calories: 700, protein: 40, carbs: 50, fat: 30 }
          },
          {
            hour: '22:00',
            meal: 'Gece Öğünü',
            foods: ['1 kase süzme peynir', 'Bir avuç ceviz'],
            notes: 'Gece kas onarımı için yavaş sindirilen proteinler önemlidir.',
            nutrition: { calories: 200, protein: 20, carbs: 10, fat: 10 }
          }
        ]
      },
      {
        day: 'Cuma',
        program: [
          {
            hour: '07:00',
            meal: 'Kahvaltı',
            foods: ['Protein shake', 'Badem'],
            notes: 'Protein shake, yoğun antrenman sonrası kas toparlanması için önemlidir.',
            nutrition: { calories: 300, protein: 35, carbs: 15, fat: 10 }
          },
          {
            hour: '10:00',
            meal: 'Ara Öğün',
            foods: ['2 adet haşlanmış yumurta'],
            nutrition: { calories: 150, protein: 12, carbs: 1, fat: 11 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Kırmızı et (bonfile, 150g)', 'Brokoli', 'Esmer pirinç'],
            notes: 'Kırmızı et, demir ve B12 vitamini kaynağıdır.',
            nutrition: { calories: 650, protein: 50, carbs: 60, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Antrenman Öncesi',
            foods: ['1 adet muz', 'Bir avuç ceviz'],
            notes: 'Antrenman öncesi enerji için karbonhidrat ve sağlıklı yağlar tüketin.',
            nutrition: { calories: 200, protein: 5, carbs: 30, fat: 8 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Hindi göğsü (150g)', 'Bulgur pilavı', 'Karışık salata'],
            notes: 'Akşam yemeğinde protein alımınıza dikkat edin.',
            nutrition: { calories: 550, protein: 40, carbs: 50, fat: 10 }
          },
          {
            hour: '22:00',
            meal: 'Gece Öğünü',
            foods: ['1 kase süzme peynir'],
            notes: 'Gece öğünü, kas onarımı için önemlidir.',
            nutrition: { calories: 150, protein: 25, carbs: 5, fat: 5 }
          }
        ]
      },
      {
        day: 'Cumartesi',
        program: [
          {
            hour: '07:00',
            meal: 'Kahvaltı',
            foods: ['Haşlanmış yumurta (3 adet)', 'Avokado (yarım)', '2 dilim tam buğday ekmeği'],
            notes: 'Hafta sonu kahvaltınızı daha zengin hale getirin.',
            nutrition: { calories: 500, protein: 25, carbs: 40, fat: 25 }
          },
          {
            hour: '10:00',
            meal: 'Ara Öğün',
            foods: ['1 adet protein bar', '1 adet portakal'],
            notes: 'Hızlı bir protein ve vitamin takviyesi.',
            nutrition: { calories: 250, protein: 20, carbs: 30, fat: 8 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Izgara balık (150g)', 'Haşlanmış patates', 'Yeşil salata'],
            notes: 'Öğle yemeğinizde bolca protein ve karbonhidrat tüketin.',
            nutrition: { calories: 600, protein: 40, carbs: 50, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Antrenman Öncesi',
            foods: ['1 kase yoğurt', '1 yemek kaşığı bal'],
            notes: 'Antrenman öncesi karbonhidrat alımı önemlidir.',
            nutrition: { calories: 150, protein: 10, carbs: 20, fat: 4 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Protein bar (30g protein)', 'Süzme peynir (1 kase)'],
            notes: 'Akşam yemeğinizde protein alımınızı artırın.',
            nutrition: { calories: 400, protein: 40, carbs: 30, fat: 15 }
          },
          {
            hour: '22:00',
            meal: 'Gece Öğünü',
            foods: ['1 kase yoğurt'],
            notes: 'Gece kas onarımı için protein alımına devam edin.',
            nutrition: { calories: 100, protein: 8, carbs: 10, fat: 2 }
          }
        ]
      },
      {
        day: 'Pazar',
        program: [
          {
            hour: '07:00',
            meal: 'Kahvaltı',
            foods: ['Yumurta beyazı (4 adet)', 'Yulaf', 'Muz', 'Fıstık ezmesi'],
            notes: 'Pazar gününe güçlü bir başlangıç yapın.',
            nutrition: { calories: 550, protein: 30, carbs: 60, fat: 20 }
          },
          {
            hour: '10:00',
            meal: 'Ara Öğün',
            foods: ['Protein shake', '1 adet elma'],
            notes: 'Ara öğünlerde protein ve meyve dengesini kurun.',
            nutrition: { calories: 250, protein: 30, carbs: 25, fat: 2 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Izgara tavuk (150g)', 'Esmer pirinç', 'Brokoli'],
            notes: 'Öğle yemeği, antrenman sonrası kas toparlanması için önemlidir.',
            nutrition: { calories: 600, protein: 45, carbs: 60, fat: 10 }
          },
          {
            hour: '16:00',
            meal: 'Antrenman Öncesi',
            foods: ['1 adet muz', '10 adet badem'],
            notes: 'Antrenman öncesi karbonhidrat ve sağlıklı yağ alımı önemlidir.',
            nutrition: { calories: 200, protein: 5, carbs: 30, fat: 8 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Somon (150g)', 'Haşlanmış tatlı patates'],
            notes: 'Somonun sağlıklı yağları kas büyümesi için faydalıdır.',
            nutrition: { calories: 700, protein: 40, carbs: 50, fat: 30 }
          },
          {
            hour: '22:00',
            meal: 'Gece Öğünü',
            foods: ['1 kase süzme peynir', 'Bir avuç ceviz'],
            notes: 'Yavaş sindirilen proteinler gece kas onarımına yardımcı olur.',
            nutrition: { calories: 200, protein: 20, carbs: 10, fat: 10 }
          }
        ]
      }
    ]
  },
  {
    id: 'flexitarian',
    name: 'Fleksitaryen Diyet',
    description: 'Ağırlıklı olarak bitkisel beslenmeyi hedefleyen, ancak ara sıra et tüketimine izin veren esnek bir plan. Esneklik ve sağlık dengesi sağlar.',
    target: 'Daha fazla sebze tüketme, kilo kontrolü, genel sağlık.',
    caloriesPerDay: 1900,
    macronutrients: { protein: '20-25%', carbs: '50-55%', fat: '20-25%' },
    weeklyProgram: [
      {
        day: 'Pazartesi',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Yulaf lapası (badem sütü ile)', 'Meyve (çilek, yaban mersini)'],
            notes: 'Yulaf lapasına tarçın ekleyebilirsiniz.',
            nutrition: { calories: 350, protein: 10, carbs: 50, fat: 10 }
          },
          {
            hour: '11:30',
            meal: 'Ara Öğün',
            foods: ['1 adet armut', 'Bir avuç ceviz'],
            nutrition: { calories: 150, protein: 4, carbs: 25, fat: 6 }
          },
          {
            hour: '12:30',
            meal: 'Öğle Yemeği',
            foods: ['Mercimek salatası (domates, salatalık, soğan)', 'Tam tahıllı pide (1 adet)'],
            notes: 'Mercimek, bitkisel protein açısından zengindir.',
            nutrition: { calories: 450, protein: 20, carbs: 60, fat: 10 }
          },
          {
            hour: '16:30',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt'],
            nutrition: { calories: 100, protein: 8, carbs: 10, fat: 2 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Tavuklu sebze sote (tavuk göğsü, brokoli, havuç)', 'Kinoa (1 kase)'],
            notes: 'Tavuk, esnekliğinizi korumanız için bir protein kaynağıdır.',
            nutrition: { calories: 600, protein: 40, carbs: 50, fat: 20 }
          }
        ]
      },
      {
        day: 'Salı',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Omlet (2 yumurta, bol sebzeli)', 'Mevsim meyvesi'],
            notes: 'Omletinizi mantar, ıspanak veya biberle zenginleştirin.',
            nutrition: { calories: 400, protein: 20, carbs: 25, fat: 25 }
          },
          {
            hour: '11:30',
            meal: 'Ara Öğün',
            foods: ['1 adet muz', '5 adet badem'],
            notes: 'Ara öğünler, kan şekerinizi dengelemeye yardımcı olur.',
            nutrition: { calories: 150, protein: 4, carbs: 25, fat: 5 }
          },
          {
            hour: '12:30',
            meal: 'Öğle Yemeği',
            foods: ['Nohut yemeği (1 kase)', 'Bulgur pilavı (yarım kase)'],
            notes: 'Nohut yemeği ve bulgur pilavı doyurucu bir kombinasyondur.',
            nutrition: { calories: 500, protein: 25, carbs: 60, fat: 10 }
          },
          {
            hour: '16:30',
            meal: 'Ara Öğün',
            foods: ['1 kase çilek', '1 yemek kaşığı kabak çekirdeği'],
            nutrition: { calories: 120, protein: 4, carbs: 18, fat: 5 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Izgara balık (levrek, 150g)', 'Yeşil salata'],
            notes: 'Balık, omega-3 açısından zengindir ve hafiftir.',
            nutrition: { calories: 500, protein: 40, carbs: 20, fat: 25 }
          }
        ]
      },
      {
        day: 'Çarşamba',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Yulaf ezmesi (yarım kase)', 'Yoğurt (1 kase)', 'Çilek ve yaban mersini'],
            notes: 'Yulaf ezmesi, lifli yapısıyla sindirimi kolaylaştırır.',
            nutrition: { calories: 300, protein: 12, carbs: 40, fat: 8 }
          },
          {
            hour: '11:30',
            meal: 'Ara Öğün',
            foods: ['1 adet elma', '10 adet fındık'],
            nutrition: { calories: 150, protein: 4, carbs: 25, fat: 6 }
          },
          {
            hour: '12:30',
            meal: 'Öğle Yemeği',
            foods: ['Sebze çorbası (tuzsuz)', 'Tam tahıllı ekmek (2 dilim)'],
            notes: 'Sebze çorbası, bol vitamin ve mineral sağlar.',
            nutrition: { calories: 350, protein: 10, carbs: 50, fat: 5 }
          },
          {
            hour: '16:30',
            meal: 'Ara Öğün',
            foods: ['1 adet portakal'],
            nutrition: { calories: 80, protein: 1, carbs: 20, fat: 0 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Vegan köfte (mercimek veya nohut bazlı)', 'Fırınlanmış patates', 'Roka salatası'],
            notes: 'Vegan köfte, et yerine iyi bir alternatiftir.',
            nutrition: { calories: 550, protein: 20, carbs: 70, fat: 20 }
          }
        ]
      },
      {
        day: 'Perşembe',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Yulaf lapası (badem sütü ile)', 'Meyve'],
            notes: 'Yulaf lapasını zencefil veya tarçınla lezzetlendirin.',
            nutrition: { calories: 350, protein: 10, carbs: 50, fat: 10 }
          },
          {
            hour: '11:30',
            meal: 'Ara Öğün',
            foods: ['1 adet armut', 'Bir avuç ceviz'],
            nutrition: { calories: 150, protein: 4, carbs: 25, fat: 6 }
          },
          {
            hour: '12:30',
            meal: 'Öğle Yemeği',
            foods: ['Mercimek salatası', 'Tam tahıllı pide'],
            notes: 'Salatanıza ek olarak avokado ekleyebilirsiniz.',
            nutrition: { calories: 450, protein: 20, carbs: 60, fat: 10 }
          },
          {
            hour: '16:30',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt'],
            nutrition: { calories: 100, protein: 8, carbs: 10, fat: 2 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Tavuklu sebze sote', 'Kinoa'],
            notes: 'Tavuklu sebze sotenin içine farklı renkte biberler ekleyin.',
            nutrition: { calories: 600, protein: 40, carbs: 50, fat: 20 }
          }
        ]
      },
      {
        day: 'Cuma',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Omlet (2 yumurta)', 'Meyve'],
            notes: 'Omletinize lor peyniri ekleyerek protein miktarını artırın.',
            nutrition: { calories: 400, protein: 20, carbs: 25, fat: 25 }
          },
          {
            hour: '11:30',
            meal: 'Ara Öğün',
            foods: ['1 adet muz', '5 adet badem'],
            notes: 'Ara öğünlerde sağlıklı atıştırmalıklara yönelin.',
            nutrition: { calories: 150, protein: 4, carbs: 25, fat: 5 }
          },
          {
            hour: '12:30',
            meal: 'Öğle Yemeği',
            foods: ['Nohut yemeği', 'Bulgur pilavı'],
            notes: 'Nohut, yüksek lifli bir baklagildir.',
            nutrition: { calories: 500, protein: 25, carbs: 60, fat: 10 }
          },
          {
            hour: '16:30',
            meal: 'Ara Öğün',
            foods: ['1 kase çilek', '1 yemek kaşığı kabak çekirdeği'],
            nutrition: { calories: 120, protein: 4, carbs: 18, fat: 5 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Izgara balık (150g)', 'Yeşil salata'],
            notes: 'Akşam yemeğinizde hafif protein kaynaklarını tercih edin.',
            nutrition: { calories: 500, protein: 40, carbs: 20, fat: 25 }
          }
        ]
      },
      {
        day: 'Cumartesi',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Yulaf ezmesi', 'Yoğurt', 'Meyve'],
            notes: 'Hafta sonu kahvaltınızı daha çeşitli yapın.',
            nutrition: { calories: 300, protein: 12, carbs: 40, fat: 8 }
          },
          {
            hour: '11:30',
            meal: 'Ara Öğün',
            foods: ['1 adet elma', '10 adet fındık'],
            nutrition: { calories: 150, protein: 4, carbs: 25, fat: 6 }
          },
          {
            hour: '12:30',
            meal: 'Öğle Yemeği',
            foods: ['Sebze çorbası', 'Tam tahıllı ekmek'],
            notes: 'Sebze çorbası yerine baklagil çorbası da tüketebilirsiniz.',
            nutrition: { calories: 350, protein: 10, carbs: 50, fat: 5 }
          },
          {
            hour: '16:30',
            meal: 'Ara Öğün',
            foods: ['1 adet portakal'],
            nutrition: { calories: 80, protein: 1, carbs: 20, fat: 0 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Vegan köfte', 'Fırınlanmış patates', 'Roka salatası'],
            notes: 'Vegan köfteyi evde hazırlayarak daha sağlıklı hale getirin.',
            nutrition: { calories: 550, protein: 20, carbs: 70, fat: 20 }
          }
        ]
      },
      {
        day: 'Pazar',
        program: [
          {
            hour: '08:30',
            meal: 'Kahvaltı',
            foods: ['Yulaf lapası', 'Meyve'],
            notes: 'Pazar gününe hafif ve sağlıklı bir başlangıç yapın.',
            nutrition: { calories: 350, protein: 10, carbs: 50, fat: 10 }
          },
          {
            hour: '11:30',
            meal: 'Ara Öğün',
            foods: ['1 adet armut', 'Bir avuç ceviz'],
            nutrition: { calories: 150, protein: 4, carbs: 25, fat: 6 }
          },
          {
            hour: '12:30',
            meal: 'Öğle Yemeği',
            foods: ['Mercimek salatası', 'Tam tahıllı pide'],
            notes: 'Mercimek salatasına ek olarak tavuk veya balık ekleyebilirsiniz.',
            nutrition: { calories: 450, protein: 20, carbs: 60, fat: 10 }
          },
          {
            hour: '16:30',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt'],
            nutrition: { calories: 100, protein: 8, carbs: 10, fat: 2 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Tavuklu sebze sote', 'Kinoa'],
            notes: 'Diyetinizin esnekliğini kullanarak sosyal etkinliklerinize uyum sağlayın.',
            nutrition: { calories: 600, protein: 40, carbs: 50, fat: 20 }
          }
        ]
      }
    ]
  },
  {
    id: 'raw-food',
    name: 'Çiğ Gıda Diyeti',
    description: 'Yemeklerin 48°C (118°F) altında tutulduğu, çoğunlukla pişmemiş gıdaların tüketildiği program. Vitamin, mineral ve enzimler açısından zengindir.',
    target: 'Enerji artışı, sindirim sağlığını iyileştirme, kilo kaybı.',
    caloriesPerDay: 1800,
    macronutrients: { protein: '15-20%', carbs: '60-65%', fat: '15-20%' },
    weeklyProgram: [
      {
        day: 'Pazartesi',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Meyve salatası (muz, çilek, elma, kivi)', 'Badem sütü (1 bardak)', '1 yemek kaşığı chia tohumu'],
            notes: 'Meyve salatasını taze meyvelerle hazırlayın.',
            nutrition: { calories: 350, protein: 10, carbs: 50, fat: 10 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet armut', 'Bir avuç çiğ badem'],
            notes: 'Ara öğünlerde çiğ kuruyemişleri tercih edin.',
            nutrition: { calories: 150, protein: 5, carbs: 25, fat: 6 }
          },
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Avokadolu yeşil salata (marul, roka, domates, salatalık)', 'Çiğ sebzeler (havuç, salatalık, biber)'],
            notes: 'Salataya limon suyu ve zeytinyağı ekleyin.',
            nutrition: { calories: 450, protein: 15, carbs: 40, fat: 25 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Taze sıkılmış sebze suyu (havuç, zencefil, limon)'],
            notes: 'Taze sıkılmış meyve veya sebze suları iyi bir enerji kaynağıdır.',
            nutrition: { calories: 100, protein: 2, carbs: 25, fat: 0 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Kabak makarnası (spagetti şeklinde doğranmış)', 'Fındık sosu (çiğ fındık, su, sarımsak, fesleğen)'],
            notes: 'Kabak makarnası, sağlıklı bir makarna alternatifidir.',
            nutrition: { calories: 500, protein: 15, carbs: 60, fat: 20 }
          }
        ]
      },
      {
        day: 'Salı',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Yeşil smoothie (ıspanak, kivi, muz, su)', 'Meyve (çilek)'],
            notes: 'Smoothie, sindirimi kolaylaştırır.',
            nutrition: { calories: 300, protein: 5, carbs: 50, fat: 5 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç kuru üzüm', '5 adet ceviz'],
            notes: 'Kuru meyveler, doğal enerji kaynağıdır.',
            nutrition: { calories: 150, protein: 3, carbs: 25, fat: 5 }
          },
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Marul dürümü (marul yaprakları, avokado, domates, salatalık)', 'Fındık ezmesi'],
            notes: 'Marul dürümü, hafif ve lezzetli bir öğle yemeğidir.',
            nutrition: { calories: 400, protein: 10, carbs: 30, fat: 25 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Taze sıkılmış meyve suyu (elma, havuç)'],
            notes: 'Taze sıkılmış meyve suları, vitamin deposudur.',
            nutrition: { calories: 100, protein: 1, carbs: 25, fat: 0 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Çiğ sebzeli pizza (karnabahar veya brokoli tabanlı)', 'Çiğ peynir (kaju bazlı)'],
            notes: 'Çiğ gıda tariflerini internetten araştırabilirsiniz.',
            nutrition: { calories: 550, protein: 20, carbs: 50, fat: 30 }
          }
        ]
      },
      {
        day: 'Çarşamba',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Taze sıkılmış meyve suyu (portakal, greyfurt)', 'Kuru meyve (hurma, kuru kayısı)'],
            notes: 'Sabah kahvaltıda sindirimi kolay gıdalar tüketin.',
            nutrition: { calories: 250, protein: 3, carbs: 50, fat: 2 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet salatalık', '1 adet havuç'],
            notes: 'Çiğ sebzeler, detoks etkisi sağlar.',
            nutrition: { calories: 50, protein: 1, carbs: 10, fat: 0 }
          },
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Avokado (1 adet)', 'Domates salatası (soğan, maydanoz, limonlu)'],
            notes: 'Avokado, sağlıklı yağlar içerir.',
            nutrition: { calories: 400, protein: 10, carbs: 30, fat: 30 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç çiğ fındık'],
            notes: 'Fındık, E vitamini açısından zengindir.',
            nutrition: { calories: 150, protein: 5, carbs: 5, fat: 12 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Çiğ sebzeli çorba (domates, salatalık, biber, zencefil)'],
            notes: 'Çorbayı blenderdan geçirerek hazırlayın.',
            nutrition: { calories: 300, protein: 5, carbs: 40, fat: 10 }
          }
        ]
      }
    ]
  },
  {
    id: 'scandinavian',
    name: 'İskandinav Diyeti',
    description: 'İskandinav ülkelerinde popüler olan, kök sebzeler, tam tahıllar ve deniz ürünleri ağırlıklı plan. Sağlıklı yağlar, protein ve lif açısından zengindir.',
    target: 'Genel sağlık, kilo kontrolü, kalp sağlığını iyileştirme.',
    caloriesPerDay: 2100,
    macronutrients: { protein: '20-25%', carbs: '50-55%', fat: '20-25%' },
    weeklyProgram: [
      {
        day: 'Pazartesi',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Yulaf lapası (yarım kase)', 'Çilek', 'Yağsız yoğurt', '1 yemek kaşığı keten tohumu'],
            notes: 'Yulaf, tokluk hissi sağlar.',
            nutrition: { calories: 400, protein: 15, carbs: 50, fat: 10 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet elma', 'Bir avuç badem'],
            notes: 'Ara öğünlerde sağlıklı yağlar ve lifli gıdalar tüketin.',
            nutrition: { calories: 150, protein: 5, carbs: 20, fat: 6 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Sıcak somon salatası (ızgara somon, marul, salatalık, dereotu)', 'Çavdar ekmeği (1 dilim)'],
            notes: 'Somon, omega-3 açısından zengindir.',
            nutrition: { calories: 600, protein: 40, carbs: 40, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt'],
            notes: 'Yoğurt, sindirim sağlığı için faydalıdır.',
            nutrition: { calories: 100, protein: 8, carbs: 10, fat: 2 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Sebzeli güveç (havuç, kereviz, patates, soğan)', 'Izgara alabalık (150g)'],
            notes: 'Güveç, doyurucu ve lezzetli bir seçenektir.',
            nutrition: { calories: 650, protein: 40, carbs: 60, fat: 15 }
          }
        ]
      },
      {
        day: 'Salı',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Haşlanmış yumurta (2 adet)', 'Siyah çavdar ekmeği (1 dilim)'],
            notes: 'Çavdar ekmeği, sindirimi kolaylaştırır.',
            nutrition: { calories: 350, protein: 15, carbs: 35, fat: 15 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet muz'],
            notes: 'Muz, hızlı enerji sağlar.',
            nutrition: { calories: 100, protein: 1, carbs: 25, fat: 0 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Somon çorbası (patates, havuç, dereotu ile)'],
            notes: 'Somon çorbası, soğuk havalar için idealdir.',
            nutrition: { calories: 450, protein: 30, carbs: 40, fat: 15 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Bir avuç çiğ badem'],
            notes: 'Badem, doyurucu bir ara öğündür.',
            nutrition: { calories: 150, protein: 5, carbs: 5, fat: 12 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Ringa balığı (150g)', 'Haşlanmış patates', 'Bol yeşillikli salata'],
            notes: 'Ringa balığı, sağlıklı yağlar açısından zengindir.',
            nutrition: { calories: 550, protein: 40, carbs: 40, fat: 20 }
          }
        ]
      },
      {
        day: 'Çarşamba',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Tam tahıllı gevrek (yarım kase)', 'Yağsız süt', 'Meyve (çilek, yaban mersini)'],
            notes: 'Şeker ilavesiz gevrekleri tercih edin.',
            nutrition: { calories: 300, protein: 10, carbs: 50, fat: 5 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet kivi', '5 adet ceviz'],
            notes: 'Kivi, C vitamini deposudur.',
            nutrition: { calories: 120, protein: 3, carbs: 20, fat: 4 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Sebzeli sandviç (tam tahıllı ekmek, marul, domates, salatalık)'],
            notes: 'Sandviçinize avokado ekleyebilirsiniz.',
            nutrition: { calories: 400, protein: 10, carbs: 60, fat: 10 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 kase yoğurt'],
            notes: 'Yoğurdunuzun üzerine tarçın serpin.',
            nutrition: { calories: 100, protein: 8, carbs: 10, fat: 2 }
          },
          {
            hour: '19:00',
            meal: 'Akşam Yemeği',
            foods: ['Kırmızı et (bonfile, 150g)', 'Kök sebzeler (fırınlanmış havuç, pancar, patates)'],
            notes: 'Kırmızı eti az yağda pişirin.',
            nutrition: { calories: 650, protein: 50, carbs: 50, fat: 20 }
          }
        ]
      }
    ]
  },
  {
    id: 'lactose-free',
    name: 'Laktozsuz Diyet',
    description: 'Laktoz intoleransı olanlar için süt ve süt ürünleri yerine laktozsuz alternatifler ve diğer gıdaların kullanıldığı beslenme planı.',
    target: 'Laktoz intoleransı semptomlarını azaltma, sindirim sağlığını iyileştirme.',
    caloriesPerDay: 2000,
    macronutrients: { protein: '20-25%', carbs: '50-55%', fat: '20-25%' },
    weeklyProgram: [
      {
        day: 'Pazartesi',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Yulaf ezmesi (laktozsuz süt ile)', 'Muz', 'Çilek'],
            notes: 'Yulaf ezmesi, laktozsuz sütle hazırlandığında sindirimi kolaydır.',
            nutrition: { calories: 400, protein: 10, carbs: 60, fat: 10 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet armut', '10 adet badem'],
            notes: 'Ara öğünlerde sağlıklı yağları tercih edin.',
            nutrition: { calories: 150, protein: 5, carbs: 25, fat: 6 }
          },
          {
            hour: '13:00',
            meal: 'Öğle Yemeği',
            foods: ['Izgara tavuk (150g)', 'Kinoa', 'Haşlanmış brokoli'],
            notes: 'Tavuk, iyi bir laktozsuz protein kaynağıdır.',
            nutrition: { calories: 500, protein: 40, carbs: 40, fat: 15 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['Laktozsuz yoğurt (1 kase)'],
            notes: 'Laktozsuz yoğurt, sindirim sağlığı için faydalıdır.',
            nutrition: { calories: 100, protein: 8, carbs: 10, fat: 2 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Mercimek çorbası', 'Biftek (150g)', 'Yeşil salata'],
            notes: 'Çorbanızı laktozsuz süt veya su ile hazırlayın.',
            nutrition: { calories: 600, protein: 45, carbs: 40, fat: 25 }
          }
        ]
      },
      {
        day: 'Salı',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Laktozsuz yoğurt', 'Muz', 'Bir avuç ceviz'],
            notes: 'Laktozsuz ürünler, diyetin temelidir.',
            nutrition: { calories: 350, protein: 15, carbs: 40, fat: 15 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet kivi'],
            notes: 'Kivi, C vitamini açısından zengindir.',
            nutrition: { calories: 60, protein: 1, carbs: 15, fat: 0 }
          },
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Tavuklu salata (ızgara tavuk, marul, salatalık)', 'Zeytinyağı ve limon sosu'],
            notes: 'Tavuk salatasını evde hazırlayın.',
            nutrition: { calories: 450, protein: 35, carbs: 25, fat: 20 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 adet portakal'],
            notes: 'Portakal, gün içinde enerji seviyenizi artırır.',
            nutrition: { calories: 80, protein: 1, carbs: 20, fat: 0 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Hindi pirzola (150g)', 'Patates (fırınlanmış)'],
            notes: 'Hindi, laktozsuz bir protein kaynağıdır.',
            nutrition: { calories: 550, protein: 40, carbs: 40, fat: 20 }
          }
        ]
      },
      {
        day: 'Çarşamba',
        program: [
          {
            hour: '08:00',
            meal: 'Kahvaltı',
            foods: ['Badem sütü (1 bardak)', 'Çilek', 'Bir avuç fındık'],
            notes: 'Badem sütü, laktozsuz bir alternatifidir.',
            nutrition: { calories: 300, protein: 5, carbs: 30, fat: 15 }
          },
          {
            hour: '11:00',
            meal: 'Ara Öğün',
            foods: ['1 adet yeşil elma'],
            notes: 'Elma, lif açısından zengindir.',
            nutrition: { calories: 80, protein: 0, carbs: 20, fat: 0 }
          },
          {
            hour: '12:00',
            meal: 'Öğle Yemeği',
            foods: ['Izgara balık (levrek, 150g)', 'Buharda brokoli'],
            notes: 'Balık, laktozsuz bir omega-3 kaynağıdır.',
            nutrition: { calories: 500, protein: 40, carbs: 20, fat: 25 }
          },
          {
            hour: '16:00',
            meal: 'Ara Öğün',
            foods: ['1 adet muz'],
            notes: 'Muz, potasyum açısından zengindir.',
            nutrition: { calories: 100, protein: 1, carbs: 25, fat: 0 }
          },
          {
            hour: '18:00',
            meal: 'Akşam Yemeği',
            foods: ['Haşlanmış et (150g)', 'Kabak (sotelenmiş)'],
            notes: 'Haşlanmış et, hafif ve sindirimi kolaydır.',
            nutrition: { calories: 550, protein: 40, carbs: 20, fat: 30 }
          }
        ]
      }
    ]
  }
]