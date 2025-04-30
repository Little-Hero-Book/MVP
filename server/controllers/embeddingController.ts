import { RequestHandler } from 'express';
import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI();

/**
 * Generate embeddings for user input using text-embedding-3-small.
 */
export const generateUserInputEmbeddings: RequestHandler = async (_req, res, next) => {
  const { naturalLanguageQuery } = res.locals;
  
  try {
    // Construct a meaningful input string from the form data
    const inputText = [
      `name: ${naturalLanguageQuery.name}`,
      `age: ${naturalLanguageQuery.age}`,
      `trait: ${naturalLanguageQuery.trait}`,
      `favoriteThing: ${naturalLanguageQuery.favoriteThing}`,
      `favoriteColor: ${naturalLanguageQuery.favoriteColor}`,
      `storyType: ${naturalLanguageQuery.storyType}`
    ].filter(Boolean).join('\n');
    
    res.locals.inputText = inputText;

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: inputText,
      encoding_format: 'float',
    });

    const embeddings = {
      text: inputText,
      embedding: response.data[0].embedding,
    };

    res.locals.userInputEmbeddings = embeddings.embedding;
    next();
  } catch (error) {
    console.error('Failed to generate embeddings:', error);
    throw error;
  }
};



