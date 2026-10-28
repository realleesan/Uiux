# Đối chiếu wireframe với phần 1–4 của báo cáo

Phạm vi của Nhung là wireframe: cấu trúc màn hình, vị trí thành phần, nội dung và các trạng thái nghiệp vụ theo phần 1–4. Nhóm trưởng phụ trách UI và prototype; prototype v2 áp dụng cải tiến sau kiểm thử ở phần 6–7.

## Căn cứ thiết kế

| Căn cứ | Thể hiện ở wireframe |
| --- | --- |
| Phần 1–2: Khó theo dõi tư vấn dang dở, không rõ ai đang chờ ai | Tổ chức danh sách theo trách nhiệm xử lý tiếp theo |
| Phần 3: Giải pháp được chọn | Ba tab Cần trả lời, Chờ khách, Tạm hoãn; có số lượng hội thoại |
| Phần 4 mục 1.2: Cấu trúc thông tin | Hai vùng chính: danh sách bên trái, khung chat bên phải; tab và tìm kiếm ở đầu danh sách |
| Phần 4 mục 1.4: Thẻ hội thoại và khung chat | Tên khách, kênh Messenger, tin xem trước, lịch sử hai chiều, mốc thời gian, ô soạn, gửi ảnh và nút Gửi |
| Phần 3 mục 3.3 và phần 4 mục 1.6: Tạm hoãn | Nút trên tiêu đề, chọn 3 hoặc 5 phút, chuyển sang Tạm hoãn, quay về đầu Cần trả lời khi hết hạn |
| Phần 4 mục 3.2: Ca hết hạn có viền nổi bật | Giữ đường viền xám để thể hiện yêu cầu này ở mức wireframe; không dùng thiết kế cảnh báo cam, đồng hồ và nhãn mới của vòng cải tiến |
| Phần 3 mục 3.3: Quay lại sớm | Mở lại trước hạn để tiếp tục tư vấn |
| Phần 4 mục 3.2: Khách nhắn thêm khi đang hoãn | Hủy tạm hoãn, đưa hội thoại về Cần trả lời |
| Phần 4: Hoàn tất phản hồi | Gửi thành công chuyển hội thoại sang Chờ khách; giữ Cần trả lời và mở ca tiếp theo |
| Phần 4 mục 3.2: Gửi lỗi | Trạng thái Chưa gửi được, nút Thử lại, giữ nội dung |

## Các màn và trạng thái thuộc phần wireframe

1. Cần trả lời: danh sách và hội thoại đang mở.
2. Hộp thoại Tạm hoãn: hai lựa chọn 3 phút và 5 phút, chưa chọn sẵn; ghi chú tùy chọn; Hủy và Xác nhận tạm hoãn.
3. Tạm hoãn: hội thoại đã hẹn giờ, ghi chú và thời gian còn lại.
4. Đến hạn quay lại: hội thoại ở đầu Cần trả lời; đường viền xám và thông báo nhắc trong khung chat.
5. Chờ khách: hội thoại shop đã phản hồi, đang chờ khách cung cấp thông tin hoặc quyết định.
6. Ngoại lệ: khách nhắn thêm trước hạn; gửi lỗi và Thử lại.
7. Danh sách rỗng và không có kết quả tìm kiếm.

## Những chi tiết đã gỡ khỏi bản wireframe

- Viền cam và nền cam trên thẻ hội thoại đến hạn.
- Biểu tượng đồng hồ báo thức và nhãn Đến hạn nhắc việc ngay trên thẻ.
- Ghi chú nhắc việc nổi bật ngay trong thẻ danh sách.
- Mặc định chọn sẵn 3 phút khi mở hộp thoại.
- Tự động focus vào ô ghi chú.
- Phím Enter xác nhận tạm hoãn. Enter trong ghi chú dùng để xuống dòng bình thường.

Các chi tiết này thuộc cải tiến ở phần 6–7 và dành cho công việc prototype v2 của nhóm trưởng. Bản wireframe không được dùng làm bằng chứng rằng các cải tiến đã được kiểm thử thành công.

## Giới hạn

Mã hiện có giữ các tương tác minh họa để xem các trạng thái wireframe. Đây không phải bàn giao UI hoàn thiện hoặc prototype v2. Dữ liệu là mẫu, chưa kết nối Facebook, kho hoặc máy chủ gửi tin. Không bổ sung chatbot, đa kênh, quản lý kho, dashboard doanh thu hoặc quản lý đơn hàng ngoài MVP phần 3.
