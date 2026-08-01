import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db, { type CatalogItem } from '../db/db';
import { Package, Plus, Trash2, Edit, Save, X, Filter } from 'lucide-react';

export default function CatalogPage() {
  const { t } = useTranslation();

  const items = useLiveQuery(() => db.catalog.toArray());
  const [filterType, setFilterType] = useState<'all' | 'product' | 'service'>('all');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const defaultForm: Partial<CatalogItem> = {
    type: 'product',
    name: '',
    unit: 'шт',
    price: 0,
    track_stock: false,
    stock_quantity: 0
  };
  
  const [formData, setFormData] = useState<Partial<CatalogItem>>(defaultForm);

  const filteredItems = items?.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    return true;
  }) || [];

  const handleSave = async () => {
    if (!formData.name || !formData.unit) {
      alert('Заполните обязательные поля');
      return;
    }
    
    const dataToSave = {
      ...formData,
      price: Number(formData.price) || 0,
      stock_quantity: formData.track_stock ? (Number(formData.stock_quantity) || 0) : 0
    } as CatalogItem;

    if (dataToSave.type === 'service') {
      dataToSave.track_stock = false;
      dataToSave.stock_quantity = 0;
    }

    if (editingId) {
      await db.catalog.update(editingId, dataToSave);
    } else {
      await db.catalog.add(dataToSave);
    }
    
    cancelEdit();
  };

  const startEdit = (item: CatalogItem) => {
    setFormData(item);
    setEditingId(item.id!);
  };

  const cancelEdit = () => {
    setFormData(defaultForm);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить позицию из каталога?')) {
      await db.catalog.delete(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Package className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">Каталог товаров и услуг</h1>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">{editingId ? 'Редактировать позицию' : 'Добавить позицию'}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("catalog.table.type")}</label>
            <select 
              value={formData.type}
              onChange={e => {
                const type = e.target.value as 'product' | 'service';
                setFormData({...formData, type, track_stock: type === 'product' ? formData.track_stock : false });
              }}
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-black"
            >
              <option value="product">{t("catalog.form.type_product")}</option>
              <option value="service">{t("catalog.form.type_service")}</option>
            </select>
          </div>
          
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Наименование *</label>
            <input 
              type="text" 
              placeholder="Например: Разработка сайта"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цена (Стоимость)</label>
            <input 
              type="number" 
              min="0"
              value={formData.price}
              onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ед. измерения *</label>
            <input 
              type="text" 
              placeholder="шт, ч, усл..."
              value={formData.unit}
              onChange={e => setFormData({...formData, unit: e.target.value})}
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-black"
            />
          </div>

          {formData.type === 'product' && (
            <div className="flex flex-col justify-end pb-2">
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={!!formData.track_stock}
                  onChange={e => setFormData({...formData, track_stock: e.target.checked})}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Учет остатков</span>
              </label>
            </div>
          )}

          {formData.type === 'product' && formData.track_stock && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("catalog.table.stock")}</label>
              <input 
                type="number" 
                value={formData.stock_quantity}
                onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})}
                className="w-full border border-gray-300 rounded-md p-2 bg-white text-black"
              />
            </div>
          )}

          <div className="flex space-x-2 lg:col-span-full justify-end mt-4">
             {editingId && (
              <button onClick={cancelEdit} className="px-4 py-2 flex items-center space-x-2 text-gray-600 hover:text-gray-800 bg-gray-100 rounded-md">
                <X size={18} />
                <span>{t("common.cancel")}</span>
              </button>
            )}
            <button onClick={handleSave} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              <span>{editingId ? 'Сохранить' : 'Добавить'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter size={18} className="text-gray-500" />
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value as any)}
              className="border-gray-300 rounded-md text-sm p-1.5 bg-white text-black"
            >
              <option value="all">Все записи</option>
              <option value="product">Только товары</option>
              <option value="service">Только услуги</option>
            </select>
          </div>
          <span className="text-sm text-gray-500">Всего позиций: {filteredItems.length}</span>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("catalog.table.name")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("catalog.table.type")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("catalog.table.price")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("catalog.table.stock")}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.type === 'product' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {item.type === 'product' ? 'Товар' : 'Услуга'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.price} ₸ / {item.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.type === 'service' ? (
                    <span className="text-gray-300">—</span>
                  ) : item.track_stock ? (
                    <span className={item.stock_quantity <= 0 ? 'text-red-600 font-bold' : 'text-gray-900'}>{item.stock_quantity} {item.unit}</span>
                  ) : (
                    <span className="text-gray-400 italic">Без учета</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <button onClick={() => startEdit(item)} className="text-blue-600 hover:text-blue-900">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id!)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  В каталоге пока нет записей.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
