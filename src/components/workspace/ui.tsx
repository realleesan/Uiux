import { ButtonHTMLAttributes, ReactNode, useEffect, useRef, useState } from "react"
import { Tone } from "../../types/chat"

/* =========================================================================
   UI PRIMITIVES — Prototype v2
   Mọi component trong workspace chỉ dùng các primitive này để đảm bảo
   cùng cỡ chữ, chiều cao, bo góc và màu sắc.

   Chiều cao:  Tag 20px · Chip 28px · Button sm 32px · Button/Input md 36px
   Bo góc:     Tag 6px · Button/Input 8px · Card 12px · Bubble/Modal 16px
   ========================================================================= */

const toneClass: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-700",
  violet: "bg-violet-50 text-violet-700",
  rose: "bg-rose-50 text-rose-700",
}

/** Nhãn tĩnh (không bấm được): trạng thái, tag nghiệp vụ, tồn kho */
export function Tag({ tone = "neutral", icon, children }: { tone?: Tone; icon?: ReactNode; children: ReactNode }) {
  return (
    <span className={`inline-flex h-5 shrink-0 items-center gap-1 rounded-md px-1.5 type-caption ${toneClass[tone]}`}>
      {icon}
      {children}
    </span>
  )
}

/** Chip bấm được: bộ lọc, mẫu câu, mã sản phẩm */
export function Chip({
  active = false,
  children,
  ...rest
}: { active?: boolean; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex h-6.5 shrink-0 items-center rounded-lg border px-2.5 type-caption transition-colors ${
        active
          ? "border-blue-600 bg-blue-600 text-white font-medium"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  )
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "success" | "warning"
type ButtonSize = "sm" | "md"

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  warning: "bg-amber-500 text-white hover:bg-amber-600",
}

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-8 px-3",
  md: "h-9 px-3.5",
}

export function Button({
  variant = "secondary",
  size = "md",
  block = false,
  icon,
  children,
  ...rest
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  icon?: ReactNode
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg type-label transition-colors disabled:pointer-events-none disabled:opacity-40 ${
        variantClass[variant]
      } ${sizeClass[size]} ${block ? "w-full" : ""}`}
    >
      {icon}
      {children}
    </button>
  )
}

export function IconButton({
  label,
  children,
  active = false,
  ...rest
}: { label: string; active?: boolean; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={`grid size-8 shrink-0 place-items-center rounded-lg transition-colors ${
        active ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  )
}

/** Tab gạch chân dùng chung cho cột trái và cột phải */
export type TabItem<T extends string> = { id: T; label: string; count?: number; alert?: boolean }

export function Tabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: TabItem<T>[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div role="tablist" className="flex h-10 shrink-0 border-b border-slate-200 px-1">
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`-mb-px flex flex-1 items-center justify-center gap-1 whitespace-nowrap border-b-2 px-1 text-[13px] font-medium transition-colors ${
              active
                ? "border-blue-600 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={`grid h-4.5 min-w-4.5 place-items-center rounded-full px-1 text-[11px] ${
                  item.alert && item.count > 0
                    ? "bg-rose-500 text-white"
                    : active
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export const inputClass =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 type-body text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block type-caption text-slate-500">{label}</span>
      {children}
    </label>
  )
}

export function CustomSelect<T extends string | number>({
  value,
  options,
  onChange,
  placeholder,
  className = "",
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (val: T) => void
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options.find((o) => o.value === value)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 type-body text-slate-900 outline-none transition-colors hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
      >
        <span className="truncate text-left">{selectedOption?.label || placeholder || "Chọn..."}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-4 text-slate-400 shrink-0 ml-1.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left type-body transition-colors cursor-pointer ${
                  isSelected ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <span className="type-caption text-blue-600 font-bold ml-2 shrink-0">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export const MessengerIcon = ({ className = "size-full" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#0084FF" />
    <path
      fill="#FFFFFF"
      d="M5.5 13.5 11 8l3 3 4.5-2.5-5.5 5.5-3-3z"
    />
  </svg>
)

const avatarSize = { sm: "size-7", md: "size-9", lg: "size-10" }
const badgeSize = { sm: "size-3.5 -bottom-0.5 -right-0.5", md: "size-4.5 -bottom-1 -right-1", lg: "size-5 -bottom-1 -right-1" }

export function Avatar({
  src,
  name,
  size = "lg",
  channel = false,
}: {
  src?: string
  name?: string
  size?: keyof typeof avatarSize
  channel?: boolean
}) {
  return (
    <span className="relative inline-block shrink-0">
      <img src={src} alt={name} className={`${avatarSize[size]} rounded-full object-cover shrink-0`} />
      {channel && (
        <span
          title="Facebook Messenger"
          className={`absolute ${badgeSize[size]} block shrink-0 rounded-full ring-2 ring-white shadow-xs overflow-hidden z-1`}
        >
          <MessengerIcon className="size-full block" />
        </span>
      )}
    </span>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="type-heading text-slate-900">{children}</h3>
      {action}
    </div>
  )
}
