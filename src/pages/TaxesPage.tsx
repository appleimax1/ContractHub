import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Edit2, Trash2, Save, X, Calculator } from 'lucide-react';
import db, { type TaxRate } from '../db/db';
import toast from 'react-hot-toast';

export default function TaxesPage() {
  const { t } = useTranslation();

  const taxes = useLiveQuery(() => db.tax_rates.toArray());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<TaxRate>>({
    name: '',
    rate: 0
  });

  const handleSave = async () => {
    if (!formData.name || formData.rate === undefined) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    try {
      if (editingId) {
        await db.tax_rates.update(editingId, formData);
        toast.success('Налог успешно обновлен');
      } else {
        await db.tax_rates.add(formData as TaxRate);
        toast.success('Новый налог добавлен');
      }
      setEditingId(null);
      setFormData({ name: '', rate: 0 });
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Ошибка при сохранении');
    }
  };

  const handleEdit = (tax: TaxRate) => {
    setEditingId(tax.id!);
    setFormData(tax);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот налог?')) {
      try {
        await db.tax_rates.delete(id);
        toast.success('Налог удален');
      } catch (error) {
        console.error('Delete failed:', error);
        toast.error('Ошибка при удалении');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', rate: 0 });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="text-blue-600" size={32} />
          Налоговые ставки
        </h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {editingId ? 'Редактировать налог' : 'Добавить новый налог'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("taxes.form.name")}</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
              placeholder="НДС 12%"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("taxes.form.rate")}</label>
            <input
              type="number"
              value={formData.rate || 0}
              onChange={e => setFormData({ ...formData, rate: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
              placeholder="12"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Save size={18} />
            {editingId ? 'Сохранить изменения' : 'Добавить налог'}
          </button>
          
          {editingId && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              <X size={18} />
              Отмена
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("taxes.table.name")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("taxes.table.rate")}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {taxes?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  Налоговые ставки пока не добавлены
                </td>
              </tr>
            )}
            {taxes?.map(tax => (
              <tr key={tax.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{tax.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{tax.rate}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleEdit(tax)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                    title="Редактировать"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(tax.id!)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Удалить"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
