import { useTranslation } from 'react-i18next';
import { useState, useRef } from 'react';
import { Download, Upload, Trash2, AlertTriangle, Sparkles } from 'lucide-react';
import { exportDB, importInto } from 'dexie-export-import';
import db from '../db/db';
import { seedDemoData } from '../db/seed';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { t } = useTranslation();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Экспорт базы данных...');
    try {
      const blob = await exportDB(db, { prettyJson: true });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contracthub-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('База данных успешно экспортирована', { id: toastId });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Ошибка при экспорте базы данных', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(t('settings.export_import.import_warning'))) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading('Импорт базы данных...');
    try {
      await db.delete();
      await db.open(); // open again before import
      await importInto(db, file, {
        overwriteValues: true,
        clearTablesBeforeImport: true
      });
      toast.success('База данных успешно импортирована', { id: toastId });
      setTimeout(() => {
        window.location.reload(); // Reload to reflect changes across all states
      }, 1000);
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Ошибка при импорте базы данных', { id: toastId });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearData = async () => {
    if (confirm(t('common.confirm_delete'))) {
      const confirmation = prompt(t('settings.danger.prompt_msg'));
      if (confirmation === 'УДАЛИТЬ' || confirmation === 'DELETE') {
        setIsClearing(true);
        const toastId = toast.loading('Удаление данных...');
        try {
          await db.delete();
          toast.success('Все данные удалены', { id: toastId });
          setTimeout(() => {
            window.location.href = '/'; // Reload to home
          }, 1000);
        } catch (error) {
          console.error('Clear failed:', error);
          toast.error('Ошибка при удалении данных');
          setIsClearing(false);
        }
      } else {
        toast.error('Неверное слово подтверждения');
      }
    }
  };
  const handleLoadDemoData = async () => {
    if (confirm(t('settings.demo.load_warning'))) {
      setIsSeeding(true);
      const toastId = toast.loading('Загрузка тестовых данных...');
      try {
        await seedDemoData(true);
        toast.success('Демо-данные успешно загружены!', { id: toastId });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Seed failed:', error);
        toast.error('Ошибка при загрузке демо-данных', { id: toastId });
        setIsSeeding(false);
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('settings.title')}</h1>
      
      <div className="space-y-6">
        
        {/* Export / Import Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">{t('settings.export_import.title')}</h2>
          <p className="text-sm text-gray-600 mb-6">
            {t('settings.export_import.export_desc')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">{t('settings.export_import.export_btn')}</h3>
              <p className="text-xs text-blue-700 mb-4 h-8">{t('settings.export_import.export_desc')}</p>
              <button 
                onClick={handleExport}
                disabled={isExporting || isImporting || isClearing}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Download size={18} />
                <span>{isExporting ? 'Экспорт...' : t('settings.export_import.export_btn')}</span>
              </button>
            </div>

            <div className="p-4 border border-green-100 bg-green-50/30 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">{t('settings.export_import.import_btn')}</h3>
              <p className="text-xs text-green-700 mb-4 h-8">{t('settings.export_import.import_desc')}</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isExporting || isImporting || isClearing}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Upload size={18} />
                <span>{isImporting ? 'Импорт...' : t('settings.export_import.import_btn')}</span>
              </button>
              <input 
                type="file" 
                accept=".json"
                ref={fileInputRef}
                onChange={handleImport}
                className="hidden" 
              />
            </div>
          </div>
        </section>

        {/* Demo Data Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-2 text-indigo-900 flex items-center gap-2">
            <Sparkles size={22} className="text-indigo-600" />
            Тестовый набор данных (Demo Data)
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            {t('settings.demo.load_desc')}
          </p>
          <button 
            onClick={handleLoadDemoData}
            disabled={isExporting || isImporting || isClearing || isSeeding}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 font-semibold text-sm disabled:opacity-50 transition-all shadow-sm"
          >
            <Sparkles size={18} />
            <span>{isSeeding ? 'Загрузка...' : t('settings.demo.load_btn')}</span>
          </button>
        </section>

        {/* Danger Zone Section */}
        <section className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold mb-2 text-red-700 flex items-center gap-2">
            <AlertTriangle size={24} />
            {t('settings.danger.title')}
          </h2>
          <p className="text-sm text-red-600 mb-6">
            {t('settings.danger.clear_desc')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-lg border border-red-100">
            <div>
              <h3 className="font-medium text-gray-900">{t('settings.danger.clear_btn')}</h3>
              <p className="text-sm text-gray-500">{t('settings.danger.clear_desc')}</p>
            </div>
            <button 
              onClick={handleClearData}
              disabled={isExporting || isImporting || isClearing}
              className="mt-4 sm:mt-0 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 size={18} />
              <span>{t('settings.danger.clear_btn')}</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
