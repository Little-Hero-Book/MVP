import { RequestHandler } from 'express';
import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI();

/**
 * Generate embeddings for an array of plots using text-embedding-3-small.
 * Save the embeddings to a JSON file using the saveToJSON utility function.
 */
export const generateUserInputEmbeddings: RequestHandler = async (_req, res, next) => {
  const { naturalLanguageQuery } = res.locals;
  const storyElement = JSON.stringify(naturalLanguageQuery.storyElement)
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: storyElement,
      encoding_format: 'float',
    });

    const embeddings = {
      text: storyElement,
      embedding: response.data[0].embedding,
    };

    res.locals.userInputEmbeddings = embeddings.embedding;
    console.log(
      'user input successfully converted to embeddings, input converted: ',
      storyElement
    );
    next();
  } catch (error) {
    console.error('Failed to generate embeddings:', error);
    throw error;
  }
};



