import { Train } from "lucide-react"

export function SplashScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        background: "linear-gradient(135deg, #15803d 0%, #84cc16 100%)",
        minHeight: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      <div className="text-center relative z-10">
        <div className="mb-8 flex justify-center">
          <div className="p-6 bg-white/20 rounded-full backdrop-blur-sm">
            <Train size={64} style={{ color: "#ffffff" }} />
          </div>
        </div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{
            color: "#ffffff",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          철도 유휴부지
        </h1>
        <p
          className="text-xl"
          style={{
            color: "#ffffff",
            opacity: 0.9,
            textShadow: "0 1px 2px rgba(0,0,0,0.2)",
          }}
        >
          활용 플랫폼
        </p>
        <div className="mt-8">
          <div
            className="w-8 h-8 rounded-full animate-spin mx-auto"
            style={{
              border: "4px solid rgba(255,255,255,0.3)",
              borderTop: "4px solid #ffffff",
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}
