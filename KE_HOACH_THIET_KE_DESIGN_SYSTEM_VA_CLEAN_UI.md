# KẾ HOẠCH CHUẨN HÓA TOÀN DIỆN DESIGN SYSTEM & CLEAN ARCHITECTURE
## DỰ ÁN: WORKSPACE QUẢN LÝ HỘI THOẠI & CHỐT ĐƠN THỜI TRANG ONLINE
*(Tài liệu quy chuẩn UI/UX Design System, Typography Scale, Clean Code & Product Microcopy)*

---

## 1. VISUAL AUDIT: NHÌN THẲNG VÀO CÁC LỖI THÔ THIỂN HIỆN TẠI (TRÊN SCREENSHOT)

Từ hình ảnh thực tế trên trình duyệt (`uiux-pi-pearl.vercel.app`), giao diện đang mắc phải các lỗi căn bản khiến sản phẩm trông giống **"bản nháp bài tập nhồi nhét"** thay vì một **phần mềm SaaS thương mại chuyên nghiệp**:

```
[ LỖI HIỆN TẠI TRÊN SCREENSHOT ]
├── 1. TEXT GIẢI THÍCH NHỒI NHÉT VÀO UI (Microcopy sai lệch)
│   ├── "NV: Nguyễn Vy (Ca cao điểm 20h–22h)" -> Đưa cả giả định nghiên cứu vào header thật!
│   ├── "Số đo: 1m60 · 50kg (Size M)" gắn thô thiển cạnh tên khách.
│   ├── "⚡ Ưu tiên ca đến hạn 4 hội thoại" -> Văn phong báo cáo, không phải app chat.
│   └── Placeholder: "Soạn nội dung... (Gõ /size, /stk hoặc bấm tin mẫu ở trên)" dài lê thê.
├── 2. BỐ CỤC BỊ VỠ & TỶ LỆ KÉM CHUẨN XÁC
│   ├── Tab "Cần trả" bị rớt chữ "lời" xuống dòng, badge tròn đỏ bị lệch tâm.
│   ├── Thẻ chat bị nhồi nhét 3 hàng tag màu đè lên nhau, chữ cắt cụt "nhé....."
│   └── Cột 3 nhồi emoji (📦, ⚡, ⏱), nút to cồng kềnh, phân cách rời rạc.
├── 3. TYPOGRAPHY & ĐỘ TƯƠNG PHẢN THIẾU QUY CHUẨN
│   ├── Chưa nhất quán 2 font: Trộn lẫn không có quy tắc.
│   ├── Dùng font size tùy tiện, nhiều cỡ chữ vụn vặt (10px, 11px, 12px, 13px, 14px).
│   └── Bong bóng chat của Shop dùng màu xanh điện quá gắt, tương phản chói mắt.
└── 4. KIẾN TRÚC CODE SPAGHETTI (Chưa Clean Code)
    └── Toàn bộ 1.000 dòng code nhồi vào 1 file `PrototypeV2View.tsx`, không tách component.
```

---

## 2. BỘ QUY CHUẨN DESIGN SYSTEM CHUẨN MỰC (DESIGN TOKENS)

### 2.1. Thống nhất 2 Font chữ Tiếng Việt chuẩn mực
Tuân thủ nghiêm ngặt quy định ban đầu của đồ án:
1. **Font Tiêu đề, Tên khách hàng, Con số & Nhãn hành động (Headings & Accents):**  
   👉 **`Plus Jakarta Sans`** (Hiện đại, bo cong hình học cao cấp, tạo nét sang trọng cho thời trang).
2. **Font Thân bài, Bong bóng tin nhắn, Ô nhập liệu, Dữ liệu bảng (Body & UI Interface):**  
   👉 **`Inter`** (Chuẩn mực công nghệ số 1 thế giới về độ sắc nét, chống mỏi mắt trên màn hình Desktop).

### 2.2. Bảng Thang bậc Kích thước Chữ (Typography Scale - 8-pt Grid System)
Tuyệt đối xóa bỏ các class tùy tiện (`text-[10px]`, `text-[11px]`, `text-[13px]`). Chuẩn hóa thành 5 bậc duy nhất:

