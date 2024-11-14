// import { extractText, getDocumentProxy } from 'unpdf';
// export async function parsePdf(data: ArrayBuffer) {
//   const pdf = await getDocumentProxy(new Uint8Array(data));
//   const { text } = await extractText(pdf, { mergePages: true });
//   return text;
// }
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { extractText, getDocumentProxy } from 'unpdf';

function sanitizeText(text: string): string {
  return text
    .replace(/\u0000/g, '') // 널 문자 제거
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '') // 잘못된 유니코드 문자 제거
    .replace(/[^\p{L}\p{N}\p{P}\p{Z}\p{M}\p{Sc}]/gu, ''); // 문자, 숫자, 구두점, 공백, 결합 문자, 통화 기호만 유지
}

export async function parsePdf(data: ArrayBuffer) {
  try {
    const blob = new Blob([data], { type: 'application/pdf' });
    const file = new File([blob], 'document.pdf', { type: 'application/pdf' });

    // PDFLoader 시도
    try {
      const loader = new PDFLoader(file, {
        splitPages: false,
      });
      const docs = await loader.load();
      if (docs?.[0]?.pageContent) {
        return sanitizeText(docs[0].pageContent);
      }
    } catch (e) {
      console.warn('PDFLoader 실패, unpdf로 시도합니다:', e);
    }

    // unpdf 시도
    const pdf = await getDocumentProxy(new Uint8Array(data));
    const { text } = await extractText(pdf, { mergePages: true });
    const textContent = Array.isArray(text) ? text.join(' ') : text;
    return sanitizeText(textContent);
  } catch (error) {
    console.error('PDF 파싱 오류:', error);
    throw error;
  }
}
