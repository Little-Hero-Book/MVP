import dotenv from 'dotenv';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import OpenAI, { toFile } from 'openai';
import { readFile, writeFile } from 'fs/promises';
import { FileLike } from 'openai/uploads';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new OpenAI();

// img generation constants
const imgModel = 'gpt-image-1';
const mimeType = 'image/jpeg';
const imgOutputQuality = 'low';
const imgOutputSize = '1024x1024';

const readFilesFromDisk = async (filePaths: string[]): Promise<FileLike[]> => {
  const files = await Promise.all(
    filePaths.map(
      async (path) => await toFile(readFile(path), null, { type: mimeType })
    )
  );
  return files;
};

// takes in a prompt string and an array of FileLike objects for context images
const generateImage = async (
  prompt: string,
  contextImgs: FileLike[],
  numberOfImages = 1
): Promise<string | string[]> => {
  const response = await client.images.edit({
    model: imgModel,
    image: contextImgs,
    prompt: prompt,
    quality: imgOutputQuality,
    size: imgOutputSize,
    n: numberOfImages,
  });
  if (numberOfImages === 1) {
    const image_base64 = response.data ? response.data[0].b64_json : '';
    return image_base64 ? image_base64 : '';
  } else if (response?.data && response.data.length > 1) {
    const images_base64 = response.data.map((imgRsp) => imgRsp.b64_json);
    return images_base64;
  } else {
    return '';
  }
};

const generateHeroImg = async (heroImg: FileLike): Promise<string> => {
  const prompt = `Here is a photo of a human being. Please create a cartoon version that looks just like them.
                  They will be a hero in a short picture book. Generate a color image.`;
  const response = await client.images.edit({
    model: imgModel,
    image: heroImg,
    prompt: prompt,
    quality: imgOutputQuality,
    size: imgOutputSize,
    n: 1,
  });
  const image_base64 = response.data ? response.data[0].b64_json : '';
  return image_base64 ? image_base64 : '';
};

const genPages = async (
  heroName: string,
  heroImg: FileLike,
  illustrationPrompts: string[]
): Promise<string[]> => {
  const totalPages = illustrationPrompts.length;
  const prompt = `Here is a photo of ${heroName}. They are going to be the hero in a colorful picture book that consists of
                  ${totalPages} pages. Each page will contain one picture. The style will be a colorful fantasy picture book. Please use
                  the following illustration descriptions to generate ${totalPages} images. Make sure they're all in color and are consistent
                  with each other in terms of style. Whenever the illustration description mentions ${heroName} just use a cartoonified version of ${heroName}
                  from the reference photo.
                  Illustration Prompts:
                  ${illustrationPrompts.join('\n\n')}`;
  const pages = await generateImage(prompt, [heroImg], totalPages);
  return pages;
};

// export default generateIllustrations = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {

// };

const main = async () => {
  const illustrationPrompts = [
    'A bright sunny schoolyard. A lively little boy named Owen with messy hair and a big grin is showing off by running laps while other kids watch. Beside him stands Hero, a quieter child with gentle eyes and a calm expression. Hero raises a finger and calmly challenges Owen to a race. The other kids in the background giggle and whisper, clearly doubting Hero.',
    'A race track drawn in chalk on the playground. Owen zooms ahead with a blur of motion, full of energy, kicking up dust. Hero is far behind, calmly jogging with short, steady steps. The other children cheer from the sidelines. Owen looks over his shoulder confidently, smiling smugly.',
    'Under a leafy tree by the track, Owen is stretched out on the grass, munching on a snack, then yawning and lying down to nap. Meanwhile, in the distance, Hero keeps walking past him quietly, step by step. A gentle breeze blows leaves across the scene.',
    'The finish line with a cheering group of kids. Hero is just about to cross it with a calm, focused expression. Owen is behind him, sprinting in a panic, eyes wide. A big banner says "Finish!" and the crowd of kids looks shocked and amazed. Hero wins the race with quiet determination.',
  ];
  const imgHero = await readFilesFromDisk(['testHero.jpg']);
  const pages = await genPages('Bob', imgHero[0], illustrationPrompts);
  for (let i = 0; i < pages.length; i++) {
    await writeFile(`page${i}.png`, pages[i], 'base64');
  }
};

main();

// const main = async () => {
//   const outputFile = 'output.png';
//   const testPrompt =
//     "Combine the two images into a children's coloring book format. Cartoonify the human in the photo and then have him sit at a table with everyone, eating.";
//   const testFiles = ['input.png', 'input2.png'];
//   const files = await readFilesFromDisk(testFiles);
//   const output = await generateImage(testPrompt, files);
//   await writeFile(outputFile, output, 'base64');
// };

// main();
