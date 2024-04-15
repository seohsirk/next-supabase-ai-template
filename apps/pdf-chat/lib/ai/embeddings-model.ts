import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers';
import { env } from '@xenova/transformers';
import { OpenAIEmbeddings } from '@langchain/openai';
import { z } from 'zod';

env.useBrowserCache = false;
env.allowLocalModels = false;

const USE_HUGGINGFACE_EMBEDDINGS = process.env.HUGGINGFACE_EMBEDDINGS === 'true';

/**
 * Get the embeddings model to use for the AI.
 * If you want to use a different embeddings model, you can change it here.
 * by default, we use the HuggingFace Transformers model.
 */
export default function getEmbeddingsModel() {
  if (USE_HUGGINGFACE_EMBEDDINGS) {
    return getHuggingFaceEmbeddingsModel();
  }

  return getOpenAIEmbeddingsModel();
}

/**
 * Get the embeddings model to use for the AI using HuggingFace.
 * Good for local development.
 */
function getHuggingFaceEmbeddingsModel() {
  return new HuggingFaceTransformersEmbeddings({
    modelName: 'Supabase/gte-small',
  });
}

/**
 * Get the embeddings model to use for the AI using OpenAI.
 * Good for production.
 */
function getOpenAIEmbeddingsModel() {
  const data = z.object({
    openAIApiKey: z.string().min(1),
    baseURL: z.string().min(1).optional(),
  }).parse({
    openAIApiKey: process.env.LLM_API_KEY,
    baseURL: process.env.LLM_BASE_URL,
  });

  return new OpenAIEmbeddings({
    openAIApiKey: data.openAIApiKey,
    configuration: {
      baseURL: data.baseURL
    }
  });
}