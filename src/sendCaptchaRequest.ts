import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const { TWOCAPTCHA_API_KEY } = process.env;
const TWOCAPTCHA_BASE_URL = 'http://2captcha.com';

export const sendCaptchaRequest = async (
  encodedImage: string,
  textInstructions: string,
) => {
  const TWOCAPTCHA_REQUEST_URL = `${TWOCAPTCHA_BASE_URL}/in.php?${TWOCAPTCHA_API_KEY}&method=base64&recaptcha=1&body=${encodedImage}&textinstructions=${textInstructions}`;
  try {
    await axios.post(TWOCAPTCHA_REQUEST_URL);
  } catch (err) {
    console.error(err);
  }
};
