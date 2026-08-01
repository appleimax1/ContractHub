# ContractHub

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple?logo=vite)](https://vitejs.dev/)

Language / Язык: [English](#-english) | [Русский](#-русский)

---

## 🌐 English

**ContractHub** is a modern and secure web application for automating primary document generation (contracts, invoices, completion acts) in **DOCX** and **PDF** formats based on customizable MS Word templates.

The application runs entirely on the client-side (Client-Side / Offline-First). All data is stored strictly in local browser storage (IndexedDB), ensuring full commercial confidentiality.

---

### 🚀 Key Features

- **🏢 Multi-Company Management:**
  - Manage requisites for multiple legal entities (LLCs, sole proprietorships, etc.).
  - Support multiple bank accounts per company.
  - Upload stamp and signature facsimile images (PNG/JPG) with automatic insertion into generated documents.

- **👥 Client Directory:**
  - Maintain a database of counterparties (BIN/IIN, legal/actual addresses, contacts, CEO info).
  - Manage client bank accounts.

- **📦 Product & Service Catalog:**
  - Track inventory items (goods and services).
  - Units of measurement, prices, stock remaining.
  - Tax rates (VAT 12%, No VAT 0%, etc.).

- **🔢 Numerators & Custom Fields:**
  - Automatic document numbering with customizable prefixes and suffixes (e.g., `DOC-001/2026`).
  - Flexible constructor for custom fields (text, numbers, dates, dropdown lists).

- **📄 Document Generator:**
  - Instant generation of `.docx` files and live preview/download in `.pdf`.
  - Automatic conversion of financial numbers to **"Amount in words"** (in KZT, RUB, USD, EUR).
  - Support for iteration loops and dynamic specification tables.

- **🌐 Multi-language Support:**
  - UI and document support for **Russian**, **Kazakh (KZ)**, and **English (EN)**.

- **💾 Export & Import (Backup):**
  - Full database export into a single JSON file for backup or migration to another device.
  - Quick restore from backup file.
  - One-click demo data loading.

---

### 📝 Template Tag Syntax (.docx)

Templates are created using standard Microsoft Word. Use variables enclosed in **double curly braces** for dynamic data substitution:

#### 1. My Company Details (`company`)
| Tag | Description |
| :--- | :--- |
| `{{ company.name }}` | Company Name |
| `{{ company.bin_iin }}` | BIN / IIN |
| `{{ company.address_legal }}` | Legal Address |
| `{{ company.address_actual }}` | Actual Address |
| `{{ company.phone }}` | Phone Number |
| `{{ company.email }}` | Email |
| `{{ company.ceo_name }}` | CEO / Representative Full Name |
| `{{ company.ceo_title }}` | Position (General Director, Sole Proprietor, etc.) |
| `{{ company.ceo_base }}` | Legal basis (Articles of Association, Certificate, etc.) |
| `{{ company.bank.bank_name }}` | Bank Name |
| `{{ company.bank.bik }}` | BIK |
| `{{ company.bank.iik }}` | IIK (Account Number) |

#### 2. Client Details (`client`)
| Tag | Description |
| :--- | :--- |
| `{{ client.name }}` | Client Name |
| `{{ client.bin_iin }}` | Client BIN / IIN |
| `{{ client.address_legal }}` | Legal Address |
| `{{ client.ceo_name }}` | Client CEO / Representative Name |
| `{{ client.bank.iik }}` | Client Account Number |

#### 3. Stamps & Signatures (Images)
| Tag | Description |
| :--- | :--- |
| `{{%company.stamp}}` | Inserts official company seal/stamp image |
| `{{%company.signature}}` | Inserts signature facsimile image |

> 💡 **Note:** Use `{{%...}}` syntax for images. PNG files with transparent backgrounds are recommended.

#### 4. System & Financial Fields
| Tag / Modifier | Description |
| :--- | :--- |
| `{{ doc_number }}` | Document Number |
| `{{ doc_date }}` | Document Date |
| `{{ doc_date \| date:'dd.mm.yyyy' }}` | Date Formatting |
| `{{ deal.total_amount }}` | Total Deal Amount |
| `{{ deal.total_amount \| money:'words' }}` | Amount in words |

#### 5. Product & Service Table (Specification)
Create a table in MS Word and wrap the table row in a loop `{{#products}}` ... `{{/products}}`:

```text
| # | Name | Unit | Quantity | Price | Total |
| {{#products}} | {{name}} | {{unit}} | {{quantity}} | {{price}} | {{total}} {{/products}} |
```

---

### 🛠 Tech Stack

- **Frontend Framework:** React 19, TypeScript
- **Bundler:** Vite 8
- **Styling:** Tailwind CSS v4, Lucide Icons
- **Local Storage:** Dexie.js (IndexedDB Wrapper), dexie-export-import
- **Document Generation:** Docxtemplater, docxtemplater-image-module-free, PizZip, Mammoth.js, html2pdf.js
- **Internationalization:** i18next, react-i18next

---

### 📦 Installation & Setup

#### Prerequisites
- **Node.js** v18.x or higher
- **npm** v9.x or higher

#### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/appleimax1/ContractHub.git
   cd ContractHub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```
   Production files will be generated in the `dist/` folder.

---

### 🔒 Security & Privacy

- **No API Keys Required:** Zero hardcoded tokens, passwords, or private keys.
- **Client-Side Privacy:** User data is never sent to external servers. All operations run entirely in the browser memory.
- **Open Source Licensing:** All npm dependencies use permissive open-source licenses (MIT, Apache 2.0, BSD-2-Clause).

---

### 📄 License

This project is licensed under the permissive **MIT License**. See the [LICENSE](LICENSE) file for details.

---
---

## 🌐 Русский

**ContractHub** — современная и безопасная веб-система для автоматизации генерации первичных документов (договоров, счетов на оплату, актов выполненных работ) в форматах **DOCX** и **PDF** на основе настраиваемых шаблонов MS Word.

Приложение полностью работает на стороне клиента (Client-Side / Offline-First). Все данные хранятся исключительно в локальном хранилище браузера (IndexedDB), обеспечивая полную конфиденциальность коммерческой информации.

---

### 🚀 Основные возможности

- **🏢 Мультикомпанейность:**
  - Управление реквизитами нескольких собственных юридических лиц (ТОО, ИП и др.).
  - Поддержка нескольких банковских счетов для каждой компании.
  - Загрузка сканов печатей и факсимиле подписей (PNG/JPG) с автоматической вставкой в документы.

- **👥 Справочник клиентов:**
  - Ведение базы контрагентов (БИН/ИИН, юридический и фактический адреса, контакты, руководитель, основание).
  - Управление банковскими счетами клиентов.

- **📦 Каталог товаров и услуг:**
  - Учет номенклатуры (товары и услуги).
  - Единицы измерения, цены, складской учет остатков.
  - Налоговые ставки (НДС 12%, Без НДС 0% и т.д.).

- **🔢 Нумераторы и Кастомные поля:**
  - Автоматическая нумерация документов с префиксами и суффиксами (например, `ДОГ-001/2026`).
  - Гибкий конструктор дополнительных полей (текст, числа, даты, выпадающие списки).

- **📄 Генератор документов:**
  - Мгновенная генерация файлов `.docx` и просмотр/скачивание в `.pdf`.
  - Автоматический перевод финансовых сумм в **«Сумму прописью»** (в тенге, рублях, долларах, евро).
  - Поддержка циклов и динамических таблиц спецификаций.

- **🌐 Мультиязычность:**
  - Поддержка интерфейса и документов на **русском**, **казахском (KZ)** и **английском (EN)** языках.

- **💾 Экспорт и Импорт (Резервное копирование):**
  - Полный экспорт всей базы данных в единый JSON-файл для бэкапа или переноса на другой компьютер.
  - Быстрое восстановление из резервной копии.
  - Загрузка стартовых тестовых (демо) данных в один клик.

---

### 📝 Синтаксис и размещение тегов в шаблонах (.docx)

Шаблоны создаются в обычном редакторе Microsoft Word. Для автоматической подстановки данных используйте переменные в **двойных фигурных скобках**:

#### 1. Реквизиты Моей Компании (`company`)
| Тег | Описание |
| :--- | :--- |
| `{{ company.name }}` | Наименование компании |
| `{{ company.bin_iin }}` | БИН / ИИН |
| `{{ company.address_legal }}` | Юридический адрес |
| `{{ company.address_actual }}` | Фактический адрес |
| `{{ company.phone }}` | Телефон |
| `{{ company.email }}` | E-mail |
| `{{ company.ceo_name }}` | ФИО руководителя |
| `{{ company.ceo_title }}` | Должность (Генеральный директор, ИП и т.д.) |
| `{{ company.ceo_base }}` | На основании чего действует (Устав, Талон ИП) |
| `{{ company.bank.bank_name }}` | Название банка |
| `{{ company.bank.bik }}` | БИК |
| `{{ company.bank.iik }}` | ИИК (Расчетный счет) |

#### 2. Реквизиты Клиента (`client`)
| Тег | Описание |
| :--- | :--- |
| `{{ client.name }}` | Наименование клиента |
| `{{ client.bin_iin }}` | БИН / ИИН клиента |
| `{{ client.address_legal }}` | Юридический адрес |
| `{{ client.ceo_name }}` | ФИО руководителя клиента |
| `{{ client.bank.iik }}` | ИИК клиента |

#### 3. Печати и Подписи (Изображения)
| Тег | Описание |
| :--- | :--- |
| `{{%company.stamp}}` | Вставляет изображение синей печати компании |
| `{{%company.signature}}` | Вставляет изображение факсимиле подписи |

> 💡 **Примечание:** Для корректной вставки картинок в engine используется синтаксис `{{%...}}`. Рекомендуется загружать PNG с прозрачным фоном.

#### 4. Системные и Финансовые поля
| Тег / Модификатор | Описание |
| :--- | :--- |
| `{{ doc_number }}` | Номер документа |
| `{{ doc_date }}` | Дата документа |
| `{{ doc_date \| date:'dd.mm.yyyy' }}` | Форматирование даты |
| `{{ deal.total_amount }}` | Общая сумма сделки |
| `{{ deal.total_amount \| money:'words' }}` | Сумма прописью |

#### 5. Таблица товаров и услуг (Спецификация)
Создайте таблицу в MS Word и оберните строку в цикл `{{#products}}` ... `{{/products}}`:

```text
| № | Наименование | Ед. изм. | Кол-во | Цена | Сумма |
| {{#products}} | {{name}} | {{unit}} | {{quantity}} | {{price}} | {{total}} {{/products}} |
```

---

### 🛠 Технологический стек

- **Frontend Framework:** React 19, TypeScript
- **Сборщик:** Vite 8
- **Стилизация:** Tailwind CSS v4, Lucide Icons
- **Локальное хранилище:** Dexie.js (IndexedDB Wrapper), dexie-export-import
- **Генерация документов:** Docxtemplater, docxtemplater-image-module-free, PizZip, Mammoth.js, html2pdf.js
- **Интернационализация:** i18next, react-i18next

---

### 📦 Установка и запуск

#### Требования
- **Node.js** версии 18.x или выше
- **npm** версии 9.x или выше

#### Инструкция по локальному запуску

1. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/appleimax1/ContractHub.git
   cd ContractHub
   ```

2. **Установите зависимости:**
   ```bash
   npm install
   ```

3. **Запустите проект в режиме разработки:**
   ```bash
   npm run dev
   ```
   Приложение откроется по адресу `http://localhost:5173`.

4. **Сборка для продакшена:**
   ```bash
   npm run build
   ```
   Готовые статические файлы будут в папке `dist/`.

---

### 🔒 Безопасность и проверка конфиденциальности

Проект прошел полную проверку перед публикацией:
- **Отсутствие API ключей:** В коде отсутствуют токены, пароли или закрытые ключи доступа.
- **Client-Side Privacy:** Данные пользователей не передаются на внешние серверы. Все операции производятся исключительно в памяти браузера пользователя.
- **Совместимость лицензий:** Все использованные npm-библиотеки распространяются под свободно разрешительными лицензиями (MIT, Apache 2.0, BSD-2-Clause).

---

### 📄 Лицензия

Данный проект распространяется под открытой лицензией **MIT License**. Подробная информация содержится в файле [LICENSE](LICENSE).
