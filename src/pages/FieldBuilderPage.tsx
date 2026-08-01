import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db, { type CustomField } from '../db/db';
import { Copy, Plus, Trash2, Check, Edit, Save, Lock } from 'lucide-react';

const transliterate = (text: string) => {
  const cyrillicToLatin: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya', ' ': '_', '-': '_'
  };
  return text.toLowerCase().split('').map(char => cyrillicToLatin[char] || char).join('').replace(/[^a-z0-9_]/g, '');
};

const SYSTEM_FIELDS = [
  { section: 'Документ', name: 'Номер документа', key: 'doc_number', type: 'numerator', tag: '{{ doc_number }}' },
  { section: 'Документ', name: 'Дата документа', key: 'doc_date', type: 'date', tag: "{{ doc_date | date:'d.m.Y' }}" },
  
  { section: 'Моя компания', name: 'Название', key: 'company.name', type: 'string', tag: '{{ company.name }}' },
  { section: 'Моя компания', name: 'БИН/ИИН', key: 'company.bin_iin', type: 'string', tag: '{{ company.bin_iin }}' },
  { section: 'Моя компания', name: 'Юр. Адрес', key: 'company.address_legal', type: 'string', tag: '{{ company.address_legal }}' },
  { section: 'Моя компания', name: 'ФИО руководителя', key: 'company.ceo_name', type: 'string', tag: '{{ company.ceo_name }}' },
  { section: 'Моя компания', name: 'Должность рук.', key: 'company.ceo_title', type: 'string', tag: '{{ company.ceo_title }}' },
  { section: 'Моя компания', name: 'Банк (Выбранный)', key: 'company.bank.bank_name', type: 'string', tag: '{{ company.bank.bank_name }}' },
  { section: 'Моя компания', name: 'ИИК', key: 'company.bank.iik', type: 'string', tag: '{{ company.bank.iik }}' },
  
  { section: 'Клиент', name: 'Название', key: 'client.name', type: 'string', tag: '{{ client.name }}' },
  { section: 'Клиент', name: 'БИН/ИИН', key: 'client.bin_iin', type: 'string', tag: '{{ client.bin_iin }}' },
  { section: 'Клиент', name: 'Юр. Адрес', key: 'client.address_legal', type: 'string', tag: '{{ client.address_legal }}' },
  { section: 'Клиент', name: 'ФИО руководителя', key: 'client.ceo_name', type: 'string', tag: '{{ client.ceo_name }}' },
  { section: 'Клиент', name: 'Должность рук.', key: 'client.ceo_title', type: 'string', tag: '{{ client.ceo_title }}' },
  { section: 'Клиент', name: 'Банк (Выбранный)', key: 'client.bank.bank_name', type: 'string', tag: '{{ client.bank.bank_name }}' },
  { section: 'Клиент', name: 'ИИК', key: 'client.bank.iik', type: 'string', tag: '{{ client.bank.iik }}' },
  
  { section: 'Сделка / Товар', name: 'Сумма без налога', key: 'deal.amount_without_tax', type: 'money', tag: '{{ deal.amount_without_tax }}' },
  { section: 'Сделка / Товар', name: 'Сумма скидки', key: 'deal.discount_amount', type: 'money', tag: '{{ deal.discount_amount }}' },
  { section: 'Сделка / Товар', name: 'Сумма налога', key: 'deal.tax_amount', type: 'money', tag: '{{ deal.tax_amount }}' },
  { section: 'Сделка / Товар', name: 'Общая стоимость сделки', key: 'deal.total_amount', type: 'money', tag: '{{ deal.total_amount }}' },
  { section: 'Сделка / Товар', name: 'Наименование товара/услуги', key: 'product.name', type: 'string', tag: '{{ product.name }}' },
  { section: 'Сделка / Товар', name: 'Количество', key: 'product.quantity', type: 'number', tag: '{{ product.quantity }}' },
  { section: 'Сделка / Товар', name: 'Ед. измерения', key: 'product.unit', type: 'string', tag: '{{ product.unit }}' },
  { section: 'Сделка / Товар', name: 'Цена за единицу', key: 'product.price', type: 'money', tag: '{{ product.price }}' },
];

