import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import expressions from 'angular-expressions';
// @ts-ignore
import ImageModule from 'docxtemplater-image-module-free';
import { registerFilters } from './filters';

// Register all custom pipes
registerFilters();

function angularParser(tag: string) {
  return {
    get(scope: any, context: any) {
      if (tag === '.') {
        return scope;
      }
      
      const compileFunc = (expressions as any).compile || (expressions as any).default?.compile;
      if (!compileFunc) {
        throw new Error("Cannot find angular-expressions compile function");
      }
      
      try {
        const exp = compileFunc(tag.replace(/(’|‘)/g, "'").replace(/(“|”)/g, '"'));
        const result = exp(scope, context);
        return result === undefined ? '' : result;
      } catch (err: any) {
        throw new Error(`В теге "${tag}": ${err.message}`);
      }
    }
  };
}

export class TemplateEngine {
  private zip: PizZip;
  private doc: Docxtemplater;

  constructor(arrayBuffer: ArrayBuffer) {
    this.zip = new PizZip(arrayBuffer);
    
    const imageOptions = {
        centered: false,
        getImage(tagValue: any) {
            if (typeof tagValue === 'string' && tagValue.startsWith('data:image')) {
                const base64Data = tagValue.split(',')[1];
                const binaryString = window.atob(base64Data);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return bytes.buffer;
            }
            return tagValue;
        },
        getSize() {
            // Default stamp/signature size
            return [150, 150];
        }
    };
    
    try {
      this.doc = new Docxtemplater(this.zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '{{',
          end: '}}',
        },
        parser: angularParser,
        nullGetter() {
          return '';
        },
        modules: [new ImageModule(imageOptions)]
      });
    } catch (error: any) {
      if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors.map((e: any) => {
          const rootErr = e.properties?.rootError?.message ? ` Причина: ${e.properties.rootError.message}` : '';
          return (e.properties?.explanation || e.message || String(e)) + rootErr;
        }).join("\n");
        throw new Error(`Ошибка компиляции шаблона Docx:\n${errorMessages}`);
      }
      throw error;
    }
  }

  // Render the document with data
  public render(data: Record<string, any>): Blob {
    try {
      this.doc.render(data);
    } catch (error: any) {
      if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors.map((e: any) => {
          const rootErr = e.properties?.rootError?.message ? ` Причина: ${e.properties.rootError.message}` : '';
          return (e.properties?.explanation || e.message || String(e)) + rootErr;
        }).join("\n");
        throw new Error(`Ошибка в шаблоне Docx:\n${errorMessages}`);
      }
      throw error;
    }
    
    const out = this.doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    
    return out as Blob;
  }
}
