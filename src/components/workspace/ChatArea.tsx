import React, { FormEvent, RefObject, useEffect, useRef, useState } from "react"
import { Chat, ChatTag, HistoryMessage, QuickReply } from "../../types/chat"
import { CheckCheckIcon, MoreHorizontalIcon, MoreVerticalIcon, PaperclipIcon, TrashIcon } from "./icons"
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
  onDeleteMessage,
}: ChatAreaProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [hoveredMsgIndex, setHoveredMsgIndex] = useState<number | null>(null)
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

  const staffAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"

  return (
    <main className="flex min-h-0 flex-col bg-slate-50/50">
      {/* Header cuộc trò chuyện: Hiển thị Khách + Trạng thái hoạt động + Tư vấn bởi nhân viên nào */}
      <header className="flex h-13 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 select-none">
        <div className="flex items-center gap-3">
          <Avatar src={customer?.avatar} name={customer?.name} size="md" channel />
          <div>
            <h2 className="type-title text-slate-900 leading-tight">{customer?.name}</h2>
            <p className="type-caption text-slate-500 font-normal">Đang hoạt động</p>
          </div>

          {/* Phân công tư vấn viên phụ trách hội thoại */}
          <div className="ml-3 flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="type-caption text-slate-400">Tư vấn bởi:</span>
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-0.5 pl-1 pr-2.5">
              <img
                src={staffAvatar}
                alt="Nguyễn Vy"
                className="size-5 rounded-full object-cover shrink-0"
              />
              <span className="type-caption font-medium text-slate-700">Nguyễn Vy</span>
            </div>
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

      {/* Vùng Tin nhắn Cuộn: TẤT CẢ BONG BÓNG TIN NHẮN ĐỀU CĂN TRÁI THEO CHUẨN CRM */}
      <div aria-label="Nội dung trao đổi" className="min-h-0 flex-1 overflow-y-auto px-6 py-4 space-y-4">
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

        {/* Danh sách tin nhắn theo dòng thời gian căn toàn bộ bên trái */}
        {history.map((entry, index) => {
          const isShop = entry.from === "shop"
          const isLastShop = index === lastShopIndex

          // Thẻ Đơn hàng
          if (entry.isOrderCard && entry.orderInfo) {
            const info = entry.orderInfo
            return (
              <div
                key={index}
                className="group flex max-w-[78%] flex-col mr-auto items-start"
                onMouseEnter={() => setHoveredMsgIndex(index)}
                onMouseLeave={() => setHoveredMsgIndex(null)}
              >
                <div className="flex items-start gap-2.5 w-full">
                  <Avatar src={staffAvatar} name="Nguyễn Vy" size="sm" />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2 type-caption">
                      <span className="font-semibold text-blue-700">Nguyễn Vy</span>
                      <span className="text-[11px] text-slate-400">· Tư vấn viên</span>
                      <span className="text-[10.5px] text-slate-400">{entry.time}</span>
                    </div>

                    <div className="relative rounded-2xl border border-emerald-300 bg-gradient-to-b from-emerald-50/80 to-white p-4 shadow-xs">
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
                </div>
              </div>
            )
          }

          return (
            <div
              key={index}
              className="group flex max-w-[75%] flex-col mr-auto items-start"
              onMouseEnter={() => setHoveredMsgIndex(index)}
              onMouseLeave={() => setHoveredMsgIndex(null)}
            >
              <div className="flex items-start gap-2.5">
                {/* Avatar người gửi: Shop là Nguyễn Vy, Khách là customer */}
                {isShop ? (
                  <Avatar src={staffAvatar} name="Nguyễn Vy" size="sm" />
                ) : (
                  <Avatar src={customer?.avatar} name={customer?.name} size="sm" />
                )}

                <div className="flex-1 min-w-0">
                  {/* Nhãn người gửi & Thời gian gửi */}
                  <div className="mb-1 flex items-center gap-1.5 type-caption">
                    <span className={`font-semibold ${isShop ? "text-blue-700" : "text-slate-800"}`}>
                      {isShop ? "Nguyễn Vy" : customer?.name || "Khách hàng"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isShop ? "· Tư vấn viên" : "· Khách hàng"}
                    </span>
                    <span className="text-[10.5px] text-slate-400">· {entry.time}</span>
                  </div>

                  {/* Bong bóng tin nhắn căn trái, hình chữ nhật bo 4 góc đều đặn */}
                  <div className="relative inline-flex items-center gap-1.5">
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
                    </div>

                    {/* Nút thao tác nhanh trên tin nhắn khi hover */}
                    {hoveredMsgIndex === index && (
                      <div className="flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-0.5 shadow-xs">
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(entry.text || "")}
                          title="Sao chép tin nhắn"
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </button>
                        {onDeleteMessage && (
                          <button
                            type="button"
                            onClick={() => onDeleteMessage(index)}
                            title="Xóa tin nhắn này"
                            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <TrashIcon className="size-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cơ chế ĐÃ XEM chuẩn Messenger */}
              {isLastShop && (
                <div className="ml-10 mt-1 flex items-center gap-1 text-[11px] text-slate-400 select-none">
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

      {/* Footer Soạn thảo Tinh gọn: BỎ HẲN NÚT GỬI, ENTER ĐỂ GỬI, TỰ GIÃN CHIỀU CAO KHI DÀI */}
      <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-2 relative">
        {/* Menu gợi ý Slash Command / */}
        {(showSlashMenu || message.startsWith("/")) && (
          <div className="absolute bottom-full left-4 z-40 mb-2 w-80 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase">
              <span>Tin mẫu nhanh (phím /)</span>
              <button
                type="button"
                onClick={() => setShowSlashMenu(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕ Đóng
              </button>
            </div>
            <div className="max-h-52 overflow-y-auto space-y-0.5 p-0.5">
              {filteredQuickReplies.length === 0 ? (
                <div className="p-3 text-center type-caption text-slate-400">Không tìm thấy mẫu phù hợp</div>
              ) : (
                filteredQuickReplies.map((qr) => (
                  <button
                    key={qr.id}
                    type="button"
                    onClick={() => {
                      onMessageChange(qr.content)
                      setShowSlashMenu(false)
                    }}
                    className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {qr.shortcut}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="type-label text-slate-900 text-xs font-semibold">{qr.title}</div>
                      <div className="truncate type-caption text-slate-500 text-[11px]">{qr.content}</div>
                    </div>
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

        {/* Ô nhập tin nhắn tinh gọn: Không nút gửi, Enter để gửi, tự động giãn chiều cao */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (message.trim() || attachment) {
              onSendMessage()
              if (textareaRef.current) textareaRef.current.style.height = "auto"
            }
          }}
          className="flex w-full items-end rounded-xl border border-slate-300 bg-white px-2 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-colors"
        >
          {/* Nút đính kèm ảnh */}
          <label
            className="flex cursor-pointer items-center justify-center size-7 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0 mb-0.5"
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

          {/* Nút mở nhanh tin mẫu / */}
          <button
            type="button"
            onClick={() => setShowSlashMenu((v) => !v)}
            title="Mẫu câu nhanh (phím /)"
            className={`flex items-center justify-center size-7 rounded-lg font-mono text-xs font-bold transition-colors shrink-0 mb-0.5 ml-0.5 ${
              showSlashMenu ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            /
          </button>

          {/* Khung nhập văn bản: Tự động co giãn theo số dòng */}
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
            className="mx-2 block flex-1 resize-none bg-transparent type-body text-slate-900 outline-none placeholder:text-slate-400 leading-normal min-h-[24px] max-h-40 overflow-y-auto"
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
