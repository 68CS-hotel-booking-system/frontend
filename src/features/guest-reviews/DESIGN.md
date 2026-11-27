---
name: StayHub Guest Reviews
description: Quy ước giao diện hiện có cho đánh giá sau lưu trú và phản hồi của khách sạn.
colors:
  customer-accent: "#c91f4b"
  management-primary: "#0b5f53"
  surface: "#ffffff"
  reply-surface: "#f4f8f7"
  management-ink: "#12211d"
  secondary-text: "#52635d"
  divider: "#dce7e3"
  control-border: "#b7c6c1"
  field-error: "#a51c30"
typography:
  body:
    fontFamily: "'Be Vietnam Pro', system-ui, sans-serif"
    lineHeight: 1.7
  booking-title:
    fontSize: "18px"
  summary:
    fontSize: "22px"
  metadata:
    fontSize: "14px"
  label:
    fontWeight: 600
rounded:
  control: "10px"
  reply: "12px"
spacing:
  compact: "8px"
  field: "12px"
  group: "16px"
  section: "24px"
components:
  guest-rating-option:
    rounded: "{rounded.control}"
    padding: "10px 12px"
  guest-rating-selected:
    backgroundColor: "{colors.customer-accent}"
    textColor: "{colors.surface}"
  guest-owner-reply:
    backgroundColor: "{colors.reply-surface}"
    textColor: "{colors.management-ink}"
    rounded: "{rounded.reply}"
    padding: "16px"
  guest-filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.management-ink}"
    rounded: "{rounded.control}"
    padding: "8px 32px 8px 12px"
---

# Design System: StayHub Guest Reviews

## Overview

**Creative North Star: "Nhận xét rõ ràng trong giao diện hiện có"**

Tài liệu chỉ ghi nhận feature đánh giá trong hệ giao diện StayHub hiện có (Operate mode). Khách đặt phòng và trang công khai giữ sắc hồng của shell khách hàng; màn quản lý giữ sắc xanh của shell quản trị. Cụm từ trên mô tả cách triển khai, không xác lập thương hiệu hay phương án thiết kế mới.

**Key Characteristics:**
- Danh sách một cột, ưu tiên tác giả, điểm và nội dung nhận xét.
- Phản hồi khách sạn nằm trong nền nhạt riêng, có nhãn rõ ràng.
- Bộ lọc có nhãn, trạng thái lỗi có thao tác thử lại.
- Form dùng quyền và trạng thái từ API; không giả thành công.

Nguồn: `guest-reviews.css`, `components/`, `api/guest-review-api.ts`, `hooks/use-guest-reviews.ts`; tích hợp tại `../../pages/public/HotelDetailPage.tsx`, `../../pages/management/hotels/HotelReviewsPage.tsx` và `../bookings/components/`. Theme thuộc `../../app/layouts/AppLayout.tsx`, `../../app/layouts/AdminLayout.tsx` và stylesheet shell. Ảnh đối chiếu desktop/mobile ở `.impeccable/review/guest-final-*.png` của repository; tài liệu này không thay thế kết quả kiểm thử.

## Colors

### Primary
- **Hồng khách hàng:** nút chính kế thừa theme khách hàng; lựa chọn điểm và vòng focus của form gửi đánh giá có override hồng riêng.
- **Xanh quản lý:** hành động quản lý kế thừa theme quản trị. Select lọc dùng vòng focus xanh trong CSS feature, kể cả khi nằm ở trang công khai.

### Neutral
- **Nền trắng / nền phản hồi nhạt:** phân biệt nội dung khách với câu trả lời của khách sạn.
- **Mực quản lý / chữ phụ / đường phân cách:** giữ nhãn, ngày và các nhận xét tách biệt mà không cần nhiều thẻ lồng nhau.
- **Viền điều khiển / lỗi trường:** viền ô lọc và radio; lỗi luôn kèm chữ mô tả.

**The Context Accent Rule.** Giữ provider của màn chứa feature; không dùng override xanh cho nút gửi đánh giá của khách hàng.

## Typography

Kế thừa Be Vietnam Pro và fallback của shell; không thêm font riêng. Tiêu đề form đặt phòng dùng role booking-title; điểm trung bình công khai dùng role summary. Nhãn có trọng lượng label; ngày và hướng dẫn dùng role metadata. Các control Ant Design giữ kiểu chữ từ provider.

Nội dung nhận xét và phản hồi có chiều dài dòng tối đa (72ch), giữ xuống dòng và giãn dòng theo role body. Điểm dùng chữ số có độ rộng đều. Ngày hiển thị theo tiếng Việt và múi giờ Asia/Ho_Chi_Minh.

**The Readable Comment Rule.** Giữ xuống dòng và cho phép ngắt chuỗi dài trong nhận xét để nội dung người dùng không làm tràn khung.

