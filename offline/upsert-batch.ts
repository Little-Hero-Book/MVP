import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import OpenAI from 'openai';
import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import 'dotenv/config';

type TextMetadata = {
    id: string;
    title: string;
    fullStory: string;
    theme: string;
    traits: string[];
    summary: string;
};
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pinecone = new Pinecone();
const index = pinecone.index<TextMetadata>('story-embeddings');

interface EmbeddingData {
    text: TextMetadata;
    embedding: OpenAI.Embedding['embedding'];
}

/**
 * Generate Pinecone records from embeddings data.
 */
const generatePineconeRecords = (
    embeddingsData: EmbeddingData[]
): PineconeRecord<TextMetadata>[] => {
    const pineconeRecords: PineconeRecord<TextMetadata>[] = [];
    for (const { text, embedding } of embeddingsData) {
        pineconeRecords.push({
            id: text.id,
            values: embedding,
            metadata: text,
        });
    }
    return pineconeRecords;
};

/**
 * Create batches of Pinecone records for upserting.
 * Refer to the Pinecone documentation: https://docs.pinecone.io/guides/data/upsert-data
 */
const createPineconeBatches = (
    vectors: PineconeRecord<TextMetadata>[],
    batchSize = 200
): PineconeRecord<TextMetadata>[][] => {
    const batches: PineconeRecord<TextMetadata>[][] = [];
    for (let i = 0; i < vectors.length; i += batchSize) {
        batches.push(vectors.slice(i, i + batchSize));
    }
    return batches;
};

/**
 * Upsert batches of Pinecone records to Pinecone.
 * Provide logging for each batch you try to, including the IDs of the first and last records in the batch.
 * Log the success or failure of each batch upsert.
 */
const upsertBatchesToPicone = async (
    pineconeBatches: PineconeRecord<TextMetadata>[][]
): Promise<void> => {
    const delayBatch = (ms: number): Promise<void> =>
        new Promise((resolve) => setTimeout(resolve, ms));

    const upsertResults = await Promise.allSettled(
        pineconeBatches.map(async (batch, i) => {
            // await delayBatch(1000 * i); // Uncomment if you're getting Pinecone network errors
            console.log(
                `Upserting batch ${i} of ${pineconeBatches.length}: IDs ${batch[0].id
                } through ${batch[batch.length - 1].id}`
            );
            return index.upsert(batch);
        })
    );

    upsertResults.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            console.log(`Batch ${i + 1} upserted successfully.`);
        } else {
            console.error(`Failed to upsert batch ${i + 1}:`, result.reason);
        }
    });
};

const loadVariableFromJSON = async <T>(filename: string): Promise<T | null> => {
    const filePath = path.resolve(__dirname, filename);

    try {
        const data = await fs.readFile(filePath, 'utf-8');
        console.log(`Data loaded from ${filePath}`);
        return JSON.parse(data) as T;
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.warn(`File ${filePath} does not exist.`);
            return null;
        } else {
            console.error(`Failed to load data from ${filePath}:`, error);
            return null;
        }
    }
};

const main = async (): Promise<void> => {
    const embeddingsData = await loadVariableFromJSON<EmbeddingData[]>(
        'sample_embeddings.json'
    );
    if (!embeddingsData) {
        throw new Error('Embeddings data not found.');
    }

    const pineconeRecords = generatePineconeRecords(embeddingsData);
    const pineconeBatches = createPineconeBatches(pineconeRecords);
    upsertBatchesToPicone(pineconeBatches);
};

main().catch((error) => {
    console.error('An error occurred in main:', error);
    process.exit(1);
});
