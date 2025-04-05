import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const BUCKET_NAME = "usagi-server-homepage-new";
const IMAGE_FOLDER = "images/"; // 画像が格納されているフォルダ

// S3 クライアントを初期化
const s3Client = new S3Client({ region: "ap-northeast-1" });

export const handler = async (event) => {
  try {
    // S3 バケット内のオブジェクトをリスト化
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: IMAGE_FOLDER, // フォルダを指定
    });

    const data = await s3Client.send(command);

    // 画像ファイルのみをフィルタリング
    const imageUrls = (data.Contents || [])
      .filter((item) => /\.(png|jpe?g|webp|gif)$/i.test(item.Key))
      .map((item) => `https://www.usagi-server.com/${item.Key}`);

    // 成功レスポンスを返す
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(imageUrls),
    };
  } catch (error) {
    console.error("Error fetching image list:", error);

    // エラーレスポンスを返す
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch image list" }),
    };
  }
};