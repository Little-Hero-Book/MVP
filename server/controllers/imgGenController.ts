import { Request, Response, NextFunction } from 'express';
import { ServerError } from '../types';
import OpenAI, { toFile } from 'openai';
import { Image } from 'openai/resources/images';

const openAIclient = new OpenAI();

// constants
const imgModel = '';
const imgOutputSize = '1024x1024';
const imgOutputQuality = 'low';
const imgOutputRspFormat = 'b64_json';

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

    // get info about number of illustrations and their prompts
    const illustrationPrompts = res.locals.illustrationPrompts;
    const numberOfPages = illustrationPrompts.length;

    // generate actual illustrations
    const illustrations = [] as string[];

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

const genHeroImg = async (photo, mimeType): Promise<Buffer> => {
  const prompt = `This is a photo of someone who will be a hero in a story book.
                  Please generate a cartoonish version of them that's worthy of
                  a picture book illustration. Make sure the face and hair style
                  matches that of the original photo.`;
  
  const rsp = await openAIclient.images.edit({
    model: imgModel,
    image: photo,
    prompt: prompt,
    quality: imgOutputQuality,
    size: imgOutputSize,
    response_format: imgOutputRspFormat
  });

  if (!rsp.data) {
    throw new ReferenceError('image data not returned for hero image')
  }
  const rspImageData = rsp.data?[0] as Image;
  const rspImgBase64 = rspImageData.b64_json;
  const imgBytes = Buffer.from(rspImgBase64, 'base64')
  return imgBytes;
};

// dry-run test
const mainTest = async () => {
  console.log(`OPENAI_API_KEY is: ${process.env.OPENAI_API_KEY}`);

  console.log('The test should be here somewhere...');
};

mainTest();
