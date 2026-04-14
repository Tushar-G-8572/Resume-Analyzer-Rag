import ImageKit from '@imagekit/nodejs'
import { config } from '../../config/config.js'

const imageKitClient = new ImageKit({
  privateKey: config.IMAGEKIT_PRIVATE_KEY
})

export async function storeResumeAndGetUrl(buffer) {
  if (!buffer) {
    throw new Error("File buffer is missing");
  }

  const base64File = buffer.toString("base64");

  const response = await imageKitClient.files.upload({
    file: base64File, // 🔥 FIX HERE
    fileName: `resume-${Date.now()}.pdf`,
    folder: "Resume/"
  });

  return response.url;
}