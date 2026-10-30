import React, { FormEvent, RefObject, useState } from "react"
import { Chat, ChatTag, HistoryMessage, QuickReply } from "../../types/chat"
import { CheckCheckIcon, ClockIcon, MoreVerticalIcon, PaperclipIcon, SendIcon, TagIcon } from "./icons"
import { Avatar, Button, Chip, IconButton, Tag } from "./ui"

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
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <main className="flex min-h-0 flex-col bg-slate-50/50">
      {/* Header cuộc trò chuyện */}
      <header className="flex h-13 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 select-none">
        <div className="flex items-center gap-3">
          <Avatar src={customer?.avatar} name={customer?.name} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="type-title text-slate-900">{customer?.name}</h2>
              <span className="inline-flex items-center gap-1 type-caption text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Trực tuyến
              </span>
            </div>
            <p className="type-caption text-slate-500">
              Facebook Messenger · Phản hồi trong vài phút
            </p>
          </div>
        </div>

        {/* Thao tác Header */}
        <div className="flex items-center gap-2">
          {/* Nút Gán nhãn */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              icon={<TagIcon className="size-3.5" />}
              onClick={onToggleTagDropdown}
            >
              Gán nhãn
            </Button>
            {tagDropdownOpen && (
              <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg type-body">
                <div className="px-2.5 py-1 type-caption font-semibold text-slate-400 uppercase">Thẻ nghiệp vụ</div>
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onToggleTag(tag.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left type-label hover:bg-slate-50 ${
                      customer?.tags?.includes(tag.id) ? "font-semibold text-blue-600 bg-blue-50/50" : "text-slate-700"
                    }`}
                  >
                    <span>{tag.label}</span>
                    {customer?.tags?.includes(tag.id) && <span className="type-caption">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nút Tạm hoãn */}
          <Button
            variant={customer?.status === "snoozed" ? "warning" : "secondary"}
            size="sm"
            icon={<ClockIcon className="size-3.5" />}
            onClick={onOpenSnooze}
          >
            {customer?.status === "snoozed" ? `Đang hoãn (${remainingTimeText})` : "Tạm hoãn"}
          </Button>

          {/* Menu phụ giả lập */}
          <div className="relative">
            <IconButton label="Tùy chọn khác" onClick={() => setMoreOpen((v) => !v)}>
              <MoreVerticalIcon className="size-4" />
            </IconButton>
            {moreOpen && (
              <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg type-body">
                <button
                  type="button"
                  onClick={() => {
                    onTriggerCustomerReply()
                    setMoreOpen(false)
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left type-label text-blue-700 hover:bg-blue-50"
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
                    className="w-full rounded-lg px-3 py-2 text-left type-label text-amber-700 hover:bg-amber-50"
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
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left type-label text-slate-700 hover:bg-slate-50"
                >
                  <span>Mất kết nối mạng</span>
                  <span className={`size-2 rounded-full ${simulateOffline ? "bg-amber-500" : "bg-slate-300"}`} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Vùng Tin nhắn Cuộn */}
      <div aria-label="Nội dung trao đổi" className="min-h-0 flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
        {/* Banner Nhắc việc khi đến hạn */}
        {customer?.returnedNote && (
          <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/95 p-3 shadow-xs backdrop-blur-xs">
            <div className="flex items-center gap-2.5 type-body text-amber-900">
              <ClockIcon className="size-4 shrink-0 text-amber-600" />
              <div>
                <span className="type-heading text-amber-950">Đến hạn nhắc việc quay lại:</span>{" "}
                <span>"{customer.returnedNote}"</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onDismissReturnedNote}>
              Đã rõ
            </Button>
          </div>
        )}

        {/* Ghi chú nội bộ */}
        {customer?.internalNote && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 type-caption text-amber-900">
            <span className="font-semibold text-amber-800">Ghi chú ca trực:</span>
            <span className="flex-1 text-slate-700">{customer.internalNote}</span>
          </div>
        )}

        {/* Mốc thời gian */}
        <div className="flex items-center gap-3 my-2 select-none">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="type-caption text-slate-400">Hôm nay</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Danh sách tin nhắn */}
        {history.map((entry, index) => {
          const isShop = entry.from === "shop"

          // Thẻ Đơn hàng POS
          if (entry.isOrderCard && entry.orderInfo) {
            return (
              <div key={index} className="flex justify-end mb-2">
                <div className="w-full max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-2xs type-body">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2 mb-2.5">
                    <span className="type-heading text-emerald-950">
                      ĐƠN HÀNG #{entry.orderInfo.orderId}
                    </span>
                    <Tag tone="emerald">Đã xác nhận</Tag>
                  </div>
                  <div className="space-y-1 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sản phẩm:</span>
                      <span className="type-label text-slate-900">{entry.orderInfo.productName} ({entry.orderInfo.variant})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tiền hàng:</span>
                      <span className="text-slate-900">{entry.orderInfo.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phí giao hàng:</span>
                      <span className="text-slate-900">{entry.orderInfo.shipping}</span>
                    </div>
                    <div className="flex justify-between border-t border-emerald-200/80 pt-1.5 type-heading text-emerald-950">
                      <span>Tổng thanh toán:</span>
                      <span className="text-blue-700">{entry.orderInfo.total}</span>
                    </div>
                    <div className="pt-1 type-caption text-slate-500">
                      Giao đến: {entry.orderInfo.phone} · {entry.orderInfo.address}
                    </div>
                  </div>
                  <div className="mt-2 text-right type-caption text-emerald-700">
                    {entry.time} · Đã gửi biên lai
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div
              key={index}
              className={`flex max-w-[68%] items-end gap-2 ${isShop ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {!isShop && (
                <Avatar src={customer?.avatar} name={customer?.name} size="sm" />
              )}
              <div className="min-w-0">
                <div
                  className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 type-body leading-relaxed shadow-2xs ${
                    isShop
                      ? "rounded-br-xs bg-blue-600 text-white"
                      : "rounded-bl-xs border border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  {entry.image && (
                    <img
                      src={entry.image}
                      alt="Ảnh đính kèm"
                      className="mb-2 max-h-56 rounded-xl object-cover"
                    />
                  )}
                  <p>{entry.text}</p>
                </div>

                {/* Thời gian hiển thị tinh tế: không lặp text vô nghĩa */}
                {isShop ? (
                  <div className="mt-1 flex items-center justify-end gap-1 pr-1 type-caption text-slate-400 select-none">
                    <span>{entry.time}</span>
                    <CheckCheckIcon className="size-3 text-blue-500" />
                  </div>
                ) : (
                  <div className="mt-1 pl-1 type-caption text-slate-400 select-none">
                    <span>{entry.time}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={historyEndRef} />
      </div>

      {/* Footer Soạn thảo & Mẫu trả lời nhanh */}
      <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-2.5 space-y-2">
        {/* Thanh Mẫu trả lời nhanh: nhỏ gọn, tinh tế */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <span className="shrink-0 type-caption text-slate-400 mr-0.5 select-none font-medium">
            Mẫu nhanh:
          </span>
          {quickReplies.map((qr) => (
            <Chip
              key={qr.id}
              onClick={() => onInsertQuickReply(qr)}
            >
              {qr.title}
            </Chip>
          ))}
        </div>

        {/* Ảnh đính kèm nếu có */}
        {attachment && (
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-1.5 type-caption">
            <img src={attachment.url} alt="Ảnh đính kèm" className="size-8 rounded-md object-cover" />
            <span className="type-label text-slate-700 truncate max-w-xs">{attachment.name}</span>
            <button
              type="button"
              className="text-slate-400 hover:text-rose-600 underline ml-auto text-xs"
              onClick={onRemoveAttachment}
            >
              Xóa ảnh
            </button>
          </div>
        )}

        {/* Báo lỗi mạng */}
        {sendError && (
          <div className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-1.5 type-caption text-rose-700 border border-rose-200">
            <span>Không có kết nối mạng. Tin nhắn đã soạn được giữ nguyên.</span>
            <button type="button" className="font-semibold underline hover:text-rose-900" onClick={onRetrySend}>
              Thử lại
            </button>
          </div>
        )}

        {/* Khung Soạn thảo Tinh gọn */}
        <form onSubmit={onSendMessage} className="flex items-end gap-2">
          <div className="flex-1 rounded-xl border border-slate-300 bg-white p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-colors">
            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Nhập tin nhắn tư vấn (nhấn Enter để gửi)..."
              rows={1}
              className="block w-full resize-none bg-transparent type-body text-slate-900 outline-none placeholder:text-slate-400 leading-normal max-h-24"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  onSendMessage()
                }
              }}
            />
            <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-1">
              <label className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-0.5 type-caption text-slate-500 hover:bg-slate-100 transition-colors">
                <PaperclipIcon className="size-3.5 text-slate-500" />
                <span>Đính kèm ảnh</span>
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
              <span className="type-caption text-slate-400 select-none text-[11px]">
                Enter để gửi · Shift+Enter xuống dòng
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<SendIcon className="size-3.5" />}
            disabled={!message.trim() && !attachment}
            onClick={() => onSendMessage()}
          >
            Gửi
          </Button>
        </form>
      </footer>
    </main>
  )
}
