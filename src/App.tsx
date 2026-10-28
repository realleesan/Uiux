import { FormEvent, useEffect, useState } from "react"

type IconName = "inbox" | "clock" | "pause" | "search" | "more" | "send" | "paperclip"
type ChatStatus = "needsReply" | "waiting" | "snoozed"
type Chat = {
  initials: string
  name: string
  snippet: string
  lastCustomerMessage: string
  time: string
  wait: string
  status: ChatStatus
  unread?: boolean
  snoozeDelay?: string
  snoozeNote?: string
  returnedNote?: string
  snoozeUntil?: number
  updatedAt?: number
}

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    inbox: (
      <>
        <path d="M4 5h16v14H4z" />
        <path d="M4 13h4l2 3h4l2-3h4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </>
    ),
    pause: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M10 9v6M14 9v6" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6" />
        <path d="m15 15 4 4" />
      </>
    ),
    more: (
      <>
        <circle cx="6" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="18" cy="12" r="1" fill="currentColor" />
      </>
    ),
    send: (
      <>
        <path d="m4 4 17 8-17 8 3-8z" />
        <path d="M7 12h14" />
      </>
    ),
    paperclip: (
      <path d="m9 12 5.5-5.5a3 3 0 0 1 4.25 4.25l-7.5 7.5a5 5 0 0 1-7.07-7.07l7-7" />
    ),
  }
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function ChannelIcon() {
  return (
    <span
      aria-label="Facebook Messenger"
      className="grid size-4 place-items-center rounded-full border border-[#6B7280] bg-white text-[11px] font-black leading-none text-[#374151]"
      title="Facebook Messenger"
    >
      f
    </span>
  )
}

const initialChats: Chat[] = [
  {
    initials: "MT",
    name: "Minh Trang",
    snippet:
      "Dạ shop ơi, em chốt lấy mẫu này nhé. Cho em xin thông tin chuyển khoản ạ!",
    lastCustomerMessage:
      "Dạ shop ơi, em chốt lấy mẫu này nhé. Cho em xin thông tin chuyển khoản ạ!",
    time: "10:40",
    wait: "1 phút",
    status: "needsReply",
    unread: true,
  },
  {
    initials: "HL",
    name: "Hoàng Lan",
    snippet: "Mình muốn màu trắng, shop kiểm tra giúp mình nhé.",
    lastCustomerMessage: "Mình muốn màu trắng, shop kiểm tra giúp mình nhé.",
    time: "10:34",
    wait: "3 phút",
    status: "needsReply",
  },
  {
    initials: "QN",
    name: "Quang Nam",
    snippet: "Có thể đổi sang màu đen giúp mình?",
    lastCustomerMessage: "Có thể đổi sang màu đen giúp mình?",
    time: "09:55",
    wait: "25 phút",
    status: "needsReply",
  },
  {
    initials: "TA",
    name: "Thùy Anh",
    snippet: "Cảm ơn shop nhé!",
    lastCustomerMessage: "Cảm ơn shop nhé!",
    time: "Hôm qua",
    wait: "1 giờ",
    status: "needsReply",
  },
  {
    initials: "GH",
    name: "Gia Hân",
    snippet: "Dạ, mình đợi bạn xác nhận thêm nhé.",
    lastCustomerMessage: "Shop tư vấn giúp mình mẫu này nhé.",
    time: "09:42",
    wait: "8 phút",
    status: "waiting",
  },
  {
    initials: "ĐA",
    name: "Đức Anh",
    snippet: "Kiểm tra lịch giao hàng",
    lastCustomerMessage: "Đơn của mình dự kiến khi nào giao?",
    time: "09:30",
    wait: "5 phút",
    status: "snoozed",
    snoozeDelay: "5 phút",
    snoozeNote: "Kiểm tra lịch giao hàng",
    snoozeUntil: Date.now() + 300000,
  },
]

const navItems: {
  label: string
  status: ChatStatus
  icon: IconName
}[] = [
  { label: "Cần trả lời", status: "needsReply", icon: "inbox" },
  { label: "Chờ khách", status: "waiting", icon: "clock" },
  { label: "Tạm hoãn", status: "snoozed", icon: "pause" },
]

