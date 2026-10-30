import React from "react"
import { BellIcon, LogOutIcon, PanelRightIcon } from "./icons"
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
      {/* Brand: Chỉ có chữ Omnichat, tối giản chuẩn SaaS */}
      <div className="flex items-center gap-2">
        <span className="font-heading font-bold text-lg tracking-tight text-slate-900">
          Omnichat
        </span>
      </div>

      {/* Trạng thái nhân viên & Nút hệ thống cơ bản */}
      <div className="flex items-center gap-3">
        {/* Thông báo chuông hệ thống */}
        <div className="relative">
          <IconButton label="Thông báo hệ thống">
            <BellIcon className="size-4" />
          </IconButton>
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </div>

        <div className="h-4 w-px bg-slate-200" />

        {/* Thông tin nhân viên với Avatar & Active Dot xanh (bỏ chữ trực tuyến) */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              alt={employeeName}
              className="size-7 rounded-full object-cover border border-slate-200 shadow-2xs"
            />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <span className="type-label text-slate-800 font-medium">{employeeName}</span>
        </div>

        <div className="h-4 w-px bg-slate-200" />

        {/* Nút Đăng xuất chuẩn hệ thống cơ bản */}
        <button
          type="button"
          onClick={() => alert(`Đăng xuất: Đã lưu phiên làm việc của nhân viên ${employeeName}`)}
          title="Đăng xuất khỏi hệ thống"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 type-caption text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors"
        >
          <LogOutIcon className="size-3.5" />
          <span>Đăng xuất</span>
        </button>

        {/* Nút thu gọn / mở cột tiện ích */}
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
