import { Request, RequestHandler } from 'express';
import { ServerError } from '../types';

export const naturalLanguageQuery = {};

export const parseNaturalLanguageQuery: RequestHandler = async (
  req: Request<unknown, unknown, Record<string, unknown>>,
  res,
  next
) => {
  try {
    console.log('Received request body:', req.body);
    
    // Access form fields from req.body (multer puts them there)
    const formData = {
      name: req.body.name,
      age: req.body.age,
      trait: req.body.trait,
      favoriteThing: req.body.favoriteThing,
      favoriteColor: req.body.favoriteColor,
      storyType: req.body.storyType,
    };

    // Access files from req.files (multer puts them there)
    const files = req.files as Express.Multer.File[] || [];
    console.log('Received files:', files.map(f => f.originalname));

    if (!formData) {
      const error: ServerError = {
        log: 'Form data not provided',
        status: 400,
        message: { err: 'An error occurred while parsing the form data' },
      };
      return next(error);
    }

    // Store both form data and files in res.locals
    res.locals.naturalLanguageQuery = formData;
    res.locals.files = files;
    
    return next();
  } catch (error) {
    const serverError: ServerError = {
      log: `Error parsing form data: ${error}`,
      status: 500,
      message: { err: 'An error occurred while processing the form' },
    };
    return next(serverError);
  }
};
