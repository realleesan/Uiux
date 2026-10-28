# KẾ HOẠCH TRIỂN KHAI UI & PROTOTYPE (V1 & V2)
**Đề tài:** Nghiên cứu khó khăn trong quá trình trực chat tư vấn và chốt đơn của nhân viên bán hàng thời trang online  
**Môn học:** Thiết kế Giao diện & Trải nghiệm Người dùng (UI/UX)  
**Phạm vi:** Wireframe -> UI & Prototype v1 -> Prototype v2 (Cải tiến sau kiểm thử)

---

## I. MỤC TIÊU & NGUYÊN TẮC CỐT LÕI

1. **Bảo toàn tính toàn vẹn của Wireframe hiện tại:** Giữ nguyên 100% bản wireframe do thành viên (Nhung) đã xây dựng theo Phần 1–4, phục vụ làm mốc so sánh tiến trình môn học.
2. **Chuẩn hóa định tuyến (Multi-route Scaffolding):** Tách bạch 3 phiên bản bằng 3 đường dẫn URL độc lập (`/wireframe`, `/prototype`, `/prototype-v2`) kèm thanh điều hướng chuyển đổi nhanh trên cùng (TopModeNav) giúp người chấm bài/giảng viên đối soát dễ dàng trên Vercel mà không bị lỗi 404 khi tải lại trang (F5).
3. **Tuân thủ triệt để UX Laws:** Xây dựng Prototype dựa trên các định luật thiết kế kinh điển thay vì cảm tính cá nhân.
4. **Không phát sinh tính năng ngoài lề:** Tuyệt đối bám sát phạm vi MVP đã xác định ở Phần 3 & 4 (Hệ thống 3 tab + Cơ chế tạm hoãn nhắc việc có hẹn giờ trên Facebook Messenger). Không bổ sung AI chatbot, quản lý kho nâng cao hay đa kênh ngoài scope.

---

## II. QUY CHUẨN DESIGN SYSTEM & UX LAWS

### 1. Bảng màu (Color Palette): Tone Xanh biển – Trắng hiện đại
* **Primary (Chủ đạo):**
  * `Royal Ocean Blue` (`#1D4ED8` - `#2563EB`): Sử dụng cho các điểm nhấn quan trọng, nút hành động chính (CTA - Gửi tin nhắn), tab đang kích hoạt, và đường viền active.
  * `Sky Blue Tint` (`#EFF6FF` - `#DBEAFE`): Dùng cho nền thẻ hội thoại đang chọn, nền bong bóng tin nhắn của shop, nhãn trạng thái nhẹ nhàng.
* **Neutral (Nền & Văn bản):**
  * `Background Base`: Trắng thuần (`#FFFFFF`) kết hợp Slate siêu nhạt (`#F8FAFC`) cho nền danh sách chat và vùng cuộn lịch sử.
  * `Text Primary`: `#0F172A` (Slate 900) - Tối ưu độ tương phản, đọc cực rõ trên màn hình máy tính.
  * `Text Secondary`: `#64748B` (Slate 500) - Dành cho dòng tin xem trước (snippet), thời gian gửi nhận.
  * `Borders / Dividers`: `#E2E8F0` (Slate 200) - Phân cách tinh tế, đường nét sắc sảo, không gây gắt mắt.
* **Semantic (Trạng thái nghiệp vụ):**
  * `Needs Reply / Alert`: Đỏ tươi (`#EF4444`) cho huy hiệu đếm ca tồn đọng và trạng thái lỗi mạng.
  * `Waiting`: Xanh Cyan/Sky dịu (`#0284C7`) cho các ca đang chờ khách phản hồi.
  * `Iterated Urgent (Chỉ có ở Prototype v2)`: Cam cảnh báo (`#EA580C` / `#F97316`) cho viền thẻ và icon đồng hồ khi ca tạm hoãn đến hạn quay lại.

