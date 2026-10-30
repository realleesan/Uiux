import React, { FormEvent, RefObject, useEffect, useRef, useState } from "react"
import { Chat, ChatTag, HistoryMessage, QuickReply } from "../../types/chat"
import { PaperclipIcon, UserIcon, ZapIcon, MoreVerticalIcon } from "./icons"
import { Avatar, Button, IconButton, Tag } from "./ui"

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
  onDeleteMessage?: (index: number) => void
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
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Tự động giãn chiều cao ô soạn thảo khi tin nhắn dài
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      const scrollH = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(Math.max(scrollH, 36), 160)}px`
    }
  }, [message])

  // Vị trí tin nhắn shop cuối cùng để hiển thị avatar "Đã xem"
  const lastShopIndex = history.map((e) => e.from).lastIndexOf("shop")

  // Lọc tin mẫu khi gõ /
  const slashQuery = message.startsWith("/") ? message.slice(1).trim().toLowerCase() : ""
  const filteredQuickReplies = slashQuery
    ? quickReplies.filter(
        (qr) =>
          qr.shortcut.toLowerCase().includes(slashQuery) ||
          qr.title.toLowerCase().includes(slashQuery) ||
          qr.content.toLowerCase().includes(slashQuery),
      )
    : quickReplies

  return (
    <main className="flex min-h-0 flex-col bg-slate-50/50">
      {/* Header cuộc trò chuyện: Tên khách + Trạng thái + Icon tư vấn viên tinh gọn */}
      <header className="flex h-13 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 select-none">
        <div className="flex items-center gap-3">
          <Avatar src={customer?.avatar} name={customer?.name} size="md" channel />
          <div>
            <h2 className="type-title text-slate-900 leading-tight">{customer?.name}</h2>
            <p className="type-caption text-slate-500 font-normal">Đang hoạt động</p>
          </div>

          {/* Phân công tư vấn viên: Tư vấn bởi: [Avatar của nhân viên] */}
          <div className="ml-3 flex items-center gap-1.5 border-l border-slate-200 pl-3 type-caption text-slate-500">
            <span>Tư vấn bởi:</span>
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              alt="Nguyễn Vy"
              title="Nguyễn Vy (Tư vấn viên)"
              className="size-5.5 rounded-full object-cover ring-1 ring-slate-200"
            />
          </div>
        </div>

        {/* Thao tác Header: Bỏ icon rác */}
        <div className="flex items-center gap-2">
          {/* Nút Gán nhãn */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
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
                <button
                  type="button"
                  onClick={() => {
                    onToggleSimulateOffline()
                    setMoreOpen(false)
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left type-label text-slate-700 hover:bg-slate-50"
                >
                  Giả lập mạng: {simulateOffline ? "Bật lại Online" : "Ngắt kết nối (Offline)"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Vùng Tin nhắn Cuộn: KHÁCH BÊN TRÁI, SHOP BÊN PHẢI CHUẨN MESSENGER */}
      <div aria-label="Nội dung trao đổi" className="min-h-0 flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {/* Banner Nhắc việc khi đến hạn: Nhẹ nhàng, thanh thoát */}
        {customer?.returnedNote && (
          <div className="sticky top-2 z-10 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/95 px-3 py-1.5 shadow-xs backdrop-blur-xs">
            <div className="flex items-center gap-2 type-caption text-amber-900 truncate">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span className="font-semibold shrink-0">Đến hạn nhắc lại:</span>
              <span className="truncate">"{customer.returnedNote}"</span>
            </div>
            <button
              type="button"
              onClick={onDismissReturnedNote}
              className="ml-2 shrink-0 rounded px-1.5 py-0.5 type-caption font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
            >
              Đã rõ
            </button>
          </div>
        )}

        {/* Danh sách tin nhắn: Khách bên trái, Shop bên phải */}
        {history.map((entry, index) => {
          const isShop = entry.from === "shop"
          const isLastShop = index === lastShopIndex

          // Thẻ Đơn hàng (Shop tạo đơn, căn phải)
          if (entry.isOrderCard && entry.orderInfo) {
            const info = entry.orderInfo
            return (
              <div key={index} className="flex max-w-[75%] flex-col ml-auto items-end">
                <div className="relative rounded-2xl border border-emerald-300 bg-gradient-to-b from-emerald-50/80 to-white p-4 shadow-xs text-left w-full">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs">
                        ✓
                      </span>
                      <div>
                        <span className="type-heading text-emerald-900 block leading-tight">
                          ĐÃ TẠO ĐƠN HÀNG THÀNH CÔNG
                        </span>
                        <span className="type-caption text-emerald-700 font-mono text-[11px]">
                          Mã đơn: #{info.orderId}
                        </span>
                      </div>
                    </div>
                    <Tag tone="emerald">Đã đồng bộ POS</Tag>
                  </div>

                  <div className="mt-3 space-y-1.5 type-body text-[13px] text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sản phẩm:</span>
                      <span className="font-medium text-slate-900">
                        {info.productName} ({info.variant})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Người nhận:</span>
                      <span className="font-medium text-slate-900">
                        {info.phone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Địa chỉ:</span>
                      <span className="font-medium text-slate-900 truncate max-w-[200px]">
                        {info.address}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2 type-heading text-slate-900">
                      <span>Tổng thu (COD):</span>
                      <span className="text-emerald-700 text-sm font-bold">{info.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div
              key={index}
              className={`flex max-w-[68%] flex-col ${isShop ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              <div className={`flex items-end gap-2 ${isShop ? "flex-row-reverse" : ""}`}>
                {/* Chỉ hiển thị avatar khách hàng ở tin nhắn của khách */}
                {!isShop && (
                  <Avatar src={customer?.avatar} name={customer?.name} size="sm" />
                )}

                {/* Bong bóng tin nhắn bo 4 góc đều đặn, giờ gửi nằm gọn bên trong */}
                <div
                  className={`relative whitespace-pre-wrap break-words rounded-2xl px-3.5 pt-2 pb-1.5 type-body leading-relaxed shadow-2xs ${
                    isShop
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200/80 bg-white text-slate-900"
                  }`}
                >
                  {entry.image && (
                    <img
                      src={entry.image}
                      alt="Ảnh đính kèm"
                      className="mb-2 max-h-56 rounded-xl object-cover"
                    />
                  )}
                  <p className="pr-1">{entry.text}</p>

                  {/* Giờ gửi nằm gọn ở góc dưới bên trong bong bóng */}
                  <div
                    className={`mt-0.5 flex items-center justify-end text-[10.5px] select-none ${
                      isShop ? "text-blue-100/80" : "text-slate-400"
                    }`}
                  >
                    <span>{entry.time}</span>
                  </div>
                </div>
              </div>

              {/* Cơ chế ĐÃ XEM chuẩn Messenger ở tin nhắn cuối cùng của shop */}
              {isLastShop && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 select-none pr-1">
                  <span>Đã xem</span>
                  {customer?.avatar ? (
                    <img
                      src={customer.avatar}
                      alt={customer.name}
                      title={`${customer.name} đã xem`}
                      className="size-3.5 rounded-full object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <span className="grid size-3.5 place-items-center rounded-full bg-slate-300 text-[8px] font-bold text-slate-700">
                      {customer?.initials || "K"}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
        <div ref={historyEndRef} />
      </div>

      {/* Footer Soạn thảo Tinh gọn: KHÔNG BỊ CỘM, DÙNG TIA SÉT THAY CHO / */}
      <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-2.5 relative">
        {/* Menu gợi ý Slash Command / hoặc bấm nút tia sét (RỘNG BẰNG KHUNG CHAT) */}
        {(showSlashMenu || message.startsWith("/")) && (
          <div className="absolute bottom-full left-4 right-4 z-40 mb-2 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              <span>Tin nhắn mẫu nhanh (phím /)</span>
              <button
                type="button"
                onClick={() => setShowSlashMenu(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer"
              >
                ✕ Đóng
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1 p-1">
              {filteredQuickReplies.length === 0 ? (
                <div className="p-4 text-center type-caption text-slate-400">Không tìm thấy mẫu phù hợp</div>
              ) : (
                filteredQuickReplies.map((qr) => (
                  <button
                    key={qr.id}
                    type="button"
                    onClick={() => {
                      onMessageChange(qr.content)
                      setShowSlashMenu(false)
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded shrink-0">
                      {qr.shortcut}
                    </span>
                    <span className="type-label text-slate-900 font-semibold text-xs shrink-0 w-36 truncate">
                      {qr.title}
                    </span>
                    <span className="type-caption text-slate-500 text-[12px] truncate flex-1">
                      {qr.content}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Xem trước ảnh đính kèm */}
        {attachment && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <img src={attachment.url} alt="Đính kèm" className="size-12 rounded object-cover" />
            <div className="min-w-0 flex-1">
              <span className="block truncate type-label text-slate-800">{attachment.name}</span>
              <span className="type-caption text-slate-400">Sẵn sàng gửi kèm (nhấn Enter để gửi)</span>
            </div>
            <button
              type="button"
              onClick={onRemoveAttachment}
              className="rounded p-1 type-caption font-semibold text-rose-600 hover:bg-rose-50"
            >
              Xóa ảnh
            </button>
          </div>
        )}

        {/* Báo lỗi mạng */}
        {sendError && (
          <div className="mb-2 flex items-center justify-between rounded-lg bg-rose-50 px-3 py-1.5 type-caption text-rose-700 border border-rose-200">
            <span>Không có kết nối mạng. Tin nhắn đã soạn được giữ nguyên.</span>
            <button type="button" className="font-semibold underline hover:text-rose-900" onClick={onRetrySend}>
              Thử lại
            </button>
          </div>
        )}

        {/* Ô nhập tin nhắn: Căn giữa hoàn hảo, không lệch placeholder, Enter để gửi */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (message.trim() || attachment) {
              onSendMessage()
              if (textareaRef.current) textareaRef.current.style.height = "auto"
            }
          }}
          className="flex w-full items-center rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all"
        >
          {/* Nút đính kèm ảnh */}
          <label
            className="flex cursor-pointer items-center justify-center size-8 rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors shrink-0"
            title="Đính kèm ảnh"
          >
            <PaperclipIcon className="size-4" />
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

          {/* Nút mở nhanh tin mẫu bằng icon TIA SÉT ⚡ */}
          <button
            type="button"
            onClick={() => setShowSlashMenu((v) => !v)}
            title="Mẫu câu nhanh"
            className={`flex items-center justify-center size-8 rounded-lg transition-colors shrink-0 ml-0.5 ${
              showSlashMenu ? "bg-amber-100 text-amber-600" : "text-slate-400 hover:bg-slate-200/60 hover:text-amber-500"
            }`}
          >
            <ZapIcon className="size-4" />
          </button>

          {/* Khung nhập văn bản: Căn giữa thẳng hàng với icon, tự co giãn khi gõ nhiều dòng */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              const val = e.target.value
              onMessageChange(val)
              if (val.startsWith("/")) {
                setShowSlashMenu(true)
              } else if (!val && showSlashMenu) {
                setShowSlashMenu(false)
              }
            }}
            placeholder="Nhập tin nhắn (Enter để gửi, Shift+Enter xuống dòng)..."
            rows={1}
            className="mx-2 block flex-1 resize-none bg-transparent type-body text-slate-900 outline-none placeholder:text-slate-400 leading-normal py-1.5 min-h-[36px] max-h-40 overflow-y-auto"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                if (message.trim() || attachment) {
                  onSendMessage()
                  if (textareaRef.current) textareaRef.current.style.height = "auto"
                }
              }
            }}
          />
        </form>
      </footer>
    </main>
  )
}