| Token Name | Font Family | Size | Weight | Line Height | Ứng dụng thực tế trên giao diện |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `font-display` | Plus Jakarta Sans | **16px** | Bold (700) | 1.3 | Tên Shop thương hiệu, Tiêu đề Modal lớn |
| `font-heading` | Plus Jakarta Sans | **14px** | SemiBold (600) | 1.4 | Tên khách hàng, Tiêu đề phân vùng, Mã đơn hàng |
| `font-body` | Inter | **14px** | Regular (400) | 1.5 | Nội dung tin nhắn chat của Shop & Khách (Đọc êm mắt) |
| `font-sub` | Inter | **13px** | Regular / Medium | 1.4 | Dòng tin nhắn xem trước (Snippet), Dữ liệu tồn kho |
| `font-caption` | Inter | **12px** | Medium / SemiBold | 1.3 | Giờ gửi nhận, Badge số lượng, Thẻ Tag phân loại |

---

### 2.3. Bảng Màu Tinh Tế Chuẩn Clean SaaS (Không dùng màu chát chúa)

```
+---------------------------------------------------------------------------------------------------+
| 1. NEUTRAL PALETTE (Nền & Văn bản tinh giản):                                                    |
|    • Canvas Base:      #F8FAFC (Slate 50)  - Nền tổng thể toàn ứng dụng, dịu mắt                  |
|    • Surface White:    #FFFFFF (White)     - Nền thẻ chat, nền khung nhập liệu, nền card          |
|    • Text Primary:     #0F172A (Slate 900) - Văn bản chính, đọc cực nét, độ tương phản AA+        |
|    • Text Muted:       #64748B (Slate 500) - Dòng xem trước, chú thích thời gian                  |
|    • Border Subtle:    #E2E8F0 (Slate 200) - Đường phân cách 1px mỏng nhẹ, tinh tế                |
+---------------------------------------------------------------------------------------------------+
| 2. BRAND & ACCENT (Điểm nhấn hiện đại - Không dùng màu xanh gắt):                                 |
|    • Primary Accent:   #2563EB (Royal Blue) - Màu nút Gửi, Tab đang chọn, Viền Active             |
|    • Shop Bubble:      #2563EB (Text trắng) HOẶC #EFF6FF (Text xanh đậm) tuỳ chế độ tương phản    |
|    • Customer Bubble:  #FFFFFF (Viền 1px Slate 200, Text Slate 900) - Tối giản, thanh lịch        |
+---------------------------------------------------------------------------------------------------+
| 3. SEMANTIC TAGS (Màu sắc chức năng chuẩn Pancake - Nhẹ nhàng, không loè loẹt):                  |
|    • Khách chốt đơn:   Nền #ECFDF5 | Chữ #047857 | Viền #A7F3D0 (Emerald)                         |
|    • Chờ check kho:    Nền #FFFBEB | Chữ #B45309 | Viền #FDE68A (Amber)                           |
|    • Tư vấn size:      Nền #EFF6FF | Chữ #1D4ED8 | Viền #BFDBFE (Blue)                            |
|    • Chờ chuyển khoản: Nền #FAF5FF | Chữ #7E22CE | Viền #E9D5FF (Purple)                          |
|    • Đến hạn nhắc lại: Viền Cam #F97316 (Orange 500) dày 2px + Nhãn cam thanh mảnh                |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. THANH LỌC TOÀN BỘ MICROCOPY (TẨY RỬA VĂN PHONG BÀI TẬP)

Một giao diện UI/UX điểm cao phải trông như **sản phẩm thương mại đang được hàng nghìn nhân viên bán hàng dùng hàng ngày**, loại bỏ hoàn toàn các câu chữ mang tính thuyết minh bài tập:

| Vị trí trên màn hình | Microcopy cũ (Lỗi bài tập nhồi nhét) | Microcopy mới (Chuẩn phần mềm thương mại) |
| :--- | :--- | :--- |
| **Header ứng dụng** | `NV: Nguyễn Vy (Ca cao điểm 20h–22h)` | `Nguyễn Vy · Trực tuyến` kèm chấm xanh nhỏ |
| **Badge thương hiệu** | `Pancake Smart Inbox` (gắn thô cạnh logo) | Tích hợp vào logo: `L'AURA CLOSET` · Phụ đề: `Hộp thư bán hàng` |
| **Header cuộc chat** | `Minh Trang Online Số đo: 1m60 · 50kg (Size M)` | `Minh Trang` · Subtitle: `Đang hoạt động · Khách hàng tiềm năng` (Số đo đưa vào Side Panel hoặc thẻ profile riêng) |
| **Tiêu đề phân cách** | `⚡ Ưu tiên ca đến hạn 4 hội thoại` | Loại bỏ hoàn toàn! Dùng trật tự sắp xếp tự nhiên để thẻ đến hạn lên đầu. |
| **Nút tiện ích** | `Thu gọn Tiện ích` | Icon Sidebar toggle tinh tế trên góc phải |
| **Thanh Tin mẫu** | `⚡ TIN MẪU: Tư vấn size & Form dáng ... ✨ Bắt SĐT` | Chuyển thành hàng Button Pills thanh thoát: `Tư vấn size`, `Chuyển khoản`, `Freeship`, `Đổi trả` |
| **Placeholder chat** | `Soạn nội dung tư vấn báo giá... (Gõ /size...)` | `Nhập tin nhắn tư vấn (nhấn Enter để gửi)...` |
| **Tab cột 3** | Nhồi nhét icon emoji `📦 Kho & Size`, `⚡ Tạo đơn POS` | Chữ chuẩn mực: `Tồn kho & Size`, `Tạo đơn hàng`, `Nhắc việc` |
| **Bảng tồn kho** | `PHÂN LOẠI SIZE & MÀU`, `TỒN KHO`, `+ Chèn` | Layout Table phẳng sạch sẽ, nút `Chèn` thiết kế icon tinh xảo |

