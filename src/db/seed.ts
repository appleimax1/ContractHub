import db from './db';

export async function seedDemoData(force = false) {
  try {
    const companiesCount = await db.my_companies.count();
    if (!force && companiesCount > 0) {
      return; // Already seeded or user has data
    }

    if (force) {
      await db.my_companies.clear();
      await db.clients.clear();
      await db.catalog.clear();
      await db.numerators.clear();
      await db.tax_rates.clear();
      await db.templates.clear();
    }

    // 1. Seed Our Company
    await db.my_companies.add({
      name: 'ТОО "ContractHub Solutions"',
      bin_iin: '240140012345',
      address_legal: 'г. Алматы, Медеуский р-н, пр. Аль-Фараби, д. 77/7',
      address_actual: 'г. Алматы, Медеуский р-н, пр. Аль-Фараби, д. 77/7',
      phone: '+7 (727) 355-12-34',
      email: 'info@contracthub.kz',
      ceo_name: 'Ахметов Болат Серикович',
      ceo_title: 'Генеральный директор',
      ceo_base: 'Устава',
      bank_accounts: [
        {
          id: '1',
          alias: 'Основной KZT счет',
          bank_name: 'АО "Halyk Bank"',
          bik: 'HSBKKZKXA',
          iik: 'KZ123456789012345678'
        }
      ],
      stamp_image: 'data:image/png;base64,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',
      signature_image: 'data:image/png;base64,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'

    });

    // 2. Seed Clients
    await db.clients.bulkAdd([
      {
        name: 'ТОО "Инновационные Технологии"',
        bin_iin: '180540098765',
        address_legal: 'г. Астана, р-н Есиль, ул. Достык, д. 18',
        address_actual: 'г. Астана, р-н Есиль, ул. Достык, д. 18',
        phone: '+7 (7172) 70-80-90',
        email: 'contact@innotech.kz',
        ceo_name: 'Иванов Сергей Владимирович',
        ceo_title: 'Генеральный директор',
        ceo_base: 'Устава',
        bank_accounts: [
          {
            id: 'client-bank-1',
            alias: 'Расчетный счет KZT',
            bank_name: 'АО "Kaspi Bank"',
            bik: 'CASPKZKKA',
            iik: 'KZ987654321098765432'
          }
        ]
      },
      {
        name: 'ИП "Казахстан Сервис"',
        bin_iin: '850315300123',
        address_legal: 'г. Шымкент, Аль-Фарабийский р-н, ул. Тауке хана, д. 45',
        address_actual: 'г. Шымкент, Аль-Фарабийский р-н, ул. Тауке хана, д. 45',
        phone: '+7 (7252) 55-44-33',
        email: 'kz.service@mail.kz',
        ceo_name: 'Смагулов Кайрат Нурланович',
        ceo_title: 'Индивидуальный предприниматель',
        ceo_base: 'Талона ИП №12345',
        bank_accounts: [
          {
            id: 'client-bank-2',
            alias: 'Счет ИП',
            bank_name: 'АО "Банк ЦентрКредит"',
            bik: 'KCJKKZKX',
            iik: 'KZ555666777888999000'
          }
        ]
      },
      {
        name: 'ТОО "Smart Logistics"',
        bin_iin: '210940055443',
        address_legal: 'г. Алматы, Алмалинский р-н, ул. Толе би, д. 101',
        address_actual: 'г. Алматы, Алмалинский р-н, ул. Толе би, д. 101',
        phone: '+7 (727) 299-11-22',
        email: 'logistics@smart.kz',
        ceo_name: 'Ли Елена Викторовна',
        ceo_title: 'Директор',
        ceo_base: 'Устава',
        bank_accounts: [
          {
            id: 'client-bank-3',
            alias: 'Основной счет',
            bank_name: 'АО "ForteBank"',
            bik: 'FORTEKZKA',
            iik: 'KZ112233445566778899'
          }
        ]
      }
    ]);

    // 3. Seed Catalog
    await db.catalog.bulkAdd([
      {
        type: 'product',
        name: 'Лицензия ПО "ContractHub Enterprise"',
        unit: 'шт.',
        price: 150000,
        track_stock: true,
        stock_quantity: 50
      },
      {
        type: 'product',
        name: 'Серверное оборудование КХ-100',
        unit: 'шт.',
        price: 450000,
        track_stock: true,
        stock_quantity: 12
      },
      {
        type: 'product',
        name: 'Комплект офисной мебели "Комфорт"',
        unit: 'компл.',
        price: 85000,
        track_stock: true,
        stock_quantity: 25
      },
      {
        type: 'product',
        name: 'Набор расходных материалов (A4, Картриджи)',
        unit: 'набор',
        price: 12500,
        track_stock: true,
        stock_quantity: 100
      },
      {
        type: 'service',
        name: 'Услуги по настройке и внедрению ПО',
        unit: 'услуга',
        price: 200000,
        track_stock: false,
        stock_quantity: 0
      },
      {
        type: 'service',
        name: 'Годовое техническое обслуживание',
        unit: 'год',
        price: 350000,
        track_stock: false,
        stock_quantity: 0
      },
      {
        type: 'service',
        name: 'Консультационные услуги специалист-часа',
        unit: 'час',
        price: 45000,
        track_stock: false,
        stock_quantity: 0
      },
      {
        type: 'service',
        name: 'Юридическое сопровождение сделки',
        unit: 'услуга',
        price: 120000,
        track_stock: false,
        stock_quantity: 0
      }
    ]);

    // 4. Seed Numerators
    await db.numerators.bulkAdd([
      {
        name: 'Договоры',
        prefix: 'ДОГ-',
        suffix: '/2026',
        current_counter: 1
      },
      {
        name: 'Счета на оплату',
        prefix: 'СЧ-',
        suffix: '',
        current_counter: 1
      },
      {
        name: 'Акты выполненных работ',
        prefix: 'АВР-',
        suffix: '',
        current_counter: 1
      }
    ]);

    // 5. Seed Tax Rates
    await db.tax_rates.bulkAdd([
      { name: 'НДС 12%', rate: 12 },
      { name: 'Без НДС (0%)', rate: 0 }
    ]);

    // 6. Seed DOCX Templates from /templates/
    const templateNames = [
      'Счет на оплату.docx',
      'Акт выполненных работ (АВР).docx',
      'Договор возмездного оказания услуг.docx'
    ];

    for (const name of templateNames) {
      try {
        const res = await fetch(`/templates/${encodeURIComponent(name)}`);
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          await db.templates.add({
            name: name,
            file_data: buffer,
            created_at: new Date()
          });
        }
      } catch (err) {
        console.warn(`Could not load template file ${name}:`, err);
      }
    }

    console.log('Demo data successfully seeded into ContractHub database!');
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
}
