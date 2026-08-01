import Dexie, { type EntityTable } from 'dexie';

export interface BankAccount {
  id: string; // unique string id e.g., Date.now().toString()
  alias: string;
  bank_name: string;
  bik: string;
  iik: string;
}

export interface MyCompany {
  id?: number;
  name: string;
  bin_iin: string;
  address_legal: string;
  address_actual: string;
  phone: string;
  email: string;
  ceo_name: string;
  ceo_title: string;
  ceo_base: string;
  bank_accounts: BankAccount[];
  stamp_image?: string; // base64
  signature_image?: string; // base64
}

export interface Client {
  id?: number;
  name: string;
  bin_iin: string;
  address_legal: string;
  address_actual: string;
  phone: string;
  email: string;
  ceo_name: string;
  ceo_title: string;
  ceo_base: string;
  bank_accounts: BankAccount[];
}

export type DocumentStatus = 'согласование' | 'отказ' | 'доработка' | 'заключен';

export interface DocumentHistory {
  id?: number;
  client_id: number;
  company_id: number;
  template_name: string;
  generated_at: Date;
  payload: Record<string, any>;
  status: DocumentStatus;
  file_data?: ArrayBuffer;
  file_type?: 'docx' | 'pdf';
}

export interface CustomField {
  id?: number;
  key: string;
  name: string;
  type: 'string' | 'list' | 'date' | 'time' | 'datetime' | 'number' | 'money' | 'file' | 'numerator';
  default_modifier?: string;
  list_options?: string[];
  list_is_multiple?: boolean;
}

export interface Numerator {
  id?: number;
  name: string;
  prefix: string;
  suffix: string;
  current_counter: number;
}

export interface CatalogItem {
  id?: number;
  type: 'product' | 'service';
  name: string;
  unit: string;
  price: number;
  track_stock: boolean;
  stock_quantity: number;
}

export interface TaxRate {
  id?: number;
  name: string;
  rate: number; // e.g. 12 for 12%
}

export interface DocumentTemplate {
  id?: number;
  name: string;
  file_data: ArrayBuffer;
  created_at: Date;
  last_used_at?: Date;
}

const db = new Dexie('CustomDocDatabase') as Dexie & {
  my_companies: EntityTable<MyCompany, 'id'>;
  clients: EntityTable<Client, 'id'>;
  document_history: EntityTable<DocumentHistory, 'id'>;
  custom_fields: EntityTable<CustomField, 'id'>;
  numerators: EntityTable<Numerator, 'id'>;
  catalog: EntityTable<CatalogItem, 'id'>;
  templates: EntityTable<DocumentTemplate, 'id'>;
  tax_rates: EntityTable<TaxRate, 'id'>;
};

// Define schema
db.version(3).stores({
  my_companies: '++id, name', // Primary key and indexed props
  clients: '++id, name, bin_iin',
  document_history: '++id, client_id, company_id',
  custom_fields: '++id, key, type',
  numerators: '++id, name'
}).upgrade(tx => {
  // Migrate existing data to new structure
  tx.table('my_companies').toCollection().modify(company => {
    company.bin_iin = company.bin_iin || '';
    company.address_legal = company.address_legal || '';
    company.address_actual = company.address_actual || '';
    company.phone = company.phone || '';
    company.email = company.email || '';
    company.ceo_name = company.ceo_name || company.director || '';
    company.ceo_title = company.ceo_title || '';
    company.ceo_base = company.ceo_base || '';
    company.bank_accounts = company.bank_accounts || [];
    delete company.director;
    delete company.requisites;
    delete company.bank_details;
  });

  tx.table('clients').toCollection().modify(client => {
    client.bin_iin = client.bin_iin || client.bin || '';
    client.address_legal = client.address_legal || '';
    client.address_actual = client.address_actual || '';
    client.phone = client.phone || '';
    client.email = client.email || '';
    client.ceo_name = client.ceo_name || client.director || '';
    client.ceo_title = client.ceo_title || '';
    client.ceo_base = client.ceo_base || '';
    client.bank_accounts = client.bank_accounts || [];
    delete client.bin;
    delete client.director;
    delete client.requisites;
    delete client.bank_details;
  });
});

db.version(4).stores({
  document_history: '++id, client_id, company_id, status, generated_at',
}).upgrade(tx => {
  tx.table('document_history').toCollection().modify(doc => {
    doc.status = doc.status || 'согласование';
  });
});

db.version(5).stores({
  catalog: '++id, type, name'
});

db.version(6).stores({
  templates: '++id, name, created_at, last_used_at'
});

db.version(7).stores({
  tax_rates: '++id, name, rate'
});

db.version(8).stores({
  document_history: '++id, client_id, company_id, status, generated_at'
}).upgrade(() => {
  // Just bump version, dexie adds optional fields automatically
});

export default db;
