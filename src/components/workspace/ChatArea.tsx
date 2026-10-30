import React, { FormEvent, RefObject } from "react"
import { Chat, ChatTag, HistoryMessage, QuickReply } from "../../types/chat"

type ChatAreaProps = {
  customer?: Chat
  history: HistoryMessage[]
  message: string
  attachment?: { name: string; url: string }
  sendError: boolean
  tagDropdownOpen: boolean
  tags: ChatTag[]
  quickReplies: QuickReply[]
  remainingTimeText: string
  historyEndRef: RefObject<HTMLDivElement | null>
  onMessageChange: (val: string) => void
  onSendMessage: (e?: FormEvent) => void
  onOpenSnooze: () => void
  onToggleTagDropdown: () => void
  onToggleTag: (tagId: string) => void
  onDismissReturnedNote: () => void
  onInsertQuickReply: (qr: QuickReply) => void
  onAutoFillPOS: () => void
  onAttachFile: (file: File) => void
  onRemoveAttachment: () => void
  onRetrySend: () => void
  onTriggerCustomerReply: () => void
  onTriggerExpireSnooze: () => void
  simulateOffline: boolean
  onToggleSimulateOffline: () => void
}

export default function ChatArea({
  customer,
  history,
  message,
  attachment,
  sendError,
  tagDropdownOpen,
  tags,
  quickReplies,
  remainingTimeText,
  historyEndRef,
  onMessageChange,
  onSendMessage,
  onOpenSnooze,
  onToggleTagDropdown,
  onToggleTag,
  onDismissReturnedNote,
  onInsertQuickReply,
  onAutoFillPOS,
  onAttachFile,
  onRemoveAttachment,
  onRetrySend,
  onTriggerCustomerReply,
  onTriggerExpireSnooze,
  simulateOffline,
  onToggleSimulateOffline,
}: ChatAreaProps) {
  const [moreOpen, setMoreOpen] = React.useState(false)

  return (
    <main className="flex min-h-0 flex-col bg-slate-50/40">
      {/* Header cuộc trò chuyện */}
      <header className="flex h-13 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-5 select-none">
        <div className="flex items-center gap-3">
          <img
            src={customer?.avatar}
            alt={customer?.name}
            className="size-9 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-slate-900 text-sm">{customer?.name}</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Đang hoạt động
              </span>
            </div>
            <p className="text-xs text-slate-400 font-body">
              Facebook Messenger {customer?.customerHeightWeight ? `· Số đo: ${customer.customerHeightWeight}` : ""}
            </p>
          </div>
        </div>

        {/* Các nút thao tác trên header */}
        <div className="flex items-center gap-2">
          {/* Nút Gán nhãn */}
          <div className="relative">
            <button
              type="button"
              onClick={onToggleTagDropdown}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-body"
            >
              <svg className="size-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z" />
              </svg>
              <span>Gán nhãn</span>
            </button>
            {tagDropdownOpen && (
              <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg text-xs font-body">
                <div className="px-2.5 py-1 font-semibold text-slate-400 text-[11px] uppercase">Thẻ nghiệp vụ</div>
                {tags.filter((t) => t.id !== "all").map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onToggleTag(tag.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left font-medium hover:bg-slate-50 ${
                      customer?.tags?.includes(tag.id) ? "font-bold text-blue-600 bg-blue-50/50" : "text-slate-700"
                    }`}
                  >
                    <span>{tag.label}</span>
                    {customer?.tags?.includes(tag.id) && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nút Tạm hoãn */}
          <button
            type="button"
            onClick={onOpenSnooze}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all font-body ${
              customer?.status === "snoozed"
                ? "bg-amber-500 text-white hover:bg-amber-600 shadow-2xs font-semibold"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>
              {customer?.status === "snoozed" ? `Đang hoãn (${remainingTimeText})` : "Tạm hoãn"}
            </span>
          </button>

          {/* Menu thao tác nhanh giả lập */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              title="Thêm tùy chọn"
            >
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg text-xs font-body">
                <button
                  type="button"
                  onClick={() => {
                    onTriggerCustomerReply()
                    setMoreOpen(false)
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left font-medium text-blue-700 hover:bg-blue-50"
                >
                  Giả lập: Khách nhắn thêm
                </button>
                {customer?.status === "snoozed" && (
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerExpireSnooze()
                      setMoreOpen(false)
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left font-medium text-amber-700 hover:bg-amber-50"
                  >
                    Giả lập: Hết giờ ngay
                  </button>
                )}
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => {
                    onToggleSimulateOffline()
                    setMoreOpen(false)
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                >
                  <span>Mất kết nối mạng</span>
                  <span className={`size-2 rounded-full ${simulateOffline ? "bg-amber-500" : "bg-slate-300"}`} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Lịch sử tin nhắn */}
      <div aria-label="Nội dung trao đổi" className="min-h-0 flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
        {/* Banner Nhắc việc khi đến hạn */}
        {customer?.returnedNote && (
          <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/95 p-3 shadow-xs backdrop-blur-xs font-body">
            <div className="flex items-center gap-2.5 text-xs text-amber-900">
              <span className="text-base leading-none">⏰</span>
              <div>
                <span className="font-semibold text-amber-950 font-heading">Đến hạn nhắc việc quay lại:</span>{" "}
                <span>"{customer.returnedNote}"</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onDismissReturnedNote}
              className="rounded-lg bg-amber-200/60 px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-200 transition-all"
            >
              Đã rõ
            </button>
          </div>
        )}

        {/* Ghi chú nội bộ (Internal Note) */}
        {customer?.internalNote && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs text-amber-900 font-body">
            <span className="font-semibold text-amber-800 font-heading">Ghi chú ca trực:</span>
            <span className="flex-1 text-slate-700">{customer.internalNote}</span>
          </div>
        )}

        {/* Dòng phân cách ngày */}
        <div className="flex items-center gap-3 my-2 select-none">
          <div className="h-px flex-1 bg-slate-200/70" />
          <span className="text-[12px] font-medium text-slate-400 font-body">Hôm nay</span>
          <div className="h-px flex-1 bg-slate-200/70" />
        </div>

        {/* Danh sách bong bóng tin nhắn */}
        {history.map((entry, index) => {
          const isShop = entry.from === "shop"

          // Thẻ Đơn hàng POS
          if (entry.isOrderCard && entry.orderInfo) {
            return (
              <div key={index} className="flex justify-end mb-2">
                <div className="w-full max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-2xs text-xs font-body">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2 mb-2.5">
                    <span className="font-heading font-bold text-emerald-950 text-xs tracking-tight">
                      ĐƠN HÀNG #{entry.orderInfo.orderId}
                    </span>
                    <span className="rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
                      Đã xác nhận
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sản phẩm:</span>
                      <span className="font-medium text-slate-900">{entry.orderInfo.productName} ({entry.orderInfo.variant})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tiền hàng:</span>
                      <span className="font-medium text-slate-900">{entry.orderInfo.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phí giao hàng:</span>
                      <span className="font-medium text-slate-900">{entry.orderInfo.shipping}</span>
                    </div>
                    <div className="flex justify-between border-t border-emerald-200/80 pt-1.5 font-heading font-bold text-sm text-emerald-950">
                      <span>Tổng thanh toán:</span>
                      <span className="text-blue-700">{entry.orderInfo.total}</span>
                    </div>
                    <div className="pt-1 text-[11px] text-slate-500">
                      Giao đến: {entry.orderInfo.phone} · {entry.orderInfo.address}
                    </div>
                  </div>
                  <div className="mt-2 text-right text-[11px] text-emerald-700">
                    {entry.time} · Đã gửi biên lai
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div
              key={index}
              className={`flex max-w-[80%] items-end gap-2.5 ${isShop ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {!isShop && (
                <img
                  src={customer?.avatar}
                  alt={customer?.name}
                  className="size-7 rounded-full object-cover ring-1 ring-slate-200 mb-1"
                />
              )}
              <div className="min-w-0">
                <div
                  className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed font-body shadow-2xs ${
                    isShop
                      ? "rounded-br-xs bg-blue-600 text-white"
                      : "rounded-bl-xs border border-slate-200/80 bg-white text-slate-900"
                  }`}
                >
                  {entry.image && (
                    <img
                      src={entry.image}
                      alt="Ảnh sản phẩm"
                      className="mb-2 max-h-56 rounded-xl object-cover"
                    />
                  )}
                  <p>{entry.text}</p>
                </div>
                <div className={`mt-1 text-[11px] text-slate-400 font-body ${isShop ? "text-right" : ""}`}>
                  {entry.time} · {isShop ? "Đã gửi" : customer?.name}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={historyEndRef} />
      </div>

      {/* Footer ô soạn thảo & Tin mẫu */}
      <footer className="shrink-0 border-t border-slate-200/80 bg-white px-5 py-3 space-y-2.5">
        {/* Thanh Tin mẫu dạng Button Pills tinh tế */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs font-body">
          <span className="shrink-0 font-medium text-slate-400 text-xs mr-0.5 select-none">
            Mẫu nhanh:
          </span>
          {quickReplies.map((qr) => (
            <button
              key={qr.id}
              type="button"
              onClick={() => onInsertQuickReply(qr)}
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700 transition-all font-medium"
              title={qr.content}
            >
              {qr.title}
            </button>
          ))}

          {customer?.customerPhone && (
            <button
              type="button"
              onClick={onAutoFillPOS}
              className="shrink-0 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-emerald-800 font-medium hover:bg-emerald-100 transition-all"
            >
              Điền SĐT vào đơn POS
            </button>
          )}
        </div>

        {/* Ảnh đính kèm nếu có */}
        {attachment && (
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-body">
            <img src={attachment.url} alt="Ảnh đính kèm" className="size-10 rounded-lg object-cover" />
            <span className="font-medium text-slate-700">{attachment.name}</span>
            <button
              type="button"
              className="text-slate-400 hover:text-rose-600 underline text-xs ml-auto"
              onClick={onRemoveAttachment}
            >
              Xóa ảnh
            </button>
          </div>
        )}

        {/* Cảnh báo lỗi mạng */}
        {sendError && (
          <div className="flex items-center justify-between rounded-lg bg-rose-50 px-3.5 py-2 text-xs text-rose-700 border border-rose-200 font-body">
            <span>Không có kết nối mạng. Tin nhắn đã soạn được giữ nguyên.</span>
            <button type="button" className="font-bold underline hover:text-rose-900" onClick={onRetrySend}>
              Thử lại
            </button>
          </div>
        )}

        {/* Khung Soạn thảo */}
        <form onSubmit={onSendMessage} className="flex w-full items-end gap-2.5">
          <div className="flex-1 rounded-xl border border-slate-300 bg-white p-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Nhập tin nhắn tư vấn (nhấn Enter để gửi)..."
              rows={2}
              className="block w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 leading-relaxed font-body"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  onSendMessage()
                }
              }}
            />
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5">
              <label className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors font-body">
                <svg className="size-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="m9 12 5.5-5.5a3 3 0 0 1 4.25 4.25l-7.5 7.5a5 5 0 0 1-7.07-7.07l7-7" />
                </svg>
                <span>Ảnh đính kèm</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      onAttachFile(file)
                      e.target.value = ""
                    }
                  }}
                />
              </label>
              <span className="text-[11px] text-slate-400 font-body select-none">
                Enter để gửi · Shift+Enter xuống dòng
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!message.trim() && !attachment}
            className="flex h-11 items-center gap-1.5 rounded-xl bg-blue-600 px-5 text-sm font-heading font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
          >
            <span>Gửi</span>
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="m4 4 17 8-17 8 3-8z" />
              <path d="M7 12h14" />
            </svg>
          </button>
        </form>
      </footer>
    </main>
  )
}
