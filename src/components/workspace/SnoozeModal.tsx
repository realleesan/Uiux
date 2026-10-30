import React, { useEffect, useRef } from "react"

type SnoozeModalProps = {
  isOpen: boolean
  snoozeDelay: string
  snoozeNote: string
  onClose: () => void
  onDelayChange: (delay: string) => void
  onNoteChange: (note: string) => void
  onConfirm: () => void
}

export default function SnoozeModal({
  isOpen,
  snoozeDelay,
  snoozeNote,
  onClose,
  onDelayChange,
  onNoteChange,
  onConfirm,
}: SnoozeModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs select-none">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200/90 font-body">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 text-sm font-bold">
              ⏱
            </span>
            <h3 className="font-heading font-bold text-slate-900 text-sm">
              Tạm hoãn cuộc hội thoại
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
          >
            ✕
          </button>
        </div>

        {/* Thân Modal */}
        <div className="mt-4 space-y-3.5 text-xs">
          <p className="text-slate-500 font-normal leading-relaxed">
            Hội thoại sẽ tạm chuyển sang danh sách <strong>Tạm hoãn</strong>. Khi hết hạn, hệ thống tự động đưa về đầu mục <strong>Cần trả lời</strong> với viền cảnh báo nổi bật.
          </p>

          <div>
            <label className="font-medium text-slate-700 block mb-1.5 font-heading">
              Mốc thời gian dự kiến:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["3 phút", "5 phút"].map((delay) => (
                <button
                  key={delay}
                  type="button"
                  onClick={() => onDelayChange(delay)}
                  className={`rounded-xl py-2 text-xs font-heading font-semibold border transition-all ${
                    snoozeDelay === delay
                      ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {delay} (Ưu tiên)
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1.5 font-heading">
              Ghi chú nhanh ngữ cảnh (Nhấn Enter xác nhận):
            </label>
            <input
              ref={inputRef}
              value={snoozeNote}
              onChange={(e) => onNoteChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  onConfirm()
                }
              }}
              placeholder="VD: Kiểm tra màu trắng size M tại kho..."
              className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100 transition-all font-body"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 py-2.5 font-heading font-medium text-slate-700 hover:bg-slate-50 transition-all"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-amber-600 py-2.5 font-heading font-bold text-white hover:bg-amber-700 shadow-xs active:scale-95 transition-all"
            >
              Xác nhận ({snoozeDelay})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
