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

  // CẢI TIẾN 2: Mặc định chọn sẵn 3 phút
  const [snoozeDelay, setSnoozeDelay] = useState("3 phút")
  const [snoozeNote, setSnoozeNote] = useState("")

  const [now, setNow] = useState(Date.now())
  const [sendError, setSendError] = useState(false)
  const [simulateOffline, setSimulateOffline] = useState(false)

  const historyEndRef = useRef<HTMLDivElement>(null)
  const noteInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSendError(false)
    setMoreMenuOpen(false)
    setSnoozeMenuOpen(false)
  }, [activeChat])

  // CẢI TIẾN 2: Auto-focus ô ghi chú khi mở modal
  useEffect(() => {
    if (snoozeOpen) {
      setSnoozeDelay("3 phút")
      setTimeout(() => {
        noteInputRef.current?.focus()
      }, 50)
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
                  chat.snoozeNote || "Đã hết 3 phút kiểm tra kho, tiếp tục tư vấn gấp",
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
        `${chat.name} ${chat.snippet}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort(
      (a: Chat, b: Chat) =>
        Number(Boolean(b.returnedNote)) - Number(Boolean(a.returnedNote)) ||
        Number(b.time === "Vừa xong") - Number(a.time === "Vừa xong") ||
        (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
    )

  useEffect(() => {
    if (
      visibleChats.length &&
      !visibleChats.some((chat: Chat) => chats.indexOf(chat) === activeChat)
    ) {
      setActiveChat(chats.indexOf(visibleChats[0]))
    }
  }, [activeNav, search, chats, activeChat])

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [activeChat, histories])

  const customer = chats[activeChat]

  function handleSendMessage(e: FormEvent) {
    e.preventDefault()
    if (!message.trim() && !attachment) return

    if (!navigator.onLine || simulateOffline) {
      setSendError(true)
      return
    }

    setSendError(false)
    const sentText = message.trim()
    const nowTime = "Vừa xong"
    const wasNeedsReply = customer.status === "needsReply"

    setHistories((prev: HistoryMessage[][]) => {
      const next = [...prev]
      const currentList = next[activeChat] ? [...next[activeChat]] : []
      if (attachment) {
        currentList.push({
          from: "shop",
          text: "Shop đã gửi ảnh mẫu sản phẩm đính kèm",
          image: attachment.url,
          time: nowTime,
        })
      }
      if (sentText) {
        currentList.push({
          from: "shop",
          text: sentText,
          time: nowTime,
        })
      }
      next[activeChat] = currentList
      return next
    })

    const nextChat = visibleChats.find(
      (chat: Chat) => chats.indexOf(chat) !== activeChat,
    )
    const nextNeedsReply = nextChat ? chats.indexOf(nextChat) : -1

    setChats((current: Chat[]) =>
      current.map((chat: Chat, index: number) =>
        index === activeChat
          ? {
              ...chat,
              snippet: sentText || "Shop đã gửi ảnh mẫu sản phẩm",
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

    setAttachments((prev: Record<number, { name: string; url: string } | undefined>) => ({
      ...prev,
      [activeChat]: undefined,
    }))
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
    <div className="flex h-full w-full overflow-hidden bg-[#F0F2F5] text-slate-800 antialiased font-sans">
      {/* ===================== CỘT BÊN TRÁI: SIDEBAR HỘI THOẠI ===================== */}
      <aside className="flex w-[350px] shrink-0 flex-col border-r border-slate-200/90 bg-white shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        {/* Header Shop & Ca trực */}
        <div className="border-b border-slate-100 px-4 py-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-xs">
                A
              </span>
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  ANNA Closet
                </h1>
                <p className="text-[11px] text-slate-500">
                  NV: <span className="font-semibold text-slate-700">Nguyễn Vy</span> · Ca tối 20h-22h
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
              v2 (Đã cải tiến)
            </span>
          </div>
        </div>

        {/* Thanh 3 Tabs Pill-style chuẩn UI hiện đại (KHÔNG BỊ RỚT DÒNG) */}
        <div className="p-2.5 pb-2 bg-slate-50/70 border-b border-slate-100">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-200/60 p-1">
            {[
              { label: "Cần trả lời", count: conversationCounts.needsReply, color: "text-rose-600 bg-rose-50" },
              { label: "Chờ khách", count: conversationCounts.waiting, color: "text-slate-600 bg-slate-100" },
              { label: "Tạm hoãn", count: conversationCounts.snoozed, color: "text-amber-700 bg-amber-50" },
            ].map((tab) => {
              const isActive = activeNav === tab.label
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => {
                    setActiveNav(tab.label)
                    setMoreMenuOpen(false)
                    setSnoozeMenuOpen(false)
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? "bg-blue-600 text-white" : tab.color
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Ô Tìm kiếm khách hàng */}
        <div className="px-3 py-2 border-b border-slate-100">
          <div className="relative flex items-center">
            <svg
              className="absolute left-3 size-3.5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm khách hàng..."
              className="h-8.5 w-full rounded-lg bg-slate-100/80 pl-8.5 pr-3 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border border-transparent"
            />
          </div>
        </div>

        {/* Danh sách thẻ hội thoại: ÁP DỤNG CẢI TIẾN 1 (VIỀN CAM NỔI BẬT + ĐỒNG HỒ BÁO THỨC) */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {visibleChats.map((chat: Chat) => {
            const index = chats.indexOf(chat)
            const isActive = activeChat === index
            const isDue = Boolean(chat.returnedNote)

            return (
              <div
                key={chat.id}
                onClick={() => {
                  setActiveChat(index)
                  setChats((prev: Chat[]) =>
                    prev.map((c: Chat, i: number) =>
                      i === index ? { ...c, unread: false } : c,
                    ),
                  )
                }}
                className={`group relative flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition-all ${
                  isDue
                    ? "border-2 border-orange-500 bg-orange-50/70 shadow-xs ring-1 ring-orange-300"
                    : isActive
                      ? "bg-blue-50/70 border-l-[3px] border-l-blue-600 shadow-xs"
                      : "hover:bg-slate-50 border-l-[3px] border-l-transparent"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className={`size-10.5 rounded-full object-cover ring-1 ${
                      isDue ? "ring-orange-400" : "ring-slate-200"
                    }`}
                  />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 grid size-3.5 place-items-center rounded-full bg-[#0084FF] text-[8px] font-black text-white ring-1.5 ring-white"
                    title="Messenger"
                  >
                    ~
                  </span>
                </div>

                {/* Thông tin cuộc chat */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`truncate text-xs font-semibold ${
                        isDue
                          ? "font-bold text-orange-950"
                          : chat.unread
                            ? "font-bold text-slate-900"
                            : "text-slate-800"
                      }`}
                    >
                      {chat.name}
                    </span>
                    <span className="shrink-0 text-[10px] text-slate-400">
                      {chat.time}
                    </span>
                  </div>

                  <p
                    className={`mt-0.5 truncate text-[11.5px] leading-relaxed ${
                      isDue
                        ? "font-semibold text-orange-900"
                        : chat.unread
                          ? "font-medium text-slate-900"
                          : "text-slate-500"
                    }`}
                  >
                    {chat.snippet}
                  </p>

                  <div className="mt-1.5 flex items-center justify-between gap-1">
                    <span className="truncate rounded bg-slate-100 px-1.5 py-0.2 text-[9.5px] font-medium text-slate-600">
                      {chat.productTag || "Áo/Váy nữ"}
                    </span>

                    {/* CẢI TIẾN 1: Badge cam "Đến hạn nhắc việc" & icon đồng hồ ngoài danh sách */}
                    {isDue ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.2 text-[9.5px] font-bold text-white shadow-xs animate-bounce">
                        <svg
                          className="size-2.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <circle cx="12" cy="13" r="8" />
                          <path d="M12 9v4l2 2" />
                          <path d="M5 3L2 6" />
                          <path d="M22 6l-3-3" />
                        </svg>
                        Đến hạn nhắc việc!
                      </span>
                    ) : chat.unread ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.2 text-[9.5px] font-bold text-white shadow-xs">
                        <span className="size-1 rounded-full bg-white animate-pulse" />
                        Đang đợi {chat.wait}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {chat.status === "snoozed"
                          ? `Còn ${remaining(chat)}`
                          : chat.status === "waiting"
                            ? "Chờ khách rep"
                            : `Đang đợi ${chat.wait}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      {/* ===================== CỘT BÊN PHẢI: KHUNG CHAT CHI TIẾT ===================== */}
      <main className="flex min-h-0 flex-1 flex-col bg-white">
        {/* Header khung chat (gọn gàng ~54px) */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/90 px-5 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={customer?.avatar}
                alt={customer?.name}
                className="size-9 rounded-full object-cover ring-1 ring-slate-200"
              />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-1.5 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 leading-tight">
                  {customer?.name}
                </h2>
                <span
                  className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                    customer?.returnedNote
                      ? "bg-orange-100 text-orange-800 border border-orange-300"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {customer?.returnedNote
                    ? "Đến hạn nhắc việc"
                    : customer?.status === "needsReply"
                      ? "Cần trả lời"
                      : customer?.status === "waiting"
                        ? "Chờ khách"
                        : "Đang tạm hoãn"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Sản phẩm: <span className="font-semibold text-slate-700">{customer?.productTag}</span> ({customer?.orderPrice})
              </p>
            </div>
          </div>

          {/* Nút thao tác trên Header */}
          <div className="flex items-center gap-2">
            {/* Nút Tạm hoãn */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (customer?.status === "snoozed") {
                    setSnoozeMenuOpen((v) => !v)
                    setMoreMenuOpen(false)
                  } else {
                    setSnoozeDelay("3 phút") // Cải tiến v2: Chọn sẵn 3 phút
                    setSnoozeNote("")
                    setSnoozeOpen(true)
                  }
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  customer?.status === "snoozed"
                    ? "bg-amber-600 text-white shadow-xs hover:bg-amber-700"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <svg
                  className="size-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
                <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setChats((current: Chat[]) =>
                        current.map((chat: Chat, idx: number) =>
                          idx === activeChat
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
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Mở lại trước hạn
                  </button>
                </div>
              )}
            </div>

            {/* Menu 3 chấm */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMoreMenuOpen((v) => !v)
                  setSnoozeMenuOpen(false)
                }}
                className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>

              {moreMenuOpen && (
                <div className="absolute right-0 top-full z-30 mt-1 w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-xl text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setChats((current: Chat[]) =>
                        current.map((chat: Chat, idx: number) =>
                          idx === activeChat ? { ...chat, unread: true } : chat,
                        ),
                      )
                      setMoreMenuOpen(false)
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                  >
                    Đánh dấu chưa đọc
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomerReply(activeChat)}
                    className="w-full rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                  >
                    Giả lập: Khách nhắn thêm
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

        {/* Khung Tin nhắn cuộn (Bubble chat chuẩn Messenger) */}
        <div className="flex-1 overflow-y-auto bg-[#F7F8FA] px-6 py-4">
          <div className="mx-auto flex max-w-2xl min-h-full flex-col justify-end space-y-3">
            {/* Banner Hệ thống nhắc việc khi hết hạn (Đồng bộ cam với thẻ danh sách) */}
            {customer?.returnedNote && (
              <div className="sticky top-2 z-10 flex items-center justify-between rounded-xl border border-orange-300 bg-orange-50/95 px-4 py-2.5 text-xs text-orange-950 shadow-sm backdrop-blur-xs ring-1 ring-orange-200">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-orange-600 animate-ping" />
                  <span>
                    <strong>Đến hạn nhắc việc:</strong> Đã hết 3 phút tra cứu! Ghi chú:{" "}
                    <em>"{customer.returnedNote}"</em>
                  </span>
                </div>
              </div>
            )}

            {/* Banner Đang tạm hoãn */}
            {customer?.status === "snoozed" && (
              <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
                <span>
                  Đang tạm hoãn · Ghi chú: <strong>{customer.snoozeNote || "Check kho"}</strong>
                </span>
                <span className="font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  Còn lại: {remaining(customer)}
                </span>
              </div>
            )}

            {/* Mốc phân cách Hôm nay */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10.5px] font-medium text-slate-400">Hôm nay</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Danh sách tin nhắn */}
            {histories[activeChat]?.map((entry: HistoryMessage, idx: number) => {
              const isShop = entry.from === "shop"
              return (
                <div
                  key={idx}
                  className={`flex items-end gap-2 ${
                    isShop ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isShop && (
                    <img
                      src={customer?.avatar}
                      alt={customer?.name}
                      className="size-6.5 rounded-full object-cover ring-1 ring-slate-200 mb-0.5"
                    />
                  )}
                  <div
                    className={`group relative flex flex-col ${
                      isShop ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[460px] px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                        isShop
                          ? "rounded-2xl rounded-br-xs bg-[#0084FF] text-white"
                          : "rounded-2xl rounded-bl-xs bg-white text-slate-800 border border-slate-200/80"
                      }`}
                    >
                      {entry.image && (
                        <img
                          src={entry.image}
                          alt="Ảnh đính kèm"
                          className="mb-1.5 max-h-48 rounded-lg object-cover"
                        />
                      )}
                      <p className="whitespace-pre-wrap break-words">{entry.text}</p>
                    </div>
                    <span className="mt-0.5 px-1 text-[9.5px] text-slate-400">
                      {entry.time} · {isShop ? "Đã gửi" : customer?.name}
                    </span>
                  </div>
                </div>
              )
            })}
            <div ref={historyEndRef} />
          </div>
        </div>

        {/* Khung Nhập tin nhắn (Footer thanh lịch chuẩn CSKH) */}
        <footer className="border-t border-slate-200/90 bg-white p-3">
          <div className="mx-auto max-w-2xl">
            {attachment && (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-slate-100 p-2 text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={attachment.url}
                    alt="Preview"
                    className="size-8 rounded object-cover"
                  />
                  <span className="font-medium text-slate-700 text-[11px] truncate max-w-[200px]">
                    {attachment.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAttachments((prev) => ({ ...prev, [activeChat]: undefined }))
                  }
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
            )}

            {sendError && (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-700 border border-rose-200">
                <span>⚠️ Chưa gửi được do sự cố kết nối. Nội dung được lưu lại.</span>
                <button
                  type="button"
                  onClick={() => {
                    setSimulateOffline(false)
                    setSendError(false)
                    document.querySelector<HTMLFormElement>("#form-chat-v2")?.requestSubmit()
                  }}
                  className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-rose-700"
                >
                  Thử lại
                </button>
              </div>
            )}

            <form
              id="form-chat-v2"
              onSubmit={handleSendMessage}
              className="flex items-center gap-2"
            >
              <label
                className="flex size-9 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
                title="Gửi ảnh mẫu"
              >
                <svg
                  className="size-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
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

              <div className="flex flex-1 items-center rounded-full border border-slate-200 bg-slate-50/70 px-4 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập tin nhắn tư vấn size, giá, màu sắc... (Enter để gửi)"
                  className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={!message.trim() && !attachment}
                className="flex size-9 items-center justify-center rounded-full bg-[#0084FF] text-white shadow-xs transition-all hover:bg-blue-600 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shrink-0"
              >
                <svg
                  className="size-4 ml-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        </footer>
      </main>

      {/* ===================== MODAL TẠM HOÃN (CẢI TIẾN 2: CHỌN SẴN 3 PHÚT, AUTO-FOCUS, ENTER ĐỂ LƯU) ===================== */}
      {snoozeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  Tạm hoãn cuộc hội thoại
                </h3>
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                  v2 cải tiến
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSnoozeOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-3.5 space-y-3">
              <div>
                <label className="block text-[11.5px] font-semibold text-slate-700 mb-1.5">
                  Nhắc lại sau (Đã chọn sẵn 3 phút):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["3 phút", "5 phút"].map((delay) => {
                    const isSelected = snoozeDelay === delay
                    return (
                      <button
                        key={delay}
                        type="button"
                        onClick={() => setSnoozeDelay(delay)}
                        className={`rounded-xl border p-2.5 text-center transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-500 shadow-2xs"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-xs"
                        }`}
                      >
                        <div className="text-xs">{delay}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                  Ghi chú nhanh (Tự động trỏ chuột - Nhấn Enter để xác nhận):
                </label>
                <input
                  ref={noteInputRef}
                  value={snoozeNote}
                  onChange={(e) => setSnoozeNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      confirmSnooze()
                    }
                  }}
                  placeholder="Gõ nhanh: Check size M màu trắng... (Enter để xong)"
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[10px] text-slate-400">Enter: Lưu · Esc: Hủy</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSnoozeOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmSnooze}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
                >
                  Xác nhận (Enter)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
