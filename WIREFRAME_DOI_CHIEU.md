# Đối chiếu wireframe với báo cáo UI UX

Wireframe phục vụ nhân viên trực chat shop thời trang online trong giờ cao điểm. Phạm vi là theo dõi trách nhiệm xử lý và tiếp nối hội thoại dang dở, theo giải pháp được chọn ở phần 3 và hoàn thiện ở phần 6–7.

## Căn cứ thiết kế

| Nội dung báo cáo | Thể hiện trong wireframe |
| --- | --- |
| Phần 1–2: Tin nhắn dồn dập khiến nhân viên mất dấu ca đang tư vấn | Danh sách phân theo trách nhiệm xử lý; ca đến hạn được ưu tiên ở đầu |
| Phần 3: Cần trả lời, Chờ khách, Tạm hoãn | Ba tab có số lượng riêng; mở hội thoại không làm đổi trách nhiệm xử lý |
| Phần 4 mục 1.2: Hai vùng, tab ở đầu danh sách | Bỏ cột điều hướng riêng; bên trái là danh sách và tab, bên phải là khung chat |
| Phần 4 mục 1.6: Gửi thành công chuyển ngầm sang Chờ khách | Giữ tab Cần trả lời và mở khách tiếp theo trong danh sách đang xem |
| Phần 3 mục 3.3: Tạm hoãn 3/5 phút | Bộ đếm ngược theo thời gian thực; hết hạn tự đưa về Cần trả lời |
| Phần 3 mục 3.3: Mở lại trước hạn | Nút Tạm hoãn trên tiêu đề mở tùy chọn Mở lại trước hạn |
| Phần 4 mục 3.2: Khách nhắn thêm khi đang hoãn | Sự kiện khách phản hồi hủy hẹn giờ và đưa ca về Cần trả lời |
| Phần 4 mục 3.2: Gửi lỗi | Khi trình duyệt ngoại tuyến, báo Chưa gửi được, giữ nội dung và cho Thử lại |
| Phần 6 cải tiến 1 và phần 7: Nhận biết ca quay về ngay từ danh sách | Viền cam quanh thẻ, biểu tượng đồng hồ, nhãn Đến hạn nhắc việc, ghi chú và banner trong chat |
| Phần 6 cải tiến 2 và phần 7: Tối ưu thao tác tạm hoãn | Mặc định 3 phút mỗi lần mở, tự focus ghi chú, Enter xác nhận; Shift+Enter xuống dòng |
| Phần 4 mục 1.4: Phản hồi văn bản và ảnh | Soạn tin, xem trước ảnh đính kèm, xóa ảnh trước gửi và gửi ảnh mẫu |

## Các trạng thái nên chụp để đưa vào phần wireframe

1. Cần trả lời: Danh sách khách đang chờ shop và khung chat đang mở.
2. Hộp thoại Tạm hoãn: 3 phút được chọn sẵn, ghi chú đang nhập.
3. Tạm hoãn: Ca đã lưu, thời gian còn lại và ghi chú tra cứu.
4. Đến hạn: Thẻ viền cam đứng đầu Cần trả lời và banner nhắc việc trong chat.
5. Sau khi gửi: Ca vừa xử lý xuất hiện trong Chờ khách; Cần trả lời mở ca tiếp theo.
6. Nhánh ngoại lệ: Khách phản hồi trước hạn và gửi lỗi có nút Thử lại.
7. Trạng thái rỗng: Không có hội thoại phù hợp trong tab hoặc kết quả tìm kiếm.

## Kịch bản xem thử

- Mở Minh Trang, nhập một tin rồi chuyển sang khách khác và quay lại: bản nháp được giữ riêng theo khách.
- Chọn một ca, bấm Tạm hoãn, nhập ghi chú và Enter. Chuyển sang Tạm hoãn để xem bộ đếm. Sau 3 phút, ca tự quay về đầu Cần trả lời với viền cam.
- Trong một ca đang tạm hoãn, mở menu ba chấm và chọn Ghi nhận khách vừa phản hồi để mô phỏng sự kiện khách gửi tin trước hạn. Bộ đếm bị hủy, ca chuyển về Cần trả lời. Đây là thao tác trình diễn prototype, không phải kết nối nhận tin Facebook.
- Trong ca đang hoãn, bấm nút trạng thái trên tiêu đề rồi chọn Mở lại trước hạn để tiếp tục ngay.
- Gửi một tin từ Cần trả lời: số lượng giảm, ca chuyển sang Chờ khách, màn hình mở ca tiếp theo.
- Để thử nhánh lỗi, chuyển trình duyệt sang ngoại tuyến, bấm Gửi, sau đó khôi phục kết nối và bấm Thử lại.

## Phạm vi và lưu ý khi trình bày

Không bổ sung quản lý đơn hàng, bảng điều khiển doanh thu, chatbot, đa kênh hoặc tồn kho tích hợp vì phần 3 mục 5.2 đã xác định ngoài MVP. Việc thu thập địa chỉ và chốt đơn vẫn diễn ra qua nội dung chat.

Nghiên cứu ở phần 1–2 cung cấp bối cảnh; các ý tưởng không được chọn ở phần 3 không tự trở thành yêu cầu giao diện. Bản thiết kế ưu tiên giải pháp đã chọn, cấu trúc ở phần 4 và cải tiến cuối ở phần 6–7.

Dữ liệu hội thoại và gửi tin được mô phỏng trong bộ nhớ, tải lại trang sẽ đặt lại dữ liệu. Chưa có kết nối Facebook hoặc máy chủ gửi tin. Nhánh lỗi kiểm tra trạng thái mạng của trình duyệt, chưa mô phỏng lỗi từ máy chủ.

Kiểm tra đã thực hiện: TypeScript không phát hiện lỗi và Vite build thành công. Chưa kiểm tra hiển thị, tương tác trên trình duyệt thực tế. Các chỉ số 3/3 người dùng hoặc dưới 2 giây là nội dung nhóm nêu trong báo cáo, không phải kết quả kiểm thử mới của bản code này.
