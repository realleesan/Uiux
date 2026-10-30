import React from "react"
import { Chat, ChatTag } from "../../types/chat"
import { ClockIcon, SearchIcon } from "./icons"
import { Avatar, Chip, Tabs, Tag } from "./ui"

type ConversationListProps = {
  chats: Chat[]
  visibleChats: Chat[]
  activeNav: string
  activeChat: number
  search: string
  selectedTag: string
  tags: ChatTag[]
  conversationCounts: {
    needsReply: number
    waiting: number
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

  const navItems = [
    { id: "Cần trả lời", label: "Cần trả lời", count: conversationCounts.needsReply, alert: conversationCounts.needsReply > 0 },
    { id: "Chờ khách", label: "Chờ khách", count: conversationCounts.waiting },
    { id: "Tạm hoãn", label: "Tạm hoãn", count: conversationCounts.snoozed },
  ]

  return (
    <section className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
      {/* 3 Tab Nghiệp vụ: Cân đối, chuẩn phẳng */}
      <Tabs
        items={navItems}
        value={activeNav}
        onChange={onSelectNav}
      />

      {/* Tìm kiếm & Lọc thẻ tag */}
      <div className="border-b border-slate-200 p-2.5 space-y-2 bg-white">
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-3 text-slate-400">
            <SearchIcon className="size-4" />
          </span>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên khách, sản phẩm..."
            className="h-8.5 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-8.5 pr-3 type-body text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Thanh lọc Tag Thẻ nghiệp vụ: flex-wrap đảm bảo không bị khuất chữ */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <Chip active={selectedTag === "all"} onClick={() => onSelectTag("all")}>
            Tất cả
          </Chip>
          {tags.map((tag) => (
            <Chip
              key={tag.id}
              active={selectedTag === tag.id}
              onClick={() => onSelectTag(tag.id)}
            >
              {tag.label}
            </Chip>
          ))}
        </div>
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

            return (
              <button
                type="button"
                key={chat.id}
                onClick={() => onSelectChat(index)}
                className={`group relative flex w-full text-left rounded-xl p-2.5 transition-all border ${
                  isActive
                    ? "bg-blue-50/60 border-blue-200 shadow-2xs"
                    : isReturned
                      ? "bg-amber-50/50 border-amber-300 hover:bg-amber-50"
                      : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                {/* Viền cam cảnh báo khi hết hạn quay về */}
                {isReturned && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-amber-500" />
                )}

                {/* Avatar khách kèm badge kênh */}
                <div className="mr-2.5 shrink-0">
                  <Avatar src={chat.avatar} name={chat.name} size="lg" channel />
                </div>

                {/* Nội dung tóm tắt */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`truncate type-heading ${isActive ? "text-blue-900" : "text-slate-900"}`}>
                      {chat.name}
                    </span>
                    <span className="shrink-0 type-caption text-slate-400">
                      {chat.time}
                    </span>
                  </div>

                  {/* Dòng tin nhắn xem trước */}
                  <p className={`mt-0.5 line-clamp-1 type-body text-slate-500 ${chat.unread ? "font-semibold text-slate-900" : ""}`}>
                    {chat.snippet}
                  </p>

                  {/* Thẻ tag phân loại & Chỉ báo trạng thái */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {isReturned ? (
                      <Tag tone="amber" icon={<ClockIcon className="size-3" />}>
                        Đến hạn nhắc lại
                      </Tag>
                    ) : chat.status === "snoozed" ? (
                      <Tag tone="amber">
                        Còn {remainingTime(chat)}
                      </Tag>
                    ) : null}

                    {chat.tags?.map((tId) => {
                      const tagDef = tags.find((t) => t.id === tId)
                      if (!tagDef) return null
                      return (
                        <Tag key={tId} tone={tagDef.tone}>
                          {tagDef.label}
                        </Tag>
                      )
                    })}

                    {chat.productTag && (
                      <Tag tone="neutral">
                        {chat.productTag}
                      </Tag>
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
