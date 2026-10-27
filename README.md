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

Trang / gọi GET /actuator/health thật qua Vite proxy. Backend dừng sẽ hiển thị lỗi và nút thử lại, không tự thay bằng mock.
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

## Hướng auth đã chuẩn bị

BE hiện dùng HTTP Basic và CSRF; chưa có JWT/login/refresh/logout contract nghiệp vụ.
FE hiện chưa tạo phiên, chưa lưu token và không giả lập người đăng nhập.
Trang /login thông báo đúng trạng thái chưa được kết nối.

Định hướng để nhóm BE/FE chốt contract: access JWT chỉ giữ trong memory, refresh token qua cookie HttpOnly,
Secure khi chạy HTTPS, refresh/logout cùng origin qua /api. Thời hạn, CSRF, endpoint và response phải được hai nhóm chốt trước triển khai.
Đây là định hướng, chưa phải chức năng đã làm. Không tự thêm Basic credentials trong env hay lưu password/token vào localStorage.
BE quyết định quyền truy cập; route guard/menu FE không thay thế authorization phía server.

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
