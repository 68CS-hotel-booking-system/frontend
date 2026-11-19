export const acceptedImageTypes = 'image/jpeg,image/png,image/webp'

export function imageUploadError(file: File): string | null {
  if (file.size === 0) return 'Tệp ảnh trống.'
  if (file.size > 5 * 1024 * 1024) return 'Ảnh vượt quá 5 MB.'
  if (file.type && !acceptedImageTypes.split(',').includes(file.type)) return 'Chọn ảnh JPG, PNG hoặc WebP.'
  return null
}
