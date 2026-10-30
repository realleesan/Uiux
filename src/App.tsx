import { useEffect, useState } from "react"
import { AppMode } from "./types/chat"
import WireframeView from "./views/WireframeView"
import PrototypeV1View from "./views/PrototypeV1View"
import PrototypeV2View from "./views/PrototypeV2View"

export default function App() {
  // Đọc đường dẫn ban đầu từ URL trình duyệt
  const getInitialMode = (): AppMode => {
    const rawPath = decodeURIComponent(window.location.pathname.toLowerCase())
    if (rawPath.includes("wireframe")) return "wireframe"
    if (rawPath.includes("prototype-v1") || rawPath === "/v1") return "prototype-v1"
    // Mặc định luôn là Prototype v2 (cho /, /prototype-v2, /prototype v2, /prototype, v.v.)
    return "prototype-v2"
  }

  const [currentMode, setCurrentMode] = useState<AppMode>(getInitialMode)

  // Lắng nghe sự kiện back/forward của trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      const rawPath = decodeURIComponent(window.location.pathname.toLowerCase())
      if (rawPath.includes("wireframe")) setCurrentMode("wireframe")
      else if (rawPath.includes("prototype-v1") || rawPath === "/v1") setCurrentMode("prototype-v1")
      else setCurrentMode("prototype-v2")
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white select-none">
      {/* Vùng hiển thị màn hình tương ứng */}

      {/* Vùng hiển thị màn hình tương ứng */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {currentMode === "wireframe" && (
          <div className="legacy-typography h-full">
            <WireframeView />
          </div>
        )}
        {currentMode === "prototype-v1" && (
          <div className="legacy-typography h-full">
            <PrototypeV1View />
          </div>
        )}
        {currentMode === "prototype-v2" && <PrototypeV2View />}
      </div>
    </div>
  )
}
