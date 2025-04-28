import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import 'dotenv/config';

import { parseNaturalLanguageQuery } from './controllers/naturalLanguageController.js';
import { queryOpenAI } from './controllers/openaiController.js';
import { databaseController } from './controllers/databaseController.js';

import { ServerError } from './types';

const app = express();

app.use(cors());
app.use(express.json());

app.post(
  '/api',
  parseNaturalLanguageQuery,
  queryOpenAI,
  databaseController,
  (_req, res) => {
    res.status(200).json({
      openAIResponse : res.locals.openAIResponse,
      databaseResponse: res.locals.databaseResponse,
    });
  }
);

const errorHandler: ErrorRequestHandler = (
  err: ServerError,
  _req,
  res,
  _next
) => {
  const defaultErr: ServerError = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj: ServerError = { ...defaultErr, ...err };
  console.log(errorObj.log);
  res.status(errorObj.status).json(errorObj.message);
};

app.use(errorHandler);

export default app;
