import { RequestHandler } from 'express';
import { ServerError } from '../types';
import pkg from 'pg'
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

export const databaseController: RequestHandler = async (
  _req,
  res,
  next
) => {
  const { openAIResponse } = res.locals;
  if (!openAIResponse) {
    const error: ServerError = {
      log: 'Database query middleware did not receive a query',
      status: 500,
      message: { err: 'An error occurred before querying the database' },
    };
    return next(error);
  }
  try {
    console.log('openAIResponse', openAIResponse);

    // const result = await pool.query(databaseQuery);
    res.locals.databaseResponse = openAIResponse
    return next();
  }catch(err){
    const error: ServerError = {
      log: `Error querying the database: ${err}`,
      status: 500,
      message: { err: 'An error occurred while querying the database' },
    };
    return next(error);
  }
};