### 2. Typography: Chuẩn hóa 2 Font chữ Tiếng Việt
* **Font giao diện chính (UI Body, Inputs, Labels):** **`Inter`**  
  * Font chuẩn mực công nghệ, hiển thị tiếng Việt hoàn hảo, số và ký tự sắc nét ở mọi kích thước nhỏ (11px – 14px).
* **Font tiêu đề & Điểm nhấn (Headings, Customer Names):** **`Plus Jakarta Sans`**  
  * Đường nét hiện đại, hình học bo tròn trang nhã, tạo cảm giác thân thiện, chuyên nghiệp cho ứng dụng bán hàng thời trang.
* **Quy chuẩn hiển thị:**
  * Cỡ chữ tối thiểu cho thông tin phụ: `11px`.
  * Cỡ chữ chuẩn cho nội dung tin nhắn và danh sách: `13px` - `14px`.
  * Line-height: `1.5` - `1.6` để mắt quét nhanh không mỏi.

### 3. Iconography & Hình ảnh
* **Bộ Icon SVG đồng nhất:** Dùng chung 1 ngôn ngữ nét vẽ (`strokeWidth="1.75"`), kích thước chuẩn (16px / 20px).
* **Tuyệt đối không dùng emoji bừa bãi:** Không trang trí icon hoạt họa, giữ tính chuyên nghiệp của công cụ làm việc ca trực.
* **Hình ảnh & Avatar:** Thay chữ cái viết tắt thô sơ (MT, HL) bằng avatar chân dung khách hàng thanh lịch, có badge nhỏ biểu thị kênh Facebook Messenger ở góc chân thực.

### 4. Định luật UX (UX Laws) áp dụng

| UX Law | Biểu hiện cụ thể trên Prototype |
| :--- | :--- |
| **Jakob's Law** | Giữ bố cục 2 cột kinh điển của các app chat bán hàng quen thuộc (Messenger, Pancake, Zalo). Nhân viên tiếp cận là dùng được ngay không cần học lại. |
| **Fitts's Law** | Nút **Gửi** và nút **Tạm hoãn** có chiều cao tối thiểu 40px, vùng bấm rộng. Thanh 3 tab ở đỉnh danh sách có diện tích click thoải mái. |
| **Hick's Law** | Chỉ chia 3 nhóm trạng thái rõ ràng (`Cần trả lời`, `Chờ khách`, `Tạm hoãn`). Modal tạm hoãn chỉ giữ đúng 2 mốc lựa chọn (3 phút, 5 phút). |
| **Miller's Law** | Mỗi thẻ chat ngoài danh sách chỉ hiển thị đúng 4 thông tin sống còn: Avatar, Tên khách, Tin nhắn xem trước, Thời gian chờ. Không nhồi nhét thông tin phụ. |
| **Law of Proximity & Similarity** | Nhóm tin nhắn cùng phiên trao đổi gom sát nhau; các badge và tag tuân thủ 1 quy chuẩn hình khối và màu sắc đồng nhất. |
| **Aesthetic-Usability Effect** | Thiết kế cao cấp, bảng màu xanh biển - trắng dịu mắt giúp giảm căng thẳng nhận thức cho nhân viên trong khung giờ cao điểm (20h–22h). |

---

## III. BẢNG PHÂN ĐỊNH RANH GIỚI: WIREFRAME vs PROTOTYPE V1 vs PROTOTYPE V2

