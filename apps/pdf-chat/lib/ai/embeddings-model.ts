import { OpenAIEmbeddings } from '@langchain/openai';
import { z } from 'zod';

export function getEmbeddingsModel() {
  return getOpenAIEmbeddingsModel();
}

/**
 * OpenAI를 사용하여 AI에 사용할 임베딩 모델을 가져옵니다.
 * 프로덕션에 적합합니다.
 */
function getOpenAIEmbeddingsModel() {
  const data = z
    .object({
      openAIApiKey: z.string().min(1),
      baseURL: z.string().min(1).optional(),
    })
    .parse({
      openAIApiKey: process.env.LLM_API_KEY,
      baseURL: process.env.LLM_BASE_URL,
    });

  return new OpenAIEmbeddings({
    model: process.env.LLM_EMBEDDINGS_MODEL,
    dimensions: 1536,
    openAIApiKey: data.openAIApiKey,
    stripNewLines: true, // 줄바꿈 문자를 제거합니다.
    configuration: {
      baseURL: data.baseURL,
    },
  });
}
