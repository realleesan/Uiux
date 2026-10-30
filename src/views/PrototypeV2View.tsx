import React, { FormEvent, useEffect, useRef, useState } from "react"
import ChatArea from "../components/workspace/ChatArea"
import ConversationList from "../components/workspace/ConversationList"
import SideUtilityPanel from "../components/workspace/SideUtilityPanel"
import SnoozeModal from "../components/workspace/SnoozeModal"
import WorkspaceHeader from "../components/workspace/WorkspaceHeader"
import { sampleChats, sampleHistories, sampleProducts, sampleQuickReplies, sampleTags } from "../data/initialChats"
import { Chat, ChatStatus, HistoryMessage, ProductItem, QuickReply } from "../types/chat"

export default function PrototypeV2View() {
  const [chats, setChats] = useState<Chat[]>(sampleChats)
  const [histories, setHistories] = useState<HistoryMessage[][]>(sampleHistories)
  const [activeNav, setActiveNav] = useState("all")
  const [activeChat, setActiveChat] = useState(0)
  const [search, setSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState("all")

  // Draft tin nhắn
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const message = drafts[activeChat] ?? ""
  const setMessage = (val: string) =>
    setDrafts((prev) => ({ ...prev, [activeChat]: val }))

  const [attachments, setAttachments] = useState<
    Record<number, { name: string; url: string } | undefined>
  >({})
  const attachment = attachments[activeChat]

  // Cột 3 Tiện ích
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [utilityTab, setUtilityTab] = useState<"inventory" | "pos" | "snooze">("inventory")

  // Kho hàng & Sản phẩm
  const [productSearch, setProductSearch] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<ProductItem>(sampleProducts[0])

  // Form tạo đơn POS
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

  const [now, setNow] = useState(Date.now())
  const [sendError, setSendError] = useState(false)
  const [simulateOffline, setSimulateOffline] = useState(false)
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)

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
    setTagDropdownOpen(false)
  }, [activeChat])

  // Cuộn đáy khi có tin nhắn mới
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [histories, activeChat])

  // Timer đếm ngược 1s
  useEffect(() => {
    const timer = window.setInterval(() => {
      const time = Date.now()
      setNow(time)
      setChats((current) =>
        current.map((chat) =>
          chat.status === "snoozed" && chat.snoozeUntil && chat.snoozeUntil <= time
            ? {
                ...chat,
                status: "needsReply",
                snoozeUntil: undefined,
                snoozeDelay: undefined,
                returnedNote: chat.snoozeNote || "Đã hết hạn tạm hoãn! Kiểm tra kho và phản hồi khách.",
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
    const seconds = Math.max(0, Math.ceil(((chat.snoozeUntil ?? now) - now) / 1000))
    return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0")
  }

  // Xác nhận tạm hoãn
  function handleConfirmSnooze(customDelay?: string, customNote?: string) {
    const delayToUse = customDelay || snoozeDelay || "3 phút"
    const noteToUse = customNote !== undefined ? customNote : snoozeNote
    const delayMs = delayToUse === "5 phút" ? 300000 : 180000

    setChats((current) =>
      current.map((chat, index) =>
        index === activeChat
          ? {
              ...chat,
              status: "snoozed",
              snoozeDelay: delayToUse,
              snoozeUntil: Date.now() + delayMs,
              snoozeNote: noteToUse.trim() || "Kiểm tra kho/size cho khách",
              returnedNote: undefined,
              unread: false,
            }
          : chat,
      ),
    )
    setSnoozeOpen(false)
    const next = visibleChats.find((chat) => chats.indexOf(chat) !== activeChat)
    if (next) setActiveChat(chats.indexOf(next))
  }

  // Kích hoạt hết giờ ngay (Test demo)
  function handleTriggerExpireSnooze() {
    setChats((current) =>
      current.map((chat, idx) =>
        idx === activeChat && chat.status === "snoozed"
          ? {
              ...chat,
              status: "needsReply",
              snoozeUntil: undefined,
              snoozeDelay: undefined,
              returnedNote: chat.snoozeNote || "Kho xác nhận còn size M màu trắng",
              updatedAt: Date.now(),
              unread: true,
            }
          : chat,
      ),
    )
  }

  // Đếm hội thoại theo 4 tab chuẩn hệ thống lớn: Tất cả, Chưa đọc, Cần xử lý, Tạm hoãn
  const conversationCounts = {
    all: chats.length,
    unread: chats.filter((c) => Boolean(c.unread)).length,
    needsReply: chats.filter((c) => c.status === "needsReply").length,
    snoozed: chats.filter((c) => c.status === "snoozed").length,
  }

  const visibleChats = chats
    .filter((chat) => {
      let matchNav = true
      if (activeNav === "unread") matchNav = Boolean(chat.unread)
      else if (activeNav === "needsReply") matchNav = chat.status === "needsReply"
      else if (activeNav === "snoozed") matchNav = chat.status === "snoozed"

      const matchSearch = `${chat.name} ${chat.snippet} ${chat.productTag || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchTag =
        selectedTag === "all" || (chat.tags && chat.tags.includes(selectedTag))
      return matchNav && matchSearch && matchTag
    })
    .sort((a, b) => {
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

    setHistories((prev) => {
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
          text: "Shop gửi bạn ảnh mẫu tham khảo nhé ạ!",
          time: nowTime,
          image: attachment.url,
        })
      }
      next[activeChat] = currentList
      return next
    })

    const wasNeedsReply = currentCustomer?.status === "needsReply"
    const nextChatInList = visibleChats.find((chat) => chats.indexOf(chat) !== activeChat)
    const nextNeedsReply = nextChatInList ? chats.indexOf(nextChatInList) : -1

    setChats((current) =>
      current.map((chat, index) =>
        index === activeChat
          ? {
              ...chat,
              snippet: textToSend || "Shop đã gửi ảnh mẫu",
              snoozeUntil: undefined,
              time: nowTime,
              updatedAt: Date.now(),
              status: "waiting", // Tự chuyển Chờ khách
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

    if (activeNav === "needsReply" && nextNeedsReply >= 0) {
      setActiveChat(nextNeedsReply)
    }
  }

  // Chèn thông tin tồn kho vào chat
  function handleInsertInventoryInfo(prod: ProductItem, variantText: string, stock: number) {
    const text = `Dạ mẫu ${prod.code} (${prod.name}) màu ${variantText} bên shop hiện còn ${stock} sản phẩm sẵn tại kho ạ. Bạn chốt sớm để shop giữ hàng cho mình nhé! ✨`
    setMessage(text)
  }

  // Tự động nhận diện điền form POS
  function handleAutoFillPOS() {
    if (currentCustomer) {
      setOrderName(currentCustomer.name)
      setOrderPhone(currentCustomer.customerPhone || "0912345678")
      setOrderAddress(currentCustomer.customerAddress || "123 Cầu Giấy, Hà Nội")
      setUtilityTab("pos")
    }
  }

  // Xác nhận tạo đơn hàng POS
  function handleConfirmOrder() {
    if (!orderName || !orderPhone) {
      alert("Vui lòng nhập tên khách và số điện thoại!")
      return
    }

    const matchedProd = sampleProducts.find((p) => p.code === orderSelectedProduct) || sampleProducts[0]
    const subtotal = matchedProd.price * orderQuantity
    const total = subtotal + orderShipping
    const orderId = `DH-${Math.floor(1000 + Math.random() * 9000)}`
    const nowTime = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })

    setHistories((prev) => {
      const next = [...prev]
      const currentList = next[activeChat] ? [...next[activeChat]] : []
      currentList.push({
        from: "shop",
        text: `ĐÃ TẠO ĐƠN HÀNG THÀNH CÔNG #${orderId}\nSản phẩm: ${matchedProd.name} (${orderSelectedVariant}) x${orderQuantity}\nTổng thanh toán: ${total.toLocaleString("vi-VN")}đ (Đã gồm ship)\nNgười nhận: ${orderName} - ${orderPhone}\nĐịa chỉ: ${orderAddress || "Nhận tại cửa hàng"}`,
        time: nowTime,
        isOrderCard: true,
        orderInfo: {
          orderId,
          productName: matchedProd.name,
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

    setChats((current) =>
      current.map((chat, idx) =>
        idx === activeChat
          ? {
              ...chat,
              tags: Array.from(new Set([...(chat.tags || []), "chotDon"])),
              orderCreated: true,
              snippet: `Đã tạo đơn #${orderId}: ${total.toLocaleString("vi-VN")}đ`,
              status: "waiting",
              updatedAt: Date.now(),
            }
          : chat,
      ),
    )

    setOrderSuccessMsg(`Đã tạo thành công đơn hàng #${orderId}!`)
    setTimeout(() => setOrderSuccessMsg(""), 4000)
  }

  // Khách nhắn thêm
  function handleCustomerReply() {
    const replyText = "Dạ mình đã cân nhắc xong, shop tư vấn chốt đơn cho mình nhé!"
    setHistories((prev) => {
      const next = [...prev]
      const currentList = next[activeChat] ? [...next[activeChat]] : []
      currentList.push({
        from: "customer",
        text: replyText,
        time: "Vừa xong",
      })
      next[activeChat] = currentList
      return next
    })

    setChats((current) =>
      current.map((chat, idx) =>
        idx === activeChat
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
  }

  // Gán nhãn/Tag
  function handleToggleTag(tagId: string) {
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
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50 font-sans antialiased text-slate-800">
      {/* 1. Header Shop & Trạng thái */}
      <WorkspaceHeader
        employeeName="Nguyễn Vy"
        showRightPanel={showRightPanel}
        onToggleRightPanel={() => setShowRightPanel((prev) => !prev)}
      />

      {/* 2. Bố cục 3 Cột Hiện đại & Cân đối */}
      <div
        className="grid h-[calc(100%-48px)] w-full overflow-hidden"
        style={{
          gridTemplateColumns: showRightPanel ? "320px minmax(420px, 1fr) 340px" : "320px minmax(500px, 1fr)",
        }}
      >
        {/* CỘT 1: Danh sách hội thoại */}
        <ConversationList
          chats={chats}
          visibleChats={visibleChats}
          activeNav={activeNav}
          activeChat={activeChat}
          search={search}
          selectedTag={selectedTag}
          tags={sampleTags}
          conversationCounts={conversationCounts}
          now={now}
          onSelectNav={setActiveNav}
          onSelectChat={setActiveChat}
          onSearchChange={setSearch}
          onSelectTag={setSelectedTag}
        />

        {/* CỘT 2: Khung Chat tương tác */}
        <ChatArea
          customer={currentCustomer}
          history={histories[activeChat] || []}
          message={message}
          attachment={attachment}
          sendError={sendError}
          tagDropdownOpen={tagDropdownOpen}
          tags={sampleTags}
          quickReplies={sampleQuickReplies}
          remainingTimeText={currentCustomer ? remaining(currentCustomer) : ""}
          historyEndRef={historyEndRef}
          onMessageChange={setMessage}
          onSendMessage={handleSendMessage}
          onOpenSnooze={() => setSnoozeOpen(true)}
          onToggleTagDropdown={() => setTagDropdownOpen((v) => !v)}
          onToggleTag={handleToggleTag}
          onDismissReturnedNote={() => {
            setChats((curr) =>
              curr.map((c, idx) => (idx === activeChat ? { ...c, returnedNote: undefined } : c)),
            )
          }}
          onInsertQuickReply={(qr: QuickReply) => setMessage(qr.content)}
          onAutoFillPOS={handleAutoFillPOS}
          onAttachFile={(file) => {
            const reader = new FileReader()
            reader.onload = () => {
              setAttachments((prev) => ({
                ...prev,
                [activeChat]: { name: file.name, url: String(reader.result) },
              }))
            }
            reader.readAsDataURL(file)
          }}
          onRemoveAttachment={() => setAttachments((prev) => ({ ...prev, [activeChat]: undefined }))}
          onRetrySend={() => {
            setSimulateOffline(false)
            setSendError(false)
            handleSendMessage()
          }}
          onTriggerCustomerReply={handleCustomerReply}
          onTriggerExpireSnooze={handleTriggerExpireSnooze}
          simulateOffline={simulateOffline}
          onToggleSimulateOffline={() => setSimulateOffline((v) => !v)}
        />

        {/* CỘT 3: Tiện ích Bán hàng & Tồn kho */}
        {showRightPanel && (
          <SideUtilityPanel
            customer={currentCustomer}
            utilityTab={utilityTab}
            onSelectTab={setUtilityTab}
            products={sampleProducts}
            productSearch={productSearch}
            selectedProduct={selectedProduct}
            onProductSearchChange={setProductSearch}
            onSelectProduct={setSelectedProduct}
            onInsertInventoryInfo={handleInsertInventoryInfo}
            onChooseProductForOrder={(code) => {
              setOrderSelectedProduct(code)
              setUtilityTab("pos")
            }}
            orderName={orderName}
            orderPhone={orderPhone}
            orderAddress={orderAddress}
            orderSelectedProduct={orderSelectedProduct}
            orderSelectedVariant={orderSelectedVariant}
            orderQuantity={orderQuantity}
            orderShipping={orderShipping}
            orderSuccessMsg={orderSuccessMsg}
            onOrderNameChange={setOrderName}
            onOrderPhoneChange={setOrderPhone}
            onOrderAddressChange={setOrderAddress}
            onOrderProductChange={setOrderSelectedProduct}
            onOrderVariantChange={setOrderSelectedVariant}
            onOrderQuantityChange={setOrderQuantity}
            onOrderShippingChange={setOrderShipping}
            onAutoFillPOS={handleAutoFillPOS}
            onConfirmOrder={handleConfirmOrder}
            snoozeDelay={snoozeDelay}
            snoozeNote={snoozeNote}
            onSnoozeDelayChange={setSnoozeDelay}
            onSnoozeNoteChange={setSnoozeNote}
            onConfirmSnooze={() => handleConfirmSnooze()}
            onTriggerExpireSnooze={handleTriggerExpireSnooze}
          />
        )}
      </div>

      {/* Modal Tạm hoãn nhanh */}
      <SnoozeModal
        isOpen={snoozeOpen}
        snoozeDelay={snoozeDelay}
        snoozeNote={snoozeNote}
        onClose={() => setSnoozeOpen(false)}
        onDelayChange={setSnoozeDelay}
        onNoteChange={setSnoozeNote}
        onConfirm={() => handleConfirmSnooze()}
      />
    </div>
  )
}
