import axios from 'axios';
import * as dotenv from 'dotenv';
// import { delay } from './utils';

dotenv.config();
const { CAPTCHA_API_KEY } = process.env;

interface CaptchaRequestData {
  method: 'base64';
  recaptcha: 1;
  body: string;
  textinstructions: string;
  lang: 'en';
  json: 1;
}

// TODO: Reimplement once testing in Insomnia is complete
export const resolveCaptchas = async (encodedImage, textInstructions) => {
  const captchaRequestData = createCaptchaRequestData(
    encodedImage,
    textInstructions,
  );
  console.log(JSON.stringify(captchaRequestData));

  console.log('sending captcha request...');
  const sendCaptchaResponse = await sendCaptchaRequest(captchaRequestData);
  console.dir(sendCaptchaResponse);
  // const { request: requestId } = sendCaptchaResponse;
  // console.log(`here be the captcha id: ${sendCaptchaResponse}`);

  // console.log('initiating response poll...');
  // let solution;
  // while (solution === 'CAPCHA_NOT_READY') {
  //   await delay(10000);
  //   console.log('hitting response endpoint...');
  //   solution = await getCaptchaSolution(requestId);
  // }
  // console.log('Solution acquired! No longer polling 🎣');
  // console.log(`here be the solution: ${solution}`);
  return;

  // TODO: click tiles as per response, submit solution
};

export const createCaptchaRequestData = (
  encodedImage: string,
  textInstructions: string,
): CaptchaRequestData => ({
  method: 'base64',
  recaptcha: 1,
  body: encodedImage,
  textinstructions: textInstructions,
  lang: 'en',
  json: 1,
});

// interface SendCaptchaReponse {
//   status: 0 | 1;
//   request: string;
// }

const sendCaptchaRequest = async (captchaRequestData: CaptchaRequestData) => {
  const captchaRequestURL = `http://2captcha.com/in.php?key=${CAPTCHA_API_KEY}`;
  console.log(captchaRequestURL);
  const response = await axios.post<CaptchaRequestData>(
    captchaRequestURL,
    captchaRequestData,
    // {
    //   transformResponse: (res: string): SendCaptchaReponse => JSON.parse(res),
    // },
  );

  return response.data;
};

interface CaptchaSolution {
  status: 0 | 1;
  request: string;
}

export const getCaptchaSolution = async (captchaId) => {
  const getCaptchaSolutionURL = `http://2captcha.com/res.php?key=${CAPTCHA_API_KEY}&action=get&id=${captchaId}&json=1`;
  return await axios.get(getCaptchaSolutionURL, {
    transformResponse: (res: string): CaptchaSolution => JSON.parse(res),
  });
};
