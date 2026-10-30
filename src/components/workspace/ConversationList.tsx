import React from "react"
import { Chat, ChatTag } from "../../types/chat"

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

  const tabs = [
    { id: "Cần trả lời", label: "Cần trả lời", count: conversationCounts.needsReply, alert: conversationCounts.needsReply > 0 },
    { id: "Chờ khách", label: "Chờ khách", count: conversationCounts.waiting, alert: false },
    { id: "Tạm hoãn", label: "Tạm hoãn", count: conversationCounts.snoozed, alert: false },
  ]

  return (
    <section className="flex min-h-0 flex-col border-r border-slate-200/80 bg-white">
      {/* 3 Tab Nghiệp vụ: Cân đối, KHÔNG BAO GIỜ bị rớt chữ */}
      <nav aria-label="Trạng thái xử lý" className="flex border-b border-slate-200/80 bg-slate-50/70 p-1.5 gap-1 select-none">
        {tabs.map((tab) => {
          const isActive = activeNav === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectNav(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-all ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-heading font-bold"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 font-medium"
              }`}
            >
              <span className="whitespace-nowrap">{tab.label}</span>
              <span
                className={`flex size-4.5 items-center justify-center rounded-full text-[11px] font-bold ${
                  isActive
                    ? tab.alert
                      ? "bg-rose-500 text-white"
                      : "bg-slate-800 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Ô Tìm kiếm & Bộ lọc thẻ màu */}
      <div className="border-b border-slate-200/80 p-2.5 space-y-2 bg-white">
        <div className="relative flex items-center">
          <svg className="pointer-events-none absolute left-3 size-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên khách, sản phẩm..."
            className="h-8.5 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-8.5 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:bg-white transition-all font-body"
          />
        </div>

        {/* Thanh lọc Tag Thẻ nghiệp vụ */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[12px]">
          {tags.map((tag) => {
            const isSelected = selectedTag === tag.id
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onSelectTag(tag.id)}
                className={`shrink-0 rounded-md px-2 py-0.5 text-xs transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white font-medium shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                {tag.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Danh sách thẻ hội thoại */}
      <div className="min-h-0 flex-1 overflow-y-auto p-1.5 space-y-1">
        {visibleChats.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-body">
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
                    ? "bg-blue-50/70 border-blue-300 shadow-2xs"
                    : isReturned
                      ? "bg-amber-50/60 border-amber-300 hover:bg-amber-50"
                      : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200/70"
                }`}
              >
                {/* Viền cam cảnh báo khi đến hạn quay về */}
                {isReturned && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-amber-500" />
                )}

                {/* Avatar khách */}
                <div className="relative mr-2.5 shrink-0">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="size-10 rounded-full object-cover ring-1 ring-slate-200/80"
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
                    <span className={`truncate text-sm font-heading font-semibold ${isActive ? "text-blue-900" : "text-slate-900"}`}>
                      {chat.name}
                    </span>
                    <span className="shrink-0 text-[11px] font-medium text-slate-400 font-body">
                      {chat.time}
                    </span>
                  </div>

                  {/* Dòng tin nhắn xem trước */}
                  <p className={`mt-0.5 line-clamp-1 text-[13px] font-body leading-snug ${chat.unread ? "font-semibold text-slate-900" : "text-slate-500"}`}>
                    {chat.snippet}
                  </p>

                  {/* Thẻ tag phân loại & Chỉ báo trạng thái */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px]">
                    {isReturned ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.2 font-heading font-bold text-white shadow-2xs">
                        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>Đến hạn nhắc việc</span>
                      </span>
                    ) : chat.status === "snoozed" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.2 font-medium text-amber-800">
                        <span>Còn {remainingTime(chat)}</span>
                      </span>
                    ) : null}

                    {chat.tags?.map((tId) => {
                      const tagDef = tags.find((t) => t.id === tId)
                      if (!tagDef || tId === "all") return null
                      return (
                        <span
                          key={tId}
                          className={`rounded px-1.5 py-0.2 font-medium border ${tagDef.bg} ${tagDef.color} ${tagDef.border}`}
                        >
                          {tagDef.label}
                        </span>
                      )
                    })}

                    {chat.productTag && (
                      <span className="truncate rounded bg-slate-100 px-1.5 py-0.2 font-normal text-slate-600">
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
  )
}