export default function App() {
  const [chats, setChats] = useState(initialChats)
  const [activeNav, setActiveNav] = useState("Cần trả lời")
  const [activeChat, setActiveChat] = useState(0)
  const [search, setSearch] = useState("")
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const message = drafts[activeChat] ?? ""
  const setMessage = (value: string) =>
    setDrafts((current) => ({ ...current, [activeChat]: value }))
  const [attachments, setAttachments] = useState<Record<number, {
    name: string
    url: string
  } | undefined>>({})
  const attachment = attachments[activeChat]
  const [sentMessages, setSentMessages] = useState<Record<number, string[]>>({})
  const [snoozeOpen, setSnoozeOpen] = useState(false)
  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [snoozeDelay, setSnoozeDelay] = useState("")
  const [snoozeNote, setSnoozeNote] = useState("")

  const [now, setNow] = useState(Date.now())
  const [sendError, setSendError] = useState(false)
  const [notice, setNotice] = useState("")
  useEffect(() => {
    setSendError(false)
    setMoreMenuOpen(false)
    setSnoozeMenuOpen(false)
  }, [activeChat])
  useEffect(() => {
    const timer = window.setInterval(() => {
      const time = Date.now()
      setNow(time)
      setChats((current) =>
        current.map((chat) =>
          chat.status === "snoozed" &&
          chat.snoozeUntil &&
          chat.snoozeUntil <= time
            ? {
                ...chat,
                status: "needsReply",
                snoozeUntil: undefined,
                snoozeDelay: undefined,
                returnedNote: chat.snoozeNote || "Tiếp tục tư vấn cho khách",
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
    setChats((current) =>
      current.map((chat, index) =>
        index === activeChat
          ? {
              ...chat,
              status: "snoozed",
              snoozeDelay,
              snoozeUntil:
                Date.now() + (snoozeDelay === "3 phút" ? 180000 : 300000),
              snoozeNote: snoozeNote.trim(),
              returnedNote: undefined,
              unread: false,
            }
          : chat,
      ),
    )
    setSnoozeOpen(false)
    setActiveNav("Cần trả lời")
    const next = visibleChats.find((chat) => chats.indexOf(chat) !== activeChat)
    if (next) setActiveChat(chats.indexOf(next))
    setNotice("Đã tạm hoãn. Hệ thống sẽ nhắc bạn quay lại khi đến hạn.")
  }

  const activeStatus =
    navItems.find((item) => item.label === activeNav)?.status ?? "needsReply"
  const conversationCounts = chats.reduce<Record<ChatStatus, number>>(
    (counts, chat) => ({ ...counts, [chat.status]: counts[chat.status] + 1 }),
    { needsReply: 0, waiting: 0, snoozed: 0 },
  )
  const visibleChats = chats
    .filter(
      (chat) =>
        chat.status === activeStatus &&
        `${chat.name} ${chat.snippet}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort(
      (a, b) =>
        Number(Boolean(b.returnedNote)) - Number(Boolean(a.returnedNote)) ||
        Number(b.time === "Vừa xong") - Number(a.time === "Vừa xong") ||
        (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
    )
  const customer = chats[activeChat]
  const statusLabels: Record<ChatStatus, string> = {
    needsReply: "Cần trả lời",
    waiting: "Chờ khách",
    snoozed: "Tạm hoãn",
  }

  function sendMessage(event: FormEvent) {
    event.preventDefault()
    if (!message.trim() && !attachment) return
    if (!navigator.onLine) {
      setSendError(true)
      return
    }
    setSendError(false)
    const sent = message.trim()
    const wasNeedsReply = customer.status === "needsReply"
    const nextChat = visibleChats.find(
      (chat) => chats.indexOf(chat) !== activeChat,
    )
    const nextNeedsReply = nextChat ? chats.indexOf(nextChat) : -1
    setSentMessages((current) => ({
      ...current,
      [activeChat]: [
        ...(current[activeChat] ?? []),
        ...(attachment ? [attachment.url] : []),
        ...(sent ? [sent] : []),
      ],
    }))
    setChats((current) =>
      current.map((chat, index) =>
        index === activeChat
          ? {
              ...chat,
              snippet: sent || "Shop đã gửi ảnh mẫu sản phẩm",
              snoozeUntil: undefined,
              time: "Vừa xong",
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
    setSnoozeMenuOpen(false)
    if (wasNeedsReply) {
      setActiveNav("Cần trả lời")
      if (nextNeedsReply >= 0) setActiveChat(nextNeedsReply)
    } else {
      setActiveNav("Chờ khách")
    }
    setNotice("Đã gửi · Hội thoại chuyển sang Chờ khách.")
    setAttachments((current) => ({ ...current, [activeChat]: undefined }))
    setMessage("")
  }

  function receiveCustomerReply(index: number) {
    setSentMessages((current) => ({
      ...current,
      [index]: [
        ...(current[index] ?? []),
        "__customer__Dạ, mình xác nhận nhé. Shop hỗ trợ tiếp giúp mình ạ.",
      ],
    }))
    setChats((current) =>
      current.map((chat, chatIndex) =>
        chatIndex === index
          ? {
              ...chat,
              status: "needsReply",
              snoozeUntil: undefined,
              snoozeDelay: undefined,
              returnedNote: undefined,
              unread: true,
              snippet: "Dạ, mình xác nhận nhé. Shop hỗ trợ tiếp giúp mình ạ.",
              lastCustomerMessage:
                "Dạ, mình xác nhận nhé. Shop hỗ trợ tiếp giúp mình ạ.",
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
    <main className="h-screen min-h-[640px] overflow-hidden bg-white text-[#1F2937]">
      <section className="app-shell grid h-full w-full grid-cols-[380px_minmax(0,1fr)] overflow-hidden bg-white">
        <section className="flex min-h-0 flex-col border-r border-[#E5E7EB] bg-white">
          <header className="border-b border-[#E5E7EB] px-5 py-5">
            <div className="text-xs uppercase tracking-widest text-gray-500">
              Shop Thời Trang · Facebook Messenger
            </div>
            <h1 className="mt-2 text-xl font-bold">Hội thoại bán hàng</h1>
            <p className="mt-1 text-xs text-gray-500">
              Nguyễn Vy · Nhân viên trực ca
            </p>
          </header>
          <nav
            aria-label="Trạng thái hội thoại"
            className="flex border-b border-gray-200 px-2 pt-3"
          >
            {navItems.map((item) => (
              <button
                key={item.status}
                type="button"
                aria-current={activeNav === item.label ? "page" : undefined}
                onClick={() => {
                  setActiveNav(item.label)
                  setMoreMenuOpen(false)
                  setSnoozeMenuOpen(false)
                  const first = chats
                    .filter((chat) => chat.status === item.status)
                    .sort(
                      (a, b) =>
                        Number(Boolean(b.returnedNote)) -
                          Number(Boolean(a.returnedNote)) ||
                        (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
                    )[0]
                  if (first) setActiveChat(chats.indexOf(first))
                }}
                className={
                  "flex flex-1 items-center justify-center gap-1 border-b-2 px-1 py-3 text-xs font-semibold " +
                  (activeNav === item.label
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500")
                }
              >
                {item.label}
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5">
                  {conversationCounts[item.status]}
                </span>
              </button>
            ))}
          </nav>
          <div className="border-b border-[#E5E7EB] p-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#6B7280]">
                <Icon name="search" />
              </div>
              <input
                aria-label="Tìm kiếm khách hàng"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm kiếm khách hàng..."
                className="h-11 w-full rounded-md border border-[#9CA3AF] bg-[#F4F5F7] pl-10 pr-3 text-sm outline-none placeholder:text-[#9CA3AF] focus:border-[#1F2937]"
              />
            </div>
          </div>
          <p className="px-4 pt-3 text-xs text-gray-500">
            {activeStatus === "waiting"
              ? "Khách cần phản hồi tiếp"
              : activeStatus === "snoozed"
                ? "Shop còn cam kết · Đang hẹn giờ tra cứu"
                : "Shop cần xử lý tiếp · Ca đến hạn được ưu tiên"}
          </p>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-[0.1em] text-[#6B7280]">
              {activeNav}
            </div>
            <div className="text-xs text-[#9CA3AF]">
              {visibleChats.length} hội thoại
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2">
            {visibleChats.map((chat) => {
              const index = chats.indexOf(chat)
              const active = activeChat === index
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
                  className={`mb-1 w-full rounded-md border-l-[3px] p-3 text-left ${
                    chat.returnedNote
                      ? "border border-[#6B7280] border-l-[3px] bg-white"
                      : active
                        ? "border-[#1F2937] bg-[#F3F4F6]"
                        : "border-transparent hover:bg-[#F4F5F7]"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="relative grid size-10 shrink-0 place-items-center rounded-full border border-[#9CA3AF] bg-white text-xs font-bold">
                      {chat.initials}
                      <span className="absolute -bottom-0.5 -right-0.5">
                        <ChannelIcon />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`truncate text-sm ${
                            chat.unread ? "font-bold" : "font-semibold"
                          }`}
                        >
                          {chat.name}
                        </span>
                        <span className="shrink-0 text-[11px] text-[#6B7280]">
                          {chat.time}
                        </span>
                      </div>
                      <div
                        className={`mt-1 truncate text-xs ${
                          chat.unread
                            ? "font-bold text-[#1F2937]"
                            : "text-[#6B7280]"
                        }`}
                      >
                        {chat.snippet}
                      </div>
                      <div className="mt-2 flex justify-end">
                        {chat.unread ? (
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-[#1F2937]" />
                            <span className="rounded-full border border-[#1F2937] bg-white px-2 py-1 text-[10px] font-bold text-[#1F2937]">
                              Đang đợi {chat.wait}
                            </span>
                          </div>
                        ) : (
                          <span className="rounded-full border border-[#9CA3AF] bg-white px-2 py-1 text-[10px] font-semibold text-[#4B5563]">
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

        <section className="relative flex min-h-0 min-w-0 flex-col bg-white">
          <header className="flex h-[77px] shrink-0 items-center gap-3 border-b border-[#E5E7EB] px-6">
            <div className="grid size-10 place-items-center rounded-full border border-[#9CA3AF] bg-[#F3F4F6] text-xs font-bold">
              {customer.initials}
            </div>
            <div>
              <div className="font-bold">{customer.name}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-[#6B7280]">
                <span className="size-2 rounded-full bg-[#4B5563]" />
                <span>Đang hoạt động</span>
              </div>
            </div>
            <div className="ml-2 rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium">
              {statusLabels[customer.status]}
            </div>
            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => {
                  if (customer.status === "snoozed") {
                    setSnoozeMenuOpen((open) => !open)
                    setMoreMenuOpen(false)
                  } else {
                    setSnoozeDelay("")
                    setSnoozeNote("")
                    setSnoozeOpen(true)
                  }
                }}
                className={`rounded-md border border-[#1F2937] px-4 py-2.5 text-sm font-semibold transition-colors ${
                  customer.status === "snoozed"
                    ? "bg-[#1F2937] text-white"
                    : "bg-white hover:bg-[#F3F4F6]"
                }`}
              >
                {customer.status === "snoozed"
                  ? `Tạm hoãn · ${remaining(customer)}`
                  : "Tạm hoãn"}
              </button>
              {snoozeMenuOpen && customer.status === "snoozed" && (
                <div className="absolute right-0 top-full z-30 mt-2 w-48 rounded-md border border-[#9CA3AF] bg-white p-1 shadow-lg">
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
                    className="w-full rounded px-3 py-2.5 text-left text-sm font-semibold text-[#1F2937] hover:bg-[#F3F4F6]"
                  >
                    Mở lại trước hạn
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                aria-label="Thêm tùy chọn"
                type="button"
                onClick={() => {
                  setMoreMenuOpen((open) => !open)
                  setSnoozeMenuOpen(false)
                }}
                className="grid size-10 place-items-center rounded-md text-[#4B5563] hover:bg-[#F3F4F6]"
              >
                <Icon name="more" />
              </button>
              {moreMenuOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 w-48 rounded-md border border-[#9CA3AF] bg-white p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setChats((current) =>
                        current.map((chat, index) =>
                          index === activeChat
                            ? { ...chat, unread: true }
                            : chat,
                        ),
                      )
                      setMoreMenuOpen(false)
                    }}
                    className="w-full rounded px-3 py-2.5 text-left text-sm font-medium text-[#1F2937] hover:bg-[#F3F4F6]"
                  >
                    Đánh dấu chưa đọc
                  </button>
                  {(customer.status === "waiting" ||
                    customer.status === "snoozed") && (
                    <button
                      type="button"
                      onClick={() => receiveCustomerReply(activeChat)}
                      className="w-full rounded border-t border-[#E5E7EB] px-3 py-2.5 text-left text-sm font-medium text-[#1F2937] hover:bg-[#F3F4F6]"
                    >
                      Ghi nhận khách vừa phản hồi
                    </button>
                  )}
                </div>
              )}
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#FAFAFA] px-8 py-6">
            <div className="mx-auto flex max-w-3xl flex-col">
              {customer.returnedNote && (
                <div className="sticky top-0 z-10 mb-5 rounded-md border border-[#9CA3AF] bg-[#F3F4F6] px-4 py-3 text-sm leading-5 shadow-sm">
                  <span className="font-semibold">Hệ thống:</span> Đã đến hạn
                  nhắc nhở quay lại hội thoại. Ghi chú của bạn:{" "}
                  <span className="font-bold">'{customer.returnedNote}'</span>
                </div>
              )}
              {customer.status === "snoozed" && (
                <div className="mb-5 rounded border border-gray-300 bg-white p-3 text-sm">
                  <strong>Đang tạm hoãn · Còn {remaining(customer)}</strong>
                  <p className="mt-1 text-gray-500">
                    {customer.snoozeNote || "Tiếp tục tư vấn khi đến hạn"}
                  </p>
                </div>
              )}
              {activeChat === 0 ? (
                <>
                  <div className="mb-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-[#E5E7EB]" />
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#9CA3AF]">
                      Hôm nay, 10:35
                    </span>
                    <div className="h-px flex-1 bg-[#E5E7EB]" />
                  </div>
                  <div className="mb-5 flex max-w-[70%] items-end gap-2 self-start">
                    <div className="grid size-7 shrink-0 place-items-center rounded-full border border-[#9CA3AF] bg-white text-[9px] font-bold">
                      MT
                    </div>
                    <div>
                      <div className="rounded-xl rounded-bl-sm border border-[#9CA3AF] bg-white px-4 py-3 text-sm leading-6">
                        Shop ơi, mẫu váy này còn size M không ạ?
                      </div>
                      <div className="mt-1.5 text-[10px] text-[#9CA3AF]">
                        10:35
                      </div>
                    </div>
                  </div>
                  <div className="mb-6 max-w-[70%] self-end text-right">
                    <div className="rounded-xl rounded-br-sm bg-[#E5E7EB] px-4 py-3 text-left text-sm leading-6">
                      Dạ mẫu này còn size M bạn nhé. Mình gửi bạn thông tin sản
                      phẩm ngay đây ạ.
                    </div>
                    <div className="mt-1.5 text-[10px] text-[#9CA3AF]">
                      10:37 · Đã gửi
                    </div>
                  </div>
                  <div className="mb-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-[#9CA3AF]" />
                    <span className="text-xs font-semibold text-[#9CA3AF]">
                      Tin nhắn mới
                    </span>
                    <div className="h-px flex-1 bg-[#9CA3AF]" />
                  </div>
                  <div className="mb-5 flex max-w-[76%] items-end gap-2 self-start">
                    <div className="grid size-7 shrink-0 place-items-center rounded-full border border-[#1F2937] bg-white text-[9px] font-bold">
                      MT
                    </div>
                    <div>
                      <div className="rounded-xl rounded-bl-sm border border-[#1F2937] bg-white px-4 py-3 text-sm font-medium leading-6">
                        Dạ shop ơi, em chốt lấy mẫu này nhé. Cho em xin thông
                        tin chuyển khoản ạ!
                      </div>
                      <div className="mt-1.5 text-[10px] font-semibold text-[#6B7280]">
                        10:40
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-[#E5E7EB]" />
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#9CA3AF]">
                      Hôm nay
                    </span>
                    <div className="h-px flex-1 bg-[#E5E7EB]" />
                  </div>
                  <div className="mb-5 flex max-w-[70%] items-end gap-2 self-start">
                    <div className="grid size-7 shrink-0 place-items-center rounded-full border border-[#9CA3AF] bg-white text-[9px] font-bold">
                      {customer.initials}
                    </div>
                    <div>
                      <div className="rounded-xl rounded-bl-sm border border-[#9CA3AF] bg-white px-4 py-3 text-sm leading-6 text-[#1F2937]">
                        {initialChats[activeChat]?.lastCustomerMessage ??
                          customer.snippet}
                      </div>
                      <div className="mt-1.5 text-[10px] text-[#9CA3AF]">
                        {customer.time}
                      </div>
                    </div>
                  </div>
                </>
              )}
              {(sentMessages[activeChat] ?? []).map((text, index) => (
                <div
                  key={`${text}-${index}`}
                  className={
                    "mb-5 max-w-[70%] " +
                    (text.startsWith("__customer__")
                      ? "self-start"
                      : "self-end text-right")
                  }
                >
                  <div
                    className={
                      "rounded-xl px-4 py-3 text-left text-sm leading-6 " +
                      (text.startsWith("__customer__")
                        ? "border border-gray-400 bg-white"
                        : "rounded-br-sm bg-[#E5E7EB]")
                    }
                  >
                    {text.startsWith("data:image/") ? (
                      <img
                        src={text}
                        alt="Ảnh mẫu sản phẩm shop gửi"
                        className="max-h-60 rounded"
                      />
                    ) : (
                      text.replace(/^__customer__/, "")
                    )}
                  </div>
                  <div className="mt-1.5 text-[10px] text-[#9CA3AF]">
                    {text.startsWith("__customer__")
                      ? "Vừa xong · Khách hàng"
                      : "Vừa xong · Đã gửi"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div role="status" className="px-5 text-xs text-gray-500">
            {notice}
          </div>
          <footer className="shrink-0 border-t border-[#E5E7EB] bg-white p-5">
            {attachment && (
              <div className="mb-3 flex items-center gap-3 text-xs">
                <img
                  src={attachment.url}
                  alt="Ảnh đính kèm"
                  className="size-12 rounded border object-cover"
                />
                <span>{attachment.name}</span>
                <button
                  type="button"
                  className="underline"
                  onClick={() =>
                    setAttachments((current) => ({
                      ...current,
                      [activeChat]: undefined,
                    }))
                  }
                >
                  Xóa ảnh
                </button>
              </div>
            )}
            {sendError && (
              <div
                role="alert"
                className="mb-3 flex items-center justify-between text-sm text-red-700"
              >
                Chưa gửi được. Nội dung được giữ lại.
                <button
                  type="button"
                  className="font-bold underline"
                  onClick={() => {
                    if (navigator.onLine) {
                      document
                        .querySelector<HTMLFormElement>("form")
                        ?.requestSubmit()
                    }
                  }}
                >
                  Thử lại
                </button>
              </div>
            )}
            <form
              onSubmit={sendMessage}
              className="mx-auto flex max-w-3xl items-end gap-3"
            >
              <div className="flex-1 rounded-lg border border-[#9CA3AF] bg-white p-3 focus-within:border-[#1F2937]">
                <textarea
                  aria-label="Tin nhắn"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Nhập tin nhắn..."
                  rows={2}
                  className="block w-full resize-none bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <label
                    className="flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-1 text-[11px] font-medium text-[#4B5563] hover:bg-[#F3F4F6]"
                    title="Gửi ảnh mẫu sản phẩm"
                  >
                    <Icon name="paperclip" />
                    <span>Gửi ảnh mẫu sản phẩm</span>
                    <input
                      aria-label="Gửi ảnh mẫu sản phẩm"
                      accept="image/*"
                      className="hidden"
                      type="file"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (!file || !file.type.startsWith("image/")) return
                        const index = activeChat
                        const reader = new FileReader()
                        reader.onload = () =>
                          setAttachments((current) => ({
                            ...current,
                            [index]: {
                              name: file.name,
                              url: String(reader.result),
                            },
                          }))
                        reader.readAsDataURL(file)
                        event.target.value = ""
                      }}
                    />
                  </label>
                  <span className="text-[10px] text-[#9CA3AF]">
                    Enter để xuống dòng
                  </span>
                </div>
              </div>
              <button
                type="submit"
                className="flex h-11 items-center gap-2 rounded-md bg-[#1F2937] px-5 text-sm font-bold text-white hover:bg-[#374151]"
              >
                <span>Gửi</span>
                <Icon name="send" />
              </button>
            </form>
          </footer>
          {visibleChats.length === 0 && (
            <div className="absolute inset-0 z-40 grid place-items-center bg-white">
              <div className="max-w-sm px-8 text-center">
                <div className="mx-auto mb-5 grid size-20 place-items-center rounded-full border border-dashed border-[#9CA3AF] bg-[#F9FAFB]">
                  <div className="relative h-9 w-11 rounded-md border border-[#9CA3AF] bg-white">
                    <div className="absolute left-2 top-2 size-2 rounded-full bg-[#D1D5DB]" />
                    <div className="absolute bottom-2 left-2 right-2 h-px bg-[#9CA3AF]" />
                  </div>
                </div>
                <div className="text-sm font-semibold text-[#374151]">
                  {activeNav === "Tạm hoãn"
                    ? "Chưa có cuộc hội thoại nào đang tạm hoãn"
                    : `Chưa có cuộc hội thoại nào trong ${activeNav.toLowerCase()}`}
                </div>
                <div className="mt-2 text-xs leading-5 text-[#9CA3AF]">
                  Các cuộc hội thoại phù hợp sẽ xuất hiện tại đây.
                </div>
              </div>
            </div>
          )}
        </section>
      </section>

      {snoozeOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1F2937]/55 p-6">
          <section
            aria-labelledby="snooze-title"
            aria-modal="true"
            onKeyDown={(event) => { if (event.key === "Escape") setSnoozeOpen(false) }}
            role="dialog"
            className="w-[440px] max-w-full overflow-hidden rounded-lg border border-[#374151] bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
              <div id="snooze-title" className="text-base font-bold">
                Tạm hoãn cuộc hội thoại?
              </div>
              <button
                aria-label="Đóng"
                type="button"
                onClick={() => setSnoozeOpen(false)}
                className="grid size-8 place-items-center rounded-md text-sm font-bold text-[#4B5563] hover:bg-[#F4F5F7]"
              >
                X
              </button>
            </header>

            <div className="px-5 py-5">
              <div className="mb-2.5 text-sm text-[#374151]">Nhắc lại sau:</div>
              <div className="flex gap-2">
                {["3 phút", "5 phút"].map((delay) => {
                  const selected = snoozeDelay === delay
                  return (
                    <button
                      key={delay}
                      type="button"
                      onClick={() => setSnoozeDelay(delay)}
                      className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                        selected
                          ? "border-[#1F2937] bg-[#1F2937] text-white"
                          : "border-[#9CA3AF] bg-white text-[#374151] hover:bg-[#F4F5F7]"
                      }`}
                    >
                      {delay}
                    </button>
                  )
                })}
              </div>

              <label
                className="mb-2 mt-4 block text-sm text-[#374151]"
                htmlFor="snooze-note"
              >
                Ghi chú nhanh (Tùy chọn):
              </label>
              <textarea
                id="snooze-note"
                value={snoozeNote}
                onChange={(event) => setSnoozeNote(event.target.value)}
                placeholder="Ví dụ: Check size M màu trắng ở kho..."
                className="h-[70px] w-full resize-none rounded-md border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm outline-none placeholder:italic placeholder:text-[#9CA3AF] focus:border-[#374151]"
              />
            </div>

            <footer className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4">
              <button
                type="button"
                onClick={() => setSnoozeOpen(false)}
                className="rounded-md border border-[#9CA3AF] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F4F5F7]"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!snoozeDelay}
                onClick={confirmSnooze}
                className="rounded-md bg-[#1F2937] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#374151] disabled:cursor-not-allowed disabled:bg-[#D1D5DB] disabled:text-[#6B7280]"
              >
                Xác nhận tạm hoãn
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  )
}

