import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Download, Loader2, Eye, X } from 'lucide-react';

interface GenerationActionsProps {
  isDisabled: boolean;
  isGenerating: boolean;
  generateAndDownloadDocx: () => void;
  generateAndDownloadPdf: () => void;
  generatePreview: () => Promise<string | null>;
}

export function GenerationActions({
  isDisabled,
  isGenerating,
  generateAndDownloadDocx,
  generateAndDownloadPdf,
  generatePreview
}: GenerationActionsProps) {
  const { t } = useTranslation();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const handlePreview = async () => {
    setIsLoadingPreview(true);
    const html = await generatePreview();
    if (html) {
      setPreviewHtml(html);
      setIsPreviewOpen(true);
    }
    setIsLoadingPreview(false);
  };

  return (
    <div className={`bg-blue-50 p-6 rounded-lg border border-blue-200 mt-6 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <h3 className="font-semibold text-blue-900 mb-4">{t("generator.ready_to_generate")}</h3>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <button
          onClick={handlePreview}
          disabled={isGenerating || isLoadingPreview}
          className="flex-1 flex items-center justify-center space-x-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 font-medium shadow-sm transition-colors"
        >
          {isLoadingPreview ? <Loader2 className="animate-spin" size={20} /> : <Eye size={20} />}
          <span>{t("generator.preview")}</span>
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={generateAndDownloadDocx}
          disabled={isGenerating}
          className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium shadow-sm transition-colors"
        >
          <Download size={20} />
          <span>{t("generator.download_docx")}</span>
        </button>
        <button
          onClick={generateAndDownloadPdf}
          disabled={isGenerating}
          className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-red-400 font-medium shadow-sm transition-colors"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
          <span>{isGenerating ? 'Создание PDF...' : 'Скачать .pdf'}</span>
        </button>
      </div>

      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">{t("generator.preview_title")}</h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-8 bg-gray-100 relative">
              {previewHtml && (
                <div 
                  className="bg-white shadow-sm border border-gray-300 mx-auto max-w-[210mm] min-h-[297mm] p-12"
                  dangerouslySetInnerHTML={{ __html: previewHtml }} 
                />
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsPreviewOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
