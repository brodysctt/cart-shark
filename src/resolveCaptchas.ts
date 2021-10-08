import axios from 'axios';

const { CAPTCHA_API_KEY } = process.env;

export type CaptchaResponse =
  | 'CAPCHA_NOT_READY'
  | { status: number; request: string }
  | void;

export const createCaptchaRequestData = (
  encodedImage: string,
  textInstructions: string,
) => ({
  key: CAPTCHA_API_KEY,
  method: 'base64',
  recaptcha: 1,
  body: encodedImage,
  textinstructions: textInstructions,
  lang: 'en',
  json: 1,
});

// TODO: Update to use request body 🤾‍♂️
export const sendCaptchaRequest = async (
  encodedImage: string,
  textInstructions: string,
) => {
  const twoCaptchaRequestURL = `http://2captcha.com/in.php?${CAPTCHA_API_KEY}&method=base64&recaptcha=1&body=${encodedImage}&textinstructions=${textInstructions}&lang=en`;
  try {
    await axios.post<string>(twoCaptchaRequestURL);
  } catch (err) {
    console.error(err);
  }
};

export const getCaptchaResponse = async (captchaId) => {
  const twoCaptchaResponseURL = `http://2captcha.com/res.php?key=${CAPTCHA_API_KEY}&action=get&id=${captchaId}&json=1`;
  console.log(twoCaptchaResponseURL);
  try {
    await axios.get<CaptchaResponse>(twoCaptchaResponseURL);
  } catch (err) {
    console.error(err);
  }
};