---

## 4. TÁI CẤU TRÚC KIẾN TRÚC MÃ NGUỒN (CLEAN CODE COMPONENTIZATION)

Thay vì dồn toàn bộ 1.000 dòng code vào một file `PrototypeV2View.tsx`, chúng ta sẽ phân rã thành các component module hóa theo chuẩn React/TypeScript:

```
src/
├── components/
│   ├── TopModeNav.tsx                  <- Thanh điều hướng 3 chế độ (Giữ nguyên)
│   └── workspace/
│       ├── WorkspaceHeader.tsx         <- Header shop gọn gàng, trạng thái nhân viên
│       ├── ConversationList.tsx        <- Cột 1: Danh sách hội thoại, 3 tab, bộ lọc tag
│       │   ├── ConversationCard.tsx    <- Thẻ chat con (Avatar, badge, tag, viền cam)
│       │   └── TagFilterBar.tsx        <- Thanh chọn tag màu nghiệp vụ
│       ├── ChatArea.tsx                <- Cột 2: Khung chat trung tâm
│       │   ├── ChatHeader.tsx          <- Header khách hàng, nút Tạm hoãn, Tag
│       │   ├── MessageList.tsx         <- Lịch sử bong bóng chat, banner nhắc việc
│       │   ├── OrderReceiptCard.tsx    <- Thẻ hóa đơn POS đã tạo
│       │   ├── QuickRepliesBar.tsx     <- Thanh tin mẫu 1 chạm
│       │   └── MessageComposer.tsx     <- Ô nhập liệu, upload ảnh, nút Gửi
│       └── SideUtilityPanel.tsx        <- Cột 3: Tiện ích bên phải
│           ├── InventoryTab.tsx        <- Tra cứu tồn kho ma trận Size x Màu
│           ├── FastOrderPosTab.tsx     <- Form tạo đơn hàng nhanh POS
│           └── SnoozeScheduleTab.tsx   <- Hẹn giờ nhắc việc & nút test
└── views/
    ├── WireframeView.tsx               <- Bảo toàn 100% bản gốc
    ├── PrototypeV1View.tsx             <- Bảo toàn 100% bản V1 đối chứng
    └── PrototypeV2View.tsx             <- Component điều phối sạch sẽ (<150 dòng)
```

---

## 5. THIẾT KẾ CHI TIẾT 3 PHÂN VÙNG GIAO DIỆN MỚI

