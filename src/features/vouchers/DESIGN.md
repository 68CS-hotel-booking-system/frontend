---
name: Voucher trong giao diện hiện có
description: Quy ước riêng cho quản lý voucher và mã giảm giá tại checkout.
colors:
  voucher-management: "#0b5f53"
  voucher-customer: "#c91f4b"
  voucher-customer-action: "#a6173d"
  voucher-ink: "#12211d"
  voucher-muted: "#52635d"
  voucher-divider: "#dce7e3"
  voucher-control-border: "#b7c6c1"
  voucher-checkout-border: "#b9aeb1"
  voucher-checkout-divider: "#e6dadd"
  voucher-error: "#a51c30"
  voucher-surface: "#ffffff"
rounded:
  voucher-control: "8px"
spacing:
  voucher-tight: "8px"
  voucher-control: "12px"
  voucher-field: "16px"
  voucher-section: "20px"
  voucher-row: "24px"
components:
  voucher-owner-input:
    backgroundColor: "{colors.voucher-surface}"
    textColor: "{colors.voucher-ink}"
    rounded: "{rounded.voucher-control}"
    padding: "8px 12px"
  voucher-checkout-action:
    backgroundColor: "{colors.voucher-surface}"
    textColor: "{colors.voucher-customer-action}"
    rounded: "{rounded.voucher-control}"
    padding: "10px 12px"
---

# Voucher trong giao diện hiện có

## Overview

Tài liệu giới hạn ở `src/features/vouchers`, trang quản lý `/vouchers` và phần mã giảm giá trong `ClientBookingCheckout`. Đây là phần mở rộng Operate của giao diện hiện có, không xác lập thương hiệu hay hệ thiết kế mới.

Chủ khách sạn chọn khách sạn trước khi quản lý mã. Khách đặt phòng dùng một mã trong báo giá của máy chủ. Nội dung ưu tiên điều kiện ưu đãi, thời hạn và trạng thái thao tác.

## Colors

Màn quản lý giữ màu xanh của provider quản lý; checkout giữ sắc hồng của màn khách hàng. Màu lỗi đi cùng thông báo bằng chữ; trạng thái mã có nhãn rõ ràng. Các token phía trên được trích từ `vouchers.css`.

## Typography

Control native kế thừa font từ phần tử chứa qua `font: inherit`. Global body dùng Plus Jakarta Sans; provider Ant Design của shell quản lý và khách hàng khai báo Be Vietnam Pro. Giữ sự kế thừa này, không áp font riêng cho voucher. Nhãn form có độ đậm (600); chú thích, lỗi và trạng thái dùng cỡ chữ (14px); mã dùng `code` (16px). Các số trong danh sách dùng chữ số thẳng cột.

## Layout

Trang quản lý dùng container `max-w-5xl` của ứng dụng. Danh sách không bọc từng voucher thành card: mỗi hàng có đường phân cách dưới và khoảng đệm dọc theo token hàng. Điều kiện mã nằm trong lưới hai cột. Form tạo nằm trong Modal Ant Design rộng (640px), với lưới hai cột và nhãn trên control.

Ở chiều rộng tối đa (640px), form và điều kiện danh sách chuyển một cột, tiêu đề hàng cho phép xuống dòng, bộ chọn khách sạn xếp dọc. Mã dài được phép ngắt dòng. Checkout giữ input và nút áp dụng cùng hàng, trong cột tóm tắt hiện có. Phân trang voucher dùng (10) mục mỗi trang; bộ chọn khách sạn có phân trang riêng.

## Elevation & Depth

Feature không thêm bóng đổ riêng. Danh sách và phần mã checkout dùng khoảng trắng, đường phân cách; Modal và nút quản lý giữ hành vi từ Ant Design của shell.

## Shapes

Input và select native có góc bo theo token control; control quản lý cao tối thiểu (42px). Focus quản lý dùng outline xanh, checkout dùng outline hồng, dày (2px), lệch (3px). Không thay hình dạng nút Ant Design bằng quy ước riêng.

## Components

- **Bộ chọn khách sạn:** có nhãn, tải lại và trạng thái loading, error, empty. Chỉ chủ khách sạn dùng màn quản lý; không mở quyền cho admin.
- **Form tạo:** hỗ trợ phần trăm hoặc số tiền cố định; giới hạn giảm tối đa chỉ hiện với phần trăm. Tiền và lượt dùng nhập bằng text với bàn phím số, không có spinner. Dùng `datetime-local` native, ghi rõ giờ Việt Nam; API chuyển giá trị với offset `+07:00` sang UTC. Giữ bản nháp khi tạo lỗi, khóa control và thao tác đóng Modal trong lúc gửi.
- **Điều kiện cố định:** nêu rõ thông tin chương trình giữ nguyên sau khi tạo; muốn đổi ưu đãi thì tạm dừng và tạo mã mới.
- **Hàng voucher:** trình bày tên, mã, trạng thái, mức giảm, tiền phòng tối thiểu, thời hạn và lượt đã giữ / dùng. Tạm dừng / bật lại gửi `expectedVersion`; khi lỗi xung đột, khóa thao tác và cung cấp “Tải phiên bản mới”.
- **Mã checkout:** áp dụng hoặc bỏ một mã, cập nhật báo giá máy chủ và chi tiết giảm giá. Lỗi mã/báo giá khóa xác nhận; không dùng tổng tiền cũ để đặt phòng. Trong lúc gửi, cập nhật báo giá hoặc chưa xác định kết quả tạo đơn, khóa đổi/bỏ mã.

## Do's and Don'ts

- **Do** giữ theme, provider và layout của màn chứa voucher.
- **Do** giữ lỗi, thử lại, empty, loading và phân trang từ dữ liệu API.
- **Do** hiển thị điều kiện cố định và giờ Việt Nam trước khi tạo mã.
- **Don't** tính giảm giá ở client hoặc xác nhận với báo giá lỗi.
- **Don't** đổi mã khi yêu cầu đặt phòng còn đang xử lý hoặc chưa xác định kết quả.
- **Don't** mở rộng tài liệu feature này thành quy ước thương hiệu toàn ứng dụng.