## Layout

Form là một cột với khoảng cách field; toolbar dùng khoảng cách group và tự xuống hàng. Mỗi nhận xét có khoảng đệm dọc section, riêng mục đầu bắt đầu ở field. Header đặt tác giả/ngày bên trái, điểm bên phải; điểm không co lại. Phản hồi nằm sau nội dung, trước thao tác quản lý.

Ở (640px) trở xuống, toolbar dùng khoảng cách field; nhóm lọc co giãn với chiều rộng tối thiểu (130px), select chiếm chiều rộng nhóm. Radio chuyển gap từ (8px) sang (6px), padding ngang còn (10px). Panel quản lý giảm padding còn (16px). Các nút cuối form tự xuống hàng khi cần.

Danh sách công khai và quản lý dùng năm mục mỗi trang, ẩn phân trang khi chỉ có một trang. Thay bộ lọc đưa trang về đầu; thay trang hoặc bộ lọc trong quản lý đóng form phản hồi đang mở. Không biến các hành vi này thành quy tắc phân trang toàn ứng dụng.

## Elevation & Depth

Feature không tạo shadow hay motion riêng. Panel quản lý kế thừa surface card có viền và shadow nhẹ của shell; bên trong, đường phân cách và nền phản hồi tạo thứ bậc. Trang công khai nằm trực tiếp trong section khách sạn. Giữ các trạng thái tương tác của Ant Design thay vì tạo hiệu ứng nổi riêng cho nhận xét.

## Shapes

Select và lựa chọn điểm dùng góc control; khối phản hồi dùng góc reply. Lựa chọn điểm có viền mảnh, nền đặc khi được chọn và vòng focus (2px), offset (3px). Select có chiều cao tối thiểu (40px), focus offset (2px). Textarea và nút tiếp tục dùng hình dạng từ provider hiện hành.

## Components

**Form khách hàng:** mở từ đơn CHECKED_OUT; API quyết định `canReview`. Nhóm điểm là radio thực với fieldset/legend, lựa chọn từ 1 đến 5; textarea nhận xét bắt buộc, tối đa 2000 ký tự sau trim. Trước nút gửi, nội dung giải thích nhận xét công khai với tên rút gọn, mỗi đơn gửi một lần và không sửa sau khi gửi. Sau thành công, form chuyển sang nhận xét chỉ đọc. Khi gửi, khóa control và dùng loading của nút; khi lỗi giữ bản nháp và hiển thị alert.

**Nhận xét công khai:** hiển thị tên rút gọn từ API, ngày, điểm số và nội dung; không tự tạo tên ẩn danh. Điểm trung bình có tối đa một chữ số thập phân; tổng số đánh giá là số liệu toàn khách sạn từ API, không tính lại từ trang đang xem. Có lọc điểm, làm mới, loading, empty, error và thử lại.

**Phản hồi khách sạn:** nền nhạt, nhãn “Phản hồi từ khách sạn”, nội dung và ngày phản hồi. Chủ khách sạn thêm/sửa khi API trả `canReply`; admin chỉ đọc theo quyền API. Form có nhãn “Phản hồi công khai của khách sạn”, textarea tối đa 2000 ký tự và hai nút hủy/lưu. Quản lý lọc thêm trạng thái đã/chưa phản hồi.

**The Explicit Reload Rule.** Khi xung đột phiên bản, giữ bản nháp và khóa lưu; người dùng chủ động chọn “Tải phiên bản mới” trước khi tiếp tục. Không tự tải lại khi focus/reconnect để thay bản nháp đang chỉnh sửa.

**Control dùng chung:** nút, textarea, alert và phân trang dùng Ant Design. Select lọc có label và focus rõ; radio giữ thao tác bàn phím. Lỗi trường có văn bản liên kết qua `aria-describedby` và thông báo alert. Feature không có navigation hoặc tài sản ảnh riêng.

## Do's and Don'ts

### Do:
- Do giữ theme của shell và ngữ cảnh quyền từ API.
- Do hiển thị điểm bằng số bên cạnh biểu tượng sao và giữ nhãn phản hồi khách sạn.
- Do giữ bản nháp khi gửi lỗi và yêu cầu tải phiên bản mới khi xung đột.
- Do duy trì loading, empty, error, retry và trạng thái chỉ đọc sau khi gửi.

### Don't:
- Don't thêm thao tác sửa/xóa nhận xét khách hàng hoặc quyền phản hồi cho admin.
- Don't lấy trung bình hoặc tổng số đánh giá từ riêng danh sách đang lọc/phân trang.
- Don't thay lỗi API bằng dữ liệu mẫu hoặc thông báo thành công giả.
- Don't mở rộng quy ước của feature này thành thương hiệu hay thiết kế lại các màn khác.
