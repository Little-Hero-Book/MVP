import { Request, RequestHandler } from 'express';
import { ServerError } from '../types';

// const mockUserInput = {
//   name: 'gaga',
//   age: 4,
//   storyType: 'adventure',
//   trait: 'brave',
//   favoriteColor: 'blue',
//   favoriteObj: 'dog',
// }

export const naturalLanguageQuery = {};

export const parseNaturalLanguageQuery: RequestHandler = async (
  req: Request<unknown, unknown, Record<string, unknown>>,
  res,
  next
) => {
  console.log(req.body.naturalLanguageQuery)
  if (!req.body.naturalLanguageQuery) {
    const error: ServerError = {
      log: 'Natural language query not provided',
      status: 400,
      message: { err: 'An error occurred while parsing the user query' },
    };
    return next(error);
  }

  const { naturalLanguageQuery } = req.body;
  //use mock user input for now
  // naturalLanguageQuery = mockUserInput;

  if (!naturalLanguageQuery) {
    const error: ServerError = {
      log: 'Natural language query is not a string',
      status: 400,
      message: { err: 'An error occurred while parsing the user query' },
    };
    return next(error);
  }
  res.locals.naturalLanguageQuery = JSON.stringify(naturalLanguageQuery);
  return next();
};
