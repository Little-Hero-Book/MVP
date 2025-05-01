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
import { generatePDF } from './controllers/pdfController.js';

const app = express();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Only PNG, JPG, and WEBP files are allowed.'
        )
      );
    }
  },
});

app.use(cors());
app.use(express.json());

// Update the route to handle file uploads
app.post(
  '/api',
  (req, res, next) => {
    upload.array('images')(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ err: 'File upload error' });
      }
      next();
    });
  },
  (req, res, next) => {
    console.log('Request body after multer:', req.body);
    next();
  },
  parseNaturalLanguageQuery,
  generateUserInputEmbeddings,
  queryPineconeDatabase,
  queryOpenAI,
  databaseController,
  generatePDF,
  (_req, res) => {
    res.status(200).json({
      openAIResponse: res.locals.openAIResponse,
      databaseResponse: res.locals.databaseResponse,
      pdfBlob: res.locals.pdfBlob,
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
  console.error('Error details:', {
    log: errorObj.log,
    status: errorObj.status,
    message: errorObj.message,
  });
  res.status(errorObj.status).json(errorObj.message);
};

app.use(errorHandler);

export default app;
