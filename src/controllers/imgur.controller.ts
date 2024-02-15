import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
const Imgur = await import('imgur');
const ImgurClient = Imgur.ImgurClient;
import { appError, successHandle } from '@/utils';

const client = new ImgurClient({
  clientId: process.env.IMGUR_CLIENTID,
  clientSecret: process.env.IMGUR_CLIENT_SECRET,
  refreshToken: process.env.IMGUR_REFRESH_TOKEN,
});

export const upload = multer({
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter(_req, file, cb)
  {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
      cb(Error('檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。'));
    }
    cb(null, true);
  },
}).any();
// 將文件上傳的中間件和後續處理分開
class ImgurController {
  public static async createImgurHandler(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.files) {
        throw appError({ code: 400, message: '請上傳檔案', next });
        }
        const response = await client.upload({
          image: req.files[0].buffer.toString('base64'),
          type: 'base64',
          album: process.env.IMGUR_ALBUM_ID,
        });
        successHandle(res, 'Successfully uploaded to imgur', { result: response.data.link });
      } catch (error) {
        if (error instanceof Error) {
          appError({ code: 500, message: error.message, next });
        }
      }
  };
}

export default ImgurController;
