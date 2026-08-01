import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db, { type DocumentStatus } from '../db/db';
import { Trash2, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HistoryPage() {
  const { t, i18n } = useTranslation();
  const history = useLiveQuery(() => db.document_history.reverse().toArray());
  const companies = useLiveQuery(() => db.my_companies.toArray());
  const clients = useLiveQuery(() => db.clients.toArray());

  const [filterCompany, setFilterCompany] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // wait for data
  if (!history || !companies || !clients) return <div className="p-8">{t('history.loading')}</div>;

  const filteredHistory = history.filter(doc => {
    if (filterCompany && doc.company_id.toString() !== filterCompany) return false;
    if (filterClient && doc.client_id.toString() !== filterClient) return false;
    if (filterStatus && doc.status !== filterStatus) return false;
    if (filterDate) {
       const docDate = new Date(doc.generated_at).toISOString().split('T')[0];
       if (docDate !== filterDate) return false;
    }
    return true;
  });

  const handleStatusChange = async (id: number, newStatus: DocumentStatus) => {
    await db.document_history.update(id, { status: newStatus });
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('history.actions.delete_confirm'))) {
      await db.document_history.delete(id);
    }
  };

  const getCompanyName = (id: number) => companies.find(c => c.id === id)?.name || t('history.table.unknown');
  const getClientName = (id: number) => clients.find(c => c.id === id)?.name || t('history.table.unknown');

  const handleDownload = (doc: typeof history[0]) => {
    if (!doc.file_data) {
      alert(t('history.actions.no_file'));
      return;
    }
    const ext = doc.file_type || 'docx';
    const mimeType = ext === 'pdf' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
    const blob = new Blob([doc.file_data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Construct filename
    const clientName = getClientName(doc.client_id);
    const dateStr = new Date(doc.generated_at).toISOString().split('T')[0];
    const fileName = `${clientName}_${doc.template_name}_${dateStr}.${ext}`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('history.title')}</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('history.filters.company')}</label>
          <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className="w-full border rounded p-2">
            <option value="">{t('history.filters.all_companies')}</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('history.filters.client')}</label>
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="w-full border rounded p-2">
            <option value="">{t('history.filters.all_clients')}</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('history.filters.status')}</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full border rounded p-2">
            <option value="">{t('history.filters.all_statuses')}</option>
            <option value="согласование">{t('history.statuses.согласование')}</option>
            <option value="доработка">{t('history.statuses.доработка')}</option>
            <option value="заключен">{t('history.statuses.заключен')}</option>
            <option value="отказ">{t('history.statuses.отказ')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('history.filters.date')}</label>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full border rounded p-2" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('history.table.date')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('history.table.template')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('history.table.company')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('history.table.client')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('history.table.status')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('history.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredHistory.map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(doc.generated_at).toLocaleString(
                    i18n.language === 'kk' ? 'kk-KZ' : i18n.language === 'en' ? 'en-US' : 'ru-RU'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.template_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getCompanyName(doc.company_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getClientName(doc.client_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select 
                    value={doc.status} 
                    onChange={e => handleStatusChange(doc.id!, e.target.value as DocumentStatus)}
                    className={`border rounded p-1 text-sm font-medium
                      ${doc.status === 'согласование' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                      ${doc.status === 'доработка' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                      ${doc.status === 'заключен' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      ${doc.status === 'отказ' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                    `}
                  >
                    <option value="согласование">{t('history.statuses.согласование')}</option>
                    <option value="доработка">{t('history.statuses.доработка')}</option>
                    <option value="заключен">{t('history.statuses.заключен')}</option>
                    <option value="отказ">{t('history.statuses.отказ')}</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {doc.file_data && (
                    <button onClick={() => handleDownload(doc)} className="text-blue-600 hover:text-blue-900 mr-4" title={t('history.actions.download')}>
                      <Download size={18} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(doc.id!)} className="text-red-600 hover:text-red-900" title={t('history.actions.delete')}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {t('history.table.no_records')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
