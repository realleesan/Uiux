import React, { FormEvent, useEffect, useRef, useState } from "react"
import { sampleChats, sampleHistories, sampleProducts, sampleQuickReplies, sampleTags } from "../data/initialChats"
import { Chat, ChatStatus, HistoryMessage, ProductItem, QuickReply } from "../types/chat"

export default function PrototypeV2View() {
  const [chats, setChats] = useState<Chat[]>(sampleChats)
  const [histories, setHistories] = useState<HistoryMessage[][]>(sampleHistories)
  const [activeNav, setActiveNav] = useState("Cần trả lời")
  const [activeChat, setActiveChat] = useState(0)
  const [search, setSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState("all")

  // Draft tin nhắn theo từng chat
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const message = drafts[activeChat] ?? ""
  const setMessage = (val: string) =>
    setDrafts((prev: Record<number, string>) => ({ ...prev, [activeChat]: val }))

  const [attachments, setAttachments] = useState<
    Record<number, { name: string; url: string } | undefined>
  >({})
  const attachment = attachments[activeChat]

  // Trạng thái Cột 3: utilityTab ('inventory' | 'pos' | 'snooze')
  const [utilityTab, setUtilityTab] = useState<"inventory" | "pos" | "snooze">("inventory")
  const [showRightPanel, setShowRightPanel] = useState(true)

  // Kho hàng & Tìm kiếm sản phẩm
  const [productSearch, setProductSearch] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<ProductItem>(sampleProducts[0])

  // Form Tạo đơn nhanh POS (Cột 3)
  const [orderName, setOrderName] = useState("")
  const [orderPhone, setOrderPhone] = useState("")
  const [orderAddress, setOrderAddress] = useState("")
  const [orderSelectedProduct, setOrderSelectedProduct] = useState("VD01")
  const [orderSelectedVariant, setOrderSelectedVariant] = useState("Trắng · M")
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [orderShipping, setOrderShipping] = useState(25000)
  const [orderSuccessMsg, setOrderSuccessMsg] = useState("")

  // Tạm hoãn
  const [snoozeOpen, setSnoozeOpen] = useState(false)
  const [snoozeDelay, setSnoozeDelay] = useState("3 phút")
  const [snoozeNote, setSnoozeNote] = useState("")
  const snoozeInputRef = useRef<HTMLInputElement>(null)

  const [now, setNow] = useState(Date.now())
  const [sendError, setSendError] = useState(false)
  const [simulateOffline, setSimulateOffline] = useState(false)
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  const historyEndRef = useRef<HTMLDivElement>(null)

  const currentCustomer = chats[activeChat]

  // Đồng bộ thông tin khách vào form POS khi chuyển chat
  useEffect(() => {
    if (currentCustomer) {
      setOrderName(currentCustomer.name || "")
      setOrderPhone(currentCustomer.customerPhone || "")
      setOrderAddress(currentCustomer.customerAddress || "")
      setOrderSuccessMsg("")
    }
    setSendError(false)
    setMoreMenuOpen(false)
    setTagDropdownOpen(false)
  }, [activeChat])

  // Auto focus ô ghi chú khi mở modal tạm hoãn
  useEffect(() => {
    if (snoozeOpen) {
      setTimeout(() => snoozeInputRef.current?.focus(), 50)
    }
  }, [snoozeOpen])

  // Cuộn xuống đáy khi có tin nhắn mới
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [histories, activeChat])

  // Timer đếm ngược 1s cho các ca tạm hoãn
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
                  chat.snoozeNote || "Đã hết hạn tạm hoãn! Kiểm tra kho/size và phản hồi khách ngay.",
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

  // Xác nhận Tạm hoãn
  function confirmSnooze(customDelay?: string, customNote?: string) {
    const delayToUse = customDelay || snoozeDelay || "3 phút"
    const noteToUse = customNote !== undefined ? customNote : snoozeNote
    const delayMs = delayToUse === "5 phút" ? 300000 : 180000

    setChats((current: Chat[]) =>
      current.map((chat: Chat, index: number) =>
        index === activeChat
          ? {
              ...chat,
              status: "snoozed",
              snoozeDelay: delayToUse,
              snoozeUntil: Date.now() + delayMs,
              snoozeNote: noteToUse.trim() || "Kiểm tra thông tin kho/bảng size",
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

  // Hết giờ ngay (Dành cho test nhanh kịch bản)
  function triggerExpireSnoozeImmediately() {
    setChats((current: Chat[]) =>
      current.map((chat: Chat, idx: number) =>
        idx === activeChat && chat.status === "snoozed"
          ? {
              ...chat,
              status: "needsReply",
              snoozeUntil: undefined,
              snoozeDelay: undefined,
              returnedNote: chat.snoozeNote || "Đã hết hạn tra kho (Kho xác nhận còn hàng size M)",
              updatedAt: Date.now(),
              unread: true,
            }
          : chat,
      ),
    )
    setActiveNav("Cần trả lời")
  }

  // Lọc chat
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
    .filter((chat: Chat) => {
      const matchStatus = chat.status === activeStatus
      const matchSearch = `${chat.name} ${chat.snippet} ${chat.productTag || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchTag =
        selectedTag === "all" || (chat.tags && chat.tags.includes(selectedTag))
      return matchStatus && matchSearch && matchTag
    })
    .sort((a: Chat, b: Chat) => {
      // Ưu tiên ca có returnedNote (đến hạn nhắc việc) lên đầu tiên!
      return (
        Number(Boolean(b.returnedNote)) - Number(Boolean(a.returnedNote)) ||
        Number(b.time === "Vừa xong") - Number(a.time === "Vừa xong") ||
        (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
      )
    })

  // Xử lý gửi tin nhắn
  function handleSendMessage(e?: FormEvent) {
    if (e) e.preventDefault()

    if (simulateOffline || !navigator.onLine) {
      setSendError(true)
      return
    }

    const textToSend = message.trim()
    if (!textToSend && !attachment) return

    setSendError(false)
    const nowTime = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })

    setHistories((prev: HistoryMessage[][]) => {
      const next = [...prev]
      const currentList = next[activeChat] ? [...next[activeChat]] : []
      if (textToSend) {
        currentList.push({
          from: "shop",
          text: textToSend,
          time: nowTime,
          image: attachment?.url,
        })
      } else if (attachment) {
        currentList.push({
          from: "shop",
          text: "Shop gửi bạn ảnh mẫu tham khảo ạ!",
          time: nowTime,
          image: attachment.url,
        })
      }
      next[activeChat] = currentList
      return next
    })

    const wasNeedsReply = currentCustomer?.status === "needsReply"
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
              status: "waiting", // Tự động luân chuyển sang "Chờ khách"
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

  // Chèn tin nhắn mẫu vào ô soạn thảo
  function insertQuickReply(qr: QuickReply) {
    setMessage(qr.content)
  }

  // Chèn thông tin tồn kho vào chat
  function insertInventoryInfo(prod: ProductItem, variantText: string, stock: number) {
    const text = `Dạ mẫu ${prod.code} (${prod.name}) màu ${variantText} bên shop hiện còn ${stock} sản phẩm sẵn tại kho ạ. Bạn chốt sớm để shop giữ hàng cho mình nhé! ✨`
    setMessage(text)
  }

  // Tự động nhận diện thông tin khách hàng từ tin nhắn (Auto-fill POS)
  function handleAutoFillFromChat() {
    if (currentCustomer) {
      setOrderName(currentCustomer.name)
      setOrderPhone(currentCustomer.customerPhone || "0912345678")
      setOrderAddress(currentCustomer.customerAddress || "123 Cầu Giấy, Hà Nội")
      setUtilityTab("pos")
    }
  }

  // Xác nhận tạo đơn hàng nhanh POS
  function handleConfirmCreateOrder() {
    if (!orderName || !orderPhone) {
      alert("Vui lòng nhập đầy đủ tên khách và số điện thoại!")
      return
    }

    const matchedProduct = sampleProducts.find((p) => p.code === orderSelectedProduct) || sampleProducts[0]
    const subtotal = matchedProduct.price * orderQuantity
    const total = subtotal + orderShipping
    const orderId = `DH-${Math.floor(1000 + Math.random() * 9000)}`
    const nowTime = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })

    // Đẩy Card xác nhận đơn hàng vào lịch sử chat
    setHistories((prev) => {
      const next = [...prev]
      const currentList = next[activeChat] ? [...next[activeChat]] : []
      currentList.push({
        from: "shop",
        text: `🎉 ĐÃ TẠO ĐƠN HÀNG THÀNH CÔNG #${orderId}\nSản phẩm: ${matchedProduct.name} (${orderSelectedVariant}) x${orderQuantity}\nTổng thanh toán: ${total.toLocaleString("vi-VN")}đ (Đã gồm ship)\nNgười nhận: ${orderName} - ${orderPhone}\nĐịa chỉ: ${orderAddress || "Nhận tại shop"}\nShop sẽ đóng gói và gửi hàng sớm nhất cho bạn nhé! Cảm ơn bạn rất nhiều! ❤️`,
        time: nowTime,
        isOrderCard: true,
        orderInfo: {
          orderId,
          productName: matchedProduct.name,
          variant: orderSelectedVariant,
          price: `${subtotal.toLocaleString("vi-VN")}đ`,
          shipping: `${orderShipping.toLocaleString("vi-VN")}đ`,
          total: `${total.toLocaleString("vi-VN")}đ`,
          phone: orderPhone,
          address: orderAddress || "Nhận tại cửa hàng",
        },
      })
      next[activeChat] = currentList
      return next
    })

    // Gán tag "Khách chốt đơn" cho hội thoại
    setChats((current) =>
      current.map((chat, idx) =>
        idx === activeChat
          ? {
              ...chat,
              tags: Array.from(new Set([...(chat.tags || []), "chotDon"])),
              orderCreated: true,
              snippet: `Đã tạo đơn #${orderId}: ${total.toLocaleString("vi-VN")}đ`,
              status: "waiting", // Chuyển sang chờ khách nhận hàng
              updatedAt: Date.now(),
            }
          : chat,
      ),
    )

    setOrderSuccessMsg(`Đã tạo thành công đơn hàng #${orderId}!`)
    setTimeout(() => setOrderSuccessMsg(""), 5000)
  }

  // Giả lập khách nhắn thêm (Alternative Path)
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

  // Gán nhãn/Tag nhanh cho hội thoại
  function toggleTagForActiveChat(tagId: string) {
    setChats((current) =>
      current.map((chat, idx) => {
        if (idx !== activeChat) return chat
        const currentTags = chat.tags || []
        const hasTag = currentTags.includes(tagId)
        const updated = hasTag ? currentTags.filter((t) => t !== tagId) : [...currentTags, tagId]
        return { ...chat, tags: updated }
      }),
    )
    setTagDropdownOpen(false)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white text-slate-800 antialiased font-sans">
      {/* ===================== THANH SUBHEADER CHUYÊN NGHIỆP ===================== */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 select-none">
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow-xs">
            L
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm">L'AURA CLOSET</span>
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[12px] font-semibold text-blue-700 border border-blue-200">
                Pancake Smart Inbox
              </span>
            </div>
          </div>
        </div>

        {/* Thông tin ca trực & tiện ích */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NV: <strong>Nguyễn Vy</strong> (Ca cao điểm 20h–22h)</span>
          </div>

          <button
            type="button"
            onClick={() => setShowRightPanel((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
              showRightPanel
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M15 3v18" />
            </svg>
            <span>{showRightPanel ? "Thu gọn Tiện ích" : "Mở Tiện ích Bán hàng"}</span>
          </button>
        </div>
      </header>

      {/* ===================== BỐ CỤC 3 CỘT HIỆN ĐẠI (3-COLUMN LAYOUT) ===================== */}
      <div className="grid h-[calc(100%-48px)] w-full overflow-hidden" style={{
        gridTemplateColumns: showRightPanel ? "310px minmax(420px, 1fr) 350px" : "320px minmax(500px, 1fr)"
      }}>
        {/* ========================================================================= */}
        {/* CỘT 1: HỘI THOẠI & BỘ LỌC (310px)                                         */}
        {/* ========================================================================= */}
        <section className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
          {/* 3 Tab Nghiệp vụ: Cần trả lời, Chờ khách, Tạm hoãn */}
          <nav aria-label="Trạng thái hội thoại" className="flex border-b border-slate-200 bg-slate-50/60 p-1.5 gap-1">
            {[
              { id: "Cần trả lời", label: "Cần trả lời", count: conversationCounts.needsReply, color: "text-rose-600" },
              { id: "Chờ khách", label: "Chờ khách", count: conversationCounts.waiting, color: "text-slate-600" },
              { id: "Tạm hoãn", label: "Tạm hoãn", count: conversationCounts.snoozed, color: "text-amber-600" },
            ].map((tab) => {
              const isActive = activeNav === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveNav(tab.id)
                    setMoreMenuOpen(false)
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/70"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[11px] font-bold ${
                      isActive
                        ? tab.id === "Cần trả lời" && tab.count > 0
                          ? "bg-rose-500 text-white"
                          : "bg-slate-800 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Ô Tìm kiếm & Lọc Tag */}
          <div className="border-b border-slate-200 p-2.5 space-y-2 bg-white">
            <div className="relative flex items-center">
              <svg className="pointer-events-none absolute left-3 size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm khách hàng, mã sản phẩm..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            {/* Thanh Filter Thẻ màu nghiệp vụ kiểu Pancake */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[12px]">
              {sampleTags.map((tag) => {
                const isSelected = selectedTag === tag.id
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedTag(tag.id)}
                    className={`shrink-0 rounded-md px-2 py-0.5 font-medium transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white font-semibold shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60"
                    }`}
                  >
                    {tag.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tiêu đề danh sách & số lượng */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/50 text-[12px] text-slate-500 font-medium">
            <span>
              {activeStatus === "needsReply" ? "⚡ Ưu tiên ca đến hạn" : activeStatus === "waiting" ? "⏳ Đang chờ khách phản hồi" : "⏸ Ca đang hẹn giờ"}
            </span>
            <span>{visibleChats.length} hội thoại</span>
          </div>

          {/* Danh sách thẻ hội thoại */}
          <div className="min-h-0 flex-1 overflow-y-auto p-1.5 space-y-1">
            {visibleChats.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Không tìm thấy hội thoại phù hợp
              </div>
            ) : (
              visibleChats.map((chat) => {
                const index = chats.indexOf(chat)
                const isActive = activeChat === index
                const isReturned = Boolean(chat.returnedNote)

                return (
                  <button
                    type="button"
                    key={chat.id}
                    onClick={() => {
                      setActiveChat(index)
                      setChats((current) =>
                        current.map((item, itemIdx) =>
                          itemIdx === index ? { ...item, unread: false } : item,
                        ),
                      )
                    }}
                    className={`group relative flex w-full text-left rounded-xl p-2.5 transition-all border ${
                      isActive
                        ? "bg-blue-50/70 border-blue-400 shadow-xs"
                        : isReturned
                          ? "bg-amber-50/60 border-amber-400 hover:bg-amber-50 shadow-2xs"
                          : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    {/* Viền cảnh báo cam khi đến hạn quay về */}
                    {isReturned && (
                      <div className="absolute -left-0.5 top-2.5 bottom-2.5 w-1 rounded-r bg-amber-500" />
                    )}

                    {/* Avatar */}
                    <div className="relative mr-2.5 shrink-0">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="size-10 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-blue-600 ring-2 ring-white flex items-center justify-center">
                        <svg className="size-2 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.5 5.43 3.84 7.08L5 22l4.16-1.39C10.05 20.85 11 21 12 21c5.52 0 10-4.03 10-9s-4.48-9-10-9z"/>
                        </svg>
                      </span>
                    </div>

                    {/* Nội dung tóm tắt */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`truncate text-sm font-semibold ${isActive ? "text-blue-900" : "text-slate-900"}`}>
                          {chat.name}
                        </span>
                        <span className="shrink-0 text-[11px] font-medium text-slate-400">
                          {chat.time}
                        </span>
                      </div>

                      {/* Snippet tin nhắn */}
                      <p className={`mt-0.5 line-clamp-1 text-xs ${chat.unread ? "font-semibold text-slate-900" : "text-slate-500"}`}>
                        {chat.snippet}
                      </p>

                      {/* Tag trạng thái & Cảnh báo đến hạn */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow-2xs animate-pulse">
                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span>Đến hạn nhắc việc!</span>
                          </span>
                        ) : chat.status === "snoozed" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
                            <span>⏸ Còn {remaining(chat)}</span>
                          </span>
                        ) : null}

                        {/* Thẻ tag nghiệp vụ (Tags) */}
                        {chat.tags?.map((tId) => {
                          const tagDef = sampleTags.find((t) => t.id === tId)
                          if (!tagDef || tId === "all") return null
                          return (
                            <span
                              key={tId}
                              className={`rounded px-1.5 py-0.2 text-[11px] font-semibold border ${tagDef.bg} ${tagDef.color} ${tagDef.border}`}
                            >
                              {tagDef.label}
                            </span>
                          )
                        })}

                        {chat.productTag && (
                          <span className="truncate rounded bg-slate-100 px-1.5 py-0.2 text-[11px] font-medium text-slate-600">
                            {chat.productTag}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CỘT 2: KHUNG CHAT TƯ VẤN TẬP TRUNG (Flex 1)                                */}
        {/* ========================================================================= */}
        <main className="flex min-h-0 flex-col bg-slate-50/50">
          {/* Header cuộc trò chuyện */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
            <div className="flex items-center gap-3">
              <img
                src={currentCustomer?.avatar}
                alt={currentCustomer?.name}
                className="size-9 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">{currentCustomer?.name}</h2>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    Online
                  </span>
                  {currentCustomer?.customerHeightWeight && (
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-200">
                      Số đo: {currentCustomer.customerHeightWeight}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Kênh: Facebook Messenger · {currentCustomer?.productTag || "Quan tâm sản phẩm thời trang"}
                </p>
              </div>
            </div>

            {/* Action buttons header */}
            <div className="flex items-center gap-2">
              {/* Nút gán Tag */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTagDropdownOpen((v) => !v)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <svg className="size-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z" />
                  </svg>
                  <span>Gán nhãn</span>
                </button>
                {tagDropdownOpen && (
                  <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg text-xs">
                    <div className="px-2 py-1 font-semibold text-slate-400 text-[11px] uppercase">Chọn thẻ nghiệp vụ</div>
                    {sampleTags.filter((t) => t.id !== "all").map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTagForActiveChat(tag.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left font-medium hover:bg-slate-50 ${
                          currentCustomer?.tags?.includes(tag.id) ? "font-bold text-blue-600 bg-blue-50/50" : "text-slate-700"
                        }`}
                      >
                        <span>{tag.label}</span>
                        {currentCustomer?.tags?.includes(tag.id) && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Nút Tạm hoãn có hẹn giờ */}
              <button
                type="button"
                onClick={() => setSnoozeOpen(true)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  currentCustomer?.status === "snoozed"
                    ? "bg-amber-600 text-white hover:bg-amber-700 shadow-2xs"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M10 15V9M14 15V9" />
                </svg>
                <span>
                  {currentCustomer?.status === "snoozed"
                    ? `Đang hoãn (${remaining(currentCustomer)})`
                    : "Tạm hoãn"}
                </span>
              </button>

              {/* Thêm tùy chọn menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen((v) => !v)}
                  className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
                {moreMenuOpen && (
                  <div className="absolute right-0 top-full z-30 mt-1 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl text-xs">
                    <button
                      type="button"
                      onClick={() => handleCustomerReply(activeChat)}
                      className="w-full rounded-lg px-3 py-2 text-left font-medium text-blue-700 hover:bg-blue-50"
                    >
                      💬 Giả lập: Khách nhắn thêm
                    </button>
                    {currentCustomer?.status === "snoozed" && (
                      <button
                        type="button"
                        onClick={triggerExpireSnoozeImmediately}
                        className="w-full rounded-lg px-3 py-2 text-left font-semibold text-amber-700 hover:bg-amber-50"
                      >
                        ⚡ Giả lập: Hết giờ ngay
                      </button>
                    )}
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setSimulateOffline((v) => !v)
                        setMoreMenuOpen(false)
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-amber-800 hover:bg-amber-50"
                    >
                      <span>Giả lập mất mạng khi gửi</span>
                      <span className={`size-2 rounded-full ${simulateOffline ? "bg-amber-500" : "bg-slate-300"}`} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Vùng Tin nhắn Cuộn */}
          <div aria-label="Lịch sử hội thoại" className="min-h-0 flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Banner Hệ thống nhắc việc khi hết hạn tạm hoãn */}
            {currentCustomer?.returnedNote && (
              <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50/95 p-3.5 shadow-xs backdrop-blur-xs">
                <div className="flex items-center gap-2.5 text-xs text-amber-900">
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-amber-500 text-white font-bold">
                    ⏰
                  </div>
                  <div>
                    <span className="font-bold">Đến hạn nhắc việc quay lại!</span> Ghi chú lúc hoãn:{" "}
                    <span className="font-semibold text-amber-950">"{currentCustomer.returnedNote}"</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setChats((curr) =>
                      curr.map((c, idx) =>
                        idx === activeChat ? { ...c, returnedNote: undefined } : c,
                      ),
                    )
                  }}
                  className="rounded-lg bg-amber-200/70 px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-300 transition-all"
                >
                  Đã rõ
                </button>
              </div>
            )}

            {/* Banner Ghi chú nội bộ (Internal Note) - Học hỏi từ Pancake */}
            {currentCustomer?.internalNote && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
                <span className="font-bold text-amber-700">📌 Ghi chú ca trực:</span>
                <span className="flex-1">{currentCustomer.internalNote}</span>
              </div>
            )}

            {/* Dòng mốc thời gian */}
            <div className="flex items-center gap-3 my-2">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[12px] font-medium text-slate-400">Hội thoại tư vấn hôm nay</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Danh sách bong bóng tin nhắn */}
            {histories[activeChat]?.map((entry: HistoryMessage, index: number) => {
              const isShop = entry.from === "shop"

              // Nếu là Card Đơn hàng POS
              if (entry.isOrderCard && entry.orderInfo) {
                return (
                  <div key={index} className="flex justify-end mb-3">
                    <div className="w-full max-w-md rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 shadow-sm text-xs">
                      <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5 mb-2.5">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-sm">
                          <span>📦</span> ĐƠN HÀNG #{entry.orderInfo.orderId}
                        </span>
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
                          Đã xác nhận
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-700 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Sản phẩm:</span>
                          <span className="font-semibold text-slate-900">{entry.orderInfo.productName} ({entry.orderInfo.variant})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tiền hàng:</span>
                          <span className="font-semibold text-slate-900">{entry.orderInfo.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Phí vận chuyển:</span>
                          <span className="font-semibold text-slate-900">{entry.orderInfo.shipping}</span>
                        </div>
                        <div className="flex justify-between border-t border-emerald-200/80 pt-1.5 font-bold text-sm text-emerald-950">
                          <span>Tổng thu (COD):</span>
                          <span className="text-blue-700">{entry.orderInfo.total}</span>
                        </div>
                        <div className="pt-1.5 text-[11px] text-slate-500">
                          Giao đến: {entry.orderInfo.phone} · {entry.orderInfo.address}
                        </div>
                      </div>
                      <div className="mt-2.5 text-right text-[11px] text-emerald-700">
                        {entry.time} · Đã gửi biên lai cho khách
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={index}
                  className={`flex max-w-[82%] items-end gap-2.5 ${isShop ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  {!isShop && (
                    <img
                      src={currentCustomer?.avatar}
                      alt={currentCustomer?.name}
                      className="size-7 rounded-full object-cover ring-1 ring-slate-200 mb-1"
                    />
                  )}
                  <div className="min-w-0">
                    <div
                      className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-2xs ${
                        isShop
                          ? "rounded-br-xs bg-blue-600 text-white"
                          : "rounded-bl-xs border border-slate-200/90 bg-white text-slate-800"
                      }`}
                    >
                      {entry.image && (
                        <img
                          src={entry.image}
                          alt="Ảnh đính kèm"
                          className="mb-2 max-h-60 rounded-xl object-cover"
                        />
                      )}
                      <p>{entry.text}</p>
                    </div>
                    <div className={`mt-1 text-[11px] text-slate-400 ${isShop ? "text-right" : ""}`}>
                      {entry.time} · {isShop ? "Đã gửi" : currentCustomer?.name}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={historyEndRef} />
          </div>

          {/* ===================== KHUNG NHẬP LIỆU & TIN MẪU 1 CHẠM ===================== */}
          <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-3 space-y-2.5">
            {/* Thanh Gợi ý Tin nhắn Mẫu (Quick Replies Bar - Pancake Style) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
              <span className="shrink-0 font-semibold text-slate-400 text-[11px] uppercase mr-1">
                ⚡ Tin mẫu:
              </span>
              {sampleQuickReplies.map((qr) => (
                <button
                  key={qr.id}
                  type="button"
                  onClick={() => insertQuickReply(qr)}
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700 transition-all font-medium"
                  title={qr.content}
                >
                  {qr.title}
                </button>
              ))}

              {/* Nút Auto-fill tạo đơn nhanh nếu khách có SĐT */}
              {currentCustomer?.customerPhone && (
                <button
                  type="button"
                  onClick={handleAutoFillFromChat}
                  className="shrink-0 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-emerald-800 font-semibold hover:bg-emerald-100 transition-all"
                >
                  ✨ Bắt SĐT tạo đơn POS
                </button>
              )}
            </div>

            {/* Hiển thị ảnh đính kèm nếu có */}
            {attachment && (
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
                <img src={attachment.url} alt="Ảnh đính kèm" className="size-10 rounded-lg object-cover" />
                <span className="font-medium text-slate-700">{attachment.name}</span>
                <button
                  type="button"
                  className="text-slate-400 hover:text-rose-600 underline text-xs ml-auto"
                  onClick={() => setAttachments((prev) => ({ ...prev, [activeChat]: undefined }))}
                >
                  Xóa ảnh
                </button>
              </div>
            )}

            {/* Banner Lỗi mạng */}
            {sendError && (
              <div className="flex items-center justify-between rounded-lg bg-rose-50 px-3.5 py-2 text-xs text-rose-700 border border-rose-200">
                <span>⚠️ Chưa gửi được do mất kết nối mạng. Tin nhắn đã soạn được giữ nguyên.</span>
                <button
                  type="button"
                  className="font-bold underline hover:text-rose-900"
                  onClick={() => {
                    setSimulateOffline(false)
                    setSendError(false)
                    handleSendMessage()
                  }}
                >
                  Thử lại ngay
                </button>
              </div>
            )}

            {/* Form Soạn tin */}
            <form onSubmit={handleSendMessage} className="flex w-full items-end gap-2.5">
              <div className="flex-1 rounded-xl border border-slate-300 bg-white p-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Soạn nội dung tư vấn báo giá, size, màu sắc... (Gõ /size, /stk hoặc bấm tin mẫu ở trên)"
                  rows={2}
                  className="block w-full resize-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 leading-relaxed"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5">
                  <label className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
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
                            [activeChat]: { name: file.name, url: String(reader.result) },
                          }))
                        }
                        reader.readAsDataURL(file)
                        e.target.value = ""
                      }}
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Enter để gửi · Shift+Enter xuống dòng
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!message.trim() && !attachment}
                className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
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

        {/* ========================================================================= */}
        {/* CỘT 3: BÀN LÀM VIỆC NGHIỆP VỤ (350px) - TỒN KHO, TẠO ĐƠN POS, NHẮC VIỆC     */}
        {/* ========================================================================= */}
        {showRightPanel && (
          <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-white">
            {/* 3 Tab Tiện ích */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1">
              {[
                { id: "inventory", label: "📦 Kho & Size" },
                { id: "pos", label: "⚡ Tạo đơn POS" },
                { id: "snooze", label: "⏱ Hẹn nhắc việc" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setUtilityTab(t.id as any)}
                  className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-all ${
                    utilityTab === t.id
                      ? "bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* NỘI DUNG TAB 1: TRA CỨU TỒN KHO & BẢNG SIZE */}
            {utilityTab === "inventory" && (
              <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 text-xs block mb-1.5">
                    Tra cứu sản phẩm tại kho:
                  </label>
                  <div className="relative">
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Nhập mã SP: VD01, SM03, QJ02..."
                      className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50/80 px-3 text-xs outline-none focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Danh sách nhanh gợi ý sản phẩm */}
                <div className="flex flex-wrap gap-1">
                  {sampleProducts.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setSelectedProduct(p)}
                      className={`rounded px-2 py-1 text-[11px] font-semibold border transition-all ${
                        selectedProduct.code === p.code
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {p.code}
                    </button>
                  ))}
                </div>

                {/* Chi tiết Sản phẩm đang chọn */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
                  <div className="flex gap-3">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="size-16 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-blue-700 text-xs">[{selectedProduct.code}]</span>
                      <h4 className="font-semibold text-slate-900 text-xs leading-snug line-clamp-2">
                        {selectedProduct.name}
                      </h4>
                      <p className="mt-1 font-bold text-slate-900 text-sm">{selectedProduct.priceFormatted}</p>
                    </div>
                  </div>

                  {/* Ma trận Tồn kho chi tiết theo Size & Màu */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                      <span>Phân loại Size & Màu</span>
                      <span>Tồn kho</span>
                    </div>
                    <div className="divide-y divide-slate-200/80 border border-slate-200 rounded-lg bg-white overflow-hidden">
                      {selectedProduct.variants.map((v, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 text-xs">
                          <span className="font-medium text-slate-800">
                            {v.color} · Size {v.size}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                v.stock > 5
                                  ? "text-emerald-600"
                                  : v.stock > 0
                                    ? "text-amber-600"
                                    : "text-rose-600"
                              }`}
                            >
                              {v.stock > 0 ? `Còn ${v.stock}` : "Hết hàng"}
                            </span>
                            <button
                              type="button"
                              onClick={() => insertInventoryInfo(selectedProduct, `${v.color} - Size ${v.size}`, v.stock)}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-blue-100 hover:text-blue-700"
                              title="Chèn thông tin tồn kho vào khung chat"
                            >
                              + Chèn
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nút thao tác nhanh */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOrderSelectedProduct(selectedProduct.code)
                        setUtilityTab("pos")
                      }}
                      className="flex-1 rounded-lg bg-blue-600 py-2 text-center text-xs font-bold text-white hover:bg-blue-700 shadow-2xs"
                    >
                      Chọn sản phẩm này tạo đơn
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* NỘI DUNG TAB 2: TẠO ĐƠN HÀNG NHANH (PANCAKE POS) */}
            {utilityTab === "pos" && (
              <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {orderSuccessMsg && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 font-semibold animate-pulse">
                    {orderSuccessMsg}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Thông tin đơn hàng POS</span>
                  <button
                    type="button"
                    onClick={handleAutoFillFromChat}
                    className="text-blue-600 hover:underline text-[11px] font-medium"
                  >
                    ✨ Lấy lại từ chat
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Họ tên khách nhận hàng:
                    </label>
                    <input
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder="Nguyễn Thị Minh Trang"
                      className="h-8.5 w-full rounded-lg border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Số điện thoại giao hàng:
                    </label>
                    <input
                      value={orderPhone}
                      onChange={(e) => setOrderPhone(e.target.value)}
                      placeholder="0912345678"
                      className="h-8.5 w-full rounded-lg border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Địa chỉ nhận hàng chi tiết:
                    </label>
                    <input
                      value={orderAddress}
                      onChange={(e) => setOrderAddress(e.target.value)}
                      placeholder="Số 123 Cầu Giấy, Quan Hoa, Hà Nội"
                      className="h-8.5 w-full rounded-lg border border-slate-300 px-2.5 text-xs outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Chọn sản phẩm chốt */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Mã sản phẩm:</label>
                      <select
                        value={orderSelectedProduct}
                        onChange={(e) => setOrderSelectedProduct(e.target.value)}
                        className="h-8.5 w-full rounded-lg border border-slate-300 px-2 text-xs outline-none bg-white font-medium"
                      >
                        {sampleProducts.map((p) => (
                          <option key={p.code} value={p.code}>{p.code} - {p.name.slice(0, 16)}...</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Màu & Size:</label>
                      <select
                        value={orderSelectedVariant}
                        onChange={(e) => setOrderSelectedVariant(e.target.value)}
                        className="h-8.5 w-full rounded-lg border border-slate-300 px-2 text-xs outline-none bg-white font-medium"
                      >
                        <option value="Trắng · S">Trắng · S</option>
                        <option value="Trắng · M">Trắng · M</option>
                        <option value="Trắng · L">Trắng · L</option>
                        <option value="Đen · M">Đen · M</option>
                        <option value="Be hoa nhí · M">Be hoa nhí · M</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Số lượng:</label>
                      <input
                        type="number"
                        min={1}
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Number(e.target.value))}
                        className="h-8.5 w-full rounded-lg border border-slate-300 px-2.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phí vận chuyển:</label>
                      <select
                        value={orderShipping}
                        onChange={(e) => setOrderShipping(Number(e.target.value))}
                        className="h-8.5 w-full rounded-lg border border-slate-300 px-2 text-xs outline-none bg-white font-medium"
                      >
                        <option value={25000}>Tiêu chuẩn: 25.000đ</option>
                        <option value={0}>Miễn phí ship (0đ)</option>
                        <option value={35000}>Hỏa tốc: 35.000đ</option>
                      </select>
                    </div>
                  </div>

                  {/* Tóm tắt tiền */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Đơn giá:</span>
                      <span>
                        {(sampleProducts.find((p) => p.code === orderSelectedProduct)?.price || 350000).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tiền hàng ({orderQuantity} SP):</span>
                      <span>
                        {((sampleProducts.find((p) => p.code === orderSelectedProduct)?.price || 350000) * orderQuantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Phí ship:</span>
                      <span>{orderShipping.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-sm text-slate-900">
                      <span>Tổng thanh toán:</span>
                      <span className="text-blue-700">
                        {(
                          (sampleProducts.find((p) => p.code === orderSelectedProduct)?.price || 350000) * orderQuantity +
                          orderShipping
                        ).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmCreateOrder}
                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    Xác nhận Tạo đơn & Gửi hoá đơn
                  </button>
                </div>
              </div>
            )}

            {/* NỘI DUNG TAB 3: HẸN GIỜ NHẮC VIỆC (SNOOZE & TASKS) */}
            {utilityTab === "snooze" && (
              <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Hẹn giờ nhắc quay lại</h4>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Tạm gác hội thoại khi cần kiểm tra kho hoặc việc chen ngang. Hệ thống sẽ tự động nhắc lại khi hết hạn.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Chọn thời gian hẹn giờ:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["3 phút", "5 phút", "10 phút", "15 phút"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSnoozeDelay(m)}
                          className={`rounded-lg py-2 font-semibold text-xs border transition-all ${
                            snoozeDelay === m
                              ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Ghi chú việc cần xử lý tiếp:
                    </label>
                    <input
                      value={snoozeNote}
                      onChange={(e) => setSnoozeNote(e.target.value)}
                      placeholder="VD: Kiểm tra kho tổng mẫu AT02 đen size XL..."
                      className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-amber-600"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => confirmSnooze(snoozeDelay, snoozeNote)}
                    className="w-full rounded-xl bg-amber-600 py-2.5 text-center text-xs font-bold text-white shadow-xs hover:bg-amber-700 active:scale-95 transition-all"
                  >
                    Bắt đầu Hẹn giờ ({snoozeDelay})
                  </button>

                  {/* Nút test nhanh */}
                  <div className="border-t border-slate-200 pt-3">
                    <span className="font-semibold text-slate-400 text-[11px] uppercase block mb-1.5">
                      Công cụ giả lập kiểm thử:
                    </span>
                    <button
                      type="button"
                      onClick={triggerExpireSnoozeImmediately}
                      className="w-full rounded-lg border border-amber-300 bg-amber-50 py-2 text-center text-xs font-bold text-amber-800 hover:bg-amber-100 transition-all"
                    >
                      ⚡ Giả lập: Hết hạn hẹn giờ ngay bây giờ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ===================== MODAL TẠM HOÃN NHANH (Pop-up V2) ===================== */}
      {snoozeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-amber-100 text-amber-800 font-bold">
                  ⏱
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Tạm hoãn cuộc hội thoại</h3>
              </div>
              <button
                type="button"
                onClick={() => setSnoozeOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <p className="text-slate-500">
                Cuộc chat sẽ tạm chuyển sang tab <strong>Tạm hoãn</strong>. Khi hết hạn, hệ thống sẽ tự động đưa về vị trí số 1 của tab <strong>Cần trả lời</strong> với viền cam nổi bật.
              </p>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Mốc thời gian tra cứu:</label>
                <div className="grid grid-cols-2 gap-2">
                  {["3 phút", "5 phút"].map((delay) => (
                    <button
                      key={delay}
                      type="button"
                      onClick={() => setSnoozeDelay(delay)}
                      className={`rounded-xl py-2 text-xs font-bold border transition-all ${
                        snoozeDelay === delay
                          ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {delay} (Phổ biến)
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Ghi chú nhanh ngữ cảnh (Nhấn Enter để xác nhận):
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
                  placeholder="VD: Kiểm tra màu trắng size M tại kho 2..."
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100 transition-all"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSnoozeOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => confirmSnooze()}
                  className="flex-1 rounded-xl bg-amber-600 py-2.5 font-bold text-white hover:bg-amber-700 shadow-xs active:scale-95 transition-all"
                >
                  Xác nhận hoãn ({snoozeDelay})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
