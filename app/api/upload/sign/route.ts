import cloudinary from "@/lib/cloudinary";
export async function POST(){
  const timestamp = Math.round(Date.now()/1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET },
    process.env.CLOUDINARY_API_SECRET!
  );
  return Response.json({ timestamp, signature, cloudName: process.env.CLOUDINARY_CLOUD_NAME, uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET });
}
