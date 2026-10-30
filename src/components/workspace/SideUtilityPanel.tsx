import React from "react"
import { ProductItem } from "../../types/chat"

type SideUtilityPanelProps = {
  utilityTab: "inventory" | "pos" | "snooze"
  onSelectTab: (tab: "inventory" | "pos" | "snooze") => void
  // Inventory props
  products: ProductItem[]
  productSearch: string
  selectedProduct: ProductItem
  onProductSearchChange: (val: string) => void
  onSelectProduct: (prod: ProductItem) => void
  onInsertInventoryInfo: (prod: ProductItem, variantText: string, stock: number) => void
  onChooseProductForOrder: (prodCode: string) => void
  // POS props
  orderName: string
  orderPhone: string
  orderAddress: string
  orderSelectedProduct: string
  orderSelectedVariant: string
  orderQuantity: number
  orderShipping: number
  orderSuccessMsg: string
  onOrderNameChange: (val: string) => void
  onOrderPhoneChange: (val: string) => void
  onOrderAddressChange: (val: string) => void
  onOrderProductChange: (val: string) => void
  onOrderVariantChange: (val: string) => void
  onOrderQuantityChange: (val: number) => void
  onOrderShippingChange: (val: number) => void
  onAutoFillPOS: () => void
  onConfirmOrder: () => void
  // Snooze props
  snoozeDelay: string
  snoozeNote: string
  onSnoozeDelayChange: (val: string) => void
  onSnoozeNoteChange: (val: string) => void
  onConfirmSnooze: () => void
  onTriggerExpireSnooze: () => void
}

