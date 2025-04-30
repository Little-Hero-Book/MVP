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
const generateEmbeddings = async (plots): Promise<void> => {
    try {
        const plotStrings = plots.map(
            plot => `${plot.id}\n${plot.title}\n${plot.fullStory}\n${plot.theme}\n${plot.trait.join(', ')}\n${plot.summary}`);
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

const mock = [
  {
    id: '1',
    title: 'Hero and the Big Race',
    summary: `Owen the speedy boy races against Hero, a slow but steady classmate, and learns that perseverance and consistency beat overconfidence.`,
    fullStory: `There once was a lively little boy named Owen who loved to run. He bragged, “I’m the fastest kid at school!” One day, his quiet classmate, Hero, challenged him to a race.
Everyone giggled — Hero wasn’t fast at all.
The race started. Owen zoomed ahead so quickly he decided to stop for a snack under a shady tree. Meanwhile, Hero kept walking, one small step at a time, never stopping.
Owen got so comfy he fell asleep! When he woke up, Hero was almost at the finish line. Owen sprinted, but Hero crossed first!
Owen learned that being fast is fun, but steady effort wins the race.`,
    theme: 'Adventure',
    trait: ['Perseverance', 'Grit'],
  },
  {
    id: '2',
    title: 'Hero and the Jungle Gym Rescue',
    summary: `Big kid Owen and tiny Hero become unexpected friends when Hero helps Owen out of a tough spot, showing that kindness comes in all sizes.`,
    fullStory: `In a sunny park, big 7-year-old Owen loved to show how strong he was. One day, tiny 4-year-old Hero accidentally bumped into him while chasing a butterfly.
Owen caught her with one hand and frowned, but Hero squeaked, “Please don’t be mad! I’ll help you someday!”
Owen laughed. “You? Help me?”
Later that week, Owen climbed a big jungle gym but got stuck at the top. He felt scared and couldn’t climb down.
Hero saw him and ran to get the teacher. Thanks to her, Owen was rescued!
Hero realized that even the smallest friend can save the day.`,
    theme: 'Playground Adventure',
    trait: ['Kindness', 'Empathy'],
  },
  {
    id: '3',
    title: 'Hero Plans Ahead',
    summary: `Hero saves and prepares for school while Owen plays all summer. When school starts, Owen realizes why hard work matters.`,
    fullStory: `In the same neighborhood, two best friends — Hero and Owen — spent their summer days differently.
Hero saved her allowance, cleaned her room, and finished her chores early. Owen played video games, sang songs, and chilled outside.
Hero said, “We should get ready for school starting soon!” Owen just laughed.
When school came back, Hero had everything ready: supplies, clean clothes, even lunch packed! Owen was scrambling, stressed, and late.
Owen realized that while playing is fun, being prepared makes life easier.`,
    theme: 'Seasonal Life Lessons',
    trait: ['Hard Work', 'Planning'],
  },
  {
    id: '4',
    title: 'Goldilocks and the Three Bears',
    summary: `Hero explores a house that isn’t hers, using everything inside, and learns that respecting others’ spaces is important.`,
    fullStory: `One morning, a curious girl named Hero wandered into the forest and stumbled upon a cozy cottage. The door was open. “Hello?” she called. No answer.
She stepped inside.
She tasted three bowls of porridge, sat on three chairs, and slept in three beds.
But — surprise! The bear family who lived there returned.
Hero realized she had no right to touch what wasn’t hers and quickly ran home, remembering to always respect others’ spaces.`,
    theme: 'Fantasy',
    trait: ['Respect', 'Boundaries'],
  },
  {
    id: '5',
    title: 'Hero and the Beanstalk',
    summary: `Hero climbs a magical beanstalk, faces a giant, and uses his courage to turn his family's luck around.`,
    fullStory: `Hero and his mother were very poor. One day, she sent him to sell their only cow. Instead, Hero traded it for magic beans.
His mother was furious and tossed them out the window.
Overnight, a giant beanstalk grew! Hero climbed it and found a castle full of treasures — and a huge, grumpy giant.
Quickly and bravely, Hero grabbed a singing harp and a golden hen and escaped down the beanstalk.
He chopped it down just in time, and he and his mother lived happily ever after.`,
    theme: 'Adventure',
    trait: ['Bravery', 'Resourcefulness'],
  },
  {
    id: '6',
    title: 'Hero and the Big Space Race',
    summary:
      'Owen the rocket-speed kid races Hero across Planet Zooma, learning that steady effort beats overconfidence.',
    fullStory: `Far out on Planet Zooma, Owen loved zooming around in his turbo-boost rocket shoes. "I'm the fastest kid in the galaxy!" he shouted.

One day, his quiet classmate Hero challenged him to a rover race across the craters. Everyone giggled — Hero's rover was slow and clunky!

When the race started, Owen zoomed ahead and stopped halfway for a space snack. Hero just kept rolling, slow and steady.

Owen snoozed in his hover chair. By the time he woke up, Hero was near the finish line! Owen blasted off, but Hero crossed first.

That day, Owen learned that in space and on Earth — steady wins the race.`,
    theme: 'Space Adventure',
    trait: ['Perseverance', 'Grit'],
  },
  {
    id: '7',
    title: 'Hero and the Space Station Rescue',
    summary:
      'Big astronaut Owen and tiny Hero become friends when Hero helps Owen out of a jam on Moon Base Zeta.',
    fullStory: `At Moon Base Zeta, 7-year-old Owen showed off his strength in zero gravity training.

Tiny Hero, chasing a glowing moon bug, accidentally floated into him.

Owen caught her and frowned. “Watch it!”

Hero squeaked, “I’m sorry! Maybe I’ll help you someday!”

Owen laughed. “You? Help me?”

Later that week, Owen got stuck in the cargo hold hatch during a repair mission. He was scared and couldn’t reach the controls.

Hero saw and zoomed off in her mini pod to get Mission Control.

Owen was rescued, and Hero smiled.

Even the tiniest astronaut can save the day!`,
    theme: 'Space Adventure',
    trait: ['Kindness', 'Empathy'],
  },
  {
    id: '8',
    title: 'Hero Prepares for Galactic School',
    summary:
      'Hero gets ready for the new school year on Mars Station, while Owen plays all summer — and learns why preparation matters.',
    fullStory: `On Mars Station, best friends Hero and Owen spent summer break very differently.

Hero recharged her jetpack, organized her moon-rock notebooks, and practiced space math.

Owen? He played meteor dodgeball and napped in his starlight hammock.

Hero said, “Galactic School starts soon — we should get ready!”

Owen laughed, “Nah, there's time!”

But when school began, Hero was ready with supplies, uniforms, and snacks. Owen was scrambling to find his astro-boots and forgot his lunch.

He sighed, “Next time, I’m preparing like Hero!”

Because even in space, being ready makes life way easier.`,
    theme: 'Seasonal Life Lessons',
    trait: ['Hard Work', 'Planning'],
  },
  {
    id: '9',
    title: 'Hero and the Space Dome Mystery',
    summary:
      "Hero explores an alien dome she finds on a distant moon and learns a big lesson about respecting others' property.",
    fullStory: `While exploring Moon Glimmer, Hero found a shiny silver dome with the door slightly open.

“Hello?” she called. No answer.

Inside, she tried three space chairs, tasted alien smoothies, and even bounced on a gravity bed.

Suddenly — beep beep! A family of alien bears returned!

They were surprised. “Who used our stuff?”

Hero realized she had entered without asking. She apologized and zipped away in her pod.

From then on, she remembered: even on strange planets, always respect others’ spaces.`,
    theme: 'Fantasy / Sci-fi',
    trait: ['Respect', 'Boundaries'],
  },
  {
    id: '10',
    title: 'Hero and the Starvine Ladder',
    summary:
      'Hero climbs a magical vine into space and outsmarts a grumpy space giant to help his struggling family.',
    fullStory: `Hero and his mom were low on credits and fuel. One day, she sent him to trade their last solar panel for supplies.

But Hero met a strange alien who offered glowing star seeds instead.

His mom was furious and tossed the seeds outside.

By morning, a glowing starvine had grown up into the sky! Hero climbed it and found a floating space-castle full of treasures—and a snoring space giant!

Hero carefully took a singing orb and a golden plasma hen. But the giant woke up and roared!

Hero zipped down the vine, chopped it with his laser axe, and saved his family.

Bravery and a little luck changed their future forever.`,
    theme: 'Adventure',
    trait: ['Bravery', 'Resourcefulness'],
  },
];

generateEmbeddings(
    mock);