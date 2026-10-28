import React, { FormEvent, useEffect, useRef, useState } from "react"
import { sampleChats, sampleHistories } from "../data/initialChats"
import { Chat, ChatStatus, HistoryMessage } from "../types/chat"

export default function PrototypeV2View() {
  const [chats, setChats] = useState<Chat[]>(sampleChats)
  const [histories, setHistories] = useState<HistoryMessage[][]>(sampleHistories)
  const [activeNav, setActiveNav] = useState("Cần trả lời")
  const [activeChat, setActiveChat] = useState(0)
  const [search, setSearch] = useState("")

  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const message = drafts[activeChat] ?? ""
  const setMessage = (val: string) =>
    setDrafts((prev: Record<number, string>) => ({ ...prev, [activeChat]: val }))

  const [attachments, setAttachments] = useState<
    Record<number, { name: string; url: string } | undefined>
  >({})
  const attachment = attachments[activeChat]

  const [snoozeOpen, setSnoozeOpen] = useState(false)
  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  // V2 (Cải tiến sau test): Mặc định sẵn 3 phút (Giải quyết Issue 2 trong Phần 6)
  const [snoozeDelay, setSnoozeDelay] = useState("3 phút")
  const [snoozeNote, setSnoozeNote] = useState("")
  const snoozeInputRef = useRef<HTMLInputElement>(null)

  const [now, setNow] = useState(Date.now())
  const [sendError, setSendError] = useState(false)
  const [simulateOffline, setSimulateOffline] = useState(false)

  const historyEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSendError(false)
    setMoreMenuOpen(false)
    setSnoozeMenuOpen(false)
  }, [activeChat])

  // V2: Tự động focus ô ghi chú
  useEffect(() => {
    if (snoozeOpen) {
      setTimeout(() => snoozeInputRef.current?.focus(), 50)
    }
  }, [snoozeOpen])

  // Timer đếm ngược 1s
  useEffect(() => {
    const timer = window.setInterval(() => {
      const time = Date.now()
      setNow(time)
      setChats((current: Chat[]) =>
        current.map((chat: Chat) =>
          chat.status === "snoozed" &&
          chat.snoozeUntil &&
          chat.snoozeUntil <= time
            ? {
                ...chat,
                status: "needsReply",
                snoozeUntil: undefined,
                snoozeDelay: undefined,
                returnedNote:
                  chat.snoozeNote || "Hết hạn tra cứu kho/size, tiếp tục tư vấn",
                updatedAt: time,
                unread: true,
              }
            : chat,
        ),
      )
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  function remaining(chat: Chat) {
    const seconds = Math.max(
      0,
      Math.ceil(((chat.snoozeUntil ?? now) - now) / 1000),
    )
    return (
      Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0")
    )
  }

  function confirmSnooze() {
    if (!snoozeDelay) return
    const delayMs = snoozeDelay === "3 phút" ? 180000 : 300000
    setChats((current: Chat[]) =>
      current.map((chat: Chat, index: number) =>
        index === activeChat
          ? {
              ...chat,
              status: "snoozed",
              snoozeDelay,
              snoozeUntil: Date.now() + delayMs,
              snoozeNote: snoozeNote.trim(),
              returnedNote: undefined,
              unread: false,
            }
          : chat,
      ),
    )
    setSnoozeOpen(false)
    setActiveNav("Cần trả lời")
    const next = visibleChats.find((chat: Chat) => chats.indexOf(chat) !== activeChat)
    if (next) setActiveChat(chats.indexOf(next))
  }

  function triggerExpireSnoozeImmediately() {
    setChats((current: Chat[]) =>
      current.map((chat: Chat, idx: number) =>
        idx === activeChat && chat.status === "snoozed"
          ? {
              ...chat,
              status: "needsReply",
              snoozeUntil: undefined,
              snoozeDelay: undefined,
              returnedNote: chat.snoozeNote || "Hết hạn tra kho (Đã kiểm tra còn size M)",
              updatedAt: Date.now(),
              unread: true,
            }
          : chat,
      ),
    )
    setActiveNav("Cần trả lời")
  }

  const activeStatus: ChatStatus =
    activeNav === "Cần trả lời"
      ? "needsReply"
      : activeNav === "Chờ khách"
        ? "waiting"
        : "snoozed"

  const conversationCounts = chats.reduce<Record<ChatStatus, number>>(
    (counts: Record<ChatStatus, number>, chat: Chat) => ({
      ...counts,
      [chat.status]: (counts[chat.status] || 0) + 1,
    }),
    { needsReply: 0, waiting: 0, snoozed: 0 },
  )

  const visibleChats = chats
    .filter(
      (chat: Chat) =>
        chat.status === activeStatus &&
        `${chat.name} ${chat.snippet} ${chat.productTag}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a: Chat, b: Chat) => {
      return (
        Number(Boolean(b.returnedNote)) - Number(Boolean(a.returnedNote)) ||
        Number(b.time === "Vừa xong") - Number(a.time === "Vừa xong") ||
        (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
      )
    })

  useEffect(() => {
    if (
      visibleChats.length &&
      !visibleChats.some((chat: Chat) => chats.indexOf(chat) === activeChat)
    ) {
      setActiveChat(chats.indexOf(visibleChats[0]))
    }
  }, [activeNav, search, chats, activeChat, visibleChats])

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [activeChat, histories])

  const customer = chats[activeChat]

  function handleSendMessage(e?: FormEvent) {
    if (e) e.preventDefault()
    if (!message.trim() && !attachment) return

    if (simulateOffline) {
      setSendError(true)
      return
    }

    setSendError(false)
    const textToSend = message.trim()
    const nowTime = "Vừa xong"

    setHistories((prev: HistoryMessage[][]) => {
      const next = [...prev]
      const currentList = next[activeChat] ? [...next[activeChat]] : []
      if (attachment) {
        currentList.push({
          from: "shop",
          text: "Shop đã gửi ảnh mẫu sản phẩm",
          image: attachment.url,
          time: nowTime,
        })
      }
      if (textToSend) {
        currentList.push({
          from: "shop",
          text: textToSend,
          time: nowTime,
        })
      }
      next[activeChat] = currentList
      return next
    })

    const wasNeedsReply = customer?.status === "needsReply"
    const nextChatInList = visibleChats.find(
      (chat: Chat) => chats.indexOf(chat) !== activeChat,
    )
    const nextNeedsReply = nextChatInList ? chats.indexOf(nextChatInList) : -1

    setChats((current: Chat[]) =>
      current.map((chat: Chat, index: number) =>
        index === activeChat
          ? {
              ...chat,
              snippet: textToSend || "Shop đã gửi ảnh mẫu",
              snoozeUntil: undefined,
              time: nowTime,
              updatedAt: Date.now(),
              status: "waiting",
              unread: false,
              snoozeDelay: undefined,
              snoozeNote: undefined,
              returnedNote: undefined,
            }
          : chat,
      ),
    )

    setAttachments((prev) => ({ ...prev, [activeChat]: undefined }))
    setMessage("")

    if (wasNeedsReply) {
      setActiveNav("Cần trả lời")
      if (nextNeedsReply >= 0) setActiveChat(nextNeedsReply)
    } else {
      setActiveNav("Chờ khách")
    }
  }

  function handleCustomerReply(index: number) {
    const replyText = "Dạ mình đã cân nhắc xong, shop tư vấn chốt đơn cho mình nhé!"
    setHistories((prev: HistoryMessage[][]) => {
      const next = [...prev]
      const currentList = next[index] ? [...next[index]] : []
      currentList.push({
        from: "customer",
        text: replyText,
        time: "Vừa xong",
      })
      next[index] = currentList
      return next
    })

    setChats((current: Chat[]) =>
      current.map((chat: Chat, chatIndex: number) =>
        chatIndex === index
          ? {
              ...chat,
              status: "needsReply",
              snoozeUntil: undefined,
              snoozeDelay: undefined,
              returnedNote: undefined,
              unread: true,
              snippet: replyText,
              lastCustomerMessage: replyText,
              time: "Vừa xong",
              updatedAt: Date.now(),
            }
          : chat,
      ),
    )
    setActiveNav("Cần trả lời")
    setActiveChat(index)
    setMoreMenuOpen(false)
  }

  return (
    <div className="h-full min-h-[600px] overflow-hidden bg-white text-slate-800">
      <section className="grid h-full w-full grid-cols-[350px_minmax(0,1fr)] overflow-hidden bg-white">
        {/* ===================== CỘT TRÁI: DANH SÁCH HỘI THOẠI (350px) ===================== */}
        <section className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
          {/* Header Ca trực */}
          <header className="border-b border-slate-200 px-5 py-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Shop Thời Trang · Facebook Messenger
            </div>
            <h1 className="mt-1 text-lg font-bold text-slate-900 leading-tight">
              Hội thoại bán hàng
            </h1>
            <p className="mt-0.5 text-xs text-emerald-700 font-semibold">
              Nguyễn Vy · Nhân viên trực ca (Bản Prototype v2 Cải tiến)
            </p>
          </header>

          {/* 3 Tab Nghiệp vụ: Cần trả lời, Chờ khách, Tạm hoãn */}
          <nav aria-label="Trạng thái hội thoại" className="flex border-b border-slate-200 px-2 pt-2 bg-white">
            {[
              { id: "Cần trả lời", label: "Cần trả lời", count: conversationCounts.needsReply },
              { id: "Chờ khách", label: "Chờ khách", count: conversationCounts.waiting },
              { id: "Tạm hoãn", label: "Tạm hoãn", count: conversationCounts.snoozed },
            ].map((item) => {
              const isActive = activeNav === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveNav(item.id)
                    setMoreMenuOpen(false)
                    setSnoozeMenuOpen(false)
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-blue-600 text-blue-600 font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span className="whitespace-nowrap">{item.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Ô Tìm kiếm */}
          <div className="border-b border-slate-200 p-3">
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="10.5" cy="10.5" r="6" />
                  <path d="m15 15 4 4" />
                </svg>
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm khách hàng..."
                className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50/70 pl-9 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Dòng định hướng nghiệp vụ IA */}
          <p className="px-4 pt-3 text-xs text-slate-500">
            {activeStatus === "waiting"
              ? "Khách cần phản hồi tiếp"
              : activeStatus === "snoozed"
                ? "Shop còn cam kết · Đang hẹn giờ tra cứu"
                : "Shop cần xử lý tiếp · Ca đến hạn được ưu tiên"}
          </p>
          <div className="flex items-center justify-between px-4 py-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {activeNav}
            </div>
            <div className="text-xs text-slate-400">
              {visibleChats.length} hội thoại
            </div>
          </div>

          {/* Danh sách thẻ hội thoại (V2: Có viền cam nổi bật & icon đồng hồ báo thức khi hết hạn) */}
          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1">
            {visibleChats.map((chat) => {
              const index = chats.indexOf(chat)
              const active = activeChat === index
              const isReturned = Boolean(chat.returnedNote)

              return (
                <button
                  type="button"
                  key={chat.name}
                  onClick={() => {
                    setActiveChat(index)
                    setChats((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, unread: false } : item,
                      ),
                    )
                  }}
                  className={`mb-1.5 w-full rounded-xl p-3 text-left transition-colors border ${
                    // V2 CẢI TIẾN: Viền cam đậm nổi bật + nền vàng/cam khi hết hạn tạm hoãn quay về
                    isReturned
                      ? "border-2 border-amber-500 bg-amber-50 shadow-sm ring-1 ring-amber-300"
                      : active
                        ? "border-blue-600 bg-blue-50/70 border-l-[3px] shadow-2xs"
                        : "border-transparent hover:bg-slate-50 border-l-[3px]"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className={`size-10 rounded-full object-cover ring-1 ${
                          isReturned ? "ring-2 ring-amber-500" : "ring-slate-200"
                        }`}
                      />
                      <span
                        className="absolute -bottom-0.5 -right-0.5 grid size-3.5 place-items-center rounded-full bg-[#0084FF] text-white"
                        title="Facebook Messenger"
                      >
                        <svg className="size-2 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.91 1.45 5.51 3.73 7.15V22l3.41-1.87c.92.25 1.89.39 2.86.39 5.52 0 10-4.14 10-9.25S17.52 2 12 2zm1.06 12.44l-2.61-2.79-5.1 2.79 5.61-5.96 2.67 2.79 5.04-2.79-5.61 5.96z" />
                        </svg>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          {/* V2: Icon đồng hồ báo thức ⏰ trên thẻ danh sách */}
                          {isReturned && (
                            <span
                              className="inline-flex size-4 items-center justify-center rounded-full bg-amber-500 text-white text-[10px]"
                              title="Hết hạn tạm hoãn"
                            >
                              ⏰
                            </span>
                          )}
                          <span
                            className={`truncate text-sm ${
                              isReturned
                                ? "font-bold text-amber-950"
                                : chat.unread
                                  ? "font-bold text-slate-900"
                                  : "font-semibold text-slate-800"
                            }`}
                          >
                            {chat.name}
                          </span>
                        </div>
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {chat.time}
                        </span>
                      </div>
                      <div
                        className={`mt-1 truncate text-xs ${
                          isReturned
                            ? "font-bold text-amber-800"
                            : chat.unread
                              ? "font-medium text-slate-900"
                              : "text-slate-500"
                        }`}
                      >
                        {isReturned ? `📌 ${chat.returnedNote}` : chat.snippet}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-1">
                        <span className="truncate rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                          {chat.productTag || "Áo/Váy nữ"}
                        </span>
                        {isReturned ? (
                          <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                            Ưu tiên số 1
                          </span>
                        ) : chat.unread ? (
                          <div className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                              Đang đợi {chat.wait}
                            </span>
                          </div>
                        ) : (
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {chat.status === "waiting"
                              ? "Đang chờ khách"
                              : chat.status === "snoozed"
                                ? `Còn ${remaining(chat)}`
                                : `Đang đợi ${chat.wait}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* ===================== CỘT PHẢI: KHUNG CHAT CHI TIẾT ===================== */}
        <section className="relative flex min-h-0 min-w-0 flex-col bg-white">
          {/* Header khung chat */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={customer?.avatar}
                  alt={customer?.name}
                  className="size-10 rounded-full object-cover ring-1 ring-slate-200"
                />
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-1.5 ring-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold text-slate-900">{customer?.name}</div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                    {customer?.status === "needsReply"
                      ? "Cần trả lời"
                      : customer?.status === "waiting"
                        ? "Chờ khách"
                        : "Đang tạm hoãn"}
                  </span>
                  {customer?.returnedNote && (
                    <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      ⏰ Hết hạn tra kho
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  Facebook Messenger · Khách quan tâm: <span className="font-semibold text-slate-700">{customer?.productTag}</span> ({customer?.orderPrice})
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (customer?.status === "snoozed") {
                      setSnoozeMenuOpen((open) => !open)
                      setMoreMenuOpen(false)
                    } else {
                      setSnoozeDelay("3 phút")
                      setSnoozeNote("")
                      setSnoozeOpen(true)
                    }
                  }}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    customer?.status === "snoozed"
                      ? "bg-amber-600 text-white hover:bg-amber-700"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M10 15V9M14 15V9" />
                  </svg>
                  <span>
                    {customer?.status === "snoozed"
                      ? `Đang hoãn · ${remaining(customer)}`
                      : "Tạm hoãn"}
                  </span>
                </button>
                {snoozeMenuOpen && customer?.status === "snoozed" && (
                  <div className="absolute right-0 top-full z-30 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setChats((current) =>
                          current.map((chat, index) =>
                            index === activeChat
                              ? {
                                  ...chat,
                                  status: "needsReply",
                                  snoozeDelay: undefined,
                                  snoozeUntil: undefined,
                                  returnedNote: undefined,
                                  updatedAt: Date.now(),
                                }
                              : chat,
                          ),
                        )
                        setActiveNav("Cần trả lời")
                        setSnoozeMenuOpen(false)
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      Mở lại trước hạn
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerExpireSnoozeImmediately()
                        setSnoozeMenuOpen(false)
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left font-semibold text-amber-700 hover:bg-amber-50"
                    >
                      ⚡ Hết giờ ngay
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setMoreMenuOpen((open) => !open)
                    setSnoozeMenuOpen(false)
                  }}
                  className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Thêm tùy chọn"
                >
                  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
                {moreMenuOpen && (
                  <div className="absolute right-0 top-full z-30 mt-1.5 w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-xl text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setChats((current) =>
                          current.map((chat, index) =>
                            index === activeChat ? { ...chat, unread: true } : chat,
                          ),
                        )
                        setMoreMenuOpen(false)
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Đánh dấu chưa đọc
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCustomerReply(activeChat)}
                      className="w-full rounded-lg px-3 py-2 text-left font-medium text-blue-700 hover:bg-blue-50"
                    >
                      💬 Giả lập: Khách nhắn thêm
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setSimulateOffline((v) => !v)
                        setMoreMenuOpen(false)
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-amber-700 hover:bg-amber-50"
                    >
                      <span>Lỗi mất mạng khi gửi</span>
                      <span
                        className={`size-2 rounded-full ${
                          simulateOffline ? "bg-amber-500" : "bg-slate-300"
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Vùng Tin nhắn cuộn */}
          <div aria-label="Lịch sử hội thoại" className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 px-6 py-4">
            <div className="flex min-h-full flex-col justify-end">
              {customer?.returnedNote && (
                <div className="sticky top-0 z-10 mb-4 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 shadow-sm">
                  <span className="font-bold">⏰ Hệ thống nhắc việc tự động:</span> Đã hết hạn tạm hoãn tra kho! Ghi chú của bạn:{" "}
                  <span className="font-bold underline decoration-amber-400 decoration-2">'{customer.returnedNote}'</span>
                </div>
              )}
              {customer?.status === "snoozed" && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-white p-3 text-xs text-slate-700 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700">
                      ⏸ Đang tạm hoãn · Còn {remaining(customer)}
                    </span>
                    <button
                      type="button"
                      onClick={triggerExpireSnoozeImmediately}
                      className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 hover:bg-amber-200"
                    >
                      ⚡ Hết giờ ngay
                    </button>
                  </div>
                  <p className="mt-1 text-slate-500">
                    {customer.snoozeNote || "Tiếp tục tư vấn khi đến hạn"}
                  </p>
                </div>
              )}

              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] text-slate-400">Hôm nay</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Tin nhắn lịch sử */}
              {histories[activeChat]?.map((entry: HistoryMessage, index: number) => {
                const isShop = entry.from === "shop"
                return (
                  <div
                    key={index}
                    className={`mb-3 flex max-w-[80%] items-end gap-2.5 ${
                      isShop ? "self-end" : "self-start"
                    }`}
                  >
                    {!isShop && (
                      <img
                        src={customer?.avatar}
                        alt={customer?.name}
                        className="size-7 rounded-full object-cover ring-1 ring-slate-200 mb-0.5"
                      />
                    )}
                    <div className="min-w-0">
                      <div
                        className={`max-w-[560px] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-2xs ${
                          isShop
                            ? "rounded-br-xs bg-[#0084FF] text-white"
                            : "rounded-bl-xs border border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        {entry.image && (
                          <img
                            src={entry.image}
                            alt="Ảnh đính kèm"
                            className="mb-2 max-h-56 rounded-lg object-cover"
                          />
                        )}
                        <p>{entry.text}</p>
                      </div>
                      <div
                        className={`mt-1 text-[11px] text-slate-400 ${
                          isShop ? "text-right" : ""
                        }`}
                      >
                        {entry.time} · {isShop ? "Đã gửi" : customer?.name}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={historyEndRef} />
            </div>
          </div>

          {/* Khung Nhập tin nhắn: 2 dòng textarea chuẩn Wireframe & CSKH */}
          <footer className="shrink-0 border-t border-slate-200 bg-white px-6 py-3.5">
            {attachment && (
              <div className="mb-2.5 flex items-center gap-3 text-xs">
                <img
                  src={attachment.url}
                  alt="Ảnh đính kèm"
                  className="size-10 rounded-lg border border-slate-200 object-cover"
                />
                <span className="font-medium text-slate-700">{attachment.name}</span>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-700 underline text-xs ml-2"
                  onClick={() =>
                    setAttachments((prev) => ({ ...prev, [activeChat]: undefined }))
                  }
                >
                  Xóa ảnh
                </button>
              </div>
            )}

            {sendError && (
              <div className="mb-2.5 flex items-center justify-between rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-700 border border-rose-200">
                <span>⚠️ Chưa gửi được do mất kết nối mạng. Nội dung được giữ lại.</span>
                <button
                  type="button"
                  className="font-bold underline text-rose-700 hover:text-rose-900"
                  onClick={() => {
                    setSimulateOffline(false)
                    setSendError(false)
                    handleSendMessage()
                  }}
                >
                  Thử lại
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex w-full items-end gap-3">
              <div className="flex-1 rounded-xl border border-slate-300 bg-white p-3 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Soạn nội dung tư vấn báo giá, size, màu sắc..."
                  rows={2}
                  className="block w-full resize-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <div className="mt-2 flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
                  <label className="flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                    <svg className="size-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="m9 12 5.5-5.5a3 3 0 0 1 4.25 4.25l-7.5 7.5a5 5 0 0 1-7.07-7.07l7-7" />
                    </svg>
                    <span>Gửi ảnh mẫu sản phẩm</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => {
                          setAttachments((prev) => ({
                            ...prev,
                            [activeChat]: {
                              name: file.name,
                              url: String(reader.result),
                            },
                          }))
                        }
                        reader.readAsDataURL(file)
                        e.target.value = ""
                      }}
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Nhấn Enter để gửi · Shift+Enter để xuống dòng
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!message.trim() && !attachment}
                className="flex h-11 items-center gap-2 rounded-xl bg-[#0084FF] px-6 text-sm font-bold text-white shadow-xs hover:bg-blue-600 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
              >
                <span>Gửi</span>
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="m4 4 17 8-17 8 3-8z" />
                  <path d="M7 12h14" />
                </svg>
              </button>
            </form>
          </footer>
        </section>
      </section>

      {/* ===================== MODAL TẠM HOÃN (V2: MẶC ĐỊNH 3P + AUTO FOCUS + ENTER) ===================== */}
      {snoozeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900">
                    Tạm hoãn tư vấn (Hẹn giờ)
                  </h3>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                    V2 Cải tiến
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Khách: <span className="font-semibold">{customer?.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSnoozeOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-3.5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Thời gian hẹn giờ (Đã chọn sẵn 3 phút):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["3 phút", "5 phút"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSnoozeDelay(option)}
                      className={`rounded-xl border py-2.5 font-bold transition-all ${
                        snoozeDelay === option
                          ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {option} {option === "3 phút" && "✓"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ghi chú việc cần làm khi quay lại:
                </label>
                <input
                  ref={snoozeInputRef}
                  value={snoozeNote}
                  onChange={(e) => setSnoozeNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      confirmSnooze()
                    }
                  }}
                  placeholder="VD: Kiểm tra váy VD01 màu trắng size M trong kho (Nhấn Enter để lưu)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <p className="mt-1 text-[10px] text-emerald-600 font-medium">
                  ⚡ Con trỏ đã tự động trỏ sẵn vào đây · Nhấn Enter để xác nhận ngay!
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSnoozeOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={!snoozeDelay}
                  onClick={confirmSnooze}
                  className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
                >
                  Xác nhận hoãn (Enter)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
