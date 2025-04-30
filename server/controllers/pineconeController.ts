import type { RequestHandler } from 'express';
import type { ServerError, TextMetadata } from '../../types/types.js';
import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});
const index = pc.index<TextMetadata>('story-embeddings');

export const queryPineconeDatabase: RequestHandler = async (
  _req,
  res,
  next
) => {
  const { userInputEmbeddings } = res.locals;
  if (!userInputEmbeddings) {
    const error: ServerError = {
      log: 'Pinecone query middleware did not receive embedding',
      status: 500,
      message: { err: 'An error occurred before querying the database' },
    };
    return next(error);
  }

  //   const filter =
  //     parsedUserQuery.startYear && parsedUserQuery.endYear
  //       ? {
  //           year: {
  //             $gte: Number(parsedUserQuery.startYear),
  //             $lte: Number(parsedUserQuery.endYear),
  //           },
  //         }
  //       : undefined;

  // we will query pinecone for similar embeddings and store them in pineconeQueryResult

  const vectorResponse = await index.query({
    // topK is the number of results to return
    topK: 2,
    vector: userInputEmbeddings,
    includeValues: true,
    includeMetadata: true,
    // filter,
  });

  // console.log(
  //   'vectorResponse',
  //   vectorResponse.matches.map((match) => match.metadata?.title)
  // );

  const pineconeResultsObj = {
    'story1': vectorResponse.matches[0].metadata,
    'story2': vectorResponse.matches[1].metadata
  }

  res.locals.pineconeQueryResult = pineconeResultsObj;
  return next();
};