```
+----------------------------------------------------------------------------------------------------------------------+
| [Logo] L'AURA CLOSET · Hộp thư bán hàng                       [Chấm xanh] Nguyễn Vy       [Icon Sidebar Panel]       |
+----------------------------------------------------------------------------------------------------------------------+
| CỘT 1: HỘI THOẠI (300px)    | CỘT 2: KHUNG CHAT TƯ VẤN (Flex 1)              | CỘT 3: TIỆN ÍCH BÁN HÀNG (340px)      |
|                             |                                                |                                       |
| [Cần trả lời 4] [Chờ] [Hoãn]| Minh Trang  [Active] · Facebook Messenger      | [ Tồn kho & Size | Tạo đơn | Nhắc việc]|
|                             | [Thẻ Tag: Chốt đơn] [Nút Tạm hoãn] [Menu]      |                                       |
| [🔍 Tìm kiếm khách, SP...]  |------------------------------------------------| Ô tìm: [VD01                        ] |
| [Tất cả] [Chốt đơn] [Size]  | [⏰ HẾT HẠN HẸN GIỜ: Đã kiểm tra còn size M]  |                                       |
|-----------------------------|                                                | [Ảnh] VD01 - Váy suông cổ nơ cao cấp  |
| [Thẻ 1: Minh Trang]         |  (Khách): Em cao 1m60 nặng 50kg...             | Giá: 350.000đ                         |
|  - Avatar + Facebook icon   |                                                |                                       |
|  - Tag: Khách chốt đơn      |  (Shop): Mẫu VD01 form chuẩn, bạn mặc size M   | BẢNG TỒN KHO:                         |
|  - Preview: Dạ shop ơi em...|          rất vừa vặn tôn dáng nhé ạ!           | • Trắng - Size S : Còn 5   [+ Chèn]   |
|  - 10:40                    |                                                | • Trắng - Size M : Còn 12  [+ Chèn]   |
|                             |  (Khách): Em chốt nhé, SĐT 0912345678...       | • Trắng - Size L : Hết     [Báo hết]  |
| [Thẻ 2: Đức Anh] (VIỀN CAM) |                                                |                                       |
|  - Tag: Chờ check kho       |  [📦 ĐƠN HÀNG #DH-1042 ĐÃ XÁC NHẬN]            | [ Nút: Chọn mẫu này tạo đơn nhanh ]   |
|  - ⏰ Đến hạn nhắc việc!    |   Váy VD01 (Trắng · M) x1 - Tổng: 375.000đ     |                                       |
|                             |------------------------------------------------| --- HOẶC TAB TẠO ĐƠN (POS) ---        |
| [Thẻ 3: Hoàng Lan]          | Tin mẫu: [Tư vấn size] [STK] [Freeship] [Đổi]  | Họ tên: [Minh Trang                 ] |
|  - Preview: Sơ mi SM03...   |------------------------------------------------| SĐT:    [0912345678                 ] |
|                             | [Nhập tin nhắn tư vấn...]        [Nút Gửi]     | Địa chỉ:[123 Cầu Giấy, Hà Nội       ] |
|                             | [📎 Gửi ảnh mẫu]           Enter gửi · Shift+Enter| [ Nút: Xác nhận Tạo đơn & Gửi hoá đơn] |
+----------------------------------------------------------------------------------------------------------------------+
```

---

## 6. LỘ TRÌNH THỰC HIỆN TỪNG BƯỚC (STEP-BY-STEP EXECUTION)

- [ ] **Bước 1: Cấu hình Design Tokens trong `src/index.css`**
  - Khai báo biến CSS font: `--font-heading: 'Plus Jakarta Sans'` và `--font-sans: 'Inter'`.
  - Khai báo bảng màu tinh gọn và các utility class mượt mà.
- [ ] **Bước 2: Xây dựng các Sub-components sạch sẽ trong `src/components/workspace/`**
  - Tách nhỏ và làm sạch các khối logic: `WorkspaceHeader`, `ConversationList`, `ChatArea`, `SideUtilityPanel`.
  - Làm sạch toàn bộ text thô thiển, loại bỏ text chú thích bài tập.
- [ ] **Bước 3: Tối ưu UI Cột 1 (Conversation List)**
  - Sửa lỗi vỡ chữ ở Tab "Cần trả lời", căn giữa hoàn hảo badge đếm.
  - Sắp xếp thẻ chat gọn đẹp, tinh tế, padding chuẩn 12px.
- [ ] **Bước 4: Tối ưu UI Cột 2 (Chat Area)**
  - Thiết kế lại bong bóng chat: Xanh thanh lịch, bo góc 16px mượt mà.
  - Hàng nút tin mẫu nhỏ gọn dạng pills hiện đại.
  - Placeholder ngắn gọn, nút Gửi nổi bật.
- [ ] **Bước 5: Tối ưu UI Cột 3 (Side Panel)**
  - Bảng tồn kho dạng table sạch sẽ, không dùng emoji lộn xộn.
  - Form tạo đơn POS chuyên nghiệp, tự động điền thông tin nhanh.
- [ ] **Bước 6: Kiểm tra tổng thể & Đồng bộ**
  - Đảm bảo giữ nguyên vẹn `WireframeView` và `PrototypeV1View`.
  - Kiểm tra độ sắc nét và phản hồi trên Preview panel.

---
*Kế hoạch này sẽ là thước đo chuẩn mực để tiến hành chỉnh sửa mã nguồn, đem lại giao diện sạch bóng, đẳng cấp và đạt điểm tối đa môn UI/UX.*
