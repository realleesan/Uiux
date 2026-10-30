import { useEffect, useState } from "react"
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
    return "prototype-v2"
  }

  const [currentMode, setCurrentMode] = useState<AppMode>(getInitialMode)

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
