import React from "react"
import { PanelRightIcon } from "./icons"
import { IconButton } from "./ui"

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
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 select-none">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white font-heading font-bold text-sm shadow-xs">
          L
        </div>
        <div className="flex items-baseline gap-2">
          <span className="type-heading text-slate-900 tracking-tight">
            L'AURA CLOSET
          </span>
          <span className="text-slate-300 type-caption">/</span>
          <span className="type-caption text-slate-500">Hộp thư bán hàng</span>
        </div>
      </div>

      {/* Trạng thái nhân viên & Nút thu gọn tiện ích */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 type-caption text-slate-600">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-800">{employeeName}</span>
          <span className="text-slate-400">· Trực tuyến</span>
        </div>

        <div className="h-4 w-px bg-slate-200" />

        <IconButton
          label={showRightPanel ? "Đóng tiện ích" : "Mở tiện ích"}
          active={showRightPanel}
          onClick={onToggleRightPanel}
        >
          <PanelRightIcon className="size-4" />
        </IconButton>
      </div>
    </header>
  )
}
