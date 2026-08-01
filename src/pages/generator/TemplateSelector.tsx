import { useTranslation } from 'react-i18next';
import React from 'react';
import { FileText, Edit2, Check, X, Calendar, Clock, Upload, Trash2 } from 'lucide-react';

interface Template {
  id?: number;
  name: string;
  file_data: ArrayBuffer;
  created_at: Date;
  last_used_at?: Date;
}

interface TemplateSelectorProps {
  templates: Template[] | undefined;
  selectedTemplateId: number | '';
  handleSelectTemplate: (t: Template) => void;
  editingTemplateId: number | null;
  setEditingTemplateId: (id: number | null) => void;
  editTemplateName: string;
  setEditTemplateName: (name: string) => void;
  saveTemplateName: (id: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  deleteTemplate: (id: number, e: React.MouseEvent) => void;
}

export function TemplateSelector({
  templates,
  selectedTemplateId,
  handleSelectTemplate,
  editingTemplateId,
  setEditingTemplateId,
  editTemplateName,
  setEditTemplateName,
  saveTemplateName,
  handleFileUpload,
  fileInputRef,
  deleteTemplate
}: TemplateSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText className="text-blue-500" /> 1. {t('generator.template')}
      </h2>
      
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
        {templates && templates.length > 0 ? (
          templates.map((template) => (
            <div 
              key={template.id} 
              className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                selectedTemplateId === template.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              {editingTemplateId === template.id ? (
                <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={editTemplateName}
                      onChange={(e) => setEditTemplateName(e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                      autoFocus
                    />
                    <button onClick={() => saveTemplateName(template.id!)} className="p-1 text-green-600 hover:bg-green-100 rounded">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingTemplateId(null)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-800 flex items-center gap-2">
                      {template.name}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTemplateId(template.id!);
                          setEditTemplateName(template.name);
                        }}
                        className="text-gray-400 hover:text-blue-600 p-1 rounded"
                        title="Переименовать"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={(e) => deleteTemplate(template.id!, e)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded"
                        title="Удалить шаблон"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> Добавлен: {template.created_at.toLocaleDateString('ru-RU')}
                      </span>
                      {template.last_used_at && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> Исп: {template.last_used_at.toLocaleDateString('ru-RU')} {template.last_used_at.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedTemplateId === template.id && (
                    <div className="bg-blue-500 text-white rounded-full p-1 mt-1">
                      <Check size={16} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">Нет сохраненных шаблонов.</p>
        )}
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <Upload className="text-gray-400 mb-2" size={24} />
        <p className="text-sm font-medium text-gray-600">{t('generator.upload_template')}</p>
        <input 
          type="file" 
          accept=".docx" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
        />
      </div>
    </div>
  );
}