export default function FieldBuilderPage() {
  const { t } = useTranslation();

  const customFields = useLiveQuery(() => db.custom_fields.toArray());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  const [isKeyManual, setIsKeyManual] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const defaultForm: Partial<CustomField> = {
    name: '',
    key: '',
    type: 'string',
    default_modifier: '',
  };

  const [formData, setFormData] = useState<Partial<CustomField & { list_options_input?: string }>>(defaultForm);

  const generateTag = (field: Partial<CustomField>) => {
    let tag = `{{ ${field.key} }}`;
    if (field.default_modifier) {
       tag = `{{ ${field.key} | ${field.default_modifier} }}`;
    } else {
       if (field.type === 'date') tag = `{{ ${field.key} | date:'d.m.Y' }}`;
       if (field.type === 'time') tag = `{{ ${field.key} | time:'H:i:s' }}`;
       if (field.type === 'money') tag = `{{ ${field.key} | money:'words' }}`;
    }
    return tag;
  };

  const handleCopy = (tag: string, key: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.key) return;
    
    const fieldData = { ...formData };
    if (fieldData.type === 'list') {
      fieldData.list_options = (fieldData.list_options_input || '').split(',').map(s => s.trim()).filter(Boolean);
    }
    delete fieldData.list_options_input;
    
    if (editingId) {
      await db.custom_fields.update(editingId, fieldData as any);
    } else {
      const cleanKey = fieldData.key!.replace(/[^a-zA-Z0-9_]/g, '');
      await db.custom_fields.add({ ...fieldData, key: cleanKey } as CustomField);
    }
    
    cancelEdit();
  };

  const startEdit = (field: CustomField) => {
    setFormData({
      ...field,
      list_options_input: field.list_options?.join(', ') || ''
    });
    setEditingId(field.id!);
  };

  const cancelEdit = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setIsKeyManual(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить поле?')) {
      await db.custom_fields.delete(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("builder.title")}</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">{editingId ? 'Редактировать поле' : 'Создать новое поле'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("builder.form.name")}</label>
            <input 
              type="text" 
              placeholder="Например: Дата договора"
              value={formData.name}
              onChange={e => {
                const name = e.target.value;
                setFormData(prev => ({
                  ...prev, 
                  name, 
                  key: isKeyManual || editingId ? prev.key : transliterate(name) 
                }));
              }}
              className="w-full border border-gray-300 rounded-md p-2 text-black bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ключ тега {editingId && <Lock size={12} className="inline text-gray-400" />}
            </label>
            <input 
              type="text" 
              placeholder="contract_date"
              value={formData.key}
              disabled={!!editingId}
              onChange={e => {
                setIsKeyManual(true);
                setFormData({...formData, key: e.target.value.replace(/[^a-zA-Z0-9_]/g, '')});
              }}
              className="w-full border border-gray-300 rounded-md p-2 text-black bg-white disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип поля {editingId && <Lock size={12} className="inline text-gray-400" />}
            </label>
            <select 
              value={formData.type}
              disabled={!!editingId}
              onChange={e => setFormData({...formData, type: e.target.value as CustomField['type']})}
              className="w-full border border-gray-300 rounded-md p-2 text-black bg-white disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="string">{t("builder.form.type_string")}</option>
              <option value="date">{t("builder.form.type_date")}</option>
              <option value="time">{t("builder.form.type_time")}</option>
              <option value="money">{t("builder.form.type_money")}</option>
              <option value="numerator">{t("builder.form.type_numerator")}</option>
              <option value="list">{t("builder.form.type_list")}</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button onClick={handleSave} className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              <span>{editingId ? 'Сохранить' : 'Создать'}</span>
            </button>
            {editingId && (
              <button onClick={cancelEdit} className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 rounded-md">
                Отмена
              </button>
            )}
          </div>
          {formData.type === 'list' && (
            <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-2 flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Варианты для выпадающего списка (вводите через запятую)
                </label>
                <input 
                  type="text" 
                  placeholder="Например: Вариант 1, Вариант 2, Вариант 3..."
                  value={formData.list_options_input || ''}
                  onChange={e => setFormData({...formData, list_options_input: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 text-black bg-white"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={!!formData.list_is_multiple}
                  onChange={e => setFormData({...formData, list_is_multiple: e.target.checked})}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>{t("builder.form.multiple")}</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("builder.table.name")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("builder.table.type")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("builder.table.tag")}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Custom Fields */}
            {customFields?.map(field => (
              <tr key={field.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{field.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {generateTag(field)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={() => handleCopy(generateTag(field), field.key)} 
                      className="text-blue-600 hover:text-blue-900"
                      title="Скопировать тег"
                    >
                      {copiedKey === field.key ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                    <button onClick={() => startEdit(field)} className="text-blue-600 hover:text-blue-900">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(field.id!)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {customFields?.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  Нет кастомных полей. Создайте первое поле выше.
                </td>
              </tr>
            )}

            {/* System Fields */}
            {['Документ', 'Моя компания', 'Клиент', 'Сделка / Товар'].map(sectionName => (
              <React.Fragment key={sectionName}>
                <tr>
                  <td colSpan={4} className="px-6 py-3 bg-gray-100 text-xs font-bold text-gray-700 uppercase border-y border-gray-200">
                    Системные поля: {sectionName}
                  </td>
                </tr>
                {SYSTEM_FIELDS.filter(f => f.section === sectionName).map(field => (
                  <tr key={field.key} className="bg-blue-50/30 hover:bg-blue-50/60">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-800 flex items-center gap-2">
                      <Lock size={14} className="text-gray-400" />
                      {field.name}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{field.type}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {field.tag}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button 
                          onClick={() => handleCopy(field.tag, field.key)} 
                          className="text-blue-600 hover:text-blue-900"
                          title="Скопировать тег"
                        >
                          {copiedKey === field.key ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
