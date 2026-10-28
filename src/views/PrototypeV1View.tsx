import React, { FormEvent, useEffect, useRef, useState } from "react"
import { sampleChats, sampleHistories } from "../data/initialChats"
import { Chat, ChatStatus, HistoryMessage } from "../types/chat"

export default function PrototypeV1View() {
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

  // V1 (Trước kiểm thử): Chưa chọn sẵn mốc thời gian, chưa auto-focus ô ghi chú (phản ánh Issue 2)
  const [snoozeDelay, setSnoozeDelay] = useState("")
  const [snoozeNote, setSnoozeNote] = useState("")

  const [now, setNow] = useState(Date.now())
  const [sendError, setSendError] = useState(false)
  const [simulateOffline, setSimulateOffline] = useState(false)

  const historyEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSendError(false)
    setMoreMenuOpen(false)
    setSnoozeMenuOpen(false)
  }, [activeChat])

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

  // Giả lập hết giờ hẹn ngay lập tức (tiện cho việc test)
  function triggerExpireSnoozeImmediately() {
    setChats((current: Chat[]) =>
      current.map((chat: Chat, idx: number) =>
        idx === activeChat && chat.status === "snoozed"
          ? {
              ...chat,
              status: "needsReply",
              snoozeUntil: undefined,
              snoozeDelay: undefined,
              returnedNote: chat.snoozeNote || "Hết hạn tra cứu kho (Đã kiểm tra còn size M)",
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
      // Ưu tiên ca hết hạn tạm hoãn quay về
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

  // Gợi ý tin nhắn mẫu nhanh dành cho nhân viên tư vấn thời trang
  const quickReplies = [
    "Dạ mẫu này bên em còn sẵn size M màu trắng ạ!",
    "Dạ form này chuẩn size, bạn mặc M là vừa xinh nhé.",
    "Shop có hỗ trợ đổi size trong 7 ngày nên bạn yên tâm nha.",
    "Phí vận chuyển toàn quốc đồng giá 25.000đ ạ.",
    "Dạ bạn cho shop xin họ tên + SĐT + địa chỉ để chốt đơn nhé!",
  ]

  function handleSendMessage(e: FormEvent) {
    e.preventDefault()
    if (!message.trim() && !attachment) return

    if (simulateOffline) {
      setSendError(true)
      return
    }

    setSendError(false)
    const textToSend = message.trim()
    const nowTime = "Vừa xong"

    // Thêm tin nhắn vào lịch sử
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

    // Tự động chuyển hội thoại sang tab Chờ khách
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
    <div className="flex h-full w-full overflow-hidden bg-slate-100 text-slate-800">
      {/* ===================== CỘT BÊN TRÁI: DANH SÁCH HỘI THOẠI (360px) ===================== */}
      <aside className="flex w-[360px] shrink-0 flex-col border-r border-slate-200 bg-white">
        {/* Header Shop & Ca trực tư vấn */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-xs">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  ANNA Closet
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[9.5px] font-semibold text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Đang trực
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                NV: <span className="font-semibold text-slate-700">Nguyễn Vy</span> · Ca tối 20h-22h
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            Prototype v1
          </span>
        </div>

        {/* 3 Tab Nghiệp vụ: Cần trả lời, Chờ khách, Tạm hoãn */}
        <div className="border-b border-slate-200 bg-slate-50/70 p-2">
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-200/70 p-1">
            {[
              {
                id: "Cần trả lời",
                label: "Cần trả lời",
                count: conversationCounts.needsReply,
                activeBg: "bg-white text-blue-600 shadow-xs font-bold",
                badgeActive: "bg-rose-500 text-white",
                badgeInactive: "bg-rose-100 text-rose-700 font-bold",
              },
              {
                id: "Chờ khách",
                label: "Chờ khách",
                count: conversationCounts.waiting,
                activeBg: "bg-white text-slate-800 shadow-xs font-bold",
                badgeActive: "bg-slate-700 text-white",
                badgeInactive: "bg-slate-200 text-slate-700",
              },
              {
                id: "Tạm hoãn",
                label: "Tạm hoãn",
                count: conversationCounts.snoozed,
                activeBg: "bg-white text-amber-700 shadow-xs font-bold",
                badgeActive: "bg-amber-600 text-white",
                badgeInactive: "bg-amber-100 text-amber-800 font-bold",
              },
            ].map((tab) => {
              const isActive = activeNav === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveNav(tab.id)
                    setMoreMenuOpen(false)
                    setSnoozeMenuOpen(false)
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs transition-all ${
                    isActive
                      ? tab.activeBg
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/40 font-medium"
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isActive ? tab.badgeActive : tab.badgeInactive
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dòng định hướng nghiệp vụ (Sub-header IA) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-3.5 py-2 text-[11px]">
          <span className="font-semibold text-slate-600">
            {activeStatus === "needsReply"
              ? "Shop cần xử lý tiếp · Ca đến hạn ưu tiên"
              : activeStatus === "waiting"
                ? "Đang chờ khách phản hồi tư vấn"
                : "Shop còn cam kết · Đang hẹn giờ kiểm tra kho"}
          </span>
          <span className="font-bold text-slate-400">
            {visibleChats.length} hội thoại
          </span>
        </div>

        {/* Ô Tìm kiếm khách hàng */}
        <div className="px-3 py-2 border-b border-slate-100 bg-white">
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
              placeholder="Tìm theo tên khách, sản phẩm..."
              className="h-8.5 w-full rounded-lg bg-slate-100/80 pl-8.5 pr-3 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border border-transparent"
            />
          </div>
        </div>

        {/* Danh sách thẻ hội thoại */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-slate-50/40">
          {visibleChats.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-slate-400">
              <span className="text-2xl mb-1">📭</span>
              <p className="text-xs">Không có hội thoại nào trong mục này</p>
            </div>
          ) : (
            visibleChats.map((chat: Chat) => {
              const index = chats.indexOf(chat)
              const isActive = activeChat === index
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
                  className={`group relative flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-all border ${
                    isActive
                      ? "bg-blue-50/80 border-blue-500 shadow-xs"
                      : "bg-white hover:bg-slate-50/80 border-slate-200/70"
                  }`}
                >
                  {/* Avatar kèm Messenger Badge */}
                  <div className="relative shrink-0 mt-0.5">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="size-10 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-[#0084FF] text-white shadow-xs"
                      title="Facebook Messenger"
                    >
                      <svg className="size-2.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.91 1.45 5.51 3.73 7.15V22l3.41-1.87c.92.25 1.89.39 2.86.39 5.52 0 10-4.14 10-9.25S17.52 2 12 2zm1.06 12.44l-2.61-2.79-5.1 2.79 5.61-5.96 2.67 2.79 5.04-2.79-5.61 5.96z" />
                      </svg>
                    </span>
                  </div>

                  {/* Nội dung tóm tắt thẻ */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`truncate text-xs ${
                          chat.unread ? "font-bold text-slate-900" : "font-semibold text-slate-800"
                        }`}
                      >
                        {chat.name}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {chat.time}
                      </span>
                    </div>

                    <p
                      className={`mt-0.5 line-clamp-1 text-[11px] leading-snug ${
                        chat.unread
                          ? "font-semibold text-slate-900"
                          : "text-slate-500"
                      }`}
                    >
                      {chat.snippet}
                    </p>

                    <div className="mt-1.5 flex items-center justify-between gap-1">
                      <span className="truncate rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                        {chat.productTag || "Áo/Váy nữ"}
                      </span>

                      {chat.unread ? (
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
            })
          )}
        </div>
      </aside>

      {/* ===================== CỘT BÊN PHẢI: KHUNG CHAT RỘNG RÃI ===================== */}
      <main className="flex min-h-0 flex-1 flex-col bg-white">
        {/* Header khung chat: Đầy đủ bối cảnh khách + Nút thao tác */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-6 bg-white shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={customer?.avatar}
                alt={customer?.name}
                className="size-9.5 rounded-full object-cover ring-1 ring-slate-200"
              />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-1.5 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 leading-tight">
                  {customer?.name}
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] font-semibold text-slate-600">
                  {customer?.status === "needsReply"
                    ? "Cần trả lời"
                    : customer?.status === "waiting"
                      ? "Chờ khách"
                      : "Đang tạm hoãn"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Kênh: <span className="font-semibold text-blue-600">Facebook Messenger</span> · Khách hỏi: <span className="font-semibold text-slate-700">{customer?.productTag}</span> ({customer?.orderPrice})
              </p>
            </div>
          </div>

          {/* Nhóm nút thao tác */}
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
                    setSnoozeDelay("")
                    setSnoozeNote("")
                    setSnoozeOpen(true)
                  }
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  customer?.status === "snoozed"
                    ? "bg-amber-600 text-white shadow-xs hover:bg-amber-700"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs"
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
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Mở lại trước hạn
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerExpireSnoozeImmediately()
                      setSnoozeMenuOpen(false)
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-amber-700 hover:bg-amber-50"
                  >
                    ⚡ Giả lập: Hết giờ ngay
                  </button>
                </div>
              )}
            </div>

            {/* Menu 3 chấm (Tiện ích giả lập kiểm thử UX) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMoreMenuOpen((v) => !v)
                  setSnoozeMenuOpen(false)
                }}
                className="grid size-8.5 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
                title="Tùy chọn khác"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>

              {moreMenuOpen && (
                <div className="absolute right-0 top-full z-30 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl text-xs">
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
                    className="w-full rounded-lg px-3 py-2 text-left text-blue-700 hover:bg-blue-50 font-medium"
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

        {/* Băng thông tin Sản phẩm đang hỏi (Gia tăng bối cảnh CSKH thời trang) */}
        <div className="flex items-center justify-between border-b border-slate-200/70 bg-slate-50/70 px-6 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Đang quan tâm:</span>
            <span className="rounded bg-blue-100/70 px-2 py-0.5 font-bold text-blue-700">
              {customer?.productTag}
            </span>
            <span className="font-semibold text-slate-700">
              {customer?.orderPrice}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-600 font-medium">Kho còn: 3 chiếc (Size M)</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Mục tiêu: Tư vấn size &gt; Gửi ảnh &gt; Chốt đơn
          </span>
        </div>

        {/* Khung Tin nhắn cuộn: Tràn viền tự nhiên, bong bóng chuẩn Messenger */}
        <div className="flex-1 overflow-y-auto bg-[#F4F6F9] px-6 py-5">
          <div className="flex min-h-full flex-col justify-end space-y-3.5">
            {/* Banner Nhắc việc khi hết hạn tạm hoãn quay về (V1: Chỉ có banner ở đây) */}
            {customer?.returnedNote && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3 text-xs text-amber-900 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <span>🔔</span>
                  <span>Hệ thống nhắc việc: Đã hết hạn tạm hoãn!</span>
                </div>
                <p className="mt-1 text-slate-700">
                  Ghi chú của bạn:{" "}
                  <span className="font-semibold text-slate-900">
                    "{customer.returnedNote}"
                  </span>
                </p>
              </div>
            )}

            {/* Banner Trạng thái đang tạm hoãn */}
            {customer?.status === "snoozed" && (
              <div className="rounded-xl border border-amber-200 bg-white p-3 text-xs text-slate-700 shadow-xs">
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
                  {customer.snoozeNote || "Đang kiểm tra size/kho thực tế..."}
                </p>
              </div>
            )}

            {/* Mốc thời gian */}
            <div className="flex items-center gap-3 my-2">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-medium text-slate-400">Hôm nay</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Lịch sử tin nhắn */}
            {histories[activeChat]?.map((entry: HistoryMessage, idx: number) => {
              const isShop = entry.from === "shop"
              return (
                <div
                  key={idx}
                  className={`flex items-end gap-2.5 ${
                    isShop ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isShop && (
                    <img
                      src={customer?.avatar}
                      alt={customer?.name}
                      className="size-7 rounded-full object-cover ring-1 ring-slate-200 mb-0.5"
                    />
                  )}
                  <div
                    className={`group relative flex flex-col ${
                      isShop ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[560px] px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                        isShop
                          ? "rounded-2xl rounded-br-xs bg-[#0084FF] text-white"
                          : "rounded-2xl rounded-bl-xs bg-white text-slate-800 border border-slate-200/90"
                      }`}
                    >
                      {entry.image && (
                        <img
                          src={entry.image}
                          alt="Ảnh đính kèm"
                          className="mb-2 max-h-56 rounded-lg object-cover"
                        />
                      )}
                      <p className="whitespace-pre-wrap break-words">{entry.text}</p>
                    </div>
                    <span className="mt-0.5 px-1 text-[10px] text-slate-400">
                      {entry.time} · {isShop ? "Đã gửi" : customer?.name}
                    </span>
                  </div>
                </div>
              )
            })}
            <div ref={historyEndRef} />
          </div>
        </div>

        {/* Khu vực Nhập tin nhắn & Gợi ý câu trả lời nhanh */}
        <footer className="border-t border-slate-200 bg-white p-3.5">
          {/* Cụm nút Trả lời nhanh (Quick replies dành cho CSKH) */}
          <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">
              Gợi ý nhanh:
            </span>
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMessage(reply)}
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Preview ảnh đính kèm */}
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

          {/* Cảnh báo lỗi gửi do mất mạng */}
          {sendError && (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-700 border border-rose-200">
              <span>⚠️ Chưa gửi được do sự cố kết nối. Nội dung được lưu lại.</span>
              <button
                type="button"
                onClick={() => {
                  setSimulateOffline(false)
                  setSendError(false)
                  document.querySelector<HTMLFormElement>("#form-chat-v1")?.requestSubmit()
                }}
                className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-rose-700"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Form soạn tin */}
          <form
            id="form-chat-v1"
            onSubmit={handleSendMessage}
            className="flex items-center gap-2.5"
          >
            {/* Nút gửi ảnh mẫu */}
            <label
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
              title="Gửi ảnh mẫu sản phẩm"
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
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

            {/* Input nhập tin */}
            <div className="flex flex-1 items-center rounded-full border border-slate-200 bg-slate-50/80 px-4 py-2 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập nội dung tư vấn size, giá, màu sắc... (Enter để gửi)"
                className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Nút gửi tròn chuẩn Messenger */}
            <button
              type="submit"
              disabled={!message.trim() && !attachment}
              className="flex size-9 items-center justify-center rounded-full bg-[#0084FF] text-white shadow-xs transition-all hover:bg-blue-600 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shrink-0"
              title="Gửi tin nhắn"
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
        </footer>
      </main>

      {/* ===================== MODAL TẠM HOÃN (BẢN V1: CHƯA DEFAULT 3P, CHƯA AUTO-FOCUS) ===================== */}
      {snoozeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tạm hoãn tư vấn (Hẹn giờ)
                </h3>
                <p className="text-[11px] text-slate-500">
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
                  Chọn thời gian hẹn giờ:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["3 phút", "5 phút"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSnoozeDelay(option)}
                      className={`rounded-xl border py-2 font-bold transition-all ${
                        snoozeDelay === option
                          ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {!snoozeDelay && (
                  <p className="mt-1 text-[10px] text-slate-400 italic">
                    (V1: Bạn cần tự click chọn 3 phút hoặc 5 phút)
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ghi chú việc cần làm khi quay lại:
                </label>
                <input
                  value={snoozeNote}
                  onChange={(e) => setSnoozeNote(e.target.value)}
                  placeholder="VD: Kiểm tra váy VD01 màu trắng size M trong kho"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                />
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
                  Xác nhận hoãn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
