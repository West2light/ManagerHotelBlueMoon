# Tóm tắt thiết kế trang Manager

## Tổng quan các tính năng và trang tương ứng

| Tính năng | Trang thiết kế | Chức năng |
|-----------|----------------|-----------|
| Duyệt đăng ký OR gia hạn gói tập cho Khách hàng | `/manager/membership-register/approve` | Xét duyệt đăng ký mới hoặc gia hạn gói tập cho khách hàng |
| Tạo tài khoản cho Khách hàng | `/manager/user-manage/create` | Tạo tài khoản mới cho khách hàng |
| Thêm thông tin thanh toán của Khách | `/manager/payment-manage` | Quản lý và thêm thông tin thanh toán cho khách hàng |
| Xem thông tin Khách hàng | `/manager/user-manage` | Hiển thị danh sách và chi tiết thông tin khách hàng |
| Thêm Khách hàng vào quan hệ với PT | `/manager/trainer-assignment` | Phân công PT cho khách hàng |
| Chỉnh sửa quan hệ Khách hàng và PT | `/manager/trainer-assignment` | Quản lý và chỉnh sửa mối quan hệ giữa khách hàng và PT |
| Xem danh sách dụng cụ, thiết bị tập luyện trong phòng tập | `/manager/equipment-list` | Hiển thị danh sách thiết bị theo phòng tập |
| Thêm, xóa dụng cụ, thiết bị tập | `/manager/equipment-list` và `/manager/equipment-create` | Thêm mới hoặc xóa thiết bị |
| Chỉnh sửa trạng thái dụng cụ, thiết bị tập | `/manager/equipment-list` | Cập nhật số lượng, trạng thái thiết bị |
| Xem Review của Khách hàng | `/manager/reviews` | Xem đánh giá của khách hàng và thống kê |
| Xem lịch tập của Khách với PT, lịch dạy của các Trainer | `/manager/time-table` | Hiển thị lịch tập dưới dạng calendar |
| Thêm lịch tập cho Khách với PT | `/manager/time-table` | Tạo buổi tập mới trong lịch |
| Chỉnh sửa lịch tập của Khách với PT | `/manager/time-table` | Chỉnh sửa thông tin buổi tập |

## Chi tiết của từng trang

### 1. Quản lý gói tập (`/manager/membership-manage`)
- Hiển thị danh sách gói tập
- Thêm gói tập mới
- Chỉnh sửa thông tin gói tập
- Xóa gói tập

### 2. Xét duyệt đăng ký gói tập (`/manager/membership-register/approve`)
- Hiển thị danh sách đăng ký đang chờ duyệt
- Duyệt đăng ký và thiết lập thời gian bắt đầu/kết thúc
- Từ chối đăng ký
- Xem chi tiết đăng ký

### 3. Tạo tài khoản khách hàng (`/manager/user-manage/create`)
- Form tạo tài khoản với đầy đủ thông tin cá nhân
- Validate dữ liệu trước khi tạo
- Chuyển hướng sau khi tạo thành công

### 4. Quản lý thanh toán (`/manager/payment-manage`)
- Hiển thị danh sách thanh toán
- Thêm thanh toán mới
- Lọc thanh toán theo trạng thái
- Cập nhật trạng thái thanh toán

### 5. Quản lý thiết bị (`/manager/equipment-list`)
- Hiển thị thiết bị dưới dạng bảng và card theo phòng
- Lọc thiết bị theo trạng thái, phòng
- Chỉnh sửa số lượng, trạng thái thiết bị
- Xóa thiết bị

### 6. Đánh giá khách hàng (`/manager/reviews`)
- Hiển thị tổng quan thống kê đánh giá
- Hiển thị đánh giá chi tiết
- Lọc đánh giá theo số sao
- Xem chi tiết đánh giá

### 7. Lịch tập (`/manager/time-table`)
- Hiển thị calendar với các buổi tập
- Lọc lịch theo khách hàng, huấn luyện viên
- Thêm buổi tập mới
- Chỉnh sửa hoặc xóa buổi tập
- Xem chi tiết buổi tập

### 8. Phân công trainer (`/manager/trainer-assignment`)
- Hiển thị danh sách trainer và tình trạng hiện tại
- Quản lý phân công trainer cho khách hàng
- Thay đổi hoặc xóa mối quan hệ khách hàng-trainer
- Xem thông tin chi tiết khách hàng 