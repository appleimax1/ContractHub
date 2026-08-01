import { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../../db/db';
import { TemplateEngine } from '../../engine/TemplateEngine';
import { numberToWordsRu } from '../../utils/numberToWords';
import type { SelectedItem } from './ProductSelector';
// @ts-ignore
import mammoth from 'mammoth';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';

export function useDocumentGenerator() {
  const companies = useLiveQuery(() => db.my_companies.toArray());
  const clients = useLiveQuery(() => db.clients.toArray());
  const customFields = useLiveQuery(() => db.custom_fields.toArray());
  const numeratorsList = useLiveQuery(() => db.numerators.toArray());
  const catalog = useLiveQuery(() => db.catalog.toArray());
  const templates = useLiveQuery(() => db.templates.orderBy('created_at').reverse().toArray());
  const taxRates = useLiveQuery(() => db.tax_rates.toArray());

  const [baseDirectoryHandle, setBaseDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('');
  const [templateBuffer, setTemplateBuffer] = useState<ArrayBuffer | null>(null);
  
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [editTemplateName, setEditTemplateName] = useState('');

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  
  const [selectedCompanyBankId, setSelectedCompanyBankId] = useState<string>('');
  const [selectedClientBankId, setSelectedClientBankId] = useState<string>('');
  
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  
  const [docData, setDocData] = useState<Record<string, string>>({
    doc_date: new Date().toISOString().split('T')[0]
  });
  const [moneyData, setMoneyData] = useState<Record<string, { amount: string, currency: string, format: 'words'|'numbers' }>>({});
  const [dealCurrency, setDealCurrency] = useState<'KZT' | 'RUB' | 'USD'>('KZT');
  
  const [selectedTaxRateId, setSelectedTaxRateId] = useState<string>('');
  const [isTaxIncluded, setIsTaxIncluded] = useState<boolean>(true);

  const [discountType, setDiscountType] = useState<'none'|'percent'|'amount'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);

  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedCompanyId && companies) {
      const comp = companies.find(c => c.id === Number(selectedCompanyId));
      if (comp && comp.bank_accounts && comp.bank_accounts.length > 0) {
        setSelectedCompanyBankId(comp.bank_accounts[0].id);
      } else {
        setSelectedCompanyBankId('');
      }
    }
  }, [selectedCompanyId, companies]);

  useEffect(() => {
    if (selectedClientId && clients) {
      const cli = clients.find(c => c.id === Number(selectedClientId));
      if (cli && cli.bank_accounts && cli.bank_accounts.length > 0) {
        setSelectedClientBankId(cli.bank_accounts[0].id);
      } else {
        setSelectedClientBankId('');
      }
    }
  }, [selectedClientId, clients]);

  const selectBaseDirectory = async () => {
    try {
      if (typeof (window as any).showDirectoryPicker === 'undefined') {
        alert('К сожалению, ваш браузер блокирует прямой доступ к папкам компьютера (File System Access API). Либо вы открыли сайт не через localhost.\n\nФайлы будут скачиваться стандартным способом в папку "Загрузки".');
        return;
      }
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      setBaseDirectoryHandle(handle);
      toast.success(`Выбрана папка: ${handle.name}`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error(`Ошибка доступа к папке: ${err.message}`);
      }
    }
  };

  const saveToLocalDirectory = async (handle: any, pathSegments: string[], filename: string, blob: Blob) => {
    try {
      let currentHandle = handle;
      for (const segment of pathSegments) {
        const safeSegment = segment.replace(/[\/\\]/g, '_').trim() || 'Folder';
        currentHandle = await currentHandle.getDirectoryHandle(safeSegment, { create: true });
      }
      const fileHandle = await currentHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err) {
      console.error('Failed to save to local directory:', err);
      return false;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        try {
          const newId = await db.templates.add({
            name: file.name,
            file_data: buffer,
            created_at: new Date()
          });
          setSelectedTemplateId(newId as number);
          setTemplateBuffer(buffer);
          toast.success('Шаблон успешно загружен');

          if (baseDirectoryHandle) {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            await saveToLocalDirectory(baseDirectoryHandle, ['Шаблоны нашей компании'], file.name, blob);
          }
        } catch (error) {
          console.error('Error saving template:', error);
          toast.error('Ошибка при сохранении шаблона');
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplateId(template.id);
    setTemplateBuffer(template.file_data);
  };

  const saveTemplateName = async (id: number) => {
    if (editTemplateName.trim()) {
      await db.templates.update(id, { name: editTemplateName.trim() });
      toast.success('Шаблон переименован');
    }
    setEditingTemplateId(null);
  };

  const deleteTemplate = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить этот шаблон?')) {
      await db.templates.delete(id);
      if (selectedTemplateId === id) {
        setSelectedTemplateId('');
        setTemplateBuffer(null);
      }
      toast.success('Шаблон удален');
    }
  };

  const validateBeforeGeneration = () => {
    if (!selectedCompanyId) {
      toast.error('Выберите вашу компанию');
      return false;
    }
    if (!selectedClientId) {
      toast.error('Выберите клиента');
      return false;
    }
    return true;
  };

  const preparePayload = async () => {
    const company = companies?.find(c => c.id === Number(selectedCompanyId));
    const client = clients?.find(c => c.id === Number(selectedClientId));
    
    const finalDocData = { ...docData };
    const usedNumerators: { id: number, nextCount: number }[] = [];

    // Process doc_number system field (Numerator)
    const sysNumId = Number(docData['doc_number']);
    if (sysNumId) {
      const num = await db.numerators.get(sysNumId);
      if (num) {
        finalDocData['doc_number'] = `${num.prefix || ''}${num.current_counter}${num.suffix || ''}`;
        usedNumerators.push({ id: sysNumId, nextCount: num.current_counter + 1 });
      }
    }

    // Process custom fields
    if (customFields) {
      for (const field of customFields) {
        if (field.type === 'numerator') {
          const numId = Number(docData[field.key]);
          if (numId) {
            const num = await db.numerators.get(numId);
            if (num) {
              finalDocData[field.key] = `${num.prefix || ''}${num.current_counter}${num.suffix || ''}`;
              usedNumerators.push({ id: numId, nextCount: num.current_counter + 1 });
            }
          }
        }
        if (field.type === 'money') {
          const mData = moneyData[field.key] || { amount: '', currency: 'KZT', format: 'numbers' };
          const amount = parseFloat(mData.amount) || 0;
          if (mData.format === 'words') {
            finalDocData[field.key] = numberToWordsRu(amount, mData.currency);
          } else {
            finalDocData[field.key] = `${amount} ${mData.currency}`;
          }
        }
        if (field.type === 'number') {
          const numValue = Number(docData[field.key]) || 0;
          finalDocData[field.key] = new Intl.NumberFormat('ru-RU').format(numValue);
        }
        if (field.type === 'list' && field.list_is_multiple) {
          if (Array.isArray(finalDocData[field.key])) {
            finalDocData[field.key] = (finalDocData[field.key] as unknown as string[]).join(', ');
          }
        }
      }
    }

    const companyBank = company?.bank_accounts?.find(b => b.id === selectedCompanyBankId) || {};
    const clientBank = client?.bank_accounts?.find(b => b.id === selectedClientBankId) || {};

    const productsList = selectedItems
      .map(item => {
        const prod = catalog?.find(p => p.id === Number(item.productId));
        if (!prod) return null;
        return {
          name: prod.name,
          unit: prod.unit,
          price: prod.price,
          quantity: item.quantity,
          total: prod.price * item.quantity
        };
      })
      .filter(Boolean);

    let productData = {};
    let dealData: any = { 
      total_amount: '', 
      amount_without_tax: '', 
      tax_amount: '', 
      discount_amount: '' 
    };
    
    const currencySign = dealCurrency === 'KZT' ? '₸' : dealCurrency === 'RUB' ? '₽' : '$';

    if (productsList.length > 0) {
      productData = {
        name: productsList.map(p => p!.name).join(', '),
        unit: productsList.map(p => p!.unit).join(', '),
        price: productsList.map(p => `${new Intl.NumberFormat('ru-RU').format(p!.price)} ${currencySign}`).join(', '),
        quantity: productsList.map(p => p!.quantity).join(', ')
      };

      const itemsTotal = productsList.reduce((sum, p) => sum + p!.total, 0);
      
      let actualDiscount = 0;
      if (discountType === 'percent') {
        actualDiscount = itemsTotal * (discountValue / 100);
      } else if (discountType === 'amount') {
        actualDiscount = discountValue;
      }
      
      const discountedTotal = Math.max(0, itemsTotal - actualDiscount);

      let taxAmount = 0;
      let withoutTaxAmount = discountedTotal;
      let finalTotal = discountedTotal;

      const taxRateObj = taxRates?.find(t => t.id === Number(selectedTaxRateId));
      if (taxRateObj) {
        const rate = taxRateObj.rate / 100;
        if (isTaxIncluded) {
          // Tax is already included in the total: extract it using back-calculation
          taxAmount = discountedTotal - (discountedTotal / (1 + rate));
          withoutTaxAmount = discountedTotal - taxAmount;
          finalTotal = discountedTotal;
        } else {
          withoutTaxAmount = discountedTotal;
          taxAmount = discountedTotal * rate;
          finalTotal = discountedTotal + taxAmount;
        }
      }

      dealData = {
        total_amount: `${new Intl.NumberFormat('ru-RU').format(finalTotal)} ${currencySign}`,
        amount_without_tax: `${new Intl.NumberFormat('ru-RU').format(withoutTaxAmount)} ${currencySign}`,
        tax_amount: `${new Intl.NumberFormat('ru-RU').format(taxAmount)} ${currencySign}`,
        discount_amount: `${new Intl.NumberFormat('ru-RU').format(actualDiscount)} ${currencySign}`
      };
    }

    const payload = {
      ...finalDocData,
      company: {
        ...company,
        bank: companyBank,
        stamp: company?.stamp_image || '',
        signature: company?.signature_image || ''
      },
      client: {
        ...client,
        bank: clientBank
      },
      product: productData,
      products: productsList,
      deal: dealData
    };
    
    return { payload: payload as any, usedNumerators };
  };

  const commitNumerators = async (usedNumerators: { id: number, nextCount: number }[]) => {
    for (const num of usedNumerators) {
      await db.numerators.update(num.id, { current_counter: num.nextCount });
    }
  };

  const saveHistoryRecord = async (payload: any, fileData?: ArrayBuffer, fileType?: 'docx'|'pdf') => {
    if (!selectedCompanyId || !selectedClientId) return;
    const template = templates?.find(t => t.id === selectedTemplateId);
    try {
      await db.document_history.add({
        client_id: Number(selectedClientId),
        company_id: Number(selectedCompanyId),
        template_name: template?.name || 'Unknown Template',
        generated_at: new Date(),
        payload: payload,
        status: 'согласование',
        file_data: fileData,
        file_type: fileType
      });
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  };

  const handleStockDeduction = async () => {
    for (const item of selectedItems) {
      if (!item.productId) continue;
      const prod = catalog?.find(p => p.id === Number(item.productId));
      if (prod && prod.type === 'product' && prod.track_stock) {
        const newStock = Math.max(0, prod.stock_quantity - item.quantity);
        await db.catalog.update(prod.id!, { stock_quantity: newStock });
      }
    }
  };

  const updateTemplateLastUsed = async () => {
    if (selectedTemplateId) {
      await db.templates.update(Number(selectedTemplateId), { last_used_at: new Date() });
    }
  };

  const generateAndDownloadDocx = async () => {
    if (!templateBuffer || !validateBeforeGeneration()) return;
    try {
      const engine = new TemplateEngine(templateBuffer);
      const { payload, usedNumerators } = await preparePayload();
      const blob = engine.render(payload);
      
      const templateName = templates?.find(t => t.id === selectedTemplateId)?.name.replace(/\.docx$/i, '') || 'Документ';
      const docNumber = payload.doc_number ? ` №${payload.doc_number}` : '';
      const fileName = `${templateName}${docNumber}.docx`;

      const clientName = clients?.find(c => c.id === Number(selectedClientId))?.name || 'Неизвестный клиент';
      const numId = Number(docData['doc_number']);
      const docTypeName = numId ? (numeratorsList?.find(n => n.id === numId)?.name || 'Документ') : 'Без типа';

      let savedLocally = false;
      if (baseDirectoryHandle) {
        savedLocally = await saveToLocalDirectory(baseDirectoryHandle, [clientName, docTypeName], fileName, blob);
      }

      if (!savedLocally) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      // All side effects happen ONLY after successful render
      await commitNumerators(usedNumerators);
      await handleStockDeduction();
      await updateTemplateLastUsed();
      
      const fileBuffer = await blob.arrayBuffer();
      await saveHistoryRecord(payload, fileBuffer, 'docx');

      toast.success('Документ (DOCX) успешно сгенерирован и сохранен!');
    } catch (error: any) {
      console.error('Docx generation failed:', error);
      toast.error(`Ошибка генерации: ${error?.message || error}`);
    }
  };

  const generateAndDownloadPdf = async () => {
    if (!templateBuffer || !validateBeforeGeneration()) return;
    setIsGenerating(true);
    const toastId = toast.loading('Генерация PDF...');

    try {
      const engine = new TemplateEngine(templateBuffer);
      const { payload, usedNumerators } = await preparePayload();
      const docxBlob = engine.render(payload);
      const arrayBuffer = await docxBlob.arrayBuffer();
      
      const options = {
        transformDocument: (mammoth as any).transforms.paragraph((paragraph: any) => {
          if (paragraph.alignment === 'center' && !paragraph.styleName) return { ...paragraph, styleName: 'Alignment Center' };
          if (paragraph.alignment === 'right' && !paragraph.styleName) return { ...paragraph, styleName: 'Alignment Right' };
          if (paragraph.alignment === 'both' && !paragraph.styleName) return { ...paragraph, styleName: 'Alignment Justify' };
          return paragraph;
        }),
        styleMap: [
          "p[style-name='Alignment Center'] => p.center:fresh",
          "p[style-name='Alignment Right'] => p.right:fresh",
          "p[style-name='Alignment Justify'] => p.justify:fresh",
          "p[style-name='Center'] => p.center:fresh",
          "p[style-name='Right'] => p.right:fresh",
          "p[style-name='Justify'] => p.justify:fresh"
        ]
      };
      const result = await mammoth.convertToHtml({ arrayBuffer }, options);
      const html = result.value;

      const container = document.createElement('div');
      container.style.padding = "20px";
      container.style.fontFamily = "'Times New Roman', serif";
      container.style.fontSize = "12pt";
      container.style.color = "#000";
      container.style.background = "#fff";
      container.style.whiteSpace = "pre-wrap";
      container.style.lineHeight = "1.5";
      container.innerHTML = html;

      // Apply all formatting as inline styles to guarantee html2canvas picks them up
      container.querySelectorAll('*').forEach(el => {
        (el as HTMLElement).style.boxSizing = 'border-box';
      });
      container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
        (el as HTMLElement).style.fontSize = 'inherit';
        (el as HTMLElement).style.fontWeight = 'bold';
        (el as HTMLElement).style.marginTop = '16px';
        (el as HTMLElement).style.marginBottom = '8px';
      });
      container.querySelectorAll('p').forEach(el => {
        (el as HTMLElement).style.marginTop = '0';
        (el as HTMLElement).style.marginBottom = '8px';
        (el as HTMLElement).style.minHeight = '1em';
      });
      container.querySelectorAll('table').forEach(el => {
        (el as HTMLElement).style.width = '100%';
        (el as HTMLElement).style.borderCollapse = 'collapse';
        (el as HTMLElement).style.margin = '15px 0';
      });
      container.querySelectorAll('th, td').forEach(el => {
        (el as HTMLElement).style.border = '1px solid #000';
        (el as HTMLElement).style.padding = '8px';
        (el as HTMLElement).style.textAlign = 'left';
        (el as HTMLElement).style.verticalAlign = 'top';
      });
      container.querySelectorAll('p.center, .center').forEach(el => {
        (el as HTMLElement).style.setProperty('text-align', 'center', 'important');
      });
      container.querySelectorAll('p.right, .right').forEach(el => {
        (el as HTMLElement).style.setProperty('text-align', 'right', 'important');
      });
      container.querySelectorAll('p.justify, .justify').forEach(el => {
        (el as HTMLElement).style.setProperty('text-align', 'justify', 'important');
      });
      container.querySelectorAll('img').forEach(el => {
        (el as HTMLElement).style.maxWidth = '100%';
        (el as HTMLElement).style.height = 'auto';
      });
      container.querySelectorAll('strong, b').forEach(el => {
        (el as HTMLElement).style.fontWeight = 'bold';
      });
      container.querySelectorAll('em, i').forEach(el => {
        (el as HTMLElement).style.fontStyle = 'italic';
      });

      const pdfContentHtml = container.outerHTML;

      const templateName = templates?.find(t => t.id === selectedTemplateId)?.name.replace(/\.docx$/i, '') || 'Документ';
      const docNumber = payload.doc_number ? ` №${payload.doc_number}` : '';
      const fileName = `${templateName}${docNumber}.pdf`;

      const opt = {
        margin:       10,
        filename:     fileName,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  {
          scale: 2,
          useCORS: true,
          onclone: (clonedDoc: Document) => {
            clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => el.remove());
          }
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' | 'landscape' }
      };

      const pdfBlob = await html2pdf().set(opt).from(pdfContentHtml).output('blob');
      
      const clientName = clients?.find(c => c.id === Number(selectedClientId))?.name || 'Неизвестный клиент';
      const numId = Number(docData['doc_number']);
      const docTypeName = numId ? (numeratorsList?.find(n => n.id === numId)?.name || 'Документ') : 'Без типа';

      let savedLocally = false;
      if (baseDirectoryHandle) {
        savedLocally = await saveToLocalDirectory(baseDirectoryHandle, [clientName, docTypeName], fileName, pdfBlob);
      }

      if (!savedLocally) {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }

      await commitNumerators(usedNumerators);
      await handleStockDeduction();
      await updateTemplateLastUsed();
      
      const fileBuffer = await pdfBlob.arrayBuffer();
      await saveHistoryRecord(payload, fileBuffer, 'pdf');

      toast.success('PDF успешно сгенерирован', { id: toastId });
    } catch (error: any) {
      console.error('PDF generation failed:', error);
      toast.error(`Ошибка генерации PDF: ${error?.message || error}`, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };


  const generatePreview = async (): Promise<string | null> => {
    if (!templateBuffer || !validateBeforeGeneration()) return null;
    setIsGenerating(true);
    try {
      const engine = new TemplateEngine(templateBuffer);
      const { payload } = await preparePayload(); // Do not commit numerators
      const docxBlob = engine.render(payload);
      const arrayBuffer = await docxBlob.arrayBuffer();
      
      const options = {
        transformDocument: (mammoth as any).transforms.paragraph((paragraph: any) => {
          if (paragraph.alignment === 'center' && !paragraph.styleName) return { ...paragraph, styleName: 'Alignment Center' };
          if (paragraph.alignment === 'right' && !paragraph.styleName) return { ...paragraph, styleName: 'Alignment Right' };
          if (paragraph.alignment === 'both' && !paragraph.styleName) return { ...paragraph, styleName: 'Alignment Justify' };
          return paragraph;
        }),
        styleMap: [
          "p[style-name='Alignment Center'] => p.center:fresh",
          "p[style-name='Alignment Right'] => p.right:fresh",
          "p[style-name='Alignment Justify'] => p.justify:fresh",
          "p[style-name='Center'] => p.center:fresh",
          "p[style-name='Right'] => p.right:fresh",
          "p[style-name='Justify'] => p.justify:fresh"
        ]
      };
      const result = await mammoth.convertToHtml({ arrayBuffer }, options);
      let html = result.value;
      
      html = `
        <style>
          .preview-container table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .preview-container th, .preview-container td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .preview-container p.center { text-align: center !important; }
          .preview-container p.right { text-align: right !important; }
          .preview-container p.justify { text-align: justify !important; }
        </style>
        <div class="preview-container" style="font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; background: #fff; padding: 20px; white-space: pre-wrap;">
          ${html}
        </div>
      `;
      return html;
    } catch (error: any) {
      console.error('Preview generation failed:', error);
      toast.error(`Ошибка генерации предпросмотра: ${error?.message || error}`);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };
  return {
    state: {
      companies, clients, customFields, numeratorsList, catalog, templates, taxRates,
      baseDirectoryHandle, selectedTemplateId, editingTemplateId, editTemplateName,
      selectedCompanyId, selectedClientId, selectedCompanyBankId, selectedClientBankId,
      selectedItems, docData, moneyData, isGenerating, fileInputRef, dealCurrency,
      selectedTaxRateId, isTaxIncluded, discountType, discountValue
    },
    actions: {
      setEditTemplateName, setEditingTemplateId, handleSelectTemplate, saveTemplateName,
      handleFileUpload, deleteTemplate, selectBaseDirectory,
      setSelectedCompanyId, setSelectedClientId, setSelectedCompanyBankId, setSelectedClientBankId,
      setSelectedItems, setDocData, setMoneyData,
      generateAndDownloadDocx, generateAndDownloadPdf,
      generatePreview, setDealCurrency, setSelectedTaxRateId, setIsTaxIncluded,
      setDiscountType, setDiscountValue
    }
  };
}
