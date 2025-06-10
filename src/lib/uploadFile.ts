import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.YANDEX_STORAGE_ENDPOINT!,
  region: "ru-central1",
  credentials: {
    accessKeyId: process.env.YANDEX_ACCESS_KEY_ID!,
    secretAccessKey: process.env.YANDEX_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFile(file: File | Blob, path: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.YANDEX_BUCKET_NAME!,
    Key: path,
    Body: file,
    ContentType: file instanceof File ? file.type : "application/octet-stream",
  });

  await s3Client.send(command);

  return `${process.env.YANDEX_STORAGE_URL}/${path}`;
} 