import dotenv from 'dotenv';
import OpenAI, { toFile } from 'openai';
import { readFile, writeFile } from 'fs/promises';
import { Uploadable } from 'openai/uploads';

dotenv.config();

const client = new OpenAI();
const imgModel = 'gpt-image-1';
const mimeType = 'image/png';

export const readFiles = async (filePaths: string[]): Promise<string[]> => {
  const readFilePromises = filePaths.map(
    (path) => readFile(path, { encoding: 'base64' })
    // readFile(path)
  );
  const base64Files = await Promise.all(readFilePromises);
  return base64Files;
};

// takes in a prompt string and an array of file paths for context images
export const generateImage = async (
  prompt: string,
  contextImgs: string[]
): Promise<string | undefined> => {
  const images = await Promise.all(
    contextImgs.map(
      async (s) =>
        await toFile(Buffer.from(s), null, {
          type: mimeType,
        })
    )
  );
  const response = await client.images.edit({
    model: imgModel,
    image: images,
    prompt: prompt,
  });
  const image_base64 = response.data ? response.data[0].b64_json : '';
  return image_base64;
};

const main = async () => {
  const outputFile = 'output.png';
  const testPrompt =
    "Combine the two images into a children's coloring book format. Cartoonify the human in the photo and then have him sit at a table with everyone, eating.";
  const testFiles = ['input.png', 'input2.png'];
  const files = await readFiles(testFiles);
  const output = await generateImage(testPrompt, files);
  await writeFile(outputFile, output, 'utf8');
};

main();
