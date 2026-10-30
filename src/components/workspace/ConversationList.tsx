import React from "react"
import { Chat, ChatTag } from "../../types/chat"
import { ClockIcon, SearchIcon, TagIcon } from "./icons"
import { Avatar, Tabs, Tag } from "./ui"

type ConversationListProps = {
  chats: Chat[]
  visibleChats: Chat[]
  activeNav: string
  activeChat: number
  search: string
  selectedTag: string
  tags: ChatTag[]
  conversationCounts: {
    all: number
    unread: number
    needsReply: number
    snoozed: number
  }
  now: number
  onSelectNav: (tab: string) => void
  onSelectChat: (index: number) => void
  onSearchChange: (val: string) => void
  onSelectTag: (tagId: string) => void
}

export default function ConversationList({
  chats,
  visibleChats,
  activeNav,
  activeChat,
  search,
  selectedTag,
  tags,
  conversationCounts,
  now,
  onSelectNav,
  onSelectChat,
  onSearchChange,
  onSelectTag,
}: ConversationListProps) {
  function remainingTime(chat: Chat) {
    const seconds = Math.max(0, Math.ceil(((chat.snoozeUntil ?? now) - now) / 1000))
    return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0")
  }

  // 4 Tab chuẩn: Tất cả, Chưa đọc, Cần trả lời, Tạm hoãn (không dùng dot đếm số tin làm khuất text)
  const navItems = [
    { id: "all", label: "Tất cả" },
    { id: "unread", label: "Chưa đọc" },
    { id: "needsReply", label: "Cần trả lời" },
    { id: "snoozed", label: "Tạm hoãn" },
  ]

  return (
    <section className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
      {/* 4 Tab phẳng gọn gàng, không bị khuất chữ */}
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

        {/* Dropdown Lọc nhãn: Tối giản trực tiếp, không icon thừa hay chữ nhãn */}
        <select
          value={selectedTag}
          onChange={(e) => onSelectTag(e.target.value)}
          className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 type-caption text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
        >
          <option value="all">Tất cả nhãn</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.label}
            </option>
          ))}
        </select>
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

            // Lấy nhãn chính đầu tiên để không làm giãn chiều cao thẻ chat
            const primaryTagId = chat.tags?.[0]
            const primaryTag = primaryTagId ? tags.find((t) => t.id === primaryTagId) : null

            return (
              <button
                type="button"
                key={chat.id}
                onClick={() => onSelectChat(index)}
                className={`group relative flex w-full text-left rounded-lg p-2.5 transition-colors border ${
                  isActive
                    ? "bg-slate-100/90 border-slate-200 shadow-2xs"
                    : isReturned
                      ? "bg-amber-50/40 border-amber-200/60 hover:bg-amber-50/70"
                      : "bg-white border-transparent hover:bg-slate-50"
                }`}
              >
                {/* Avatar khách kèm badge kênh */}
                <div className="mr-2.5 shrink-0">
                  <Avatar src={chat.avatar} name={chat.name} size="lg" channel />
                </div>

                {/* Nội dung tóm tắt */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`truncate type-heading ${isActive ? "text-slate-900" : "text-slate-800"}`}>
                      {chat.name}
                    </span>
                    <span className="shrink-0 type-caption text-slate-400 text-[11px]">
                      {isReturned ? (
                        <span className="text-amber-600 font-semibold">Đến hạn</span>
                      ) : chat.status === "snoozed" ? (
                        <span className="text-amber-600 font-medium">{remainingTime(chat)}</span>
                      ) : (
                        chat.time
                      )}
                    </span>
                  </div>

                  {/* Dòng tin nhắn xem trước */}
                  <p className={`mt-0.5 line-clamp-1 type-body text-slate-500 text-[13px] ${chat.unread ? "font-semibold text-slate-900" : ""}`}>
                    {chat.snippet}
                  </p>

                  {/* Hàng nhãn gọn gàng: Tối đa 1 nhãn chính + Chấm xanh chưa đọc */}
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {isReturned ? (
                        <Tag tone="amber" icon={<ClockIcon className="size-3" />}>
                          Đến hạn nhắc lại
                        </Tag>
                      ) : primaryTag ? (
                        <Tag tone={primaryTag.tone}>{primaryTag.label}</Tag>
                      ) : null}
                    </div>

                    {/* Chấm tròn báo tin chưa đọc */}
                    {chat.unread && (
                      <span className="size-2 rounded-full bg-blue-600 shrink-0" title="Tin nhắn mới chưa đọc" />
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </section>
  )
}
