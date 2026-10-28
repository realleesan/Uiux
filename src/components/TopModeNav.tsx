import { AppMode } from "../types/chat"

type TopModeNavProps = {
  currentMode: AppMode
  onChangeMode: (mode: AppMode) => void
}

export default function TopModeNav({ currentMode, onChangeMode }: TopModeNavProps) {
  const modes: {
    id: AppMode
    path: string
    title: string
    badge: string
    description: string
  }[] = [
    {
      id: "wireframe",
      path: "/wireframe",
      title: "1. Wireframe",
      badge: "Phần 1–4",
      description: "Cấu trúc màn hình, phân nhóm 3 tab & luồng tạm hoãn (Bản thô)",
    },
    {
      id: "prototype-v1",
      path: "/prototype",
      title: "2. Prototype v1",
      badge: "Phần 5",
      description: "Giao diện UI hoàn chỉnh (Xanh biển - Trắng, trước khi test)",
    },
    {
      id: "prototype-v2",
      path: "/prototype-v2",
      title: "3. Prototype v2 (Cải tiến)",
      badge: "Phần 6–7",
      description: "Áp dụng cải tiến sau kiểm thử: Thẻ viền cam & Modal tối ưu 3p",
    },
  ]

  return (
    <aside
      aria-label="Thanh điều hướng chuyển đổi phiên bản đồ án"
      className="z-50 flex h-11 shrink-0 items-center justify-between border-b border-slate-800 bg-[#0F172A] px-4 text-xs text-slate-300"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex items-center gap-1.5 font-bold tracking-wide text-white">
          <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
          ĐỒ ÁN UI/UX:
        </span>
        <span className="hidden text-slate-400 md:inline">
          Hệ thống Quản lý Hội thoại Tư vấn Bán hàng Thời trang
        </span>
      </div>

      <nav className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-700/60">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChangeMode(mode.id)}
              title={mode.description}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span>{mode.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? "bg-blue-700/80 text-blue-100"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {mode.badge}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="hidden text-[11px] text-slate-400 lg:flex items-center gap-2">
        <span>Vercel Deploy:</span>
        <span className="text-emerald-400 font-mono">uiux-pi-pearl.vercel.app</span>
      </div>
    </aside>
  )
}
