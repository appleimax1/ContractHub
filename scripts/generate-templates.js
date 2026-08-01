import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
  WidthType, AlignmentType, BorderStyle, HeadingLevel 
} from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, '../public/templates');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
};

// 1. GENERATE INVOICE TEMPLATE (Счет на оплату)
async function generateInvoice() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "СЧЕТ НА ОПЛАТУ № {{ doc_number }}",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Дата документа: ", bold: true }),
            new TextRun("{{ doc_date }}")
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        }),

        // Parties Info Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ text: "ПОСТАВЩИК:", bold: true }),
                    new Paragraph({ text: "{{ company.name }}" }),
                    new Paragraph({ text: "БИН/ИИН: {{ company.bin_iin }}" }),
                    new Paragraph({ text: "Адрес: {{ company.address_actual }}" }),
                    new Paragraph({ text: "Тел: {{ company.phone }}" }),
                    new Paragraph({ text: "Банк: {{ company.bank.bank_name }}" }),
                    new Paragraph({ text: "ИИК: {{ company.bank.iik }}" }),
                    new Paragraph({ text: "БИК: {{ company.bank.bik }}" })
                  ]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ text: "ПОКУПАТЕЛЬ:", bold: true }),
                    new Paragraph({ text: "{{ client.name }}" }),
                    new Paragraph({ text: "БИН/ИИН: {{ client.bin_iin }}" }),
                    new Paragraph({ text: "Адрес: {{ client.address_actual }}" }),
                    new Paragraph({ text: "Тел: {{ client.phone }}" }),
                    new Paragraph({ text: "Банк: {{ client.bank.bank_name }}" }),
                    new Paragraph({ text: "ИИК: {{ client.bank.iik }}" }),
                    new Paragraph({ text: "БИК: {{ client.bank.bik }}" })
                  ]
                })
              ]
            })
          ]
        }),

        new Paragraph({ text: "", spacing: { after: 240 } }),

        // Products Loop Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "№", bold: true })] }),
                new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Наименование товаров/услуг", bold: true })] }),
                new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Ед. изм.", bold: true })] }),
                new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Кол-во", bold: true })] }),
                new TableCell({ width: { size: 13, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Цена", bold: true })] }),
                new TableCell({ width: { size: 13, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Сумма", bold: true })] }),
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "{{#products}}" })] }),
                new TableCell({ children: [new Paragraph({ text: "{{name}}" })] }),
                new TableCell({ children: [new Paragraph({ text: "{{unit}}" })] }),
                new TableCell({ children: [new Paragraph({ text: "{{quantity}}" })] }),
                new TableCell({ children: [new Paragraph({ text: "{{price}}" })] }),
                new TableCell({ children: [new Paragraph({ text: "{{total}}" })] }),
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ columnSpan: 6, children: [new Paragraph({ text: "{{/products}}" })] })
              ]
            })
          ]
        }),

        new Paragraph({ text: "", spacing: { after: 200 } }),

        new Paragraph({
          children: [
            new TextRun({ text: "Итого к оплате: ", bold: true, size: 28 }),
            new TextRun({ text: "{{ deal.total_amount }}", bold: true, size: 28 })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 360 }
        }),

        // Signatures Block
        new Paragraph({
          children: [
            new TextRun({ text: "Руководитель: {{ company.ceo_name }}                     ", bold: true }),
            new TextRun({ text: "Подпись: ", bold: true }),
            new TextRun({ text: "{%company.signature%}" }),
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Печать компании: ", bold: true }),
            new TextRun({ text: "{%company.stamp%}" }),
          ]
        })
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outDir, 'Счет на оплату.docx'), buffer);
  console.log('Generated Invoice template');
}

