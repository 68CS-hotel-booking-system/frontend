# Tích hợp staging (backend develop 9a3d74b)

Mở `/register` để đăng ký tài khoản; trang `/login` có liên kết Đăng ký và Quên mật khẩu hiển thị trực tiếp. Trang `/forgot-password` gửi yêu cầu đặt lại mật khẩu.

Trang `/management/live` và `/login` kết nối 18 API thật, qua HTTP client cùng origin. Chọn chức năng để đăng ký, xác minh, login, refresh/logout, reset/đổi mật khẩu, đọc user; liệt kê/cấp/thu hồi role; tạo/xem khách sạn, tạo loại phòng/phòng. Các trang danh mục cũ vẫn là demo mock; nút chuyển API dẫn đến trang kiểm thử này.

Token đăng nhập/refresh chỉ giữ trong bộ nhớ; reload cần login lại. Backend trả refresh token trong JSON, chưa có cookie HttpOnly. Refresh hiện thực hiện bằng nút Làm mới phiên, không tự gửi lại các mutation. Đổi/reset mật khẩu xóa phiên local. Kết quả login không hiển thị token.

Link email `/verify-email?token=...` và `/reset-password?token=...` có form tương ứng, bỏ token khỏi URL sau khi đọc. Mật khẩu mới dài 15–128 ký tự. Test quyền cần tài khoản ADMIN/HOTEL_OWNER đã được cấp quyền trong database; đăng ký thông thường không tạo admin. City ID lấy từ seed DB; develop chưa có API cities. Không dùng ID mẫu từ giao diện demo.

## QA staging

1. Mở `/system-status`, kiểm tra UP.
2. Đăng ký bằng hộp thư test do nhóm kiểm soát; nhận email và xác minh. Kiểm tra SMTP nếu không nhận được mail.
3. Login, đọc user, refresh, logout; kiểm tra refresh bị thu hồi sau logout.
4. Với ADMIN: đọc roles, đọc/cấp/thu hồi role theo user UUID và role ID dạng số. Với user thường: kiểm tra 403.
5. ADMIN tạo khách sạn với `ownerId` và `cityId` thật. HOTEL_OWNER chỉ xem khách sạn được phân công; kiểm tra không truy cập được khách sạn khác.
6. Tạo loại phòng, dùng ID trả về để tạo phòng; thời gian ISO 8601 cần múi giờ. Kiểm tra trùng số phòng, dữ liệu thiếu/sai.
7. Test forgot/reset/change password và đăng nhập lại. Xác nhận phiên cũ bị vô hiệu hóa.

Giá phòng, hợp đồng, tài chính, inventory và sửa khách sạn chưa có trong develop này; các màn hình demo không phải kết quả QA. CI/unit test không thay thế QA quyền và email trên staging.

Phần tài liệu khởi tạo dưới đây mô tả khung trước khi có tích hợp này.

# Hotel Booking Frontend

Khung React + TypeScript + Vite để nhóm phát triển thống nhất. Node 24, npm; dùng lockfile.

## Chạy local

~~~powershell
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
~~~

Chỉ copy env khi chưa có .env.local. Backend chạy ở http://localhost:8080 với profile dev.
FE chạy http://localhost:5173. Đổi API_PROXY_TARGET trong .env.local nếu backend ở địa chỉ khác; khởi động lại Vite sau khi sửa env.

Trang /system-status gọi GET /actuator/health thật qua Vite proxy. Backend dừng sẽ hiển thị lỗi và nút thử lại, không tự thay bằng mock.
Luồng mẫu: SystemStatusPage -> useBackendHealth -> getBackendHealth -> shared HTTP client -> backend.
Đây là feature kiểm tra kết nối; chưa phải danh sách khách sạn hoặc test nghiệp vụ.

## Stack và quy ước

