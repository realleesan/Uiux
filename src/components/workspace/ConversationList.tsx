import React, { useEffect, useState } from "react"
import { Chat, ChatTag } from "../../types/chat"
import { ClockIcon, MoreHorizontalIcon, SearchIcon, TrashIcon } from "./icons"
import { Avatar, CustomSelect, Tabs, Tag } from "./ui"

type ConversationListProps = {
  chats: Chat[]
  visibleChats: Chat[]
  activeNav: string
  activeChat: number
  search: string
  selectedTag: string
  tags: ChatTag[]
  conversationCounts?: {
    all: number
    unread: number
    needsReply: number
    waiting?: number
    snoozed: number
  }
  now: number
  onSelectNav: (tab: string) => void
  onSelectChat: (index: number) => void
  onSearchChange: (val: string) => void
  onSelectTag: (tagId: string) => void
  onDeleteConversation?: (index: number) => void
  onToggleUnread?: (index: number) => void
}

export default function ConversationList({
  chats,
  visibleChats,
  activeNav,
  activeChat,
  search,
  selectedTag,
  tags,
  now,
  onSelectNav,
  onSelectChat,
  onSearchChange,
  onSelectTag,
  onDeleteConversation,
  onToggleUnread,
}: ConversationListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [openTagTooltipId, setOpenTagTooltipId] = useState<string | null>(null)

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside() {
      setOpenMenuId(null)
      setOpenTagTooltipId(null)
    }
    window.addEventListener("click", handleClickOutside)
    return () => window.removeEventListener("click", handleClickOutside)
  }, [])

  function remainingTime(chat: Chat) {
    const seconds = Math.max(0, Math.ceil(((chat.snoozeUntil ?? now) - now) / 1000))
    return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0")
  }

  // 4 Tab chuẩn nghiệp vụ: Tất cả + 3 Trạng thái cốt lõi của đề tài
  const navItems = [
    { id: "all", label: "Tất cả" },
    { id: "needsReply", label: "Cần trả lời" },
    { id: "waiting", label: "Chờ khách" },
    { id: "snoozed", label: "Tạm hoãn" },
  ]

  return (
    <section className="flex min-h-0 flex-col border-r border-slate-200 bg-white select-none">
      {/* Tab bar phẳng, cuộn mượt nếu cần, bao phủ trọn vẹn cả 3 trạng thái của đề tài */}
      <Tabs
        items={navItems}
        value={activeNav}
        onChange={onSelectNav}
      />

      {/* Tìm kiếm & Dropdown lọc theo nhãn */}
      <div className="border-b border-slate-200 p-2 space-y-1.5 bg-white">
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-3 text-slate-400">
            <SearchIcon className="size-4" />
          </span>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm..."
            className="h-8.5 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-8.5 pr-3 type-body text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Dropdown Lọc nhãn: Custom Dropdown mượt mà */}
        <CustomSelect
          value={selectedTag}
          onChange={onSelectTag}
          options={[
            { value: "all", label: "Tất cả nhãn" },
            ...tags.map((tag) => ({ value: tag.id, label: tag.label })),
          ]}
        />
      </div>

      {/* Danh sách thẻ hội thoại */}
      <div className="min-h-0 flex-1 overflow-y-auto p-1.5 space-y-1">
        {visibleChats.length === 0 ? (
          <div className="p-8 text-center type-caption text-slate-400">
            Không có hội thoại trong mục này
          </div>
        ) : (
          visibleChats.map((chat) => {
            const index = chats.indexOf(chat)
            const isActive = activeChat === index
            const isReturned = Boolean(chat.returnedNote)

            // Lấy nhãn chính đầu tiên
            const primaryTagId = chat.tags?.[0]
            const primaryTag = primaryTagId ? tags.find((t) => t.id === primaryTagId) : null
            const extraTagsCount = chat.tags && chat.tags.length > 1 ? chat.tags.length - 1 : 0

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(index)}
                className={`group relative flex w-full cursor-pointer text-left rounded-lg p-2.5 transition-colors border ${
                  isActive
                    ? "bg-slate-100/90 border-slate-200 shadow-2xs"
                    : isReturned
                      ? "bg-amber-50/40 border-amber-200/60 hover:bg-amber-50/70"
                      : "bg-white border-transparent hover:bg-slate-50"
                }`}
              >
                {/* Avatar khách kèm huy hiệu kênh Messenger */}
                <div className="mr-2.5 shrink-0">
                  <Avatar src={chat.avatar} name={chat.name} size="lg" channel />
                </div>

                {/* Nội dung tóm tắt */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`truncate type-heading ${isActive ? "text-slate-900" : "text-slate-800"}`}>
                      {chat.name}
                    </span>

                    <div className="relative shrink-0 flex items-center justify-end">
                      {/* Hiển thị giờ bình thường, tự ẩn đi khi hover */}
                      <span className={`type-caption text-slate-400 text-[11px] select-none ${openMenuId === chat.id ? "hidden" : "group-hover:hidden"}`}>
                        {isReturned ? (
                          <span className="text-amber-600 font-semibold">Đến hạn</span>
                        ) : chat.status === "snoozed" ? (
                          <span className="text-amber-600 font-medium">{remainingTime(chat)}</span>
                        ) : (
                          chat.time
                        )}
                      </span>

                      {/* Nút 3 chấm thay thế đúng vị trí của giờ khi hover */}
                      <div className={`relative ${openMenuId === chat.id ? "flex" : "hidden group-hover:flex"}`}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuId(openMenuId === chat.id ? null : chat.id)
                          }}
                          title="Tùy chọn"
                          className="flex size-5 items-center justify-center rounded hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          <MoreHorizontalIcon className="size-3.5" />
                        </button>

                        {/* Dropdown menu thao tác trên khung chat */}
                        {openMenuId === chat.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-6 z-40 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-xl type-caption text-slate-700"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onToggleUnread?.(index)
                                setOpenMenuId(null)
                              }}
                              className="flex w-full items-center justify-between px-3 py-1.5 hover:bg-slate-50 transition-colors"
                            >
                              <span>{chat.unread ? "Đánh dấu đã đọc" : "Đánh dấu chưa đọc"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteConversation?.(index)
                                setOpenMenuId(null)
                              }}
                              className="flex w-full items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <TrashIcon className="size-3.5" />
                              <span>Xóa cuộc hội thoại</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dòng tin nhắn xem trước: ĐÃ HẾT BOLD KHI ĐÃ ĐỌC */}
                  <p
                    className={`mt-0.5 line-clamp-1 type-body text-[13px] ${
                      chat.unread ? "font-semibold text-slate-900" : "text-slate-500 font-normal"
                    }`}
                  >
                    {chat.snippet}
                  </p>

                  {/* Hàng nhãn: Nhãn chính + Badge +N kèm Tooltip */}
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {isReturned ? (
                        <Tag tone="amber" icon={<ClockIcon className="size-3" />}>
                          Đến hạn nhắc lại
                        </Tag>
                      ) : primaryTag ? (
                        <Tag tone={primaryTag.tone}>{primaryTag.label}</Tag>
                      ) : null}

                      {/* Badge +N nếu có nhiều nhãn */}
                      {extraTagsCount > 0 && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenTagTooltipId(openTagTooltipId === chat.id ? null : chat.id)
                            }}
                            className="inline-flex h-5 items-center justify-center rounded-md bg-slate-100 px-1.5 type-caption font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                            title="Bấm để xem tất cả nhãn"
                          >
                            +{extraTagsCount}
                          </button>

                          {/* Tooltip hiển thị tất cả các nhãn */}
                          {openTagTooltipId === chat.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-0 bottom-full z-40 mb-1.5 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-xl min-w-[130px]"
                            >
                              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                Nhãn đã gắn ({chat.tags?.length || 0})
                              </div>
                              {chat.tags?.map((tagId) => {
                                const tagObj = tags.find((t) => t.id === tagId)
                                if (!tagObj) return null
                                return (
                                  <Tag key={tagId} tone={tagObj.tone}>
                                    {tagObj.label}
                                  </Tag>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Chấm tròn báo tin chưa đọc: chỉ xuất hiện khi chưa đọc */}
                    {chat.unread && (
                      <span className="size-2 rounded-full bg-blue-600 shrink-0" title="Tin nhắn mới chưa đọc" />
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
