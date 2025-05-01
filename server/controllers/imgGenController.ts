import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import OpenAI, { toFile } from 'openai';
import { readFile, writeFile } from 'fs/promises';
import { FileLike } from 'openai/uploads';

dotenv.config();

const client = new OpenAI();

// img generation constants
const imgModel = 'gpt-image-1';
const mimeType = 'image/png';
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
): Promise<undefined> => {
  const totalPages = illustrationPrompts.length;
  const prompt = `Here is a photo of ${heroName}. He is going to be the hero in a colorful picture book that consists of
                  ${totalPages} pages. Each page will contain one picture. The style will be a colorful fantasy picture book. Please use
                  the following illustration descriptions to generate ${totalPages} images. Make sure they're all in color and are consistent
                  with each other. Whenever the illustration description mentions ${heroName} just use a cartoonified version of ${heroName}
                  from the reference photo.`;
};

// export default generateIllustrations = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {

// };

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
