# Giao diện đặt phòng và trạng thái giữ phòng — 11/11/2026

## Sửa giao diện

Đã dừng frontend cổng 5173 và backend cổng 8080 theo yêu cầu. Chỉ mở tạm frontend cổng 5174 để kiểm thử bằng Playwright với API mô phỏng, sau kiểm tra sẽ dừng phiên này.

Trang chi tiết dùng lại bố cục đã có trong code staging qua `features/discovery/components/HotelDetailView.tsx`: lưới ảnh, tiêu đề và thông tin bên trái, khung đặt phòng màu cam bên phải, lịch chọn ngày, thanh đặt phòng mobile. Dữ liệu API được ghép vào các vị trí trong bố cục; không dùng màn chi tiết dạng form đơn giản thay thế.

`/explore` dùng lại thanh tìm kiếm, bộ lọc và thẻ chỗ nghỉ của trang hiện có. Đã bỏ màn form tìm kiếm lớn. Giá/sức chứa/tổng tiền đến từ API; đổi ngày/số khách/số phòng/hạng phòng làm báo giá cũ không còn dùng được.

Ảnh dùng ảnh bìa lấy từ kết quả API/media khi có. Hiện chưa có endpoint công khai cho toàn bộ gallery, nên không lấy ảnh quản lý vượt quyền hoặc chèn ảnh demo vào khách sạn thật. Các mục đánh giá/chủ nhà/phí/chính sách thiếu dữ liệu được ẩn hoặc ghi rõ chưa khả dụng. Slug demo như `cloud-pine` vẫn giữ giao diện minh họa, không tạo đơn thật.

## Kiểm tra đặt phòng / giữ phòng / QR

| Phần | Trạng thái code hiện tại |
| --- | --- |
| Báo giá và tạo booking | Có. `POST /hotels/{id}/quote`, `POST /bookings`; đơn ban đầu `PENDING_PAYMENT`. |
| Hạn thanh toán 15 phút | Có `expiresAt = now + holdTtl`; mặc định `booking.hold-ttl=PT15M`. |
| Giữ tồn phòng | Inventory đã có `hold`, `confirm`, `release` và kiểm tra bản ghi HELD còn hạn. **Luồng tạo booking chưa gọi `hold`.** |
| Tự hết hạn / giải phóng | Chưa thấy luồng tự chuyển booking sang EXPIRED và gọi release khi hết hạn. |
| QR / đếm ngược 15 phút | Chưa có API/payload và màn QR riêng. FE hiện hiển thị hạn thanh toán. |
| VNPay | Có code tạo URL thanh toán, nhận IPN và đọc trạng thái. Chưa cấu hình merchant local, chưa kiểm thử giao dịch sandbox thành công. |
| Xác nhận booking sau thanh toán | IPN hiện ghi trạng thái payment/biên nhận; chưa nối xác nhận booking và tồn phòng. |

Không thể coi có `expiresAt` là đã giữ được tồn phòng. Chưa xác nhận chuỗi đặt phòng → giữ đủ tồn → QR → thanh toán/xử lý hết hạn đã hoạt động.

Frontend đổi nhãn “Hạn giữ chỗ” thành “Hạn thanh toán” để không mô tả vượt khả năng của backend. Đợt sửa này không thay backend hoặc tự thêm QR giả.

## Kiểm tra đã thực hiện

- `npm.cmd run check`: 62 file / 311 test thành công, lint/typecheck/build thành công. Sau chỉnh sửa cuối đã kiểm tra lại lint/typecheck/build.
- Playwright với API mô phỏng: vô hiệu hóa báo giá khi đổi ngày; lỗi giá thay đổi 409 và thử lại; payload tạo đơn lấy tổng server; lỗi thanh toán; danh sách/chi tiết đơn; tìm kiếm → chi tiết; check-in bị backend từ chối; lỗi tải hạng phòng; desktop/mobile không tràn ngang.
- Đã xem ảnh desktop/mobile của tìm kiếm và khung đặt phòng sau khi ghép lại. Mechanical UI detector trả danh sách rỗng.
- Chưa thử giao dịch VNPay thật, chưa xác nhận giữ tồn/QR xuyên suốt. Build còn cảnh báo bundle lớn hơn 500 kB.

Chưa commit, push hoặc deploy. Backend và frontend dành cho người dùng được giữ ở trạng thái dừng.
