import React, { useEffect, useRef } from "react"
import { ClockIcon, CloseIcon } from "./icons"
import { Button, Chip, Field, IconButton, inputClass } from "./ui"

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
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <ClockIcon className="size-4" />
            </span>
            <h3 className="type-title text-slate-900">
              Tạm hoãn cuộc hội thoại
            </h3>
          </div>
          <IconButton label="Đóng" onClick={onClose}>
            <CloseIcon className="size-4" />
          </IconButton>
        </div>

        {/* Thân Modal */}
        <div className="mt-4 space-y-3.5 type-body">
          <p className="type-caption text-slate-500 leading-relaxed">
            Tạm hoãn hội thoại để kiểm tra kho. Hệ thống sẽ tự động nhắc lại khi đến hạn.
          </p>

          <div>
            <span className="type-caption text-slate-500 block mb-1.5">Thời gian hẹn:</span>
            <div className="flex gap-2">
              {["3 phút", "5 phút"].map((delay) => (
                <Chip
                  key={delay}
                  active={snoozeDelay === delay}
                  onClick={() => onDelayChange(delay)}
                >
                  {delay}
                </Chip>
              ))}
            </div>
          </div>

          <Field label="Ghi chú nhắc việc:">
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
              placeholder="Ghi chú nhắc việc..."
              className={inputClass}
            />
          </Field>

          {/* Action Buttons: Dùng grid grid-cols-2 để 2 nút chia đôi 50-50, không bao giờ bị tràn */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="secondary" size="md" onClick={onClose}>
              Hủy
            </Button>
            <Button variant="warning" size="md" onClick={onConfirm}>
              Xác nhận ({snoozeDelay})
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
