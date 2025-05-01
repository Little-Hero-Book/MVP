import { Request, Response, NextFunction } from 'express';
import { ServerError } from '../types';
import OpenAI, { toFile } from 'openai';
import { Image } from 'openai/resources/images';
import fs from 'fs';

const openAIclient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// constants
const imgModel = 'gpt-image-1';
const imgOutputSize = '1024x1024';
const imgOutputQuality = 'low';

// this is the main function to be used as middleware
// all other functions are helper functions
export const generateIllustrations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // get info about the hero
    const heroName = req.body.name;
    const files = req.files as Express.Multer.File[];
    const heroPhoto = files[0]?.buffer;
    const heroPhotoMimeType = files[0]?.mimetype;

    // generate cartoonified version of the hero for img model reference
    const heroImg = await genHeroImg(heroPhoto, heroPhotoMimeType);
    res.locals.heroImg = heroImg;

    // get info about number of illustrations and their prompts
    const illustrationPrompts = [...res.locals.illustrationPrompts];
    const numberOfPages = illustrationPrompts.length;

    // generate actual illustrations
    const illustrations = [] as Buffer[];
    const contextImages = [heroImg]
    const initialPrompt = `These are illustrations for a short picture book of ${numberOfPages} pages.
                           The hero of the story is ${heroName}.
                           The first image is of the hero.
                           
                           The following are the illustration prompts for each page:\n\n${illustrationPrompts.join('\n\n')}`
    for (let i=0; i < illustrationPrompts.length; i++) {
      const tempPrompt = initialPrompt + '\n\n' + `Generate the image for page ${i} using the following images as context and the following:
      ${illustrationPrompts[i]}`
      const currentIllustration = await genImg(tempPrompt, contextImages);
      contextImages.push(currentIllustration);
      illustrations.push(currentIllustration);
    }
    res.locals.illustrations = illustrations;
    dumpBuffersToPngFiles(illustrations);  // dump the outputs to disk for testing

    next();
  } catch (err) {
    const serverError: ServerError = {
      log: `Error generating illustrations: ${err}`,
      status: 500,
      message: { err: 'An error occurred while generating the illustrations' },
    };
    return next(serverError);
  }
};

const genHeroImg = async (photo: Buffer, mimeType: string): Promise<Buffer> => {
  const prompt = `This is a photo of someone who will be a hero in a story book.
                  Please generate a cartoonish version of them that's worthy of
                  a picture book illustration. Make sure the face and hair style
                  matches that of the original photo.`;

  const rsp = await openAIclient.images.edit({
    model: imgModel,
    image: await toFile(photo, null, { type: mimeType }),
    prompt: prompt,
    quality: imgOutputQuality,
    size: imgOutputSize,
  });

  if (!rsp.data) {
    throw new ReferenceError('image data not returned for hero image');
  }
  const rspImageData = rsp.data as Image[];
  const rspImgBase64 = rspImageData?[0].b64_json;
  const imgBytes = Buffer.from(rspImgBase64, 'base64');
  return imgBytes;
};

const genImg = async (prompt: string, contextImgs: Buffer[]): Promise<Buffer> => {
  const rsp = await openAIclient.images.edit({
    model: imgModel,
    image: await Promise.all(contextImgs.map(async (img) => await toFile(img, null, { type: 'image/png' }))),
    prompt: prompt,
    quality: imgOutputQuality,
    size: imgOutputSize,
  });
  return Buffer.from(rsp.data[0].b64_json, 'base64')
};

const dumpBuffersToPngFiles = (imgBuffers: Buffer[]) => {
  imgBuffers.forEach((buff, idx) => fs.writeFileSync(`${idx}.png`, buff))
};

// dry-run test
const mainTest = async () => {
  console.log(`OPENAI_API_KEY is: ${process.env.OPENAI_API_KEY}`);

  console.log('The test should be here somewhere...');

  // test genHeroImg
  const fs = await import('fs');
  const inputImg = fs.readFileSync('./testHero.jpg');
  const heroImg = await genHeroImg(inputImg, 'image/jpeg');
  fs.writeFileSync('testHeroImg.png', heroImg);
};

mainTest();
