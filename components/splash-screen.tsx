import Image from "next/image"

export function SplashScreen() {
  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div
        className="relative flex h-full w-full flex-col items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #e5e7eb 100%)",
        }}
      >
        {/* 👇 여기가 수정한 부분입니다. */}
        <div className="text-center relative z-10 mb-60">
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo.png"
              alt="Eco Rail Logo"
              width={200}
              height={200}
              className="rounded-full"
            />
          </div>
          <h1
            className="text-3xl font-bold mb-2 text-primary"
            style={{
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            U Rail Car
          </h1>
          <p
            className="text-xl text-primary/80"
            style={{
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            유레카! 당신이 발견하는 새로운 철길
          </p>
          <div className="mt-8">
            <div
              className="w-8 h-8 rounded-full animate-spin mx-auto border-4 border-primary/20 border-t-primary"
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}