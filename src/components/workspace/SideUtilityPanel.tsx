import React from "react"
import { Chat, ProductItem } from "../../types/chat"
import { ClockIcon, ReceiptIcon, SearchIcon, UserIcon } from "./icons"
import { Button, Chip, CustomSelect, Field, inputClass, Tabs, Tag } from "./ui"

type SideUtilityPanelProps = {
  customer?: Chat
  utilityTab: "inventory" | "pos" | "snooze"
  onSelectTab: (tab: "inventory" | "pos" | "snooze") => void
  products: ProductItem[]
  productSearch: string
  selectedProduct: ProductItem
  onProductSearchChange: (val: string) => void
  onSelectProduct: (prod: ProductItem) => void
  onInsertInventoryInfo: (prod: ProductItem, variantText: string, stock: number) => void
  onChooseProductForOrder: (prodCode: string) => void
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
  snoozeDelay: string
  snoozeNote: string
  onSnoozeDelayChange: (val: string) => void
  onSnoozeNoteChange: (val: string) => void
  onConfirmSnooze: () => void
  onTriggerExpireSnooze: () => void
}

export default function SideUtilityPanel({
  customer,
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
    { id: "inventory" as const, label: "Tồn kho" },
    { id: "pos" as const, label: "Tạo đơn hàng" },
    { id: "snooze" as const, label: "Nhắc việc" },
  ]

  const matchedProduct = products.find((p) => p.code === orderSelectedProduct) || products[0]
  const subtotal = (matchedProduct?.price || 350000) * orderQuantity
  const total = subtotal + orderShipping

  return (
    <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-white select-none">
      {/* 3 Tab Tiện ích */}
      <Tabs
        items={tabs}
        value={utilityTab}
        onChange={onSelectTab}
      />

      {/* ===================== TAB 1: TỒN KHO ===================== */}
      {utilityTab === "inventory" && (
        <div className="min-h-0 flex-1 overflow-y-auto p-3.5 space-y-3">
          {/* Thẻ Khách hàng CRM (kèm avatar thật và ghi chú ca trực) */}
          {customer && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={customer.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={customer.name}
                    className="size-6 rounded-full object-cover border border-slate-200 shadow-2xs"
                  />
                  <span className="type-heading text-slate-900">{customer.name}</span>
                </div>
                {customer.customerPhone && (
                  <button
                    type="button"
                    onClick={onAutoFillPOS}
                    className="rounded border border-blue-200 bg-white px-2 py-0.5 type-caption font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    Nhập vào POS ➔
                  </button>
                )}
              </div>

              {customer.customerHeightWeight ? (
                <div className="rounded-lg bg-white px-2.5 py-1.5 border border-blue-100/80 type-caption text-slate-700">
                  <strong className="text-slate-900 font-semibold">Số đo:</strong> {customer.customerHeightWeight}
                </div>
              ) : (
                <p className="type-caption text-slate-500">Chưa có số đo cụ thể</p>
              )}

              {/* Ghi chú ca trực: Luôn hiển thị trong CRM để không phải cuộn lên đầu chat */}
              {customer.internalNote && (
                <div className="rounded-lg bg-amber-50/70 border border-amber-200/60 px-2.5 py-1.5 type-caption text-amber-900">
                  <span className="font-semibold text-amber-950 block mb-0.5">Ghi chú ca trực:</span>
                  <span className="text-slate-700">{customer.internalNote}</span>
                </div>
              )}
            </div>
          )}

          {/* Ô tìm kiếm mã sản phẩm */}
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-3 text-slate-400">
              <SearchIcon className="size-4" />
            </span>
            <input
              value={productSearch}
              onChange={(e) => onProductSearchChange(e.target.value)}
              placeholder="Nhập mã sản phẩm..."
              className="h-8.5 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-8.5 pr-3 type-body text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Chi tiết sản phẩm & Tồn kho */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-3 space-y-3 shadow-2xs">
            <div className="flex gap-2.5 items-center">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="size-13 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="type-caption font-semibold text-blue-700">[{selectedProduct.code}]</span>
                  <span className="type-caption text-slate-500">{selectedProduct.category}</span>
                </div>
                <h4 className="type-heading text-slate-900 leading-snug line-clamp-1" title={selectedProduct.name}>
                  {selectedProduct.name}
                </h4>
                <p className="type-heading text-slate-900 font-semibold">{selectedProduct.priceFormatted}</p>
              </div>
            </div>

            {/* Bảng tồn kho dạng Grid căn chỉnh chuẩn mực 100% */}
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_72px_64px] items-center px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                <span>Phân loại</span>
                <span className="text-center">Tồn kho</span>
                <span className="text-center">Thao tác</span>
              </div>
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200/80 bg-white overflow-hidden">
                {selectedProduct.variants.map((v, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_72px_64px] items-center px-3 py-1.5 hover:bg-slate-50 transition-colors"
                  >
                    {/* Cột 1: Phân loại */}
                    <span className="text-[13px] font-medium text-slate-800 truncate" title={`${v.color} · Size ${v.size}`}>
                      {v.color} · Size {v.size}
                    </span>

                    {/* Cột 2: Tồn kho */}
                    <div className="flex justify-center">
                      <Tag tone={v.stock > 5 ? "emerald" : v.stock > 0 ? "amber" : "rose"}>
                        {v.stock > 0 ? `Còn ${v.stock}` : "Hết hàng"}
                      </Tag>
                    </div>

                    {/* Cột 3: Thao tác (Button Tư vấn 1 dòng sắc nét hoặc gạch ngang) */}
                    <div className="flex justify-center">
                      {v.stock > 0 ? (
                        <button
                          type="button"
                          onClick={() => onInsertInventoryInfo(selectedProduct, `${v.color} - Size ${v.size}`, v.stock)}
                          className="inline-flex h-6 items-center justify-center rounded-md border border-blue-200 bg-blue-50/70 px-2.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all whitespace-nowrap active:scale-95"
                        >
                          Tư vấn
                        </button>
                      ) : (
                        <span className="inline-flex h-6 items-center justify-center text-xs text-slate-300 select-none">
                          —
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nút bấm tạo đơn nhanh */}
            <Button
              variant="primary"
              size="sm"
              block
              onClick={() => onChooseProductForOrder(selectedProduct.code)}
            >
              Chọn sản phẩm này tạo đơn
            </Button>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: TẠO ĐƠN HÀNG NHANH POS ===================== */}
      {utilityTab === "pos" && (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3">
          {orderSuccessMsg && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 type-body text-emerald-800 animate-pulse">
              {orderSuccessMsg}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={customer?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                alt={customer?.name}
                className="size-6 rounded-full object-cover border border-slate-200 shadow-2xs"
              />
              <span className="type-heading text-slate-900">{customer?.name || "Khách hàng"}</span>
            </div>
            <button
              type="button"
              onClick={onAutoFillPOS}
              className="text-blue-600 hover:underline type-caption font-medium"
            >
              Lấy lại từ chat
            </button>
          </div>

          <div className="space-y-2">
            <Field label="Họ tên người nhận:">
              <input
                value={orderName}
                onChange={(e) => onOrderNameChange(e.target.value)}
                placeholder="Họ tên người nhận"
                className={inputClass}
              />
            </Field>

            <Field label="Số điện thoại:">
              <input
                value={orderPhone}
                onChange={(e) => onOrderPhoneChange(e.target.value)}
                placeholder="Số điện thoại"
                className={inputClass}
              />
            </Field>

            <Field label="Địa chỉ nhận hàng:">
              <input
                value={orderAddress}
                onChange={(e) => onOrderAddressChange(e.target.value)}
                placeholder="Địa chỉ nhận hàng"
                className={inputClass}
              />
            </Field>

            <Field label="Sản phẩm:">
              <CustomSelect
                value={orderSelectedProduct}
                onChange={(val) => onOrderProductChange(String(val))}
                options={products.map((p) => ({
                  value: p.code,
                  label: `[${p.code}] ${p.name}`,
                }))}
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Phân loại:">
                <CustomSelect
                  value={orderSelectedVariant}
                  onChange={(val) => onOrderVariantChange(String(val))}
                  options={[
                    { value: "Trắng · S", label: "Trắng · S" },
                    { value: "Trắng · M", label: "Trắng · M" },
                    { value: "Trắng · L", label: "Trắng · L" },
                    { value: "Đen · M", label: "Đen · M" },
                    { value: "Be hoa nhí · M", label: "Be hoa nhí · M" },
                  ]}
                />
              </Field>
              <Field label="Số lượng:">
                <input
                  type="number"
                  min={1}
                  value={orderQuantity}
                  onChange={(e) => onOrderQuantityChange(Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Phí giao hàng:">
              <CustomSelect
                value={orderShipping}
                onChange={(val) => onOrderShippingChange(Number(val))}
                options={[
                  { value: 25000, label: "Giao hàng tiêu chuẩn (25.000đ)" },
                  { value: 0, label: "Miễn phí vận chuyển (0đ)" },
                  { value: 35000, label: "Giao hàng hỏa tốc (35.000đ)" },
                ]}
              />
            </Field>

            {/* Bảng tính tiền */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-1 type-body">
              <div className="flex justify-between text-slate-600">
                <span>Tiền hàng:</span>
                <span>{subtotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí giao hàng:</span>
                <span>{orderShipping.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 type-heading text-slate-900">
                <span>Tổng cộng:</span>
                <span className="text-blue-700">{total.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            <Button
              variant="success"
              size="md"
              block
              onClick={onConfirmOrder}
            >
              Tạo đơn hàng
            </Button>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: HẸN GIỜ NHẮC VIỆC ===================== */}
      {utilityTab === "snooze" && (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3.5 type-body">
          <div>
            <h4 className="type-heading text-slate-900">Hẹn giờ nhắc việc</h4>
            <p className="mt-0.5 type-caption text-slate-500">
              Tạm gác hội thoại khi cần kiểm tra kho. Hệ thống sẽ tự động nhắc lại khi đến hạn.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <span className="type-caption text-slate-500 block mb-1.5">Thời gian hẹn giờ:</span>
              <div className="grid grid-cols-2 gap-2">
                {["3 phút", "5 phút", "10 phút", "15 phút"].map((m) => (
                  <Chip
                    key={m}
                    active={snoozeDelay === m}
                    onClick={() => onSnoozeDelayChange(m)}
                  >
                    {m}
                  </Chip>
                ))}
              </div>
            </div>

            <Field label="Ghi chú nhắc việc:">
              <input
                value={snoozeNote}
                onChange={(e) => onSnoozeNoteChange(e.target.value)}
                placeholder="Ghi chú nhắc việc..."
                className={inputClass}
              />
            </Field>

            <Button
              variant="warning"
              size="md"
              block
              onClick={onConfirmSnooze}
            >
              Bắt đầu hẹn ({snoozeDelay})
            </Button>

            <div className="border-t border-slate-200 pt-3">
              <span className="type-caption text-slate-400 block mb-1.5">
                Kiểm thử nhanh:
              </span>
              <Button
                variant="secondary"
                size="sm"
                block
                onClick={onTriggerExpireSnooze}
              >
                Giả lập: Hết hạn hẹn giờ ngay
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