| Đặc điểm / Tính năng | WIREFRAME (Hiện tại) | PROTOTYPE V1 (UI Hoàn chỉnh) | PROTOTYPE V2 (Cải tiến sau Test) |
| :--- | :--- | :--- | :--- |
| **Màu sắc tổng thể** | Đơn sắc Grayscale (Xám/Trắng/Đen) | Xanh biển – Trắng cao cấp, hiện đại | Xanh biển – Trắng cao cấp, hiện đại |
| **Typography & Avatar** | Font hệ thống thô, Avatar viết tắt 2 chữ | 2 Font (`Plus Jakarta Sans` + `Inter`), Avatar chân dung thật | 2 Font (`Plus Jakarta Sans` + `Inter`), Avatar chân dung thật |
| **Thẻ chat khi đến hạn hẹn giờ** | Thẻ xám bình thường, chỉ có viền xám nhẹ *(Chưa có điểm nhấn ngoài list)* | Giữ nguyên hiện trạng của WF: thẻ chỉ có viền thường *(Để mô phỏng lỗi trễ 5–10s ở bài test P01, P02)* | **Viền cam/đỏ nổi bật quanh thẻ + Icon đồng hồ báo thức cam + Nhãn "Đến hạn nhắc việc"** |
| **Modal Tạm hoãn** | Mở ra ở trạng thái rỗng, chưa chọn mốc nào, chưa focus ô note | Giữ nguyên hiện trạng của WF: mốc 3p/5p để trắng, chưa focus ô note *(Mô phỏng lỗi tốn 4–6s thao tác)* | **Mặc định chọn sẵn 3 phút + Auto-focus vào ô ghi chú + Phím Enter xác nhận ngay** |
| **Banner trong khung chat** | Banner xám thông báo đến hạn | Banner thiết kế sang trọng, rõ ràng | Banner thiết kế sang trọng, đồng bộ với thẻ cam ngoài danh sách |
| **Kênh & Kịch bản chat** | 6 ca tư vấn thời trang bám sát Phần 1 | 6 ca tư vấn thời trang với bubble chat sắc nét, ảnh mẫu thật | 6 ca tư vấn thời trang với bubble chat sắc nét, ảnh mẫu thật |
| **Cơ chế Error Case** | Kiểm tra mạng `navigator.onLine` | Tự động bắt mạng thật + Tùy chọn test giả lập lỗi mạng nhanh | Tự động bắt mạng thật + Tùy chọn test giả lập lỗi mạng nhanh |

---

## IV. CẤU TRÚC KIẾN TRÚC MÃ NGUỒN (CODE ARCHITECTURE)

```
Uiux/
├── vercel.json                      <- Cấu hình rewrite URL cho Vercel (chống 404 khi F5)
├── index.html                       <- Nhúng Google Fonts (Plus Jakarta Sans, Inter)
├── src/
│   ├── main.tsx                     <- Entrypoint ứng dụng
│   ├── index.css                    <- Tailwind CSS v4, Token màu sắc, Font wiring
│   ├── App.tsx                      <- Shell điều phối Router và TopModeNav
│   ├── types/
│   │   └── chat.ts                  <- Type định nghĩa Chat, Message, Status dùng chung
│   ├── data/
│   │   └── initialChats.ts          <- Dữ liệu chuẩn hóa 6 cuộc hội thoại thời trang mẫu
│   ├── components/
│   │   ├── TopModeNav.tsx           <- Thanh chuyển đổi chế độ [Wireframe | Prototype v1 | Prototype v2]
│   │   └── icons/
│   │       └── Icons.tsx            <- Bộ icon SVG đồng nhất
│   └── views/
│       ├── WireframeView.tsx        <- Bản Wireframe gốc của bạn Nhung (bảo tồn 100%)
│       ├── PrototypeV1View.tsx      <- Bản UI hoàn chỉnh (Trước test)
│       └── PrototypeV2View.tsx      <- Bản UI cải tiến (Sau test - Viền cam, Modal auto-focus)
```

---

## V. LỘ TRÌNH THỰC HIỆN 4 GIAI ĐOẠN (STEP-BY-STEP ROADMAP)

