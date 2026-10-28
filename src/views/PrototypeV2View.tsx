import React, { FormEvent, useEffect, useRef, useState } from "react"
import { sampleChats, sampleHistories } from "../data/initialChats"
import { Chat, ChatStatus, HistoryMessage } from "../types/chat"
import {
  InboxIcon,
  ClockIcon,
  PauseIcon,
  SearchIcon,
  SendIcon,
  PaperclipIcon,
  MoreVerticalIcon,
  AlarmClockIcon,
  AlertCircleIcon,
  CloseIcon,
  MessengerBadge,
} from "../components/icons/Icons"

const navTabs: {
  label: string
  status: ChatStatus
  icon: React.ComponentType<{ className?: string }>
  helperText: string
}[] = [
  {
    label: "Cần trả lời",
    status: "needsReply",
    icon: InboxIcon,
    helperText: "Shop có trách nhiệm xử lý tiếp · Ca hết hạn được ưu tiên lên đầu với viền cảnh báo cam",
  },
  {
    label: "Chờ khách",
    status: "waiting",
    icon: ClockIcon,
    helperText: "Shop đã gửi tư vấn xong · Đang đợi khách phản hồi hoặc quyết định",
  },
  {
    label: "Tạm hoãn",
    status: "snoozed",
    icon: PauseIcon,
    helperText: "Shop đang nợ cam kết kiểm tra kho/size · Tự động nhắc việc khi hết giờ",
  },
]

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

  // CẢI TIẾN 2 (Phần 6 & 7): Mặc định chọn sẵn mốc "3 phút"
  const [snoozeDelay, setSnoozeDelay] = useState("3 phút")
  const [snoozeNote, setSnoozeNote] = useState("")

  const [now, setNow] = useState(Date.now())
  const [sendError, setSendError] = useState(false)
  const [simulateOffline, setSimulateOffline] = useState(false)

  const historyEndRef = useRef<HTMLDivElement>(null)
  const noteInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setSendError(false)
    setMoreMenuOpen(false)
    setSnoozeMenuOpen(false)
  }, [activeChat])

  // CẢI TIẾN 2: Tự động focus vào ô ghi chú khi modal mở ra
  useEffect(() => {
    if (snoozeOpen) {
      setSnoozeDelay("3 phút")
      setTimeout(() => {
        noteInputRef.current?.focus()
      }, 50)
    }
  }, [snoozeOpen])

  // Timer đếm ngược 1s: Tự động đưa ca hết hạn về Cần trả lời
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
                  chat.snoozeNote || "Đã hết 3 phút kiểm tra kho, quay lại tư vấn gấp",
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

  const activeStatus =
    navTabs.find((item) => item.label === activeNav)?.status ?? "needsReply"

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
    <div className="flex h-full w-full min-h-[600px] overflow-hidden bg-white text-slate-800">
      {/* CỘT DANH SÁCH HỘI THOẠI (BÊN TRÁI - 360px) */}
      <aside className="flex w-[360px] min-w-[340px] max-w-[380px] shrink-0 flex-col border-r border-slate-200 bg-white">
        {/* Header Shop & Ca trực */}
        <div className="border-b border-slate-100 px-5 py-4 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200/60">
              <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
              ANNA Closet · Messenger
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              v2 (Đã cải tiến)
            </span>
          </div>
          <h1 className="mt-2 text-lg font-heading font-bold text-slate-900 tracking-tight">
            Hội thoại bán hàng
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            NV trực: <strong className="text-slate-700">Nguyễn Vy</strong> (Bản Prototype v2 sau kiểm thử)
          </p>
        </div>

        {/* Thanh 3 Tab Trạng thái */}
        <div className="flex border-b border-slate-200 px-3 pt-2 bg-white">
          {navTabs.map((tab) => {
            const isActive = activeNav === tab.label
            const count = conversationCounts[tab.status]
            const TabIcon = tab.icon
            return (
              <button
                key={tab.status}
                type="button"
                onClick={() => {
                  setActiveNav(tab.label)
                  setMoreMenuOpen(false)
                  setSnoozeMenuOpen(false)
                  const first = chats
                    .filter((c: Chat) => c.status === tab.status)
                    .sort(
                      (a: Chat, b: Chat) =>
                        Number(Boolean(b.returnedNote)) - Number(Boolean(a.returnedNote)) ||
                        (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
                    )[0]
                  if (first) setActiveChat(chats.indexOf(first))
                }}
                className={`relative flex flex-1 items-center justify-center gap-1.5 pb-3 pt-2 text-xs font-heading transition-all ${
                  isActive
                    ? "font-bold text-blue-600"
                    : "font-semibold text-slate-500 hover:text-slate-800"
                }`}
              >
                <TabIcon className={`size-3.5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive
                      ? tab.status === "needsReply" && count > 0
                        ? "bg-red-500 text-white"
                        : "bg-blue-600 text-white"
                      : tab.status === "needsReply" && count > 0
                        ? "bg-red-100 text-red-700 font-bold"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full bg-blue-600" />
                )}
              </button>
            )
          })}
        </div>

        {/* Ô Tìm kiếm */}
        <div className="border-b border-slate-100 p-3">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <SearchIcon className="size-4" />
            </span>
            <input
              aria-label="Tìm kiếm khách hàng"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc nội dung..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-3 text-xs outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Dòng hướng dẫn ngữ cảnh tab */}
        <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">{activeNav}: </span>
          {navTabs.find((t) => t.label === activeNav)?.helperText}
        </div>

        {/* Danh sách thẻ chat: ÁP DỤNG CẢI TIẾN 1 (VIỀN CAM + ICON ĐỒNG HỒ) */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {visibleChats.map((chat: Chat) => {
            const index = chats.indexOf(chat)
            const isActive = activeChat === index
            const isDueReminder = Boolean(chat.returnedNote)

            return (
              <button
                type="button"
                key={chat.id}
                onClick={() => {
                  setActiveChat(index)
                  setChats((prev: Chat[]) =>
                    prev.map((c: Chat, i: number) => (i === index ? { ...c, unread: false } : c)),
                  )
                }}
                className={`group relative w-full rounded-xl p-3 text-left transition-all ${
                  isDueReminder
                    ? "border-2 border-orange-500 bg-orange-50/40 shadow-sm ring-1 ring-orange-200"
                    : isActive
                      ? "bg-blue-50/70 border border-blue-200 shadow-xs"
                      : "border border-transparent hover:bg-slate-50"
                }`}
              >
                {isActive && !isDueReminder && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-blue-600" />
                )}

                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className={`size-11 rounded-full object-cover ring-1 ${
                        isDueReminder ? "ring-orange-400" : "ring-slate-200"
                      }`}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5">
                      <MessengerBadge />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`truncate font-heading text-sm ${
                          isDueReminder
                            ? "font-bold text-orange-950"
                            : chat.unread
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-800"
                        }`}
                      >
                        {chat.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-slate-400">{chat.time}</span>
                    </div>

                    <p
                      className={`mt-1 line-clamp-1 text-xs leading-relaxed ${
                        isDueReminder
                          ? "font-semibold text-orange-900"
                          : chat.unread
                            ? "font-medium text-slate-900"
                            : "text-slate-500"
                      }`}
                    >
                      {chat.snippet}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="truncate text-[10px] font-medium text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
                        {chat.productTag || "Quan tâm sản phẩm"}
                      </span>

                      {isDueReminder ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs animate-bounce">
                          <AlarmClockIcon className="size-3" />
                          Đến hạn nhắc việc!
                        </span>
                      ) : chat.unread ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          <span className="size-1.5 rounded-full bg-white animate-pulse" />
                          Đang đợi {chat.wait}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {chat.status === "waiting"
                            ? "Chờ khách phản hồi"
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
      </aside>

      {/* CỘT KHUNG CHAT CHI TIẾT */}
      <main className="relative flex min-h-0 flex-1 flex-col bg-white">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={customer?.avatar}
                alt={customer?.name}
                className="size-10 rounded-full object-cover ring-1 ring-slate-200"
              />
              <span className="absolute -bottom-0.5 -right-0.5">
                <MessengerBadge />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base font-bold text-slate-900">
                  {customer?.name}
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    customer?.returnedNote
                      ? "bg-orange-100 text-orange-800 border border-orange-300"
                      : customer?.status === "needsReply"
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : customer?.status === "waiting"
                          ? "bg-sky-50 text-sky-700 border border-sky-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
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
                Đang quan tâm: <strong className="text-slate-700">{customer?.productTag}</strong> · Giá {customer?.orderPrice}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (customer?.status === "snoozed") {
                    setSnoozeMenuOpen((v: boolean) => !v)
                    setMoreMenuOpen(false)
                  } else {
                    setSnoozeDelay("3 phút")
                    setSnoozeNote("")
                    setSnoozeOpen(true)
                  }
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-heading font-semibold transition-all ${
                  customer?.status === "snoozed"
                    ? "bg-blue-600 text-white shadow-xs hover:bg-blue-700"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                }`}
              >
                <PauseIcon className="size-3.5" />
                <span>
                  {customer?.status === "snoozed"
                    ? `Đang hoãn · ${remaining(customer)}`
                    : "Tạm hoãn"}
                </span>
              </button>

              {snoozeMenuOpen && customer?.status === "snoozed" && (
                <div className="absolute right-0 top-full z-30 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
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
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Mở lại trước hạn
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                aria-label="Thêm tùy chọn"
                onClick={() => {
                  setMoreMenuOpen((v: boolean) => !v)
                  setSnoozeMenuOpen(false)
                }}
                className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <MoreVerticalIcon className="size-4" />
              </button>

              {moreMenuOpen && (
                <div className="absolute right-0 top-full z-30 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
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
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Đánh dấu chưa đọc
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomerReply(activeChat)}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Giả lập: Khách nhắn thêm
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setSimulateOffline((v: boolean) => !v)
                      setMoreMenuOpen(false)
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium text-amber-700 hover:bg-amber-50"
                  >
                    <span>Giả lập lỗi mạng khi gửi</span>
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

        <div
          aria-label="Lịch sử hội thoại"
          className="flex-1 overflow-y-auto bg-slate-50/60 p-6"
        >
          <div className="mx-auto flex max-w-3xl min-h-full flex-col justify-end space-y-4">
            {customer?.returnedNote && (
              <div className="sticky top-0 z-10 flex items-start gap-2.5 rounded-xl border border-orange-300 bg-orange-50/95 p-3.5 text-xs text-orange-950 shadow-sm backdrop-blur-xs ring-1 ring-orange-200">
                <AlarmClockIcon className="size-4 shrink-0 text-orange-600 mt-0.5" />
                <div>
                  <span className="font-heading font-bold text-orange-700">Đến hạn nhắc việc: </span>
                  Đã hết thời gian hẹn giờ tra cứu! Ghi chú việc cần làm ngay:{" "}
                  <strong className="underline decoration-orange-400">
                    "{customer.returnedNote}"
                  </strong>
                </div>
              </div>
            )}

            {customer?.status === "snoozed" && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <PauseIcon className="size-4 text-blue-600" />
                  <span>
                    Cuộc trò chuyện đang được tạm gác · Ghi chú:{" "}
                    <strong>{customer.snoozeNote || "Đang tra cứu thông tin..."}</strong>
                  </span>
                </div>
                <span className="font-heading font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Còn lại: {remaining(customer)}
                </span>
              </div>
            )}

            <div className="my-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-medium text-slate-400">Hôm nay</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {histories[activeChat]?.map((entry: HistoryMessage, idx: number) => {
              const isShop = entry.from === "shop"
              return (
                <div
                  key={idx}
                  className={`flex items-end gap-2.5 ${isShop ? "justify-end" : "justify-start"}`}
                >
                  {!isShop && (
                    <img
                      src={customer?.avatar}
                      alt={customer?.name}
                      className="size-7 rounded-full object-cover ring-1 ring-slate-200 mb-1"
                    />
                  )}
                  <div className={`max-w-[70%] ${isShop ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                        isShop
                          ? "rounded-br-xs bg-blue-600 text-white font-normal"
                          : "rounded-bl-xs bg-white text-slate-800 border border-slate-200"
                      }`}
                    >
                      {entry.image && (
                        <img
                          src={entry.image}
                          alt="Ảnh sản phẩm đính kèm"
                          className="mb-2 max-h-52 rounded-lg object-cover ring-1 ring-black/5"
                        />
                      )}
                      <p className="whitespace-pre-wrap break-words">{entry.text}</p>
                    </div>
                    <div
                      className={`mt-1 px-1 text-[10px] text-slate-400 ${
                        isShop ? "text-right" : "text-left"
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

        <footer className="border-t border-slate-200 bg-white p-4">
          <div className="mx-auto max-w-3xl">
            {attachment && (
              <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={attachment.url}
                    alt="Preview"
                    className="size-10 rounded-lg object-cover border"
                  />
                  <span className="font-medium text-slate-700">{attachment.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAttachments((prev: Record<number, { name: string; url: string } | undefined>) => ({
                      ...prev,
                      [activeChat]: undefined,
                    }))
                  }
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <CloseIcon className="size-4" />
                </button>
              </div>
            )}

            {sendError && (
              <div
                role="alert"
                className="mb-3 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700"
              >
                <div className="flex items-center gap-2">
                  <AlertCircleIcon className="size-4 shrink-0 text-red-600" />
                  <span>Chưa gửi được tin nhắn do sự cố kết nối. Nội dung đã được lưu lại.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSimulateOffline(false)
                    setSendError(false)
                    document.querySelector<HTMLFormElement>("#chat-form-v2")?.requestSubmit()
                  }}
                  className="rounded-md bg-red-600 px-3 py-1 font-heading font-semibold text-white hover:bg-red-700 shadow-xs"
                >
                  Thử lại
                </button>
              </div>
            )}

            <form
              id="chat-form-v2"
              onSubmit={handleSendMessage}
              className="flex items-end gap-2.5"
            >
              <div className="flex-1 rounded-2xl border border-slate-300 bg-white p-2.5 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <textarea
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                  placeholder="Soạn nội dung tư vấn giá, size, màu sắc..."
                  rows={2}
                  className="w-full resize-none bg-transparent text-xs outline-none placeholder:text-slate-400"
                />
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <label
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
                    title="Gửi ảnh mẫu sản phẩm"
                  >
                    <PaperclipIcon className="size-3.5 text-slate-500" />
                    <span>Gửi ảnh mẫu sản phẩm</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => {
                          setAttachments((prev: Record<number, { name: string; url: string } | undefined>) => ({
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
                  <span className="text-[10px] text-slate-400">Nhấn Enter để xuống dòng</span>
                </div>
              </div>

              <button
                type="submit"
                className="flex h-11 items-center gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-heading font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
              >
                <span>Gửi</span>
                <SendIcon className="size-3.5" />
              </button>
            </form>
          </div>
        </footer>

        {visibleChats.length === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white p-6">
            <div className="max-w-xs text-center">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-blue-50 text-blue-600">
                <InboxIcon className="size-6" />
              </div>
              <h3 className="font-heading text-sm font-bold text-slate-800">
                Không có hội thoại trong {activeNav}
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Tất cả các ca tư vấn thuộc nhóm này đã được xử lý hoặc chuyển trạng thái.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* MODAL TẠM HOÃN (CẢI TIẾN 2: CHỌN SẴN 3 PHÚT, AUTO-FOCUS, ENTER ĐỂ XÁC NHẬN) */}
      {snoozeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === "Escape") setSnoozeOpen(false)
            }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Tạm hoãn cuộc hội thoại
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Cải tiến v2
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSnoozeOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Thời gian nhắc việc (Đã chọn sẵn 3 phút phổ biến):
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {["3 phút", "5 phút"].map((delay) => {
                    const isSelected = snoozeDelay === delay
                    return (
                      <button
                        key={delay}
                        type="button"
                        onClick={() => setSnoozeDelay(delay)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-100 shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between font-heading font-bold text-sm">
                          <span>{delay}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-blue-600 text-white rounded-full px-1.5 py-0.2">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {delay === "3 phút"
                            ? "Tra cứu bảng size / giá nhanh"
                            : "Kiểm tra tồn kho thực tế"}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="snooze-note-v2"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Ghi chú nhanh (Tự động trỏ chuột - Nhấn Enter để lưu):
                  </label>
                </div>
                <textarea
                  id="snooze-note-v2"
                  ref={noteInputRef}
                  value={snoozeNote}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSnoozeNote(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      confirmSnooze()
                    }
                  }}
                  placeholder="Gõ nhanh ghi chú: Check size M màu trắng... (Enter để xong)"
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-[11px] text-slate-400">
                Phím tắt: <strong className="text-slate-600">Enter</strong> xác nhận, <strong className="text-slate-600">Esc</strong> để hủy
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSnoozeOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-heading font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy (Esc)
                </button>
                <button
                  type="button"
                  onClick={confirmSnooze}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-heading font-bold text-white shadow-xs transition-all hover:bg-blue-700"
                >
                  Xác nhận tạm hoãn (Enter)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
