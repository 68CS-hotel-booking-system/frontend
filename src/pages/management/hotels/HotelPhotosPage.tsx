import { useRef, useState } from 'react'
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  PictureOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Button, Image, Popconfirm, Tag, Tooltip, Upload, message } from 'antd'
import type { UploadFile } from 'antd'
import {
  uploadHotelMedia,
  useHotelImagesQuery,
  useHotelWorkspace,
} from '@/features/hotels'
import { ApiError } from '@/shared/api/api-error'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { PageLoading } from '@/shared/ui/PageLoading'

export function HotelPhotosPage() {
  const { hotel, hotelId } = useHotelWorkspace()
  const { mode } = useDataMode()
  const activeWrite = useRef(false)
  const uploadedIds = useRef(new Map<string, string>())
  const imagesQuery = useHotelImagesQuery(hotelId)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isUpdatingGallery, setIsUpdatingGallery] = useState(false)

  if (!hotel) return null

  const breadcrumbItems = [
    { label: 'Khách sạn', to: '/hotels' },
    { label: hotel.name, to: `/hotels/${hotelId}` },
    { label: 'Hình ảnh' },
  ]

  const existingImages = imagesQuery.data ?? []
  const coverImage = existingImages.find((img) => img.cover) || (existingImages.length > 0 ? existingImages[0] : null)
  const displayCoverUrl = coverImage?.url || hotel.coverImageUrl

  const writesDisabled = !imagesQuery.canWrite || isUploading || isUpdatingGallery

  const runWrite = async (upload: boolean, operation: () => Promise<unknown>, success: string) => {
    if (activeWrite.current || !imagesQuery.canWrite) return
    activeWrite.current = true
    if (upload) setIsUploading(true)
    else setIsUpdatingGallery(true)
    try {
      await operation()
      message.success(success)
      if (upload) {
        uploadedIds.current.clear()
        setFileList([])
      }
    } catch (error) {
      message.error(error instanceof ApiError && error.status === 409
        ? 'Dữ liệu ảnh hoặc phiên bản đã thay đổi. Đã yêu cầu tải lại; hãy kiểm tra thư viện rồi thử lại thao tác.'
        : error instanceof Error ? error.message : 'Không thể lưu thư viện ảnh.')
    } finally {
      activeWrite.current = false
      setIsUploading(false)
      setIsUpdatingGallery(false)
    }
  }

  const handleUpload = () => runWrite(true, () => imagesQuery.saveGallery(async (current) => {
    for (const item of fileList) {
      const uploadKey = `${hotelId}:${item.uid}`
      if (!uploadedIds.current.has(uploadKey)) {
        if (!item.originFileObj) throw new Error(`Không đọc được tệp ${item.name}. Vui lòng chọn lại.`)
        const uploaded = await uploadHotelMedia({ file: item.originFileObj, hotelId })
        uploadedIds.current.set(uploadKey, uploaded.id)
      }
    }
    const newIds = fileList.map((item) => uploadedIds.current.get(`${hotelId}:${item.uid}`)!)
      .filter((id) => !current.some((image) => image.mediaId === id))
    return [...current, ...newIds.map((mediaId, index) => ({
      mediaId, sortOrder: 0, cover: !current.some((image) => image.cover) && index === 0,
    }))].map((image, sortOrder) => ({ ...image, sortOrder }))
  }), `Đã tải lên và lưu ${fileList.length} hình ảnh vào thư viện!`)

  const handleSetCover = (targetMediaId: string) => runWrite(false, () => imagesQuery.saveGallery((current) => {
    if (!current.some((image) => image.mediaId === targetMediaId)) throw new Error('Ảnh đã bị thay đổi. Vui lòng kiểm tra thư viện vừa tải lại.')
    return current.map((image) => ({ ...image, cover: image.mediaId === targetMediaId }))
  }), 'Đã cập nhật ảnh bìa đại diện của khách sạn!')

  const handleDeleteImage = (targetMediaId: string) => runWrite(false, () => imagesQuery.saveGallery((current) => {
    const remaining = current.filter((image) => image.mediaId !== targetMediaId)
    const hasCover = remaining.some((image) => image.cover)
    return remaining.map((image, sortOrder) => ({ ...image, sortOrder, cover: image.cover || !hasCover && sortOrder === 0 }))
  }), 'Đã gỡ ảnh khỏi thư viện!')

  const handleMoveOrder = (index: number, direction: 'left' | 'right') => {
    const mediaId = existingImages[index]?.mediaId
    return runWrite(false, () => imagesQuery.saveGallery((current) => {
      const from = current.findIndex((image) => image.mediaId === mediaId)
      const to = direction === 'left' ? from - 1 : from + 1
      if (from < 0 || to < 0 || to >= current.length) throw new Error('Thứ tự ảnh đã thay đổi. Vui lòng kiểm tra thư viện vừa tải lại.')
      const reordered = [...current]
      const previous = reordered[from]
      reordered[from] = reordered[to]
      reordered[to] = previous
      return reordered.map((image, sortOrder) => ({ ...image, sortOrder }))
    }), 'Đã thay đổi thứ tự ảnh!')
  }
  return (
    <div className="hotel-photos-page max-w-5xl space-y-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        kicker="BỘ SƯU TẬP &amp; HÌNH ẢNH"
        title="Hình ảnh khách sạn"
        description="Quản lý ảnh bìa đại diện và danh sách hình ảnh thực tế của cơ sở lưu trú. Hình ảnh rõ nét sẽ thu hút khách đặt phòng hơn."
        extra={
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={isUploading}
            disabled={fileList.length === 0 || writesDisabled}
            onClick={handleUpload}
            className="!bg-[#0b5f53]"
          >
            Lưu vào album ({fileList.length})
          </Button>
        }
      />

      {mode === 'mock' && <p role="status">Thư viện ảnh chưa có dữ liệu mẫu. Chuyển sang API để tải và lưu ảnh thật.</p>}

      {/* Ảnh bìa đại diện hiện tại */}
      <div className="bg-white p-5 rounded-2xl border border-[#dce7e3] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#12211d] m-0 flex items-center gap-2">
            <PictureOutlined className="text-[#0b5f53]" />
            <span>Ảnh bìa đại diện hiện tại</span>
          </h3>
          {displayCoverUrl && (
            <Tag color="gold" className="!rounded-md">
              <StarFilled /> Ảnh bìa
            </Tag>
          )}
        </div>

        {displayCoverUrl ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative rounded-xl overflow-hidden w-full sm:w-72 h-44 bg-[#eef8f5] border border-[#dce7e3] shrink-0">
              <Image
                src={displayCoverUrl}
                alt={hotel.name}
                className="w-full h-full object-cover rounded-xl"
                rootClassName="w-full h-full"
              />
            </div>
            <div className="text-xs text-[#5f736e] space-y-1.5">
              <p className="font-semibold text-[#12211d] text-sm mb-1">
                Ảnh đại diện xuất hiện đầu tiên trên kết quả tìm kiếm và thẻ khách sạn.
              </p>
              <p>
                Để đổi ảnh bìa, bạn hãy chọn một ảnh khác trong thư viện bên dưới và bấm nút{' '}
                <strong className="text-[#0b5f53]">"Đặt làm ảnh bìa"</strong>.
              </p>
              {coverImage && (
                <div className="text-[11px] text-[#8c9e99] pt-1">
                  Mã media: {coverImage.mediaId}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-[#f7fbfa] rounded-xl border border-dashed border-[#dce7e3] text-xs text-[#5f736e]">
            Chưa thiết lập ảnh bìa. Hãy chọn ảnh và tải lên ở mục bên dưới để hệ thống tự động gán ảnh bìa đầu tiên.
          </div>
        )}
      </div>

      {/* Thư viện hình ảnh đã lưu trên hệ thống */}
      <div className="bg-white p-5 rounded-2xl border border-[#dce7e3] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#12211d] m-0">
              Thư viện hình ảnh ({existingImages.length} ảnh)
            </h3>
            <p className="text-xs text-[#5f736e] mt-1 mb-0">
              Nhấp vào ảnh để xem kích thước lớn. Khách sạn cần tối thiểu 5 ảnh để đạt chuẩn hiển thị tốt nhất.
            </p>
          </div>
          {existingImages.length < 5 && (
            <Tag color="orange" className="!rounded-md">
              Cần thêm {5 - existingImages.length} ảnh nữa
            </Tag>
          )}
        </div>

        {imagesQuery.isPending ? (
          <PageLoading />
        ) : imagesQuery.isError ? (
          <ErrorState
            error={imagesQuery.error}
            onRetry={() => void imagesQuery.refetch()}
          />
        ) : existingImages.length === 0 ? (
          <div className="py-8 text-center bg-[#f7fbfa] rounded-xl border border-dashed border-[#dce7e3]">
            <EmptyState
              title="Chưa có hình ảnh nào trong thư viện"
              description="Khách sạn của bạn chưa tải lên bức ảnh nào. Chọn ảnh ở mục bên dưới để tải lên."
            />
          </div>
        ) : (
          <Image.PreviewGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {existingImages.map((img, index) => {
                const isCover = img.cover || index === 0 && !existingImages.some((i) => i.cover)

                return (
                  <div
                    key={img.mediaId}
                    className={`rounded-xl border overflow-hidden bg-white shadow-xs transition-shadow hover:shadow-md flex flex-col ${
                      isCover ? 'border-[#0b5f53] ring-2 ring-[#0b5f53]/20' : 'border-[#dce7e3]'
                    }`}
                  >
                    <div className="relative h-40 bg-[#f7fbfa] overflow-hidden">
                      {img.url ? (
                        <Image
                          src={img.url}
                          alt={`Ảnh khách sạn ${index + 1}`}
                          className="w-full h-40 object-cover"
                          rootClassName="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-xs text-[#8c9e99] bg-[#eef8f5]">
                          <PictureOutlined className="text-2xl mb-1 text-[#0b5f53]" />
                          <span>Ảnh #{index + 1}</span>
                        </div>
                      )}

                      <div className="absolute top-2 left-2 flex gap-1 z-10">
                        <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs">
                          #{index + 1}
                        </span>
                        {isCover && (
                          <span className="px-2 py-0.5 rounded-md bg-[#0b5f53] text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs">
                            <StarFilled /> Bìa
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white flex items-center justify-between gap-1 border-t border-[#edf4f1] mt-auto">
                      <div className="flex items-center gap-1">
                        <Tooltip title="Chuyển về trước">
                          <Button
                            size="small"
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            disabled={index === 0 || writesDisabled}
                            onClick={() => handleMoveOrder(index, 'left')}
                          />
                        </Tooltip>
                        <Tooltip title="Chuyển về sau">
                          <Button
                            size="small"
                            type="text"
                            icon={<ArrowRightOutlined />}
                            disabled={index === existingImages.length - 1 || writesDisabled}
                            onClick={() => handleMoveOrder(index, 'right')}
                          />
                        </Tooltip>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isCover && (
                          <Tooltip title="Đặt làm ảnh bìa">
                            <Button
                              size="small"
                              icon={<StarOutlined />}
                              disabled={writesDisabled}
                              onClick={() => handleSetCover(img.mediaId)}
                            >
                              Đặt bìa
                            </Button>
                          </Tooltip>
                        )}
                        <Popconfirm
                          title="Gỡ ảnh này khỏi khách sạn?"
                          okText="Gỡ"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => handleDeleteImage(img.mediaId)}
                        >
                          <Button
                            size="small"
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            disabled={writesDisabled}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Image.PreviewGroup>
        )}
      </div>

      {/* Upload Zone */}
      <div className="bg-white p-5 rounded-2xl border border-[#dce7e3] shadow-xs">
        <h3 className="text-sm font-bold text-[#12211d] mb-1">Tải lên bộ ảnh mới</h3>
        <p className="text-xs text-[#5f736e] mb-4">
          Hỗ trợ định dạng JPG, PNG, WEBP. Dung lượng tối đa 10MB mỗi ảnh. Các ảnh tải lên sẽ tự động lưu vào bộ sưu tập của khách sạn.
        </p>

        <Upload
          disabled={mode !== 'api' || isUploading || isUpdatingGallery}
          listType="picture-card"
          fileList={fileList}
          onChange={({ fileList: nextList }) => setFileList(nextList)}
          beforeUpload={() => false}
          multiple
          accept="image/*"
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }} className="text-xs">
              Chọn ảnh
            </div>
          </div>
        </Upload>

        {fileList.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#dce7e3] flex justify-end">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={isUploading}
              disabled={writesDisabled}
              onClick={handleUpload}
              className="!bg-[#0b5f53]"
            >
              Lưu {fileList.length} hình ảnh đã chọn
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

