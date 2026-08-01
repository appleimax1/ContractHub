import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db, { type Numerator } from '../db/db';
import { Plus, Save, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NumeratorsPage() {
  const { t } = useTranslation();

  const numerators = useLiveQuery(() => db.numerators.toArray());
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Partial<Numerator>>({
    name: '',
    prefix: '',
    suffix: '',
    current_counter: 1,
  });

  const openForm = (numerator?: Numerator) => {
    if (numerator) {
      setFormData(numerator);
      setEditingId(numerator.id!);
    } else {
      setFormData({ name: '', prefix: '', suffix: '', current_counter: 1 });
      setEditingId(null);
    }
    setIsAdding(true);
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', prefix: '', suffix: '', current_counter: 1 });
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.error('Введите название нумератора');
      return;
    }
    if (formData.current_counter === undefined || formData.current_counter < 0) {
      toast.error('Стартовый номер не может быть отрицательным');
      return;
    }
    
    try {
      if (editingId) {
        await db.numerators.update(editingId, formData as Numerator);
        toast.success('Нумератор успешно обновлен');
      } else {
        await db.numerators.add(formData as Numerator);
        toast.success('Нумератор успешно добавлен');
      }
      closeForm();
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при сохранении нумератора');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить нумератор?')) {
      await db.numerators.delete(id);
    }
  };

  const generatePreview = (n: Partial<Numerator>) => {
    return `${n.prefix || ''}${n.current_counter}${n.suffix || ''}`;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t("numerators.title")}</h1>
        {!isAdding && (
          <button 
            onClick={() => openForm()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            <span>{t("numerators.add_new")}</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Редактировать нумератор' : 'Новый нумератор'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("numerators.form.name")}</label>
              <input 
                type="text" 
                placeholder="Договоры 2026"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-md p-2 text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("numerators.form.prefix")}</label>
              <input 
                type="text" 
                placeholder="ДОГ-"
                value={formData.prefix}
                onChange={e => setFormData({...formData, prefix: e.target.value})}
                className="w-full border border-gray-300 rounded-md p-2 text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("numerators.form.suffix")}</label>
              <input 
                type="text" 
                placeholder="-2026"
                value={formData.suffix}
                onChange={e => setFormData({...formData, suffix: e.target.value})}
                className="w-full border border-gray-300 rounded-md p-2 text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("numerators.form.counter")}</label>
              <input 
                type="number" 
                min="0"
                value={formData.current_counter}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  setFormData({...formData, current_counter: isNaN(val) ? 0 : Math.max(0, val)});
                }}
                className="w-full border border-gray-300 rounded-md p-2 text-black bg-white"
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
            Превью первого номера: <strong className="text-gray-900">{generatePreview(formData)}</strong>
          </div>
            
          <div className="flex space-x-3 pt-4">
            <button onClick={handleSave} className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <Save size={18} />
              <span>{t("common.save")}</span>
            </button>
            <button onClick={closeForm} className="text-gray-600 hover:text-gray-800 px-4 py-2">
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("numerators.form.name")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("numerators.table.format")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("numerators.table.next")}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {numerators?.map(num => (
              <tr key={num.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{num.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {num.prefix}[НОМЕР]{num.suffix}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                  {generatePreview(num)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => openForm(num)} className="text-blue-600 hover:text-blue-900">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(num.id!)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {numerators?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            У вас пока нет ни одного нумератора. Добавьте первый!
          </div>
        )}
      </div>
    </div>
  );
}
