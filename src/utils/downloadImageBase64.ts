import axios, { AxiosResponse } from 'axios';

export const downloadImageBase64 = async (url: string) => {
  const response: AxiosResponse<ArrayBuffer> = await axios({
    method: 'get',
    url,
    responseType: 'arraybuffer',
  });

  return Buffer.from(response.data).toString('base64');
};
