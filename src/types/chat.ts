export type ChatStatus = "needsReply" | "waiting" | "snoozed"

export type HistoryMessage = {
  from: "customer" | "shop"
  text: string
  time: string
  image?: string
  isOrderCard?: boolean
  orderInfo?: {
    orderId: string
    productName: string
    variant: string
    price: string
    shipping: string
    total: string
    phone: string
    address: string
  }
}

export type ProductVariant = {
  size: "S" | "M" | "L" | "XL"
  color: string
  stock: number
}

export type ProductItem = {
  id: string
  code: string
  name: string
  price: number
  priceFormatted: string
  category: string
  image: string
  variants: ProductVariant[]
}

export type QuickReply = {
  id: string
  shortcut: string
  title: string
  content: string
  category: "size" | "payment" | "policy" | "shipping"
}

export type ChatTag = {
  id: string
  label: string
  color: string
  bg: string
  border: string
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
  tags?: string[]
  customerPhone?: string
  customerAddress?: string
  customerHeightWeight?: string
  orderCreated?: boolean
  internalNote?: string
}

export type AppMode = "wireframe" | "prototype-v1" | "prototype-v2"
