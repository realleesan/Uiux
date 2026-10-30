# BÁO CÁO NGHIÊN CỨU & ĐỀ XUẤT PHƯƠNG ÁN CẢI TIẾN TOÀN DIỆN
## NÂNG CẤP PROTOTYPE VÀ TRẢI NGHIỆM TƯ VẤN BÁN HÀNG THỜI TRANG ONLINE
*(Dựa trên phản hồi đánh giá, nghiên cứu thực tế Pancake và cấu trúc học thuật Phần 1 – Phần 7)*

---

## MỤC LỤC
1. [Bối cảnh & Phân tích nguyên nhân gốc rễ từ Feedback](#1-bối-cảnh--phân-tích-nguyên-nhân-gốc-rễ-từ-feedback)
2. [Nghiên cứu đối chuẩn Pancake (Benchmarking & Best Practices)](#2-nghiên-cứu-đối-chuẩn-pancake-benchmarking--best-practices)
3. [Định hình lại Giải pháp cốt lõi (Refining the Core Solution)](#3-định-hình-lại-giải-pháp-cốt-lõi-refining-the-core-solution)
4. [Tái thiết kế Kiến trúc Thông tin & Layout (3-Column Architecture)](#4-tái-thiết-kế-kiến-trúc-thông-tin--layout-3-column-architecture)
5. [Chuẩn hóa Design System: Hiện đại, Tối giản, Chống mỏi mắt](#5-chuẩn-hóa-design-system-hiện-đại-tối-giản-chống-mỏi-mắt)
6. [Kịch bản & Luồng tương tác hoàn chỉnh (Interactive Demo Flows)](#6-kịch-bản--luồng-tương-tác-hoàn-chỉnh-interactive-demo-flows)
7. [Kế hoạch triển khai & Lộ trình thực hiện](#7-kế-hoạch-triển-khai--lộ-trình-thực-hiện)

---

## 1. BỐI CẢNH & PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ TỪ FEEDBACK

### 1.1. Các ý kiến phản hồi nhận được:
> 1. **Chưa có gì ấn tượng:** Bản demo mang cảm giác một app chat tĩnh sơ sài, thiếu tính năng chuyên sâu gắn liền với bán hàng online.
> 2. **Nhiều style chữ quá, chữ hơi bé:** Kích thước lắt nhắt (10px, 11px, 13px), trộn lẫn 2 font gây phân mảnh thị giác, chữ nhỏ gây mỏi mắt trong ca trực dài.
> 3. **UI demo và luồng nghèo nàn:** Thao tác chỉ quanh quẩn bấm nút hoãn rồi chờ đếm ngược, thiếu các luồng nghiệp vụ thực tế như tra cứu sản phẩm, chọn size, gửi mẫu câu, tạo đơn hàng.
> 4. **Cần xem lại giải pháp:** Bản chất giải pháp cũ chưa chạm tới căn nguyên của sự gián đoạn; cần học hỏi mô hình thực chiến từ **Pancake** (nền tảng số 1 thị trường bán hàng thời trang qua chat).
> 5. **UI cần hiện đại, tối giản hơn:** Tránh cảm giác phần mềm văn phòng cũ kỹ, hướng tới phong cách SaaS hiện đại (Modern Clean SaaS).

### 1.2. Mổ xẻ nguyên nhân kỹ thuật & UX từ bản hiện trạng:

| Vấn đề quan sát | Nguyên nhân gốc rễ (Root Cause) | Tác động nhận thức & Trải nghiệm |
| :--- | :--- | :--- |
| **Giải pháp "nửa vời"** | Bản cũ chỉ giải quyết việc *nhắc nhở khi rời đi* (hẹn giờ 3p/5p), nhưng bắt nhân viên vẫn phải *chuyển sang phần mềm khác để kiểm tra kho*. Trong khi nghiên cứu Phần 1 (KA-01) đã chỉ rõ: chính việc *chuyển tab/phần mềm* mới là nguyên nhân làm đứt mạch tư duy. | Người đánh giá thấy sản phẩm chưa có giá trị thực tiễn, chưa "khép kín" được vòng đời tư vấn bán hàng. |
| **Typography phân mảnh** | Code lạm dụng `text-[10px]`, `text-[11px]`, trộn lẫn `Inter` và `Plus Jakarta Sans`, các thẻ badge và nhãn thời gian quá bé. | Trái với nguyên lý Accessibility (WCAG 2.1) và Ergonomics cho người trực máy tính 4–8 tiếng. |
| **Bố cục 2 cột chật hẹp** | Toàn bộ thông tin dồn vào 2 cột (Danh sách + Khung chat), thiếu phân vùng chuyên biệt cho dữ liệu nghiệp vụ (Sản phẩm, Tồn kho, Thông tin giao hàng, Lịch sử khách). | Khi khách hỏi kho hoặc chốt mua, nhân viên không có công cụ thao tác trực tiếp, giao diện bị nghèo nàn. |
| **Thiếu công cụ trợ lực ca trực** | Thiếu tin nhắn mẫu (Quick replies/Shortcuts), thiếu thẻ tag màu nghiệp vụ, thiếu form chốt đơn nhanh. | Người dùng phải gõ tay từng chữ, làm mất đi tính chân thực của một ca trực cao điểm (20h–22h). |

---

## 2. NGHIÊN CỨU ĐỐI CHUẨN PANCAKE (BENCHMARKING & BEST PRACTICES)

Qua nghiên cứu tài liệu kỹ thuật và thực tiễn vận hành của **Pancake (Pancake.biz & Pancake POS)** – công cụ đang phục vụ hơn 80.000 shop kinh doanh thời trang tại Việt Nam:

```
+---------------------------------------------------------------------------------------------------+
|                                  PANCAKE WORKSPACE PARADIGM                                       |
+------------------------------+------------------------------------+-------------------------------+
| CỘT 1: HỘI THOẠI & BỘ LỌC    | CỘT 2: KHUNG CHAT TƯ VẤN           | CỘT 3: TỒN KHO & ĐƠN HÀNG     |
| - Phân loại theo Trạng thái  | - Bong bóng chat rõ ràng           | - Tra cứu tồn kho theo Size/Màu|
| - Lọc theo Nhãn/Tag màu      | - Phím tắt tin mẫu (/size, /gia)   | - Tạo đơn hàng tức thì (POS)  |
| - Nhận diện ca cần ưu tiên   | - Ghi chú nội bộ (Note vàng)       | - Thông tin & lịch sử khách   |
| - Nhắc việc đếm ngược        | - Gợi ý kịch bản trả lời nhanh     | - Đặt lịch hẹn chăm sóc lại   |
+------------------------------+------------------------------------+-------------------------------+
```

### Các giá trị UX/UI cốt lõi học hỏi từ Pancake:

1. **Bố cục 3 cột kinh điển (The 3-Column Cockpit):**
   * **Cột trái (280px - 320px):** Danh sách hội thoại thông minh (Smart Inbox).
   * **Cột giữa (Linh hoạt 45% - 50%):** Không gian trò chuyện tập trung (Focus Conversation Area).
   * **Cột phải (320px - 360px):** Trợ lý bán hàng & Kho vận (Sales & Inventory Workspace).
   * *Ý nghĩa UX:* Nhân viên **không bao giờ phải rời màn hình chat**. Mọi thông tin tồn kho, bảng size, tạo đơn đều nằm ngay tầm mắt.

2. **Hệ thống Thẻ màu nghiệp vụ (Custom Color Tags):**
   * Pancake cho phép gán nhãn trực quan: `Chờ check kho` (Cam), `Hỏi size` (Xanh lam), `Khách chốt đơn` (Xanh lá), `Hẹn chuyển khoản` (Tím), `Khách VIP` (Vàng).
   * Giúp nhân viên nhận diện phân loại khách trong 0.2 giây mà không cần đọc hết chữ.

3. **Tra cứu tồn kho tức thì (Live Inventory Widget):**
   * Cho phép gõ mã sản phẩm (VD: `VD01`, `SM03`) -> Hiển thị ma trận Size (S, M, L) x Màu (Trắng, Đen, Be) và số lượng còn lại trong kho.
   * Nhân viên có nút **"Chèn vào tin nhắn"** hoặc **"Chọn tạo đơn"** chỉ bằng 1 click.

4. **Tin nhắn mẫu / Mẫu câu nhanh (Quick Replies / Slash Commands):**
   * Gõ `/size` tự động chèn: *"Dạ mẫu này form chuẩn, bạn cho shop xin chiều cao và cân nặng để shop chọn size vừa vặn nhất nhé!"*.
   * Gõ `/stk` tự động chèn thông tin tài khoản ngân hàng và cú pháp chuyển khoản.
   * Giúp tăng tốc độ phản hồi từ 45 giây xuống 3 giây trong giờ cao điểm.

5. **Ghi chú nội bộ (Internal Sticky Notes):**
   * Khung note màu vàng nhạt đặt ngay trong luồng chat hoặc tab phụ, chỉ nhân viên và chủ shop nhìn thấy (khách hàng không thấy).
   * Dùng để lưu vết: *"Khách dặn giao trước 17h"*, *"Đã hứa tặng thêm kẹp tóc"*.

---

## 3. ĐỊNH HÌNH LẠI GIẢI PHÁP CỐT LÕI (REFINING THE CORE SOLUTION)

Để giải quyết triệt để vấn đề mà thầy/mentor nêu ra: **"A nghĩ nhóm nên nghiêm túc xem lại chỗ giải pháp"**, nhóm không chỉ làm một app chat chung chung, mà định vị sản phẩm là:

> ### **Smart Fashion Sales Inbox**
> *Không gian làm việc hợp nhất giúp nhân viên trực chat thời trang xử lý đồng thời luồng tư vấn, tra cứu tồn kho và chốt đơn trong 1 màn hình duy nhất mà không bị phân mảnh hay trôi tin.*

### Ma trận đối chiếu Giải pháp Cũ vs Giải pháp Mới:

| Tiêu chí | Giải pháp cũ (Giai đoạn trước) | Giải pháp mới cải tiến (Pancake-inspired) |
| :--- | :--- | :--- |
| **Phạm vi xử lý nghiệp vụ** | Chỉ có chat và bấm tạm hoãn 3p/5p. | **Khép kín quy trình 7 bước (Phần 1):** Tiếp nhận -> Tư vấn -> Tra cứu kho tại chỗ -> Tin mẫu -> Nhắc việc -> Tạo đơn nhanh. |
| **Xử lý điểm đau Tra cứu (KA-01)** | Nhân viên vẫn phải mở tab KiotViet bên cạnh (chưa giải quyết được hành vi chuyển tab gây quên). | **Tích hợp Widget Tra cứu Kho/Size ngay cột phải:** Xem số lượng tồn từng size/màu trong 1 cú nhấp chuột. |
| **Xử lý điểm đau Quên khách (KA-02, KA-03)** | Dựa vào bộ đếm lùi thời gian đơn điệu. | **Hệ sinh thái theo dõi đa tầng:** 3 Tab trạng thái + Thẻ Tag màu nghiệp vụ + Hẹn giờ nhắc việc thông minh có ghi chú ngữ cảnh. |
| **Xử lý thao tác gõ chậm** | Gõ tay 100% nội dung. | **Bộ tin nhắn mẫu 1 chạm:** Phản hồi bảng size, chính sách đổi trả, thông tin thanh toán siêu tốc. |
| **Xử lý bước chốt đơn (Bước 6 & 7)** | Không có, dừng lại ở câu chat "em chốt nhé". | **Widget Tạo đơn hàng nhanh (Fast Order POS):** Tự động trích xuất SĐT/Tên từ tin nhắn, chọn size, bấm "Tạo đơn & Gửi xác nhận". |

---

## 4. TÁI THIẾT KẾ KIẾN TRÚC THÔNG TIN & LAYOUT (3-COLUMN ARCHITECTURE)

Giao diện sẽ chuyển đổi từ **2 cột** sang **3 cột chuẩn hiện đại**:

```
+--------------------------------------------------------------------------------------------------------------------------+
|  [Logo & Tên Shop]   | Tab Mode: [Wireframe | Prototype V1 | Prototype V2]   | Ca trực: 20:00 - 22:00 | NV: Nguyễn Vy   |
+----------------------+---------------------------------------------------+-----------------------------------------------+
| CỘT 1: DANH SÁCH (300px) | CỘT 2: KHUNG CHAT CHÍNH (Flex 1)                  | CỘT 3: TIỆN ÍCH NGHIỆP VỤ (340px)             |
|                      |                                                   |                                               |
| [3 Tab Việc cần làm] | [Header Chat: Tên khách + Tag trạng thái + Actions]| [Tab chuyển: KHO HÀNG | TẠO ĐƠN | THÔNG TIN]  |
| - Cần trả lời (4)    |                                                   |                                               |
| - Chờ khách (1)      | [Vùng lịch sử tin nhắn bong bóng hiện đại]        | --- NỘI DUNG TAB KHO HÀNG ---                 |
| - Tạm hoãn (1)       | - Tin nhắn khách (Trắng tối giản)                 | Ô tìm kiếm mã: [VD01                 ]        |
|                      | - Tin nhắn Shop (Indigo/Xanh hiện đại)            | Váy VD01 - Váy suông xếp ly (350.000đ)        |
| [Bộ lọc Tag nhanh]   | - Ghi chú nội bộ (Banner vàng tinh tế)            | Bảng tồn kho:                                 |
| [Tất cả] [Size] [Đơn]|                                                   | - Trắng: Size S (5) | Size M (12) | Size L (0)|
|                      | [Thanh gợi ý Tin mẫu 1 chạm]:                     | - Đen:   Size S (8) | Size M (4)  | Size L (6)|
| [Danh sách thẻ chat] | [Bảng size] [Hỏi chiều cao] [STK chuyển khoản]    | [Nút: Chèn vào tin nhắn] [Nút: Chọn tạo đơn]  |
| - Avatar + Tên       |                                                   |                                               |
| - Kênh Messenger     | [Khung soạn thảo thông minh]:                     | --- HOẶC TAB TẠO ĐƠN (POS) ---                |
| - Tag màu nổi bật    | - Textarea tự co giãn                             | Họ tên: [Minh Trang         ]                 |
| - Dòng preview tin   | - Nút đính kèm ảnh mẫu                            | SĐT:    [0912.345.678       ] (Auto-fill)     |
| - Thời gian / Hạn    | - Nút Đặt hẹn giờ / Tạm hoãn                      | Sản phẩm: [Váy VD01 · Trắng · M] (350k)       |
| - Viền cam khi đến hạn| - Nút Gửi (Primary CTA)                           | Phí ship: [25.000đ] -> Tổng: 375.000đ         |
|                      |                                                   | [NÚT: TẠO ĐƠN VÀ GỬI XÁC NHẬN]                |
+----------------------+---------------------------------------------------+-----------------------------------------------+
```

### Chi tiết vai trò 3 cột:
1. **Cột 1 - Inbox Navigator (Quản lý hàng đợi):**
   * Phân rõ ranh giới: Ai đang chờ ai (Shop cần trả lời vs Khách đang suy nghĩ vs Đang tạm hoãn).
   * Badge số lượng trực quan, rõ ràng, không gây rối mắt.
   * Thẻ chat có visual hierarchy chuẩn: Tên khách (14px đậm) -> Dòng tin mới (13px vừa mắt) -> Nhãn tag màu nghiệp vụ.
2. **Cột 2 - Conversation Hub (Mặt trận tương tác):**
   * Đơn giản, thoáng đãng, tập trung vào đoạn hội thoại.
   * Tích hợp thanh công cụ phản hồi nhanh: gõ tin mẫu 1 click.
   * Trạng thái nhắc việc (đến hạn hẹn giờ) hiển thị trang nhã, có nút "Xử lý ngay".
3. **Cột 3 - Sales & Utility Panel (Bàn làm việc nghiệp vụ):**
   * **Tab 1: Tra cứu Kho & Size:** Giải quyết triệt để KA-01, nhân viên không bao giờ phải chuyển tab KiotViet.
   * **Tab 2: Tạo đơn hàng nhanh (POS):** Bắt ngay SĐT của khách từ chat, điền sẵn thông tin sản phẩm, tạo đơn trong 5 giây.
   * **Tab 3: Ghi chú & Nhắc việc:** Nơi hẹn giờ tạm hoãn (3p, 5p, hoặc tùy chỉnh), lưu note cho ca sau.

---

## 5. CHUẨN HÓA DESIGN SYSTEM: HIỆN ĐẠI, TỐI GIẢN, CHỐNG MỎI MẮT

Để giải quyết phản hồi: *"Nhiều style chữ quá, chữ hơi bé"* và *"UI tham khảo style hiện đại, tối giản"*:

### 5.1. Triết lý Thiết kế (Design Philosophy): "Clean Modern SaaS"
* Lấy cảm hứng từ các công cụ làm việc hàng đầu hiện nay như **Linear.app, Raycast, Intercom Fin, Stripe Dashboard**:
* Tối giản viền viền thừa (border clutter), sử dụng khoảng trắng (whitespace) và sắc thái xám nhẹ để phân tầng không gian.
* Màu sắc có chủ đích (Intentional Color): Nền trắng/xám sạch sẽ; màu sắc chỉ dùng để báo trạng thái và điểm nhấn hành động.

### 5.2. Chuẩn hóa Bảng Typography (Tuyệt đối không dùng chữ li ti):
Nhóm chuẩn hóa về **duy nhất 1 họ Font chữ hiện đại:** `Inter` (hoặc hệ thống font tương đương có độ sắc nét cực cao trên Windows):

| Cấp bậc (Hierarchy) | Cỡ chữ (Size) | Độ đậm (Weight) | Chiều cao dòng (Line-height) | Ứng dụng thực tế trên UI |
| :--- | :--- | :--- | :--- | :--- |
| **Heading / Title** | `15px` | SemiBold (600) | `1.4` | Tên khách hàng ở Header, Tiêu đề phân vùng |
| **Card Primary Text** | `14px` | Medium / SemiBold (500/600) | `1.4` | Tên khách trong danh sách, Tên sản phẩm, Tên nút bấm |
| **Body / Chat Bubble** | `14px` | Regular (400) | `1.5` | Toàn bộ nội dung tin nhắn chat của Shop và Khách |
| **Secondary / Snippet** | `13px` | Regular (400) | `1.4` | Dòng tin nhắn xem trước ngoài thẻ, Dữ liệu tồn kho |
| **Metadata / Badge** | `12px` | Medium (500) | `1.3` | Giờ gửi nhận, Tag trạng thái, Đếm ngược thời gian |

> **Cam kết:** **KHÔNG** sử dụng cỡ chữ dưới `12px`. Loại bỏ hoàn toàn các class `text-[10px]` hay `text-[11px]` gây đau mắt.

### 5.3. Bảng Màu Tối Giản & Cao Cấp (Minimalist SaaS Palette):

```
+------------------------------------------------------------------------------------------+
| BACKGROUNDS:                                                                             |
| - Pure White:          #FFFFFF  (Vùng làm việc, khung tin nhắn, ô nhập liệu)             |
| - Subtle Canvas:       #F8FAFC  (Nền toàn trang, nền thẻ chat chưa chọn)                 |
| - Hover/Active Tint:   #F1F5F9  (Trạng thái rê chuột, nền phụ trợ)                       |
+------------------------------------------------------------------------------------------+
| TEXT CONTRAST:                                                                           |
| - Slate 900:           #0F172A  (Văn bản chính, tên khách, tin nhắn - Đọc cực rõ)        |
| - Slate 600:           #475569  (Văn bản phụ, mô tả, nhãn)                               |
| - Slate 400:           #94A3B8  (Thời gian, icon mờ, đường viền nhạt)                    |
+------------------------------------------------------------------------------------------+
| ACCENT & ACTIONS:                                                                        |
| - Modern Indigo/Blue:  #4F46E5 hoặc #2563EB (Nút Gửi, Tab đang chọn, Điểm nhấn thương hiệu) |
| - Soft Blue Bubble:    #EEF2FF hoặc #EFF6FF (Bong bóng tin nhắn của Shop - Trang nhã)   |
+------------------------------------------------------------------------------------------+
| SEMANTIC STATUS (Trạng thái rõ ràng, không loè loẹt):                                    |
| - Cam cảnh báo:        #EA580C  (Ca hẹn giờ đến hạn, Thẻ cần xử lý gấp)                   |
| - Xanh lá thành công:  #16A34A  (Đã chốt đơn, Còn hàng trong kho)                       |
| - Xanh lam thông tin:  #0284C7  (Chờ khách, Đang tư vấn)                                |
| - Xám trung tính:      #64748B  (Tạm hoãn, Chưa có đơn)                                  |
+------------------------------------------------------------------------------------------+
```

---

## 6. KỊCH BẢN & LUỒNG TƯƠNG TÁC HOÀN CHỈNH (INTERACTIVE DEMO FLOWS)

Để giải quyết triệt để nhận xét: *"UI demo và luồng nghèo nàn"*, Prototype mới sẽ xây dựng **4 kịch bản tương tác sống động, bám sát nghiệp vụ thực tế của một ca trực bán hàng thời trang**:

### Luồng 1: Tư vấn Size & Tra cứu kho tức thì (Live Stock Flow)
1. **Bước 1:** Khách Thùy Anh hỏi: *"Em cao 1m60 nặng 50kg mặc mẫu váy VD02 size gì ạ?"*.
2. **Bước 2:** Nhân viên click vào thanh Tin mẫu: `[Gợi ý size]`, ô chat tự điền câu hỏi số đo.
3. **Bước 3:** Nhìn sang Cột 3 (Tab Kho hàng), nhân viên gõ `VD02` -> Thấy ngay `Size M` còn 8 chiếc, `Size S` còn 2 chiếc.
4. **Bước 4:** Bấm nút `[Chèn thông tin tồn kho vào chat]` -> Hệ thống tự gõ câu trả lời chuẩn xác.
5. **Bước 5:** Bấm **Gửi** -> Thẻ chat tự chuyển sang tab `Chờ khách`, giải phóng hàng đợi.

### Luồng 2: Hẹn giờ Tạm hoãn & Tự động nhắc việc (Smart Snooze Flow)
1. **Bước 1:** Khách Đức Anh hỏi mẫu áo khoác cần liên hệ kho tổng để check size đặc biệt.
2. **Bước 2:** Nhân viên bấm nút `[Tạm hoãn]` ở Header chat hoặc Cột 3.
3. **Bước 3:** Hộp thoại/Panel tự chọn sẵn mốc `3 phút`, trỏ sẵn chuột vào ô Note: *"Kiểm tra size L áo khoác tại kho tổng"*.
4. **Bước 4:** Bấm Enter xác nhận -> Ca chat tạm ẩn sang tab `Tạm hoãn`.
5. **Bước 5 (Demo hết hạn):** Có nút test nhanh `[⚡ Hết giờ]` -> Thẻ chat tự động bật về vị trí số 1 của tab `Cần trả lời`, **viền cam nổi bật**, icon đồng hồ nhấp nháy, kèm banner nhắc việc trên đầu khung chat giúp nhân viên nhớ lại ngay ngữ cảnh mà không phải đọc lại tin cũ!

### Luồng 3: Thu thập thông tin & Tạo đơn hàng nhanh (Fast Order POS Flow)
1. **Bước 1:** Khách Minh Trang nhắn: *"Shop chốt cho em váy VD01 màu trắng size M nhé. SĐT em là 0912345678, ship về 123 Cầu Giấy Hà Nội"*.
2. **Bước 2:** Hệ thống tự động nhận diện thông tin trong chat và highlight nút: `[Tạo đơn nhanh từ tin nhắn]`.
3. **Bước 3:** Nhân viên bấm 1 click -> Cột 3 chuyển sang Tab Tạo đơn, các trường Họ tên, SĐT, Địa chỉ, Sản phẩm tự động được điền sẵn!
4. **Bước 4:** Bấm `[Xác nhận tạo đơn]` -> Hệ thống tự động tạo mã đơn `#DH-1042`, gắn tag xanh `[Đã tạo đơn]`, và gửi tin nhắn tóm tắt đơn hàng chuyên nghiệp kèm link đối soát cho khách.

### Luồng 4: Giả lập ca cao điểm & Ngoại lệ (Stress-test & Edge Cases)
1. **Khách nhắn thêm khi đang hoãn:** Đang hẹn giờ kiểm tra mà khách nhắn thêm câu hỏi khác -> Hệ thống tự hủy hoãn và đưa ngay về đầu `Cần trả lời`.
2. **Lỗi mạng khi bấm gửi:** Tự động bắt lỗi ngắt kết nối mạng thật hoặc giả lập, thông báo đỏ tinh tế, giữ nguyên nội dung trong khung soạn thảo kèm nút `[Thử lại]` một chạm.
3. **Lọc theo Thẻ nghiệp vụ (Tag Filter):** Nhân viên có thể lọc xem riêng các khách đang "Chờ chuyển khoản" hoặc "Hỏi tư vấn size" để xử lý hàng loạt.

---

## 7. KẾ HOẠCH TRIỂN KHAI & LỘ TRÌNH THỰC HIỆN

Kế hoạch này đảm bảo **giữ trọn vẹn tiến trình học tập của nhóm** (không làm mất bản Wireframe cũ và Prototype V1 đối chứng), đồng thời nâng cấp phiên bản **Prototype V2** thành một sản phẩm thực thụ gây ấn tượng mạnh với người chấm:

```
                             TIẾN TRÌNH 3 PHIÊN BẢN TRÊN PREVIEW PANEL
                                                                                 
 [1. WIREFRAME]              [2. PROTOTYPE V1]            [3. PROTOTYPE V2 (HOÀN THIỆN)]
 (Bản gốc của bạn Nhung)     (Bản UI cũ - làm mốc)       (BẢN CẢI TIẾN THEO PANCAKE)
 - Grayscale đơn sắc         - Giao diện 2 cột cũ         - Bố cục 3 cột chuẩn Pancake
 - Thao tác cơ bản           - Thao tác hoãn thủ công     - Tra cứu Tồn kho/Size trực tiếp
 - Minh chứng giai đoạn đầu  - Minh chứng cho bài test    - Form tạo đơn POS 1 chạm
                                                           - Bộ tin nhắn mẫu nhanh
                                                           - Design System tối giản, chữ rõ nét
```

### Các bước chuẩn bị trước khi code:
1. **Bước 1 (Review & Duyệt Phương án):** Thảo luận và thống nhất bản phương án trong file markdown này với nhóm và mentor.
2. **Bước 2 (Chuẩn bị CSDL & Types):** Bổ sung type cho Sản phẩm (Products), Tồn kho (Stock by Size/Color), Đơn hàng (Orders), và Tin mẫu (Quick Replies).
3. **Bước 3 (Thiết kế Component Cột 3):** Xây dựng component `RightUtilityPanel` (gồm 3 tab: Tra kho hàng, Tạo đơn hàng, Ghi chú hẹn giờ).
4. **Bước 4 (Chuẩn hóa Typography & Theme CSS):** Cập nhật `src/index.css`, xóa bỏ các class chữ nhỏ dưới 12px, cố định font size 14px cho body chat.
5. **Bước 5 (Tích hợp luồng tương tác):** Nối logic giữa chat, tra kho và tạo đơn để người dùng test thử trơn tru, thuyết phục 100%.

---
*Tài liệu này được soạn thảo nghiêm túc sau khi nghiên cứu kỹ hệ thống tài liệu 7 phần của đề tài và khảo sát chuyên sâu nền tảng Pancake. Sẵn sàng bắt tay vào hiện thực hóa ngay khi được xác nhận.*
