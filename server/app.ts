import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import multer from 'multer';
import 'dotenv/config';
import { parseNaturalLanguageQuery } from './controllers/naturalLanguageController.js';
import { queryOpenAI } from './controllers/openaiController.js';
import { databaseController } from './controllers/databaseController.js';
import { ServerError } from './types';
import { generateUserInputEmbeddings } from './controllers/embeddingController.js';
import { queryPineconeDatabase } from './controllers/pineconeController.js';

const app = express();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
});

app.use(cors());
app.use(express.json());

// Update the route to handle file uploads
app.post('/api', upload.array('images'), (req, res, next) => {
  console.log('Request body before multer:', req.body);
  next();
}, parseNaturalLanguageQuery,
  generateUserInputEmbeddings,
  queryPineconeDatabase,
  queryOpenAI,
  databaseController,
  (_req, res) => {
  res.status(200).json({
    openAIResponse : res.locals.openAIResponse,
    databaseResponse: res.locals.databaseResponse,
  });
});

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