- React Router: route và layout tập trung tại src/app.
- TanStack Query: dữ liệu từ server; query key đặt trong feature; truyền AbortSignal xuống API.
- Ant Design: UI và theme qua AppProviders. Không thêm bộ UI thứ hai.
- React Hook Form + Zod: form và validation. RefreshSettings là ví dụ thực tế.
- fetch qua src/shared/api/http.ts; không gọi fetch rải rác trong component.
- Import source qua alias @/.
- Luồng: page/component -> feature hook -> feature API -> shared HTTP client.
- Giữ khung app, pages, features, shared; không sao chép các tầng DDD của backend sang FE.

## API contract hiện có

- Business API dùng http.request('/hotels', options): tự nối /api/v1, unwrap { message, data }.
- Đường dẫn nghiệp vụ này là ví dụ cách dùng, BE hiện chưa có endpoint hotels.
- Lỗi là ProblemDetail: status, detail, code, traceId, errors[field,message].
- ApiError phân biệt HTTP, network, timeout, invalid-response; 401/403 giữ đúng status.
- Không tự refresh token hoặc chuyển mọi lỗi thành đăng nhập.
- HTTP 204 trả undefined; data null/false/0 vẫn hợp lệ.
- http.requestRaw dành cho ngoại lệ JSON cùng origin như Actuator; không dùng để bỏ qua contract nghiệp vụ.
- API ngoài boundary nên có Zod schema. PageResponse bắt đầu từ page=0.
- HTTP client hỗ trợ JSON, FormData, timeout và cancellation.

## Environment

.env.example được commit; .env.local và .env.* chứa cấu hình cá nhân được ignore.
env.ts là nơi duy nhất đọc import.meta.env; Vite cũng kiểm tra cấu hình khi khởi động/build.

| Biến | Mặc định | Phạm vi |
| --- | --- | --- |
| VITE_APP_NAME | Hotel Booking | Public, được bundle lúc build |
| VITE_API_BASE_URL | /api/v1 | Public; giữ path cùng origin |
| VITE_API_TIMEOUT_MS | 10000 | Public; 1000-60000 ms |
| API_PROXY_TARGET | http://localhost:8080 | Chỉ Vite dev proxy |

Không đặt password, JWT secret, private key hoặc token cá nhân trong VITE_*.
Không đổi domain API bằng VITE_API_BASE_URL cho staging/production: gateway của infra chuyển /api sang BE.
Đổi environment trong container không thay các biến đã bundle vào JavaScript.
Vite proxy chỉ dùng local. nginx.conf của FE phục vụ static/SPA; gateway /api thuộc repo infra.

## Xác thực

Xem hướng dẫn tích hợp và QA ở đầu tài liệu. Backend dùng JWT Bearer; các route xác minh/reset mật khẩu đã nối. Quyền ADMIN/HOTEL_OWNER do backend kiểm tra.

## Chất lượng và CI

~~~powershell
npm.cmd run check
~~~

check chạy lint -> typecheck -> test phần dùng chung -> build.
Có thể chạy riêng lint, typecheck, test, build; build chỉ bundle Vite, không thay typecheck.
Không có test chi tiết các feature nghiệp vụ. Test hiện tập trung env và HTTP contract/lỗi/cancellation.

CI giữ flow develop -> staging -> main: PR kiểm tra và build thử image; push develop smoke-test image rồi publish chính image đã test.
Push staging/main không build/publish lại. Required check là Frontend checks; không yêu cầu Publish frontend image trên PR.

## Thêm feature

1. Chốt API thật: method, path, request/response, lỗi, quyền. Không tự đoán endpoint/DTO.
2. Đặt API, hook, type/schema, component vào src/features/<feature>.
3. Page chỉ ghép giao diện và lấy dữ liệu qua hook; không nhân bản HTTP/error handling.
4. Làm đủ loading, empty, error, success; form có validation và xử lý lỗi từ BE.
5. Backend là nguồn quyết định giá, tồn, voucher, quyền và trạng thái booking/payment.
6. Chạy check, cập nhật test đúng hành vi và ghi rõ API/mock/chưa triển khai.
7. Đọc AGENTS.md trước khi dùng agent viết code.

Chưa tự khởi tạo Git, commit, push hoặc thay đổi repo backend trong đợt dựng khung này.