export default function SideUtilityPanel({
  utilityTab,
  onSelectTab,
  products,
  productSearch,
  selectedProduct,
  onProductSearchChange,
  onSelectProduct,
  onInsertInventoryInfo,
  onChooseProductForOrder,
  orderName,
  orderPhone,
  orderAddress,
  orderSelectedProduct,
  orderSelectedVariant,
  orderQuantity,
  orderShipping,
  orderSuccessMsg,
  onOrderNameChange,
  onOrderPhoneChange,
  onOrderAddressChange,
  onOrderProductChange,
  onOrderVariantChange,
  onOrderQuantityChange,
  onOrderShippingChange,
  onAutoFillPOS,
  onConfirmOrder,
  snoozeDelay,
  snoozeNote,
  onSnoozeDelayChange,
  onSnoozeNoteChange,
  onConfirmSnooze,
  onTriggerExpireSnooze,
}: SideUtilityPanelProps) {
  const tabs = [
    { id: "inventory" as const, label: "Tồn kho & Size" },
    { id: "pos" as const, label: "Tạo đơn hàng" },
    { id: "snooze" as const, label: "Nhắc việc" },
  ]

  const matchedProduct = products.find((p) => p.code === orderSelectedProduct) || products[0]
  const subtotal = (matchedProduct?.price || 350000) * orderQuantity
  const total = subtotal + orderShipping

  return (
    <aside className="flex min-h-0 flex-col border-l border-slate-200/80 bg-white select-none">
      {/* 3 Tab Tiện ích sạch sẽ */}
      <div className="flex border-b border-slate-200/80 bg-slate-50/70 p-1.5 gap-1">
        {tabs.map((tab) => {
          const isActive = utilityTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 py-1.5 text-center text-xs rounded-lg transition-all ${
                isActive
                  ? "bg-white text-blue-700 shadow-2xs border border-slate-200/80 font-heading font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-body font-medium"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ===================== TAB 1: TỒN KHO & BẢNG SIZE ===================== */}
      {utilityTab === "inventory" && (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-body">
          {/* Ô tìm kiếm mã sản phẩm */}
          <div>
            <label className="font-heading font-semibold text-slate-700 text-xs block mb-1.5">
              Tra cứu mã sản phẩm:
            </label>
            <input
              value={productSearch}
              onChange={(e) => onProductSearchChange(e.target.value)}
              placeholder="Nhập mã SP: VD01, SM03, QJ02..."
              className="h-8.5 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-xs outline-none focus:border-blue-600 focus:bg-white transition-all font-body"
            />
          </div>

          {/* Danh sách nhanh gợi ý mã sản phẩm */}
          <div className="flex flex-wrap gap-1">
            {products.map((p) => (
              <button
                key={p.code}
                type="button"
                onClick={() => onSelectProduct(p)}
                className={`rounded-md px-2 py-1 text-[11px] font-heading font-semibold border transition-all ${
                  selectedProduct.code === p.code
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80"
                }`}
              >
                {p.code}
              </button>
            ))}
          </div>

          {/* Chi tiết sản phẩm đang xem */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/40 p-3 space-y-3">
            <div className="flex gap-2.5">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="size-14 rounded-lg object-cover border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <span className="font-heading font-bold text-blue-700 text-xs">[{selectedProduct.code}]</span>
                <h4 className="font-heading font-semibold text-slate-900 text-xs leading-snug line-clamp-2">
                  {selectedProduct.name}
                </h4>
                <p className="mt-0.5 font-heading font-bold text-slate-900 text-sm">{selectedProduct.priceFormatted}</p>
              </div>
            </div>

            {/* Bảng tồn kho dạng Table sạch sẽ */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-heading font-semibold uppercase text-slate-400 mb-1 px-1">
                <span>Phân loại</span>
                <span>Tồn kho</span>
              </div>
              <div className="divide-y divide-slate-200/70 border border-slate-200 rounded-lg bg-white overflow-hidden text-xs">
                {selectedProduct.variants.map((v, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5">
                    <span className="text-slate-800 font-medium">
                      {v.color} · Size {v.size}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${
                          v.stock > 5
                            ? "text-emerald-600"
                            : v.stock > 0
                              ? "text-amber-600"
                              : "text-rose-600"
                        }`}
                      >
                        {v.stock > 0 ? `Còn ${v.stock}` : "Hết hàng"}
                      </span>
                      <button
                        type="button"
                        onClick={() => onInsertInventoryInfo(selectedProduct, `${v.color} - Size ${v.size}`, v.stock)}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        title="Chèn thông tin tồn kho vào khung chat"
                      >
                        Chèn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onChooseProductForOrder(selectedProduct.code)}
              className="w-full rounded-lg bg-blue-600 py-2 text-center text-xs font-heading font-semibold text-white hover:bg-blue-700 transition-all shadow-2xs"
            >
              Chọn sản phẩm này tạo đơn
            </button>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: TẠO ĐƠN HÀNG NHANH POS ===================== */}
      {utilityTab === "pos" && (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3 text-xs font-body">
          {orderSuccessMsg && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 font-medium font-body animate-pulse">
              {orderSuccessMsg}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-slate-900 text-sm">Thông tin đơn hàng</span>
            <button
              type="button"
              onClick={onAutoFillPOS}
              className="text-blue-600 hover:underline text-xs font-medium"
            >
              Lấy lại từ chat
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Họ tên người nhận:</label>
              <input
                value={orderName}
                onChange={(e) => onOrderNameChange(e.target.value)}
                placeholder="Nguyễn Thị Minh Trang"
                className="h-8.5 w-full rounded-lg border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-600 font-body"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Số điện thoại:</label>
              <input
                value={orderPhone}
                onChange={(e) => onOrderPhoneChange(e.target.value)}
                placeholder="0912345678"
                className="h-8.5 w-full rounded-lg border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-600 font-body"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Địa chỉ nhận hàng:</label>
              <input
                value={orderAddress}
                onChange={(e) => onOrderAddressChange(e.target.value)}
                placeholder="Số 123 Cầu Giấy, Hà Nội"
                className="h-8.5 w-full rounded-lg border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-600 font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Sản phẩm:</label>
                <select
                  value={orderSelectedProduct}
                  onChange={(e) => onOrderProductChange(e.target.value)}
                  className="h-8.5 w-full rounded-lg border border-slate-300 px-2 text-xs outline-none bg-white font-medium"
                >
                  {products.map((p) => (
                    <option key={p.code} value={p.code}>{p.code} - {p.name.slice(0, 14)}...</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Phân loại:</label>
                <select
                  value={orderSelectedVariant}
                  onChange={(e) => onOrderVariantChange(e.target.value)}
                  className="h-8.5 w-full rounded-lg border border-slate-300 px-2 text-xs outline-none bg-white font-medium"
                >
                  <option value="Trắng · S">Trắng · S</option>
                  <option value="Trắng · M">Trắng · M</option>
                  <option value="Trắng · L">Trắng · L</option>
                  <option value="Đen · M">Đen · M</option>
                  <option value="Be hoa nhí · M">Be hoa nhí · M</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Số lượng:</label>
                <input
                  type="number"
                  min={1}
                  value={orderQuantity}
                  onChange={(e) => onOrderQuantityChange(Number(e.target.value))}
                  className="h-8.5 w-full rounded-lg border border-slate-300 px-2.5 text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Phí vận chuyển:</label>
                <select
                  value={orderShipping}
                  onChange={(e) => onOrderShippingChange(Number(e.target.value))}
                  className="h-8.5 w-full rounded-lg border border-slate-300 px-2 text-xs outline-none bg-white font-medium"
                >
                  <option value={25000}>Tiêu chuẩn: 25.000đ</option>
                  <option value={0}>Miễn phí ship (0đ)</option>
                  <option value={35000}>Hỏa tốc: 35.000đ</option>
                </select>
              </div>
            </div>

            {/* Bảng tính tiền đơn hàng */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tiền hàng:</span>
                <span>{subtotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí giao hàng:</span>
                <span>{orderShipping.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/90 pt-1.5 font-heading font-bold text-sm text-slate-900">
                <span>Tổng cộng:</span>
                <span className="text-blue-700">{total.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onConfirmOrder}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-heading font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
            >
              Tạo đơn & Gửi biên lai
            </button>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: HẸN GIỜ NHẮC VIỆC ===================== */}
      {utilityTab === "snooze" && (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-body">
          <div>
            <h4 className="font-heading font-bold text-slate-900 text-sm">Hẹn giờ nhắc việc</h4>
            <p className="mt-0.5 text-xs text-slate-500 font-body">
              Tạm gác hội thoại khi cần kiểm tra kho. Hệ thống sẽ tự động nhắc lại khi đến hạn.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                Thời gian hẹn giờ:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["3 phút", "5 phút", "10 phút", "15 phút"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onSnoozeDelayChange(m)}
                    className={`rounded-lg py-2 font-heading font-semibold text-xs border transition-all ${
                      snoozeDelay === m
                        ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                Ghi chú ngữ cảnh:
              </label>
              <input
                value={snoozeNote}
                onChange={(e) => onSnoozeNoteChange(e.target.value)}
                placeholder="VD: Kiểm tra kho mẫu AT02 đen..."
                className="h-8.5 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-amber-600 font-body"
              />
            </div>

            <button
              type="button"
              onClick={onConfirmSnooze}
              className="w-full rounded-xl bg-amber-600 py-2.5 text-center text-xs font-heading font-bold text-white shadow-xs hover:bg-amber-700 active:scale-95 transition-all"
            >
              Bắt đầu hẹn ({snoozeDelay})
            </button>

            <div className="border-t border-slate-200 pt-3">
              <span className="font-medium text-slate-400 text-xs block mb-1.5">
                Kiểm thử nhanh:
              </span>
              <button
                type="button"
                onClick={onTriggerExpireSnooze}
                className="w-full rounded-lg border border-amber-300 bg-amber-50/80 py-2 text-center text-xs font-heading font-semibold text-amber-800 hover:bg-amber-100 transition-all"
              >
                Giả lập: Hết hạn hẹn giờ ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
