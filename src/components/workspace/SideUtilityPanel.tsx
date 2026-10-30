import React from "react"
import { ProductItem } from "../../types/chat"
import { ClockIcon, ReceiptIcon } from "./icons"
import { Button, Chip, Field, inputClass, Tabs, Tag } from "./ui"

type SideUtilityPanelProps = {
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
    <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-white select-none">
      {/* 3 Tab Tiện ích */}
      <Tabs
        items={tabs}
        value={utilityTab}
        onChange={onSelectTab}
      />

      {/* ===================== TAB 1: TỒN KHO & BẢNG SIZE ===================== */}
      {utilityTab === "inventory" && (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Ô tìm kiếm mã sản phẩm */}
          <Field label="Tra cứu mã sản phẩm:">
            <input
              value={productSearch}
              onChange={(e) => onProductSearchChange(e.target.value)}
              placeholder="VD01, SM03, QJ02..."
              className={inputClass}
            />
          </Field>

          {/* Gợi ý mã SP */}
          <div className="flex flex-wrap gap-1.5">
            {products.map((p) => (
              <Chip
                key={p.code}
                active={selectedProduct.code === p.code}
                onClick={() => onSelectProduct(p)}
              >
                {p.code}
              </Chip>
            ))}
          </div>

          {/* Chi tiết sản phẩm */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
            <div className="flex gap-2.5">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="size-14 rounded-lg object-cover border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <span className="type-caption font-semibold text-blue-700">[{selectedProduct.code}]</span>
                <h4 className="type-heading text-slate-900 leading-snug line-clamp-2">
                  {selectedProduct.name}
                </h4>
                <p className="mt-0.5 type-heading text-slate-900">{selectedProduct.priceFormatted}</p>
              </div>
            </div>

            {/* Bảng tồn kho */}
            <div>
              <div className="flex items-center justify-between type-caption text-slate-400 uppercase font-semibold mb-1 px-1">
                <span>Phân loại</span>
                <span>Tồn kho</span>
              </div>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white overflow-hidden type-body">
                {selectedProduct.variants.map((v, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5">
                    <span className="text-slate-800">
                      {v.color} · Size {v.size}
                    </span>
                    <div className="flex items-center gap-2">
                      <Tag tone={v.stock > 5 ? "emerald" : v.stock > 0 ? "amber" : "rose"}>
                        {v.stock > 0 ? `Còn ${v.stock}` : "Hết hàng"}
                      </Tag>
                      <button
                        type="button"
                        onClick={() => onInsertInventoryInfo(selectedProduct, `${v.color} - Size ${v.size}`, v.stock)}
                        className="type-caption font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Chèn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
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
            <span className="type-heading text-slate-900">Thông tin đơn hàng</span>
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
                placeholder="Nguyễn Thị Minh Trang"
                className={inputClass}
              />
            </Field>

            <Field label="Số điện thoại:">
              <input
                value={orderPhone}
                onChange={(e) => onOrderPhoneChange(e.target.value)}
                placeholder="0912345678"
                className={inputClass}
              />
            </Field>

            <Field label="Địa chỉ nhận hàng:">
              <input
                value={orderAddress}
                onChange={(e) => onOrderAddressChange(e.target.value)}
                placeholder="Số 123 Cầu Giấy, Hà Nội"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Sản phẩm:">
                <select
                  value={orderSelectedProduct}
                  onChange={(e) => onOrderProductChange(e.target.value)}
                  className={inputClass}
                >
                  {products.map((p) => (
                    <option key={p.code} value={p.code}>{p.code} - {p.name.slice(0, 14)}...</option>
                  ))}
                </select>
              </Field>
              <Field label="Phân loại:">
                <select
                  value={orderSelectedVariant}
                  onChange={(e) => onOrderVariantChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="Trắng · S">Trắng · S</option>
                  <option value="Trắng · M">Trắng · M</option>
                  <option value="Trắng · L">Trắng · L</option>
                  <option value="Đen · M">Đen · M</option>
                  <option value="Be hoa nhí · M">Be hoa nhí · M</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Số lượng:">
                <input
                  type="number"
                  min={1}
                  value={orderQuantity}
                  onChange={(e) => onOrderQuantityChange(Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
              <Field label="Phí giao hàng:">
                <select
                  value={orderShipping}
                  onChange={(e) => onOrderShippingChange(Number(e.target.value))}
                  className={inputClass}
                >
                  <option value={25000}>Tiêu chuẩn: 25.000đ</option>
                  <option value={0}>Miễn phí ship (0đ)</option>
                  <option value={35000}>Hỏa tốc: 35.000đ</option>
                </select>
              </Field>
            </div>

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
              icon={<ReceiptIcon className="size-4" />}
              onClick={onConfirmOrder}
            >
              Tạo đơn & Gửi biên lai
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

            <Field label="Ghi chú ngữ cảnh:">
              <input
                value={snoozeNote}
                onChange={(e) => onSnoozeNoteChange(e.target.value)}
                placeholder="VD: Kiểm tra kho mẫu AT02 đen..."
                className={inputClass}
              />
            </Field>

            <Button
              variant="warning"
              size="md"
              block
              icon={<ClockIcon className="size-4" />}
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