// 2. GENERATE AVR TEMPLATE (Акт выполненных работ)
async function generateAVR() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "АКТ ВЫПОЛНЕННЫХ РАБОТ (ОКАЗАННЫХ УСЛУГ) № {{ doc_number }}",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Дата составления: ", bold: true }),
            new TextRun("{{ doc_date }}")
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Исполнитель: ", bold: true }),
            new TextRun("{{ company.name }}, БИН {{ company.bin_iin }}, адрес: {{ company.address_actual }}")
          ],
          spacing: { after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Заказчик: ", bold: true }),
            new TextRun("{{ client.name }}, БИН/ИИН {{ client.bin_iin }}, адрес: {{ client.address_actual }}")
          ],
          spacing: { after: 300 }
        }),

        new Paragraph({
          text: "Мы, нижеподписавшиеся, составили настоящий Акт о том, что Исполнителем были качественно и в полном объеме оказаны следующие услуги (выполнены работы):",
          spacing: { after: 200 }
        }),

        // Products Loop Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "№", bold: true })] }),
                new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Наименование выполненных работ/услуг", bold: true })] }),
                new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Количество", bold: true })] }),
                new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Цена", bold: true })] }),
                new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Стоимость", bold: true })] }),
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "{{#products}}" })] }),
                new TableCell({ children: [new Paragraph({ text: "{{name}}" })] }),
                new TableCell({ children: [new Paragraph({ text: "{{quantity}} {{unit}}" })] }),
                new TableCell({ children: [new Paragraph({ text: "{{price}}" })] }),
                new TableCell({ children: [new Paragraph({ text: "{{total}}" })] }),
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ columnSpan: 5, children: [new Paragraph({ text: "{{/products}}" })] })
              ]
            })
          ]
        }),

        new Paragraph({ text: "", spacing: { after: 200 } }),

        new Paragraph({
          children: [
            new TextRun({ text: "Общая стоимость оказанных услуг составляет: ", bold: true }),
            new TextRun({ text: "{{ deal.total_amount }}", bold: true })
          ],
          spacing: { after: 120 }
        }),
        new Paragraph({
          text: "Работы выполнены в полном объеме, в установленные сроки. Стороны претензий друг к другу не имеют.",
          spacing: { after: 300 }
        }),

        // Signatures Side-by-side
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ text: "СДАЛ (Исполнитель):", bold: true }),
                    new Paragraph({ text: "{{ company.ceo_title }} {{ company.ceo_name }}" }),
                    new Paragraph({ text: "Подпись: {%company.signature%}" }),
                    new Paragraph({ text: "Печать: {%company.stamp%}" }),
                  ]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ text: "ПРИНЯЛ (Заказчик):", bold: true }),
                    new Paragraph({ text: "{{ client.ceo_title }} {{ client.ceo_name }}" }),
                    new Paragraph({ text: "Подпись: __________________" }),
                    new Paragraph({ text: "М.П." })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outDir, 'Акт выполненных работ (АВР).docx'), buffer);
  console.log('Generated AVR template');
}

