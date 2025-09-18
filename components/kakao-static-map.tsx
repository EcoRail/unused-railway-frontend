"use client"

import { useEffect, useRef, useState } from "react"

interface KakaoStaticMapProps {
  address: string
  height?: number
  level?: number // zoom level (1~14), lower is more zoomed in
  className?: string
}

declare global {
  interface Window {
    kakao?: any
  }
}

export function KakaoStaticMap({ address, height = 160, level = 3, className }: KakaoStaticMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  // Ensure Kakao script has initialized
  useEffect(() => {
    if (typeof window === "undefined") return
    const tryLoad = () => {
      if (window.kakao && window.kakao.maps && typeof window.kakao.maps.load === "function") {
        setReady(true)
        return true
      }
      return false
    }
    if (tryLoad()) return
    const id = setInterval(() => {
      if (tryLoad()) clearInterval(id)
    }, 200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!ready || !address || !containerRef.current) return
    const kakao = window.kakao

    kakao.maps.load(() => {
      const geocoder = new kakao.maps.services.Geocoder()
      geocoder.addressSearch(address, (result: any[], status: string) => {
        if (status !== kakao.maps.services.Status.OK || !result?.length) return

        const { x, y } = result[0]
        const coords = new kakao.maps.LatLng(Number(y), Number(x))

        const map = new kakao.maps.Map(containerRef.current, {
          center: coords,
          level,
          draggable: true, // 지도 드래그 이동을 활성화합니다.
          scrollwheel: true, // 지도 스크롤 줌 기능을 활성화합니다.
          disableDoubleClick: true,
        })

        new kakao.maps.Marker({ map, position: coords })

        const typeControl = new kakao.maps.MapTypeControl()
        map.addControl(typeControl, kakao.maps.ControlPosition.TOPRIGHT)
      })
    })
  }, [ready, address, level])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height }}
      aria-label="kakao-map"
    />
  )
}