### Giai đoạn 1: Thiết lập nền tảng & Dọn mâm Routing (Scaffolding)
- [ ] Cấu hình font chữ `Plus Jakarta Sans` và `Inter` trong `index.html` và `src/index.css`.
- [ ] Trích xuất mã nguồn hiện tại trong `src/App.tsx` thành `src/views/WireframeView.tsx` (đảm bảo chạy y hệt hiện tại).
- [ ] Tạo module kiểu dữ liệu dùng chung `src/types/chat.ts` và data mẫu `src/data/initialChats.ts`.
- [ ] Xây dựng component `src/components/TopModeNav.tsx` có badge hiển thị thông tin chế độ và đồng bộ URL (`/wireframe`, `/prototype`, `/prototype-v2`).
- [ ] Tạo file `vercel.json` cấu hình rewrite `/*` về `/index.html`.

### Giai đoạn 2: Xây dựng giao diện Prototype v1 (High-Fidelity)
- [ ] Dựng `src/views/PrototypeV1View.tsx` với bảng màu Xanh biển – Trắng cao cấp.
- [ ] Thiết kế Header ca trực sang trọng (thông tin nhân viên, trạng thái ca).
- [ ] Thiết kế lại 3 tab (`Cần trả lời`, `Chờ khách`, `Tạm hoãn`) với badge số lượng chuẩn visual hierarchy.
- [ ] Thiết kế thẻ chat danh sách: Avatar ảnh chân dung thật, badge Facebook Messenger tinh xảo, nhãn thời gian chờ đẹp mắt, active state rõ ràng.
- [ ] Thiết kế khung chat: Bong bóng tin nhắn shop (xanh nhạt bo góc), tin nhắn khách (trắng viền mảnh), avatar chân dung, ảnh mẫu thời trang đính kèm thực tế.
- [ ] Thiết kế ô soạn thảo tin nhắn: Nút gửi ảnh mẫu, nút Gửi nổi bật.
- [ ] Giữ nguyên các điểm chưa cải tiến (Modal mở ra chưa chọn sẵn 3p, thẻ danh sách khi đến hạn chưa viền cam).

### Giai đoạn 3: Xây dựng Prototype v2 (Cải tiến sau Usability Testing)
- [ ] Dựng `src/views/PrototypeV2View.tsx` kế thừa UI của v1.
- [ ] **Thực hiện Cải tiến 1 (Issue 1 & 3 - Phần 6):**
  - Khi ca tạm hoãn hết giờ quay về đầu `Cần trả lời`, thẻ chat lập tức có viền cam (`border-orange-500`) nổi bật.
  - Hiển thị icon đồng hồ báo thức màu cam + nhãn badge `"Đến hạn nhắc việc"` ngay trên thẻ ngoài danh sách.
- [ ] **Thực hiện Cải tiến 2 (Issue 2 - Phần 6):**
  - Modal Tạm hoãn tự động chọn sẵn mốc `3 phút`.
  - Tự động trỏ con trỏ chuột (`autoFocus`) vào ô Ghi chú nhanh.
  - Hỗ trợ phím tắt `Enter` để xác nhận tạm hoãn ngay lập tức.

### Giai đoạn 4: Kiểm thử kịch bản, Hoàn thiện & Đối soát
- [ ] Kiểm tra tính mượt mà của TopModeNav khi bấm chuyển tab hoặc gõ trực tiếp URL.
- [ ] Kiểm tra 4 luồng tác vụ (Task Flows) trên cả 3 view:
  1. *Happy path:* Tiếp nhận -> Gửi tin -> Tự chuyển Chờ khách -> Tự mở ca tiếp theo.
  2. *Alternative path:* Tạm hoãn 3p/5p -> Đếm ngược -> Hết giờ tự nhảy về đầu Cần trả lời.
  3. *Mở trước hạn & Khách nhắn thêm:* Menu hủy hoãn, đẩy về Cần trả lời.
  4. *Error case:* Bắt lỗi gửi tin không mất nội dung, nút Thử lại hoạt động hoàn hảo.
- [ ] Kiểm tra responsive trên các kích thước màn hình phổ biến.

---
*Tài liệu này là kim chỉ nam chính thức để đảm bảo quá trình code bám sát 100% mục tiêu học tập và cấu trúc báo cáo của nhóm.*