// 3. GENERATE CONTRACT TEMPLATE (Договор оказания услуг)
async function generateContract() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "ДОГОВОР ВОЗМЕЗДНОГО ОКАЗАНИЯ УСЛУГ № {{ doc_number }}",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Дата заключения: ", bold: true }),
            new TextRun("{{ doc_date }}")
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "{{ company.name }}", bold: true }),
            new TextRun(", в лице {{ company.ceo_title }} {{ company.ceo_name }}, действующего на основании {{ company.ceo_base }}, именуемый в дальнейшем «Исполнитель», с одной стороны, и "),
            new TextRun({ text: "{{ client.name }}", bold: true }),
            new TextRun(", в лице {{ client.ceo_title }} {{ client.ceo_name }}, действующего на основании {{ client.ceo_base }}, именуемый в дальнейшем «Заказчик», с другой стороны, заключили настоящий Договор о нижеследующем:")
          ],
          spacing: { after: 200 }
        }),

        new Paragraph({ text: "1. ПРЕДМЕТ ДОГОВОРА", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
        new Paragraph({
          text: "1.1. Исполнитель обязуется по заданию Заказчика оказать услуги (выполнить работы), указанные в Спецификации настоящего Договора, а Заказчик обязуется принять и оплатить оказанные услуги.",
          spacing: { after: 120 }
        }),

        new Paragraph({ text: "2. СТРУКТУРА И СТОИМОСТЬ УСЛУГ", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
        new Paragraph({
          text: "2.1. Перечень и стоимость оказываемых Услуг определяется сторонами в следующей Спецификации:",
          spacing: { after: 120 }
        }),

        // Products Loop Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "№", bold: true })] }),
                new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Наименование услуги/товара", bold: true })] }),
                new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Объем", bold: true })] }),
                new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Тариф", bold: true })] }),
                new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "Стоимость", bold: true })] }),
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "{{#products}}" })] }),
                new TableCell({ children: [new Paragraph({ text: "{{name}}" })] }),
                new TableCell({ children: [new Paragraph({ text: "{{quantity}} {{unit}}" })] }),
                new TableCell({ children: [new Paragraph({ text: "{{price}}" })] }),
                new TableCell({ children: [new Paragraph({ text: "{{total}}" })] }),
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ columnSpan: 5, children: [new Paragraph({ text: "{{/products}}" })] })
              ]
            })
          ]
        }),

        new Paragraph({ text: "", spacing: { after: 120 } }),

        new Paragraph({
          children: [
            new TextRun({ text: "2.2. Общая сумма договора составляет: ", bold: true }),
            new TextRun({ text: "{{ deal.total_amount }}", bold: true })
          ],
          spacing: { after: 200 }
        }),

        new Paragraph({ text: "3. АДРЕСА И РЕКВИЗИТЫ СТОРОН", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),

        // Signatures Side-by-side Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ text: "ИСПОЛНИТЕЛЬ:", bold: true }),
                    new Paragraph({ text: "{{ company.name }}" }),
                    new Paragraph({ text: "БИН/ИИН: {{ company.bin_iin }}" }),
                    new Paragraph({ text: "Адрес: {{ company.address_legal }}" }),
                    new Paragraph({ text: "Тел: {{ company.phone }}, {{ company.email }}" }),
                    new Paragraph({ text: "Банк: {{ company.bank.bank_name }}" }),
                    new Paragraph({ text: "ИИК: {{ company.bank.iik }}" }),
                    new Paragraph({ text: "БИК: {{ company.bank.bik }}" }),
                    new Paragraph({ text: "", spacing: { after: 120 } }),
                    new Paragraph({ text: "{{ company.ceo_title }}: {{ company.ceo_name }}" }),
                    new Paragraph({ text: "Подпись: {%company.signature%}" }),
                    new Paragraph({ text: "Печать: {%company.stamp%}" })
                  ]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ text: "ЗАКАЗЧИК:", bold: true }),
                    new Paragraph({ text: "{{ client.name }}" }),
                    new Paragraph({ text: "БИН/ИИН: {{ client.bin_iin }}" }),
                    new Paragraph({ text: "Адрес: {{ client.address_legal }}" }),
                    new Paragraph({ text: "Тел: {{ client.phone }}, {{ client.email }}" }),
                    new Paragraph({ text: "Банк: {{ client.bank.bank_name }}" }),
                    new Paragraph({ text: "ИИК: {{ client.bank.iik }}" }),
                    new Paragraph({ text: "БИК: {{ client.bank.bik }}" }),
                    new Paragraph({ text: "", spacing: { after: 120 } }),
                    new Paragraph({ text: "{{ client.ceo_title }}: {{ client.ceo_name }}" }),
                    new Paragraph({ text: "Подпись: __________________" }),
                    new Paragraph({ text: "М.П." })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outDir, 'Договор возмездного оказания услуг.docx'), buffer);
  console.log('Generated Contract template');
}

async function run() {
  await generateInvoice();
  await generateAVR();
  await generateContract();
  console.log('All 3 templates successfully generated!');
}

run().catch(console.error);
