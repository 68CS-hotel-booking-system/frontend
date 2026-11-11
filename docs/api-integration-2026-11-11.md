# Nối API sau khi đồng bộ develop — 11/11/2026

Đã fast-forward backend tới `5db67b8`, frontend tới `a11666c`, sau đó khôi phục thay đổi local có sẵn. Đã giải quyết xung đột bằng cách giữ cả chức năng mới từ develop và phần hồ sơ/nhân sự/VNPay local. Không commit, push hoặc deploy trong đợt này.

## Phần nối mới

| Giao diện | API |
| --- | --- |
| Trang chủ và `/explore` | `GET /hotels/search`, `/cities`, `/media/{id}/access` |
| `/stays/{UUID}` | `GET /hotels/{id}`, `/room-types`, `/availability`; `POST /hotels/{id}/quote`, `/bookings` |
| `/my-bookings` | `GET /bookings`, `/bookings/{id}`; `POST /payments/bookings/{id}/vnpay` |
| Khiếu nại từ chi tiết đơn | `POST /bookings/{id}/complaints` |
| `/my-complaints` | `GET /me/complaints`, `/me/complaints/{id}` |
| `/bookings` và tab đặt phòng khách sạn | `GET /management/hotels/{id}/bookings`, chi tiết đơn; `PUT .../room-assignments`; `POST .../check-in`, `/check-out`, `/late-arrival`, `/no-show` |
| `/contracts` | Danh sách/tạo hợp đồng đã có; bổ sung `POST /admin/hotels/{id}/contracts/{contractId}/activate`, `/terminate` |
| `/financial-access` | Gắn màn quyền tài chính đã có vào route và lựa chọn khách sạn thật |
| Tổng quan khách sạn | `POST /management/hotels/{id}/suspend`, `/resume`; `POST /admin/hotels/{id}/lock`, `/unlock` |
| `/system-status` | Health thật và cấu hình làm mới |

Các API trong bảng có prefix `/api/v1`, trừ Actuator. Không gửi lại mutation tự động.

Các phần đồng nghiệp đã nối (album, tiện ích, sửa khách sạn/loại phòng/phòng, giá, chính sách, tồn phòng/lịch chặn) được giữ lại. Các thay đổi hồ sơ, nhân sự và VNPay có sẵn ở local cũng được giữ lại.

## Hành vi đáng chú ý

- Giá cuối cùng và trạng thái đơn lấy từ server. Thay ngày, số khách, số phòng hoặc hạng phòng sẽ vô hiệu hóa báo giá cũ. Gửi tổng báo giá để backend kiểm tra giá thay đổi.
- Chặn gửi trùng khi đang tạo đơn. Lỗi mất kết nối/timeout/5xx sau khi gửi đơn yêu cầu kiểm tra danh sách trước khi tạo lại.
- Lỗi 409 được hiển thị và cho lấy lại báo giá; không báo thành công khi backend từ chối.
- Chỉ chuyển tới URL HTTPS của VNPay. Trang trả về đọc trạng thái server; không xác nhận giao dịch bằng query string của trình duyệt.
- Kết quả tìm kiếm lỗi/rỗng không bị thay bằng khách sạn mẫu. Các slug demo cũ ghi rõ là minh họa, không tạo đơn.
- Thông tin liên hệ tự điền khi hồ sơ tải xong, giữ ô đã sửa. Mobile đã sửa tràn header/menu đóng và khung chi tiết đơn.
- Phân quyền, xung đột lịch, điều kiện check-in và điều kiện mở bán do backend quyết định.

## Kiểm tra

- Frontend: `npm.cmd run check` thành công: lint, typecheck, **60 file / 309 test**, production build. Sau chỉnh kích thước drawer, đã chạy lại lint, typecheck và build thành công.
- Backend: Maven offline package thành công với Java 21, bỏ fmt và không chạy test DB. Unit suite `VnpayPaymentServiceTests,HotelStaffServiceTests,UpdateProfileServiceTests,StayOperationServicesTests,RoomBlockServicesTests`: **35 test thành công**.
- Chưa chạy được integration suite cần PostgreSQL/Testcontainers vì Docker engine không chạy. Một lần thử bộ test rộng đã dừng do thiếu Docker; không dùng kết quả đó làm bằng chứng backend đã qua integration.
- Playwright CLI trên frontend local với API mô phỏng theo DTO backend: báo giá cũ bị vô hiệu hóa, lấy lại báo giá sau 409, payload tạo đơn/tổng tiền, lỗi thanh toán, danh sách/chi tiết khách hàng, tìm kiếm -> chi tiết, check-in bị từ chối, lỗi tải hạng phòng, gửi/xem khiếu nại, kích hoạt/chấm dứt hợp đồng. Không có JavaScript runtime error trong bộ luồng chính.
- Đã xem ảnh desktop 1440px và mobile 390px; xác nhận trang tìm kiếm/đặt phòng không tràn ngang và drawer chi tiết nằm trong 390px.
- Mechanical UI detector trên các thành phần chính trả danh sách rỗng. Build vẫn có cảnh báo bundle lớn hơn 500 kB.
- Đọc staging: health 200, cities 200 (6 thành phố), search 200 nhưng `totalElements=0`. **Chưa kiểm thử đặt phòng/thanh toán thật xuyên suốt trên staging.**

Script, ảnh và log QA nằm ở backend `.qa/sync-2026-11-11/`; log frontend ở `.playwright-cli/integration-final-check.log`. Không đưa credential hoặc token thật vào tài liệu.

## Điều kiện triển khai và phần chưa có API

Các endpoint hồ sơ/nhân sự/VNPay là phần local có sẵn trước khi pull; cần đưa các thay đổi backend tương ứng vào cùng đợt triển khai. Frontend local không tự làm các endpoint đó xuất hiện trên staging.

Search chưa có dữ liệu khách sạn đủ điều kiện bán. Cần một khách sạn ACTIVE, hạng phòng đang bán, phòng vật lý đang phục vụ và đủ giá/tồn cho ngày thử để kiểm tra đặt phòng thật.

Backend hiện chưa có API cho xử lý khiếu nại admin, voucher, đánh giá và báo cáo doanh thu trong các màn placeholder; những màn này chưa được thay bằng dữ liệu giả. Nội dung biên tập và bản tin preview còn trên trang chủ. Danh sách/quyền quản lý khách sạn vẫn tuân theo controller backend hiện có; chưa mở thêm quyền chỉ ở frontend.
