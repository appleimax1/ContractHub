import { useTranslation } from 'react-i18next';
import type { MyCompany, Client } from '../../db/db';

interface CounterpartySelectorProps {
  isDisabled: boolean;
  companies: MyCompany[] | undefined;
  clients: Client[] | undefined;
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  selectedCompanyBankId: string;
  setSelectedCompanyBankId: (id: string) => void;
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  selectedClientBankId: string;
  setSelectedClientBankId: (id: string) => void;
}

export function CounterpartySelector({
  isDisabled,
  companies,
  clients,
  selectedCompanyId,
  setSelectedCompanyId,
  selectedCompanyBankId,
  setSelectedCompanyBankId,
  selectedClientId,
  setSelectedClientId,
  selectedClientBankId,
  setSelectedClientBankId
}: CounterpartySelectorProps) {
  const { t } = useTranslation();

  
  const activeCompany = companies?.find(c => c.id === Number(selectedCompanyId));
  const activeClient = clients?.find(c => c.id === Number(selectedClientId));

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <h2 className="text-lg font-semibold mb-4">2. Выберите Контрагентов</h2>
      <div className="space-y-4">
        
        {/* Company Selection */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">Моя Компания</label>
          <select 
            value={selectedCompanyId}
            onChange={e => setSelectedCompanyId(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 bg-white text-black mb-3"
          >
            <option value="">Выберите компанию...</option>
            {companies?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          
          {activeCompany && activeCompany.bank_accounts && activeCompany.bank_accounts.length > 0 && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">Банковский счет компании</label>
              <select 
                value={selectedCompanyBankId}
                onChange={e => setSelectedCompanyBankId(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 bg-white text-black text-sm"
              >
                {activeCompany.bank_accounts.map(b => (
                  <option key={b.id} value={b.id}>{b.alias || b.bank_name} ({b.iik})</option>
                ))}
              </select>
            </>
          )}
        </div>
        
        {/* Client Selection */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("generator.client")}</label>
          <select 
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 bg-white text-black mb-3"
          >
            <option value="">Выберите клиента...</option>
            {clients?.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.bin_iin})</option>
            ))}
          </select>
          
          {activeClient && activeClient.bank_accounts && activeClient.bank_accounts.length > 0 && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">Банковский счет клиента</label>
              <select 
                value={selectedClientBankId}
                onChange={e => setSelectedClientBankId(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 bg-white text-black text-sm"
              >
                {activeClient.bank_accounts.map(b => (
                  <option key={b.id} value={b.id}>{b.alias || b.bank_name} ({b.iik})</option>
                ))}
              </select>
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}
