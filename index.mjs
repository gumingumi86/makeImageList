import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const BUCKET_NAME = "usagi-server-homepage-new";
const IMAGE_FOLDER = "images/"; // 画像が格納されているフォルダ
const headers = {
  'Access-Control-Allow-Origin': 'https://www.usagi-server.com',
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
      Bucket: BUCKET_NAME,
      Prefix: IMAGE_FOLDER, // フォルダを指定
    });

    const response = await s3Client.send(command);

    // 画像ファイルのみをフィルタリング
    const imageUrls = (response.Contents || [])
      .filter((item) => /\.(png|jpe?g|webp|gif)$/i.test(item.Key))
      .map((item) => `https://www.usagi-server.com/${item.Key}`);

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