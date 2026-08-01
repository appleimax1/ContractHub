import { FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDocumentGenerator } from './generator/useDocumentGenerator';
import { TemplateSelector } from './generator/TemplateSelector';
import { CounterpartySelector } from './generator/CounterpartySelector';
import { ProductSelector } from './generator/ProductSelector';
import { CustomFieldsForm } from './generator/CustomFieldsForm';
import { GenerationActions } from './generator/GenerationActions';

export default function GeneratorPage() {
  const { state, actions } = useDocumentGenerator();
  const { t } = useTranslation();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Bar Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-100 uppercase tracking-wider">
              {t('generator.badge')}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {t('generator.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('generator.description')}
          </p>
        </div>
        
        {/* Directory Picker Button */}
        <button
          onClick={actions.selectBaseDirectory}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-2xs ${
            state.baseDirectoryHandle 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/80' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
          }`}
          title={state.baseDirectoryHandle ? `${t('generator.folder_selected')}: ${state.baseDirectoryHandle.name}` : t('generator.folder_hint')}
        >
          <FolderOpen size={18} className={state.baseDirectoryHandle ? 'text-emerald-600' : 'text-slate-400'} />
          <span>
            {state.baseDirectoryHandle ? `${t('generator.folder')}: ${state.baseDirectoryHandle.name}` : t('generator.folder_select')}
          </span>
        </button>
      </div>

      {/* 3-Step Workflow Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Step 1 & 2: Main Form Area */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1 Card: Template & Parties */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-6 relative overflow-hidden">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                1
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {t('generator.step1')}
              </h2>
            </div>

            <TemplateSelector 
              templates={state.templates}
              selectedTemplateId={state.selectedTemplateId}
              handleSelectTemplate={actions.handleSelectTemplate}
              editingTemplateId={state.editingTemplateId}
              setEditingTemplateId={actions.setEditingTemplateId}
              editTemplateName={state.editTemplateName}
              setEditTemplateName={actions.setEditTemplateName}
              saveTemplateName={actions.saveTemplateName}
              handleFileUpload={actions.handleFileUpload}
              fileInputRef={state.fileInputRef}
              deleteTemplate={actions.deleteTemplate}
            />

            <CounterpartySelector 
              isDisabled={!state.selectedTemplateId}
              companies={state.companies}
              clients={state.clients}
              selectedCompanyId={state.selectedCompanyId}
              setSelectedCompanyId={actions.setSelectedCompanyId}
              selectedCompanyBankId={state.selectedCompanyBankId}
              setSelectedCompanyBankId={actions.setSelectedCompanyBankId}
              selectedClientId={state.selectedClientId}
              setSelectedClientId={actions.setSelectedClientId}
              selectedClientBankId={state.selectedClientBankId}
              setSelectedClientBankId={actions.setSelectedClientBankId}
            />
          </div>

          {/* Step 2 Card: Products & Deal calculation */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-6 relative overflow-hidden">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                2
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {t('generator.step2')}
              </h2>
            </div>

            <ProductSelector 
              isDisabled={!state.selectedTemplateId}
              catalog={state.catalog}
              selectedItems={state.selectedItems}
              setSelectedItems={actions.setSelectedItems}
              dealCurrency={state.dealCurrency}
              setDealCurrency={actions.setDealCurrency}
              taxRates={state.taxRates}
              selectedTaxRateId={state.selectedTaxRateId}
              setSelectedTaxRateId={actions.setSelectedTaxRateId}
              isTaxIncluded={state.isTaxIncluded}
              setIsTaxIncluded={actions.setIsTaxIncluded}
              discountType={state.discountType}
              setDiscountType={actions.setDiscountType}
              discountValue={state.discountValue}
              setDiscountValue={actions.setDiscountValue}
            />
          </div>

        </div>

        {/* Step 3: Fields & Final Export Area */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-6 sticky top-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                3
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {t('generator.step3')}
              </h2>
            </div>

            <CustomFieldsForm 
              isDisabled={!state.selectedTemplateId}
              customFields={state.customFields}
              numeratorsList={state.numeratorsList}
              docData={state.docData}
              setDocData={actions.setDocData}
              moneyData={state.moneyData}
              setMoneyData={actions.setMoneyData}
            />

            <div className="pt-4 border-t border-slate-100">
              <GenerationActions 
                isDisabled={!state.selectedTemplateId || !state.selectedCompanyId || !state.selectedClientId}
                isGenerating={state.isGenerating}
                generateAndDownloadDocx={actions.generateAndDownloadDocx}
                generateAndDownloadPdf={actions.generateAndDownloadPdf}
                generatePreview={actions.generatePreview}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
