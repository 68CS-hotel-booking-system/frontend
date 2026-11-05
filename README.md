# Hotel Booking Frontend

React + TypeScript + Vite. Dùng React Router, TanStack Query, Ant Design, React Hook Form và Zod; Node 24 và npm theo lockfile.

## Tổ chức code

Đọc [Frontend architecture](docs/frontend-architecture.md) trước khi thêm tính năng.

- `app/`: router, layout và providers.
- `pages/`: route, điều hướng và ghép các feature.
- `features/<name>/api/`: HTTP functions và contract DTO của backend.
- `features/<name>/hooks/`: query keys, queries, mutations và logic React của feature.
- `features/<name>/model/`: kiểu dữ liệu, schema form và xử lý dữ liệu.
- `features/<name>/mocks/`: dữ liệu/hành vi mô phỏng được ghi rõ.
- `features/<name>/components/`: UI riêng của feature.
- `features/<name>/index.ts`: public exports cho page và feature khác.
- `shared/`: HTTP client, config, hooks, UI và utilities độc lập với feature.

Luồng: page/component -> feature hook -> feature API -> shared HTTP client.
Bên ngoài feature import từ `@/features/<name>`; bên trong dùng relative imports. ESLint kiểm tra hướng phụ thuộc và chặn import vào phần riêng của feature khác.
Tên component dùng PascalCase; file khác dùng kebab-case. Dùng named exports. Đặt test cạnh code được kiểm tra.

## Chạy local

~~~powershell
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
~~~

Chỉ copy env khi chưa có `.env.local`. Backend dev mặc định ở http://localhost:8080; FE ở http://localhost:5173.
Đổi `API_PROXY_TARGET` trong `.env.local` nếu backend ở địa chỉ khác rồi khởi động lại Vite.

## Phạm vi API và dữ liệu mẫu

- Auth có feature riêng tại `features/auth`: đăng ký, xác minh email, login, refresh/logout, forgot/reset/change password và đọc user hiện tại.
- Các route `/login`, `/register`, `/forgot-password`, `/verify-email`, `/reset-password` dùng feature auth, độc lập với trang diagnostics.
- `/management/live` giữ 18 thao tác kiểm thử API đã có, dùng lại logic auth và contract khách sạn.
- Các màn quản lý khách sạn mặc định dùng mock. Switch nguồn dữ liệu bật API tạo, danh sách và chi tiết; bộ lọc chưa có ở backend bị khóa.
- Khi dùng API, tạo khách sạn cần Owner UUID và City UUID có thật. Backend tự sinh slug. Chưa có API danh mục cities để cấp lựa chọn.
- Sửa khách sạn, danh mục/gắn tiện ích, giá theo ngày, hợp đồng và quyền tài chính chưa được backend hỗ trợ. FE khóa thao tác và báo rõ, không gửi request đến endpoint giả định.
- Discovery và admin users hiện là giao diện preview dùng mock. Các thao tác mô phỏng ở đó không chứng minh có API quản trị tương ứng.
- `/system-status` gọi `GET /actuator/health` thật; backend dừng sẽ hiện lỗi, không tự chuyển sang mock.

## Xác thực

`/admin/login` là màn hình đăng nhập riêng cho quản trị. Khách mở `/admin`, `/admin/overview` hoặc `/admin/users` được chuyển đến đây; sau login, FE gọi `/users/me` xác minh role `ADMIN` rồi quay về đường dẫn admin ban đầu (mặc định `/admin/overview`). Tài khoản thiếu quyền bị từ chối; lỗi xác minh cho phép thử lại hoặc đổi tài khoản. `/login` dành cho client vẫn giữ nguyên.

Access/refresh token chỉ giữ trong memory; reload cần đăng nhập lại. Backend trả refresh token trong JSON, chưa có cookie HttpOnly. Refresh thủ công; không tự gửi lại mutation.
Login/refresh không hiển thị token trong kết quả. Logout thành công, đổi/reset mật khẩu xóa phiên local và cache; logout lỗi giữ phiên.

Link email chứa `?token=...` được đọc vào form rồi loại token khỏi URL. Mật khẩu mới dài 15–128 ký tự. Quyền ADMIN/HOTEL_OWNER luôn được backend kiểm tra.

## HTTP contract

- Business API đi qua `shared/api/http.ts`, nối base path `/api/v1` và unwrap `{ message, data }`.
- Lỗi dùng `ApiError` và ProblemDetail: status, detail, code, traceId, errors[field,message].
- Giữ nguyên HTTP 401/403; không tự refresh hay chuyển mọi lỗi sang trang đăng nhập.
- HTTP 204 trả undefined; data null/false/0 vẫn hợp lệ.
- Truyền AbortSignal; HTTP client hỗ trợ timeout, JSON và FormData.
- Zod kiểm tra response tại API. Giữ đúng null và giá trị chưa được cung cấp; chỉ map DTO khi UI cần cấu trúc khác.
- `requestRaw` dành cho ngoại lệ cùng origin như Actuator.
- PageResponse bắt đầu từ page=0. Giá, tồn phòng, voucher, quyền và trạng thái booking/payment do BE quyết định.

## Environment

Chỉ `shared/config/env.ts` đọc cấu hình trình duyệt. `.env.example` được commit; env cá nhân được ignore.

| Biến | Mặc định | Phạm vi |
| --- | --- | --- |
| VITE_APP_NAME | Hotel Booking | Public, được bundle lúc build |
| VITE_API_BASE_URL | /api/v1 | Public; giữ path cùng origin |
| VITE_API_TIMEOUT_MS | 10000 | Public; 1000–60000 ms |
| API_PROXY_TARGET | http://localhost:8080 | Chỉ Vite dev proxy |

VITE_* là public; không chứa secret. Gateway infra chuyển /api sang BE. Thay env trong container không thay JavaScript đã build. nginx.conf FE phục vụ static/SPA; proxy /api thuộc infra.

## Kiểm tra trước bàn giao

~~~powershell
npm.cmd run check
~~~

Chạy lint -> typecheck -> toàn bộ Vitest -> production build. Các test kiểm tra HTTP, env, contract khách sạn, auth/session, form rendering và logic dữ liệu. Local tests không thay QA HTTP/database/email trên staging.

QA thật: health -> đăng ký/nhận email/xác minh -> login/me/refresh/logout -> kiểm tra 403 với user thường -> tạo/xem khách sạn đúng quyền -> tạo loại phòng/phòng -> forgot/reset/change password và xác nhận phiên cũ bị vô hiệu hóa.

## Quy trình làm việc

Giữ nguyên thay đổi ngoài phạm vi và đọc AGENTS.md. Không tự commit/push.
Nhánh công việc -> PR develop -> staging -> main. Refactor cấu trúc và thay đổi UI/UX thực hiện thành các đợt riêng để dễ review.
