import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db, { type Client, type BankAccount } from '../db/db';
import { Plus, Save, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientsPage() {
  const { t } = useTranslation();

  const clients = useLiveQuery(() => db.clients.toArray());
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const defaultForm: Partial<Client> = {
    name: '',
    bin_iin: '',
    address_legal: '',
    address_actual: '',
    phone: '',
    email: '',
    ceo_name: '',
    ceo_title: '',
    ceo_base: '',
    bank_accounts: [],
  };

  const [formData, setFormData] = useState<Partial<Client>>(defaultForm);

  const openForm = (client?: Client) => {
    if (client) {
      setFormData(client);
      setEditingId(client.id!);
    } else {
      setFormData(defaultForm);
      setEditingId(null);
    }
    setIsEditing(true);
  };

  const closeForm = () => {
    setIsEditing(false);
    setFormData(defaultForm);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.error('Введите название клиента');
      return;
    }
    if (!formData.bin_iin?.trim()) {
      toast.error('Введите БИН/ИИН');
      return;
    }
    const binRegex = /^\d{12}$/;
    if (!binRegex.test(formData.bin_iin.trim())) {
      toast.error('БИН/ИИН должен содержать ровно 12 цифр');
      return;
    }
    
    if (formData.bank_accounts) {
      for (const acc of formData.bank_accounts) {
        if (acc.iik && !/^KZ[A-Z0-9]{18}$/i.test(acc.iik.trim())) {
          toast.error(`ИИК "${acc.iik}" имеет неверный формат. Ожидается KZ и 18 символов.`);
          return;
        }
      }
    }
    
    try {
      if (editingId) {
        await db.clients.update(editingId, formData as any);
        toast.success('Клиент успешно обновлен');
      } else {
        await db.clients.add(formData as Client);
        toast.success('Клиент успешно добавлен');
      }
      closeForm();
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при сохранении клиента');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить клиента?')) {
      await db.clients.delete(id);
    }
  };

  const addBankAccount = () => {
    const newAccount: BankAccount = {
      id: Date.now().toString(),
      alias: '',
      bank_name: '',
      bik: '',
      iik: ''
    };
    setFormData(prev => ({
      ...prev,
      bank_accounts: [...(prev.bank_accounts || []), newAccount]
    }));
  };

  const updateBankAccount = (id: string, field: keyof BankAccount, value: string) => {
    setFormData(prev => ({
      ...prev,
      bank_accounts: prev.bank_accounts?.map(acc => 
        acc.id === id ? { ...acc, [field]: value } : acc
      )
    }));
  };

  const removeBankAccount = (id: string) => {
    setFormData(prev => ({
      ...prev,
      bank_accounts: prev.bank_accounts?.filter(acc => acc.id !== id)
    }));
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{t("clients.title")}</h1>
        <div className="flex w-full md:w-auto items-center space-x-4">
          {!isEditing && (
            <input 
              type="text" 
              placeholder={t("clients.search")}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full md:w-64 border border-gray-300 rounded-lg p-2 text-sm bg-white text-black focus:ring-blue-500 focus:border-blue-500"
            />
          )}
          {!isEditing && (
            <button 
              onClick={() => openForm()}
              className="flex-shrink-0 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              <span>{t("clients.add_new")}</span>
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold mb-6 pb-2 border-b">{editingId ? 'Редактировать клиента' : 'Новый клиент'}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-medium text-blue-700">Основные данные</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название клиента</label>
                <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-black bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("companies.form.bin")}</label>
                <input type="text" value={formData.bin_iin || ''} onChange={e => setFormData({...formData, bin_iin: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-black bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("companies.form.legal_address")}</label>
                <textarea value={formData.address_legal || ''} onChange={e => setFormData({...formData, address_legal: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-black bg-white h-20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("companies.form.actual_address")}</label>
                <textarea value={formData.address_actual || ''} onChange={e => setFormData({...formData, address_actual: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-black bg-white h-20" />
              </div>

              <h3 className="font-medium text-blue-700 pt-4">{t("companies.table.ceo")}</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ФИО Руководителя</label>
                <input type="text" value={formData.ceo_name || ''} onChange={e => setFormData({...formData, ceo_name: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-black bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Должность (Директор, Ген. Директор)</label>
                <input type="text" value={formData.ceo_title || ''} onChange={e => setFormData({...formData, ceo_title: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-black bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Действует на основании (Устава, Доверенности)</label>
                <input type="text" value={formData.ceo_base || ''} onChange={e => setFormData({...formData, ceo_base: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-black bg-white" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-blue-700">{t("companies.table.contacts")}</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("companies.form.phone")}</label>
                <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-black bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("companies.form.email")}</label>
                <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-black bg-white" />
              </div>

              <div className="pt-4 flex justify-between items-center">
                <h3 className="font-medium text-blue-700">Банковские счета</h3>
                <button onClick={addBankAccount} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
                  + Добавить счет
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.bank_accounts?.map((acc) => (
                  <div key={acc.id} className="p-4 bg-gray-50 border border-gray-200 rounded relative">
                    <button onClick={() => removeBankAccount(acc.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Название счета (для вас)</label>
                        <input type="text" value={acc.alias} placeholder="Основной KZT" onChange={e => updateBankAccount(acc.id, 'alias', e.target.value)} className="w-full border-gray-300 rounded p-1.5 text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Банк</label>
                        <input type="text" value={acc.bank_name} onChange={e => updateBankAccount(acc.id, 'bank_name', e.target.value)} className="w-full border-gray-300 rounded p-1.5 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t("companies.form.bik")}</label>
                        <input type="text" value={acc.bik} onChange={e => updateBankAccount(acc.id, 'bik', e.target.value)} className="w-full border-gray-300 rounded p-1.5 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">ИИК (Счет)</label>
                        <input type="text" value={acc.iik} onChange={e => updateBankAccount(acc.id, 'iik', e.target.value)} className="w-full border-gray-300 rounded p-1.5 text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
                {(!formData.bank_accounts || formData.bank_accounts.length === 0) && (
                  <p className="text-sm text-gray-500 italic">Банковские счета не добавлены</p>
                )}
              </div>
            </div>
          </div>
            
          <div className="flex space-x-3 pt-6 mt-6 border-t">
            <button onClick={handleSave} className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              <Save size={18} />
              <span>Сохранить клиента</span>
            </button>
            <button onClick={closeForm} className="text-gray-600 hover:text-gray-800 px-4 py-2">
              Отмена
            </button>
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clients?.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            c.bin_iin.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(client => (
            <div key={client.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
              <div className="flex justify-between items-start mb-4 border-b pb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{client.name}</h3>
                  <p className="text-sm text-gray-500">БИН/ИИН: {client.bin_iin}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openForm(client)} className="text-blue-500 hover:text-blue-700 p-1">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(client.id!)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600 flex-1">
                <p><strong>Руководитель:</strong> {client.ceo_title} {client.ceo_name}</p>
                <p><strong>Email:</strong> {client.email || '-'}</p>
                <p><strong>Счетов:</strong> {client.bank_accounts?.length || 0}</p>
              </div>
            </div>
          ))}
          {clients?.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            c.bin_iin.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
              {searchQuery ? 'Клиенты по вашему запросу не найдены.' : 'У вас пока нет ни одного клиента. Добавьте первого!'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
