import axios from 'axios';
import * as dotenv from 'dotenv';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

dotenv.config();
const { CAPTCHA_API_KEY } = process.env;

export const getRecaptchaSolution = async (
  encodedImage,
  textInstructions,
  gridSize,
) => {
  const captchaRequestData = createCaptchaRequestData(
    encodedImage,
    textInstructions,
    gridSize,
  );
  console.log('sending captcha request...');
  const sendCaptchaResponse = await createCaptchaRequest(captchaRequestData);
  console.dir(sendCaptchaResponse);
  const { request: requestId } = sendCaptchaResponse;

  console.log('initiating response poll...');
  let captchaSolutionData: CaptchaSolutionData = {
    status: 0,
    request: '',
  };
  while (captchaSolutionData.status !== 1) {
    console.log('waiting 5s...');
    await delay(5000);
    captchaSolutionData = await getCaptchaSolution(requestId);
  }
  console.log('solution acquired! no longer polling 🎣');
  const { request: recaptchaSolution } = captchaSolutionData;
  console.log(`here be the solution: ${recaptchaSolution}`);

  return recaptchaSolution
    .replace(/click:/g, '')
    .split('/')
    .map((tile) => Number(tile));
};

type GridSize = 3 | 4;

interface CaptchaRequestData {
  method: 'base64';
  recaptcha: 1;
  body: string;
  textinstructions: string;
  recaptcharows: GridSize;
  recaptchacols: GridSize;
  lang: 'en';
  json: 1;
}

export const createCaptchaRequestData = (
  encodedImage: string,
  textInstructions: string,
  gridSize: GridSize,
): CaptchaRequestData => ({
  method: 'base64',
  recaptcha: 1,
  body: encodedImage,
  textinstructions: textInstructions,
  recaptcharows: gridSize,
  recaptchacols: gridSize,
  // TODO: previousID
  // TODO: can_no_answer
  lang: 'en',
  json: 1,
});

interface CreatedCaptchaRequestData {
  status: 0 | 1;
  request: string;
}

const createCaptchaRequest = async (
  captchaRequestData,
): Promise<CreatedCaptchaRequestData> => {
  const captchaRequestURL = `http://2captcha.com/in.php?key=${CAPTCHA_API_KEY}`;
  const response = await axios.post<CreatedCaptchaRequestData>(
    captchaRequestURL,
    captchaRequestData,
  );
  const { data } = response;
  return data;
};

interface CaptchaSolutionData {
  status: 0 | 1;
  request: string;
}

export const getCaptchaSolution = async (
  captchaId: string,
): Promise<CaptchaSolutionData> => {
  const getCaptchaSolutionURL = `http://2captcha.com/res.php?key=${CAPTCHA_API_KEY}&action=get&id=${captchaId}&json=1`;
  const response = await axios.get<CaptchaSolutionData>(getCaptchaSolutionURL);
  const { data } = response;
  return data;
};
