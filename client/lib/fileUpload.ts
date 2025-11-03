import { supabase } from "./supabase";

export interface UploadedFile {
  name: string;
  url: string;
  path: string;
  type: string;
  size: number;
}

/**
 * Upload file to Supabase Storage
 * @param file File to upload
 * @param brandId Brand ID for path organization
 * @param category Category subfolder (logos, imagery, references, etc.)
 * @returns Upload result with public URL
 */
export async function uploadBrandFile(
  file: File,
  brandId: string,
  category: string,
): Promise<UploadedFile> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${brandId}/${category}/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("brand-assets")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("brand-assets").getPublicUrl(filePath);

  return {
    name: file.name,
    url: publicUrl,
    path: filePath,
    type: file.type,
    size: file.size,
  };
}

/**
 * Upload multiple files and create brand_assets records
 */
export async function uploadBrandFiles(
  files: File[],
  brandId: string,
  category: string,
  assetType: string,
): Promise<UploadedFile[]> {
  const uploadPromises = files.map((file) =>
    uploadBrandFile(file, brandId, category),
  );

  const uploadedFiles = await Promise.all(uploadPromises);

  // Create brand_assets records
  const assetRecords = uploadedFiles.map((file) => ({
    brand_id: brandId,
    file_name: file.name,
    file_url: file.url,
    file_type: file.type,
    file_size_bytes: file.size,
    asset_type: assetType,
    tags: [category],
  }));

  const { error } = await supabase.from("brand_assets").insert(assetRecords);

  if (error) {
    console.error("Error creating brand_assets records:", error);
  }

  return uploadedFiles;
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteBrandFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from("brand-assets")
    .remove([filePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
