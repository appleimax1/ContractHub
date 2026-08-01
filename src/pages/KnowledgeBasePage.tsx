import { useTranslation } from 'react-i18next';
import { BookOpen, FileText, Image as ImageIcon, Code } from 'lucide-react';

export default function KnowledgeBasePage() {
  const { t } = useTranslation();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="flex items-center space-x-3 text-indigo-600 mb-2">
          <BookOpen size={24} />
          <span className="text-xs font-semibold uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            {t('knowledge.title')}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          База знаний и Теги шаблонов
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Подробная инструкция по созданию собственных Word-шаблонов (.docx) с разметкой
        </p>
      </div>
      
      <div className="space-y-6 text-slate-700">
        {/* Section 1: Introduction */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              1
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Как создать свой шаблон</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600 mb-3">
            Вы можете превратить любой ваш MS Word документ (<code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200">.docx</code>) в интерактивный шаблон. Для этого вместо конкретных данных вставьте специальные плейсхолдеры (теги) в двойных фигурных скобках, например <code className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded font-mono text-xs border border-indigo-100">{`{{ company.name }}`}</code>.
          </p>
          <p className="text-sm leading-relaxed text-slate-600">
            При выборе этого шаблона в <b>Генераторе</b> система автоматически заменит все теги на реальные реквизиты, суммы и названия.
          </p>
        </section>

        {/* Section 2: Company & Client Tags */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              2
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Базовые теги (Компании и Клиенты)</h2>
          </div>
          <p className="text-sm text-slate-600 mb-5">
            Система предоставляет автоматический доступ ко всем данным выбранной <b>Моей Компании</b> и <b>Клиента</b>:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Company Tags Card */}
            <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 text-indigo-900 font-bold text-sm">
                  <FileText size={18} className="text-indigo-600" />
                  <span>Для Компании-продавца (<code className="text-indigo-600 font-mono">company</code>):</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>Название компании:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ company.name }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>БИН / ИИН:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ company.bin_iin }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>Юридический адрес:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ company.address_legal }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>Фактический адрес:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ company.address_actual }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>Телефон / Email:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ company.phone }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>ФИО Руководителя:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ company.ceo_name }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>Должность (Директор):</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ company.ceo_title }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>Основание (Устав):</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ company.ceo_base }}`}</code>
                  </li>
                  <li className="pt-2 text-indigo-700 font-bold">Банковский счет:</li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>Банк:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ company.bank.bank_name }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>БИК:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ company.bank.bik }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1">
                    <span>ИИК (Счет):</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ company.bank.iik }}`}</code>
                  </li>
                </ul>
              </div>
            </div>

            {/* Client Tags Card */}
            <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 text-indigo-900 font-bold text-sm">
                  <FileText size={18} className="text-indigo-600" />
                  <span>Для Клиента-покупателя (<code className="text-indigo-600 font-mono">client</code>):</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>Название клиента:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ client.name }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>БИН / ИИН:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ client.bin_iin }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>Юридический адрес:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ client.address_legal }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>Фактический адрес:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ client.address_actual }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>Телефон / Email:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ client.phone }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>ФИО Руководителя:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ client.ceo_name }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>Должность:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ client.ceo_title }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>Основание:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ client.ceo_base }}`}</code>
                  </li>
                  <li className="pt-2 text-indigo-700 font-bold">Банковский счет:</li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>Банк:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ client.bank.bank_name }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span>БИК:</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ client.bank.bik }}`}</code>
                  </li>
                  <li className="flex justify-between items-center py-1">
                    <span>ИИК (Счет):</span>
                    <code className="bg-white px-2 py-0.5 rounded text-indigo-600 font-mono border border-slate-200">{`{{ client.bank.iik }}`}</code>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Stamps & Signatures */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              3
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Печати и Подписи</h2>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Вы можете загрузить сканы печати и факсимиле в разделе <b>Мои Компании</b>. Чтобы они вставились в ваш документ как картинка, используйте тег с процентом <code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200">{'{{%'}</code>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center gap-3">
              <ImageIcon className="text-indigo-600 shrink-0" size={20} />
              <div>
                <code className="bg-white px-2 py-0.5 rounded text-indigo-700 font-bold font-mono text-xs border border-indigo-100">{`{{%company.stamp}}`}</code>
                <p className="text-xs text-slate-500 mt-1">Вставит изображение синей печати компании</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center gap-3">
              <ImageIcon className="text-indigo-600 shrink-0" size={20} />
              <div>
                <code className="bg-white px-2 py-0.5 rounded text-indigo-700 font-bold font-mono text-xs border border-indigo-100">{`{{%company.signature}}`}</code>
                <p className="text-xs text-slate-500 mt-1">Вставит подпись руководителя</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            💡 <b>Совет:</b> Загружайте изображения формата PNG на прозрачном фоне. Базовый размер развертывания — 150x150 px.
          </p>
        </section>

        {/* Section 4: Custom & System Fields */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              4
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Кастомные поля и Системные теги</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <strong className="block text-slate-900 text-sm font-bold flex items-center gap-2">
                <Code size={16} className="text-indigo-600" /> Системные поля
              </strong>
              <div className="space-y-1 text-xs">
                <p><code className="bg-white px-1.5 py-0.5 rounded text-indigo-600 font-mono border">{`{{ doc_number }}`}</code> — Номер</p>
                <p><code className="bg-white px-1.5 py-0.5 rounded text-indigo-600 font-mono border">{`{{ doc_date }}`}</code> — Дата</p>
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <strong className="block text-slate-900 text-sm font-bold flex items-center gap-2">
                <Code size={16} className="text-indigo-600" /> Финансовые теги
              </strong>
              <div className="space-y-1 text-xs">
                <p><code className="bg-white px-1.5 py-0.5 rounded text-indigo-600 font-mono border">{`{{ deal.total_amount }}`}</code> — Итого</p>
                <p><code className="bg-white px-1.5 py-0.5 rounded text-indigo-600 font-mono border">{`{{ deal.discount_amount }}`}</code> — Скидка</p>
                <p><code className="bg-white px-1.5 py-0.5 rounded text-indigo-600 font-mono border">{`{{ deal.amount_without_tax }}`}</code> — Без НДС</p>
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <strong className="block text-slate-900 text-sm font-bold flex items-center gap-2">
                <Code size={16} className="text-indigo-600" /> Модификатор Даты
              </strong>
              <p className="text-xs text-slate-600">
                Превращение формата даты через пайп:
              </p>
              <code className="block bg-white p-1.5 rounded text-indigo-700 font-mono text-[11px] border border-slate-200 text-center">
                {`{{ doc_date | date:'dd.mm.yyyy' }}`}
              </code>
            </div>
          </div>
        </section>

        {/* Section 5: Specification Table */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              5
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Таблица товаров и услуг (Спецификация)</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Для создания динамической таблицы создайте в Word обычную таблицу и добавьте цикл <code className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded font-mono text-xs border border-indigo-100">{`{{#products}}`}</code> и <code className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded font-mono text-xs border border-indigo-100">{`{{/products}}`}</code>:
          </p>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 border border-slate-200 text-xs rounded-lg overflow-hidden bg-white">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="px-4 py-2 text-left border-r">№</th>
                  <th className="px-4 py-2 text-left border-r">Наименование</th>
                  <th className="px-4 py-2 text-left border-r">Ед. изм.</th>
                  <th className="px-4 py-2 text-left border-r">Кол-во</th>
                  <th className="px-4 py-2 text-left border-r">Цена</th>
                  <th className="px-4 py-2 text-left">Сумма</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                <tr className="bg-indigo-50/50">
                  <td className="px-4 py-2 text-indigo-700 font-bold">{`{{#products}}`}</td>
                  <td className="px-4 py-2">{`{{name}}`}</td>
                  <td className="px-4 py-2">{`{{unit}}`}</td>
                  <td className="px-4 py-2">{`{{quantity}}`}</td>
                  <td className="px-4 py-2">{`{{price}}`}</td>
                  <td className="px-4 py-2">{`{{total}}`}</td>
                </tr>
                <tr className="bg-indigo-50/50">
                  <td colSpan={6} className="px-4 py-2 text-indigo-700 font-bold">{`{{/products}}`}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
