export type ChatStatus = "needsReply" | "waiting" | "snoozed"

export type HistoryMessage = {
  from: "customer" | "shop"
  text: string
  time: string
  image?: string
}

export type Chat = {
  id: string
  initials: string
  avatar?: string
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
  productTag?: string
  orderPrice?: string
}

export type AppMode = "wireframe" | "prototype-v1" | "prototype-v2"
