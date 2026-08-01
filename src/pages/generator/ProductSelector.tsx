import { useTranslation } from 'react-i18next';
import type { CatalogItem, TaxRate } from '../../db/db';

export interface SelectedItem {
  id: string; // unique id for the row
  productId: string;
  quantity: number;
}

interface ProductSelectorProps {
  isDisabled: boolean;
  catalog: CatalogItem[] | undefined;
  selectedItems: SelectedItem[];
  setSelectedItems: (items: SelectedItem[]) => void;
  dealCurrency: 'KZT' | 'RUB' | 'USD';
  setDealCurrency: (curr: 'KZT' | 'RUB' | 'USD') => void;
  taxRates: TaxRate[] | undefined;
  selectedTaxRateId: string;
  setSelectedTaxRateId: (id: string) => void;
  isTaxIncluded: boolean;
  setIsTaxIncluded: (val: boolean) => void;
  discountType: 'none' | 'percent' | 'amount';
  setDiscountType: (val: 'none' | 'percent' | 'amount') => void;
  discountValue: number;
  setDiscountValue: (val: number) => void;
}

export function ProductSelector({
  isDisabled,
  catalog,
  selectedItems,
  setSelectedItems,
  dealCurrency,
  setDealCurrency,
  taxRates,
  selectedTaxRateId,
  setSelectedTaxRateId,
  isTaxIncluded,
  setIsTaxIncluded,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue
}: ProductSelectorProps) {
  const { t } = useTranslation();

  const currencySign = dealCurrency === 'KZT' ? '₸' : dealCurrency === 'RUB' ? '₽' : '$';

  const itemsTotal = selectedItems.reduce((acc, item) => {
    const sel = catalog?.find(c => c.id === Number(item.productId));
    return acc + (sel ? sel.price * item.quantity : 0);
  }, 0);

  let actualDiscount = 0;
  if (discountType === 'percent') {
    actualDiscount = itemsTotal * (discountValue / 100);
  } else if (discountType === 'amount') {
    actualDiscount = discountValue;
  }
  
  const discountedTotal = Math.max(0, itemsTotal - actualDiscount);

  let taxAmount = 0;
  let finalTotal = discountedTotal;
  let withoutTaxAmount = discountedTotal;

  const taxRateObj = taxRates?.find(t => t.id === Number(selectedTaxRateId));
  if (taxRateObj) {
    const rate = taxRateObj.rate / 100;
    if (isTaxIncluded) {
      taxAmount = discountedTotal * rate;
      withoutTaxAmount = discountedTotal - taxAmount;
      finalTotal = discountedTotal;
    } else {
      withoutTaxAmount = discountedTotal;
      taxAmount = discountedTotal * rate;
      finalTotal = discountedTotal + taxAmount;
    }
  }

  return (
    <div className={`space-y-5 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Спецификация и расчет стоимости</h3>
          <p className="text-xs text-slate-500">Добавьте позиции и настройте условия скидки или налогов</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Валюта:</label>
          <select 
            value={dealCurrency} 
            onChange={(e) => setDealCurrency(e.target.value as any)}
            className="border border-slate-200 rounded-lg text-xs font-semibold p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-800 shadow-2xs"
          >
            <option value="KZT">Тенге (₸)</option>
            <option value="RUB">Рубли (₽)</option>
            <option value="USD">Доллары ($)</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-3">
        {selectedItems.map((item, index) => {
          const sel = catalog?.find(c => c.id === Number(item.productId));
          return (
            <div key={item.id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col gap-3 relative transition-all hover:border-slate-300">
              <button
                onClick={() => {
                  setSelectedItems(selectedItems.filter(i => i.id !== item.id));
                }}
                className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                title="Удалить позицию"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              
              <div className="pr-8">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Позиция #{index + 1}</label>
                <select 
                  value={item.productId}
                  onChange={e => {
                    const newItems = [...selectedItems];
                    newItems[index].productId = e.target.value;
                    setSelectedItems(newItems);
                  }}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
                >
                  <option value="">Выберите позицию из справочника...</option>
                  {catalog?.map(catItem => (
                    <option key={catItem.id} value={catItem.id}>
                      {catItem.type === 'product' ? '📦' : '💼'} {catItem.name} ({catItem.price} {currencySign})
                    </option>
                  ))}
                </select>
              </div>

              {sel && (
                <div className="flex items-center gap-4 flex-wrap pt-1 border-t border-slate-200/60">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Количество ({sel.unit})</label>
                    <input 
                      type="number"
                      min="1"
                      max={sel.track_stock ? sel.stock_quantity : undefined}
                      value={item.quantity}
                      onChange={e => {
                        const val = Number(e.target.value);
                        const newItems = [...selectedItems];
                        if (sel.track_stock && val > sel.stock_quantity) {
                          newItems[index].quantity = sel.stock_quantity;
                        } else {
                          newItems[index].quantity = val;
                        }
                        setSelectedItems(newItems);
                      }}
                      className="w-24 border border-slate-200 rounded-lg p-2 bg-white text-slate-800 text-sm font-semibold text-center focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {sel.track_stock && (
                    <div className="text-xs font-medium text-slate-500 pt-4">
                      Остаток на складе: <span className="font-semibold text-slate-700">{sel.stock_quantity}</span>
                    </div>
                  )}
                  <div className="text-sm font-extrabold text-slate-900 pt-4 ml-auto">
                    {(sel.price * item.quantity).toLocaleString('ru-RU')} {currencySign}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={() => {
            setSelectedItems([...selectedItems, { id: Date.now().toString(), productId: '', quantity: 1 }]);
          }}
          className="w-full flex justify-center items-center gap-2 py-3 border-2 border-dashed border-slate-200 text-slate-600 rounded-xl hover:bg-indigo-50/50 hover:border-indigo-300 hover:text-indigo-600 transition-all text-xs font-bold uppercase tracking-wider"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Добавить позицию
        </button>

        {selectedItems.length > 0 && (
          <div className="pt-2 space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Discount Section */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t("generator.totals.discount")}</label>
                <div className="flex items-center gap-2">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="border border-slate-200 rounded-lg p-2 bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 w-full"
                  >
                    <option value="none">{t("generator.discount_type_none")}</option>
                    <option value="percent">Процент (%)</option>
                    <option value="amount">{t("generator.total")}</option>
                  </select>
                  {discountType !== 'none' && (
                    <input
                      type="number"
                      min="0"
                      step={discountType === 'percent' ? '0.1' : '1'}
                      value={discountValue || ''}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      placeholder={discountType === 'percent' ? '10' : '5000'}
                      className="border border-slate-200 rounded-lg p-2 bg-white text-slate-800 text-xs font-semibold w-24 text-center focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              </div>

              {/* Tax Section */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Налог:</label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTaxRateId}
                    onChange={(e) => setSelectedTaxRateId(e.target.value)}
                    className="border border-slate-200 rounded-lg p-2 bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 w-full"
                  >
                    <option value="">Без налога</option>
                    {taxRates?.map(tax => (
                      <option key={tax.id} value={tax.id}>{tax.name} ({tax.rate}%)</option>
                    ))}
                  </select>
                </div>
                {selectedTaxRateId && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="taxIncluded"
                      checked={isTaxIncluded}
                      onChange={(e) => setIsTaxIncluded(e.target.checked)}
                      className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="taxIncluded" className="text-xs text-slate-600 cursor-pointer font-medium">
                      Включен в стоимость
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="bg-gradient-to-br from-indigo-50/60 via-slate-50 to-blue-50/40 p-4 rounded-xl border border-indigo-100/80 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Сумма товаров:</span>
                <span className="font-semibold text-slate-700">{itemsTotal.toLocaleString('ru-RU')} {currencySign}</span>
              </div>
              
              {actualDiscount > 0 && (
                <div className="flex justify-between text-xs text-rose-600 font-semibold">
                  <span>{t("generator.totals.discount")}</span>
                  <span>- {actualDiscount.toLocaleString('ru-RU')} {currencySign}</span>
                </div>
              )}

              {selectedTaxRateId && (
                <>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Сумма без налога:</span>
                    <span className="font-semibold text-slate-700">{withoutTaxAmount.toLocaleString('ru-RU')} {currencySign}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Сумма налога ({taxRateObj?.name}):</span>
                    <span className="font-semibold text-slate-700">{taxAmount.toLocaleString('ru-RU')} {currencySign}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-indigo-200/60 pt-2.5 mt-1">
                <span>Общая сумма сделки:</span>
                <span className="text-indigo-700">{finalTotal.toLocaleString('ru-RU')} {currencySign}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
