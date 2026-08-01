import { useTranslation } from 'react-i18next';
import type { CustomField, Numerator } from '../../db/db';

interface CustomFieldsFormProps {
  isDisabled: boolean;
  customFields: CustomField[] | undefined;
  numeratorsList: Numerator[] | undefined;
  docData: Record<string, any>;
  setDocData: (data: Record<string, any>) => void;
  moneyData: Record<string, { amount: string, currency: string, format: 'words'|'numbers' }>;
  setMoneyData: (data: Record<string, { amount: string, currency: string, format: 'words'|'numbers' }>) => void;
}

export function CustomFieldsForm({
  isDisabled,
  customFields,
  numeratorsList,
  docData,
  setDocData,
  moneyData,
  setMoneyData
}: CustomFieldsFormProps) {
  const { t } = useTranslation();


  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <h2 className="text-lg font-semibold mb-4">4. {t('generator.custom_fields')}</h2>
      <div className="space-y-4">
        
        {/* System fields */}
        <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Номер документа <span className="text-xs text-gray-400">(doc_number)</span>
            </label>
            <select
              value={docData['doc_number'] || ''}
              onChange={e => setDocData({...docData, doc_number: e.target.value})}
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-black"
            >
              <option value="">Выберите нумератор...</option>
              {numeratorsList?.map(n => (
                <option key={n.id} value={n.id}>{n.name} (След: {n.prefix}{n.current_counter}{n.suffix})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата документа <span className="text-xs text-gray-400">(doc_date)</span>
            </label>
            <input 
              type="date"
              value={docData['doc_date'] || ''}
              onChange={e => setDocData({...docData, doc_date: e.target.value})}
              className="w-full border border-gray-300 rounded-md p-2 bg-white text-black"
            />
          </div>
        </div>

        {/* Custom fields */}
        {customFields?.map(field => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.name} <span className="text-xs text-gray-400">({field.key})</span>
            </label>
            {field.type === 'numerator' ? (
              <select
                value={docData[field.key] || ''}
                onChange={e => setDocData({...docData, [field.key]: e.target.value})}
                className="w-full border border-gray-300 rounded-md p-2 bg-white text-black"
              >
                <option value="">Выберите нумератор...</option>
                {numeratorsList?.map(n => (
                  <option key={n.id} value={n.id}>{n.name} (След: {n.prefix}{n.current_counter}{n.suffix})</option>
                ))}
              </select>
            ) : field.type === 'money' ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  placeholder="Сумма"
                  value={moneyData[field.key]?.amount || ''}
                  onChange={e => setMoneyData({
                    ...moneyData, 
                    [field.key]: { ...(moneyData[field.key] || { currency: 'KZT', format: 'numbers' }), amount: e.target.value }
                  })}
                  className="flex-1 border border-gray-300 rounded-md p-2 bg-white text-black"
                />
                <select
                  value={moneyData[field.key]?.currency || 'KZT'}
                  onChange={e => setMoneyData({
                    ...moneyData, 
                    [field.key]: { ...(moneyData[field.key] || { amount: '', format: 'numbers' }), currency: e.target.value }
                  })}
                  className="border border-gray-300 rounded-md p-2 bg-white text-black"
                >
                  <option value="KZT">KZT</option>
                  <option value="RUB">RUB</option>
                  <option value="USD">USD</option>
                </select>
                <select
                  value={moneyData[field.key]?.format || 'numbers'}
                  onChange={e => setMoneyData({
                    ...moneyData, 
                    [field.key]: { ...(moneyData[field.key] || { amount: '', currency: 'KZT' }), format: e.target.value as 'words'|'numbers' }
                  })}
                  className="border border-gray-300 rounded-md p-2 bg-white text-black"
                >
                  <option value="numbers">Цифрами</option>
                  <option value="words">Прописью</option>
                </select>
              </div>
            ) : field.type === 'list' ? (
              field.list_is_multiple ? (
                <div className="flex flex-col gap-2 mt-1">
                  {field.list_options?.map((opt, idx) => {
                    const currentVals = (docData[field.key] as string[]) || [];
                    return (
                      <label key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={currentVals.includes(opt)}
                          onChange={e => {
                            let newVals = [...currentVals];
                            if (e.target.checked) {
                              newVals.push(opt);
                            } else {
                              newVals = newVals.filter(v => v !== opt);
                            }
                            setDocData({...docData, [field.key]: newVals as any});
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <select
                  value={docData[field.key] || ''}
                  onChange={e => setDocData({...docData, [field.key]: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 bg-white text-black"
                >
                  <option value="">Выберите...</option>
                  {field.list_options?.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              )
            ) : (
              <input
                type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                value={docData[field.key] || ''}
                onChange={e => setDocData({...docData, [field.key]: e.target.value})}
                className="w-full border border-gray-300 rounded-md p-2 bg-white text-black"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
