import { useEffect, useState } from "react"
import TopModeNav from "./components/TopModeNav"
import { AppMode } from "./types/chat"
import WireframeView from "./views/WireframeView"
import PrototypeV1View from "./views/PrototypeV1View"
import PrototypeV2View from "./views/PrototypeV2View"

export default function App() {
  // Đọc đường dẫn ban đầu từ URL trình duyệt
  const getInitialMode = (): AppMode => {
    const path = window.location.pathname.toLowerCase()
    if (path.includes("wireframe")) return "wireframe"
    if (path.includes("prototype-v2")) return "prototype-v2"
    if (path.includes("prototype")) return "prototype-v1"
    // Mặc định truy cập root: Vào thẳng Prototype v2 (bản hoàn thiện nhất) hoặc theo ý muốn
    return "prototype-v2"
  }

  const [currentMode, setCurrentMode] = useState<AppMode>(getInitialMode)

  // Cập nhật URL khi chuyển mode
  const handleChangeMode = (mode: AppMode) => {
    setCurrentMode(mode)
    let newPath = "/prototype-v2"
    if (mode === "wireframe") newPath = "/wireframe"
    else if (mode === "prototype-v1") newPath = "/prototype"

    if (window.location.pathname !== newPath) {
      window.history.pushState(null, "", newPath)
    }
  }

  // Lắng nghe sự kiện back/forward của trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase()
      if (path.includes("wireframe")) setCurrentMode("wireframe")
      else if (path.includes("prototype-v2")) setCurrentMode("prototype-v2")
      else if (path.includes("prototype")) setCurrentMode("prototype-v1")
      else setCurrentMode("prototype-v2")
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white select-none">
      {/* Thanh chuyển đổi 3 chế độ ở mép trên cùng */}
      <TopModeNav currentMode={currentMode} onChangeMode={handleChangeMode} />

      {/* Vùng hiển thị màn hình tương ứng */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {currentMode === "wireframe" && <WireframeView />}
        {currentMode === "prototype-v1" && <PrototypeV1View />}
        {currentMode === "prototype-v2" && <PrototypeV2View />}
      </div>
    </div>
  )
}
