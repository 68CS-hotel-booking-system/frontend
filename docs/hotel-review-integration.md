# Luồng Owner gửi hồ sơ, Admin xét duyệt

Frontend đã được cập nhật fast-forward từ `origin/develop` đến `d9c3e41` trước khi triển khai.
Các thay đổi chưa commit có sẵn được giữ lại. Không commit hoặc push.

## Sử dụng

1. Owner mở **Khách sạn → Tổng quan**, lưu thông tin, liên hệ, loại phòng và phòng vật lý.
2. Chọn **Gửi hồ sơ xét duyệt** và xác nhận. Server nhận version khách sạn, tự chụp nội dung đã lưu.
3. Khi PENDING, các màn thông tin/chính sách chuyển sang chỉ đọc; ảnh, tiện ích và cấu hình phòng
   bị chặn ghi. Thao tác readiness của buồng phòng và nghiệp vụ vận hành vẫn giữ nguyên.
4. Admin mở menu **Hệ thống & Quản trị → Xét duyệt khách sạn**, lọc trạng thái, chọn **Xem hồ sơ**.
5. Trang hồ sơ hiển thị snapshot: thông tin, liên hệ, ảnh/album, tiện ích, loại phòng, phòng vật lý
   và thời điểm/người gửi. Admin không có form sửa nội dung.
6. Admin chọn **Duyệt hồ sơ** để mở bán hoặc **Từ chối hồ sơ**, nhập lý do bắt buộc.
7. Owner thấy lý do từ chối trên Tổng quan, chỉnh sửa rồi **Gửi lại hồ sơ**. Hồ sơ cũ giữ nguyên.

Checklist phần trăm chỉ hỗ trợ theo dõi. Frontend không dùng phần trăm để tự quyết định đủ điều kiện
gửi/mở bán; lỗi 422 và từng điều kiện thiếu do backend trả về được hiển thị cho người dùng.

## Route

- Owner gửi/theo dõi: `/hotels/:hotelId`.
- Danh sách Admin: `/admin/hotel-review-requests` — 20 hồ sơ/trang, số trang ở UI đổi từ page=0 của API.
- Chi tiết dùng chung Owner/Admin: `/hotel-review-requests/:requestId`.
- Owner truy cập URL danh sách Admin bị chuyển về danh sách khách sạn. Backend kiểm lại quyền đọc,
  ownership và mọi quyết định; frontend không dùng role từ form để cấp quyền.

## API

Tất cả đi qua `shared/api/http.ts`, cùng origin `/api/v1`, có AbortSignal và Zod kiểm response.

| Thao tác | API |
|---|---|
| Owner gửi | `POST /management/hotels/{hotelId}/review-requests`, body `{expectedVersion}` của khách sạn |
| Admin liệt kê | `GET /admin/hotel-review-requests?page=0&size=20&status=PENDING` |
| Đọc snapshot | `GET /hotel-review-requests/{requestId}` |
| Admin duyệt | `POST /admin/hotel-review-requests/{requestId}/approve`, body `{expectedVersion}` của hồ sơ |
| Admin từ chối | `POST /admin/hotel-review-requests/{requestId}/reject`, body `{expectedVersion,reason}` |
| Owner lấy lại trạng thái | `GET /management/hotels/{hotelId}/review-requests?page=0&size=1` |

API GET theo khách sạn được bổ sung ở backend cùng thay đổi này để trạng thái còn đúng sau F5,
đăng nhập lại hoặc đổi thiết bị. Có thể phân trang đọc lịch sử. Tên khách sạn ở danh sách Admin lấy
từ snapshot, kể cả Owner đã đổi tên ở lần gửi sau. Các API cũ giữ hợp đồng cũ.

Frontend không gọi API PATCH approve cũ từ checklist nữa. Nó chỉ quyết định một requestId cụ thể
với version hồ sơ vừa đọc. Mutation không tự retry; cả thành công lẫn lỗi đều tải lại dữ liệu liên quan
để xử lý trường hợp đã có quyết định ở tab/người dùng khác. Nếu truy vấn trạng thái lỗi, UI giữ chỉ đọc.

Ảnh snapshot được lấy URL mới từ `/media/{mediaId}/access`, không lấy ảnh/album hiện tại của hotel
để thay thế nội dung cũ. URL hết hạn được tải lại; ảnh lỗi có nút thử lại. Cần cấu hình R2 ở backend
để các endpoint ảnh hoạt động.

## Kiểm chứng

- `npm run check`: lint, TypeScript, Vitest và production build. Test bổ sung kiểm contract,
  version đúng loại, lý do bắt buộc, lỗi 403/404/409/422, không retry mutation, invalidate cache,
  khóa pending/fail-closed, chỉ đọc của Admin và khôi phục quyền sau từ chối.
- Backend `mvn verify` thành công; `HotelReviewIntegrationTests` có 17 test trên PostgreSQL 17,
  gồm endpoint lịch sử đúng phạm vi Owner/Admin.
- Trình duyệt Chromium, desktop 1440px và mobile 390px: gọi API nghiệp vụ thật của Spring Boot
  với PostgreSQL riêng. Đã kiểm gửi 201 → từ chối 200 → sửa 200 → gửi lại 201 → duyệt 200,
  trạng thái sau F5, reason không trắng, snapshot cũ không đổi và Admin không có form sửa DRAFT.
  Môi trường QA dùng JWT ký riêng cho các tài khoản test; chỉ request khôi phục phiên được mock,
  các request nghiệp vụ và kiểm role/ownership phía backend là thật. Không dùng dữ liệu người dùng.
- Chưa kiểm thử storage R2 thật trong luồng trình duyệt; môi trường QA không bật R2.

Frontend này cần chạy cùng backend có các API xét duyệt và API đọc lịch sử theo khách sạn nêu trên.
