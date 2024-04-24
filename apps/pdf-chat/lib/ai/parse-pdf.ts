import { extractText, getDocumentProxy } from 'unpdf';

export default async function parsePdf(data: ArrayBuffer) {
  const pdf = await getDocumentProxy(new Uint8Array(data));
  const { text } = await extractText(pdf, { mergePages: true });

  return text;
}
