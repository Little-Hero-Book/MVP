import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import 'dotenv/config';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openai = new OpenAI();

interface EmbeddingResponse {
    text: Plot;
    embedding: number[];
}

/**
 * Generate embeddings for an array of plots using text-embedding-3-small.
 * Save the embeddings to a JSON file using the saveToJSON utility function.
 */
const generateEmbeddings = async (plots: Plot[]): Promise<void> => {
    try {
        const plotStrings = plots.map(
            plot => `${plot.id}\n${plot.title}\n${plot.fullStory}\n${plot.theme}\n${plot.traits.join(', ')}\n${plot.summary}`);
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: plotStrings,
            encoding_format: 'float',
        });

        const embeddings: EmbeddingResponse[] = response.data.map((item,index) => ({
            text: plots[item.index],
            embedding: item.embedding,
        }));

        await saveToJSON('sample_embeddings.json', embeddings);
    } catch (error) {
        console.error('Failed to generate embeddings:', error);
        throw error;
    }
};

const saveToJSON = async <T>(filename: string, data: T): Promise<void> => {
    const filePath = path.resolve(__dirname, filename);

    try {
        const jsonData = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, jsonData, 'utf-8');
        console.log(`Data saved to ${filePath}`);
    } catch (error) {
        console.error(`Failed to save data to ${filePath}:`, error);
    }
};



type Plot = {
    id: string;
    title: string;
    fullStory: string;
    theme: string;
    traits: string[];
    summary: string;
}

const mock = {
    id: '1',
    title: 'Hero and the Mighty Mech Rescue',
    fullStory: `One bright afternoon, 5-year-old Hero was exploring the strange and colorful Planet Zog in his little explorer spaceship.
He poked around glowing rocks, bouncing plants, and funny floating bubbles.

But—uh oh!
Hero accidentally pressed a shiny red button on the ground...
and out popped a huge, grumpy Space Commander named Slothbot!
His metal gears creaked as he grumbled,
"Who dares wake me from my 100-year nap?!"

Before Hero could even blink, Slothbot grabbed him with a giant robot claw!

Hero squeaked,
"Please let me go! I promise I can help you one day!"

Slothbot gave a rusty laugh.
"Ha! You? Help me?"
But he shrugged his big shoulders and let Hero go.

Later that day, Slothbot was stomping through the jungle of Planet Zog when he got tangled up in a wild mess of alien vines!
He tugged and pulled, but the more he struggled, the tighter they wrapped around him.

Hero saw what happened — and without a second thought, he zipped over in his spaceship, grabbed his space-scissors, and quickly cut Slothbot free!

Slothbot blinked his glowing robot eyes and said,
"You were helpful after all. Thanks, little buddy."

They laughed together and became unlikely friends — one small boy, and one giant grumpy robot.

Moral: Even the smallest helper can save the day — no matter how big the problem is!

`,
    theme: 'Space Adventure',
    traits: ['Adventure', 'Comedy', 'Family'],
    summary: "While exploring the wild Planet Zog, 5-year-old Hero accidentally wakes up a grumpy giant robot named Space Commander Slothbot. Though Slothbot lets Hero go after a promise of help, he laughs at the idea that a small boy could ever save him. But when Slothbot later gets trapped in alien vines, it's Hero who races to the rescue, proving that even the smallest helper can make a big difference."
}

generateEmbeddings([
    mock
]);