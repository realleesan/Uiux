import React from "react"

type WorkspaceHeaderProps = {
  employeeName: string
  showRightPanel: boolean
  onToggleRightPanel: () => void
}

export default function WorkspaceHeader({
  employeeName,
  showRightPanel,
  onToggleRightPanel,
}: WorkspaceHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 select-none">
      {/* Brand & Tên phần mềm */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white font-heading font-bold text-sm shadow-xs">
          L
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-heading font-bold text-slate-900 text-sm tracking-tight">
            L'AURA CLOSET
          </span>
          <span className="text-slate-400 text-xs font-normal">·</span>
          <span className="text-slate-500 text-xs font-medium">Hộp thư bán hàng</span>
        </div>
      </div>

      {/* Trạng thái nhân viên & Nút thu gọn tiện ích */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="inline-block size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
          <span className="font-medium">{employeeName}</span>
          <span className="text-slate-400 font-normal">· Trực tuyến</span>
        </div>

        <div className="h-4 w-px bg-slate-200" />

        <button
          type="button"
          onClick={onToggleRightPanel}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
            showRightPanel
              ? "border-blue-200 bg-blue-50/70 text-blue-700 font-semibold"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
          title="Bật/tắt thanh tiện ích tra kho và tạo đơn"
        >
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M15 3v18" />
          </svg>
          <span>{showRightPanel ? "Đóng tiện ích" : "Mở tiện ích"}</span>
        </button>
      </div>
    </header>
  )
}
