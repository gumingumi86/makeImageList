import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const headers = {
  'Access-Control-Allow-Origin': process.env.WEB_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  'Content-Type': 'application/json'
};

// S3 クライアントを初期化
const s3Client = new S3Client({ region: "ap-northeast-1" });

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ message: "CORS preflight check passed" }),
    };
  }

  try {
    // S3 バケット内のオブジェクトをリスト化
    const command = new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME,
      Prefix: process.env.IMAGE_FOLDER, // フォルダを指定
    });

    const response = await s3Client.send(command);

    // 画像ファイルのみをフィルタリング
    const imageUrls = (response.Contents || [])
      .filter((item) => /\.(png|jpe?g|webp|gif)$/i.test(item.Key))
      .map((item) => `${process.env.WEB_ORIGIN}/${item.Key}`);

    // 成功レスポンスを返す
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(imageUrls),
    };
  } catch (error) {
    console.error("Error fetching image list:", error);

    // エラーレスポンスを返す
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: "Failed to fetch image list" }),
    };
  }
};