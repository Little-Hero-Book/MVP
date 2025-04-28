import { RequestHandler } from 'express';
import { ServerError } from '../types';
import OpenAI from 'openai';
import { storyHistory } from './prompt.ts';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
export const queryOpenAI: RequestHandler = async (_req, res, next) => {
  const { naturalLanguageQuery } = res.locals;
  if (!naturalLanguageQuery) {
    const error: ServerError = {
      log: 'OpenAI query middleware did not receive user input',
      status: 500,
      message: { err: 'An error occurred before querying OpenAI' },
    };
    return next(error);
  }

  const getApiResponse = async () => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        //prompt
        messages: storyHistory as OpenAI.Chat.ChatCompletionMessageParam[],

      });
      if (!response.choices[0].message.content) {
        const error: ServerError = {
          log: 'OpenAI did not return a response',
          status: 500,
          message: { err: 'OpenAI did not return a response' },
        };
        return next(error);
      }
      //add logic to process the response.


      //pass the response to the database controller
      res.locals.openAIResponse = response.choices[0].message.content;
      return next();
    } catch (err) {
      const error: ServerError = {
        log: `Error in queryOpenAI: ${err instanceof Error ? err.message : String(err)}`,
        status: 500,
        message: { err: `Error querying OpenAI: ${err instanceof Error ? err.message : String(err)}` },
      };
      return next(error);
    }
  }
  await getApiResponse();
};
