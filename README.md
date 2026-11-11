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
- Quản lý khách sạn có nguồn API: danh sách/chi tiết/tạo/sửa, danh mục thành phố/tiện ích, album ảnh, loại phòng/phòng vật lý, giá theo ngày, chính sách và lịch chặn phòng. Nguồn preview còn được ghi rõ ở những màn hỗ trợ chuyển nguồn.
- Tạo khách sạn dùng danh mục cities và lựa chọn chủ sở hữu có thật. Backend sinh slug và kiểm tra quyền.
- Tổng quan khách sạn có tạm ngừng/mở bán lại và khóa/gỡ khóa theo vai trò. Lỗi trạng thái, thiếu điều kiện mở bán và quyền được giữ từ backend.
- Trang chủ lấy khách sạn đang bán từ API tìm kiếm, không thay lỗi/kết quả rỗng bằng mock. `/explore` tìm kiếm theo điểm đến, ngày, sức chứa, giá và số sao, sắp xếp/phân trang phía server. Ảnh bìa lấy qua media access; thiếu ảnh dùng hình trung tính.
- `/stays/:hotelId` với UUID lấy khách sạn và hạng phòng thật, kiểm tra tồn -> báo giá -> tạo đơn. Thay ngày/số khách/số phòng/hạng phòng sẽ vô hiệu hóa báo giá cũ. Tổng tiền tạo đơn lấy từ báo giá server, không tính giá ở client. Những slug demo cũ được ghi rõ là minh họa và không tạo đơn.
- `/my-bookings` hiển thị đơn thật, bộ lọc/phân trang/chi tiết, mở thanh toán VNPay và gửi khiếu nại. Chỉ chuyển sang URL HTTPS thuộc VNPay; trạng thái giao dịch lấy lại từ server ở `/payment/return`.
- `/my-complaints` dùng API khiếu nại của chính tài khoản. Nhóm OTHER cần nội dung ít nhất 20 ký tự. Chưa có API xử lý khiếu nại dành cho admin.
- `/bookings` và tab đặt phòng trong workspace khách sạn có danh sách/chi tiết, phân phòng, nhận/trả phòng, khách đến muộn/không đến. Server kiểm tra tồn, xung đột, quyền và trạng thái; thành công mới tải lại dữ liệu.
- `/contracts` nối danh sách/tạo dự thảo/kích hoạt/chấm dứt hợp đồng; `/financial-access` nối quyền tài chính theo khách sạn. Chỉ vai trò được backend cho phép mới thực hiện được.
- Màn admin users dùng API thật cho danh sách, tìm kiếm,
  bộ lọc, phân trang, số lượng theo tab, khóa/mở khóa, gửi lại email xác minh và cấp/thu hồi vai trò.
  Số lượng tab lấy từ `totalElements` của API danh sách; thao tác hàng loạt gọi API từng tài khoản
  và báo kết quả một phần khi có lỗi. Không chuyển sang mock khi kết nối thất bại.
- Tạo người dùng từ admin đã nối API, không cấp mật khẩu dùng chung. Người nhận xác minh email rồi dùng Quên mật khẩu để đặt mật khẩu riêng; cần cấu hình SMTP ở backend.
  Modal chi tiết dùng dữ liệu từ danh sách, chưa có API chi tiết người dùng riêng.
- `/account` sửa tên/số điện thoại với `expectedVersion`, hiển thị mã tài khoản và dùng lại luồng đổi mật khẩu.
- `/staff` lấy danh sách khách sạn thuộc quyền từ server, phân trang nhân sự và thêm/thu hồi phân công theo từng khách sạn. ADMIN được phân công quản lý; chủ khách sạn/quản lý chỉ phân công lễ tân. Dùng mã tài khoản từ hồ sơ hoặc màn admin, không nhận role toàn hệ thống từ client làm căn cứ cấp quyền.
- `/system-status` gọi `GET /actuator/health` thật; backend dừng sẽ hiện lỗi, không tự chuyển sang mock.

## Xác thực

`/admin/login` là màn hình đăng nhập riêng cho quản trị. Khách mở `/admin`, `/admin/overview` hoặc `/admin/users` được chuyển đến đây; sau login, FE gọi `/users/me` xác minh role `ADMIN` rồi quay về đường dẫn admin ban đầu (mặc định `/admin/overview`). Tài khoản thiếu quyền bị từ chối; lỗi xác minh cho phép thử lại hoặc đổi tài khoản. `/login` dành cho client vẫn giữ nguyên.

Access token giữ trong memory. Refresh token của trình duyệt nằm trong cookie HttpOnly; khi tải trang, session manager gọi refresh để khôi phục phiên. Remember me điều khiển thời hạn cookie phía server. Các menu đăng xuất dùng API logout và broadcast xoá phiên/cache cho các tab. Không tự gửi lại mutation.
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
