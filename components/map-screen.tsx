"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { MapModal } from "@/components/map-modal"
import { PostCreationForm } from "@/components/post-creation-form"
import { cn } from "@/lib/utils"

declare global {
  interface Window {
    kakao: any
  }
}

interface RawRailwaySite {
  일련번호: string
  "재산 소재지": string
  "공부상 면적": string
  사용여부: string
  "향후 사용계획 및 추진사항": string
  [key: string]: string
}

interface MapLocation {
  id: string
  name: string
  address: string
  area: string
  usage: string
  lat: number
  lng: number
  proposals: any[]
}

export function MapScreen() {
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("지도 데이터를 불러오는 중...")
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormLocation, setCreateFormLocation] = useState<MapLocation | null>(null)

  // 지도 초기화 및 데이터 로딩을 위한 통합 useEffect
  useEffect(() => {
    // 카카오맵 스크립트가 로드되지 않았다면 아무것도 하지 않음
    if (!window.kakao || !window.kakao.maps) {
      setLoadingMessage("카카오맵 스크립트를 불러올 수 없습니다.")
      setIsLoading(false)
      return
    }

    // kakao.maps.load를 사용하여 스크립트 로딩 완료 후 모든 관련 작업 수행
    window.kakao.maps.load(async () => {
      if (!mapContainer.current) return

      // 1. 지도 생성
      const options = {
        center: new window.kakao.maps.LatLng(36.3504119, 127.3845475), // 대전 중심
        level: 8,
      }
      const map = new window.kakao.maps.Map(mapContainer.current, options)
      mapInstanceRef.current = map

      // 2. CSV 데이터 불러오기 및 처리
      try {
        const response = await fetch("/korail_data.csv")
        const buffer = await response.arrayBuffer()
        const decoder = new TextDecoder("euc-kr")
        const text = decoder.decode(buffer)

        const rows = text.split("\n").slice(1).filter((row) => row.trim() !== "")
        const headers = text.split("\n")[0].split(",").map((h) => h.trim().replace(/"/g, ""))

        const parsedData = rows.map((row) => {
          const values = row.split(",")
          return headers.reduce((obj, header, i) => {
            obj[header] = values[i] ? values[i].trim().replace(/"/g, "") : ""
            return obj
          }, {} as any) as RawRailwaySite
        })

        const filteredData = parsedData.filter(
          (site) => site["재산 소재지"]?.includes("대전광역시") && site["사용여부"] === "미사용",
        )

        if (filteredData.length === 0) {
          setLoadingMessage("조건에 맞는 유휴부지 데이터가 없습니다.")
          setLocations([])
          setIsLoading(false)
          return
        }

        // 3. 주소를 좌표로 변환 (지오코딩)
        setLoadingMessage(`총 ${filteredData.length}개의 주소를 좌표로 변환 중입니다...`)
        const geocoder = new window.kakao.maps.services.Geocoder()
        const geocodePromises = filteredData.map(
          (site) =>
            new Promise<MapLocation | null>((resolve) => {
              setTimeout(() => {
                geocoder.addressSearch(site["재산 소재지"], (result: any, status: any) => {
                  if (status === window.kakao.maps.services.Status.OK && result[0]) {
                    resolve({
                      id: site.일련번호,
                      name: `철도 유휴부지 (${site.일련번호})`,
                      address: site["재산 소재지"],
                      area: site["공부상 면적"],
                      usage: site["향후 사용계획 및 추진사항"],
                      lat: parseFloat(result[0].y),
                      lng: parseFloat(result[0].x),
                      proposals: [],
                    })
                  } else {
                    resolve(null)
                  }
                })
              }, 50)
            }),
        )

        const geocodedResults = (await Promise.all(geocodePromises)).filter(Boolean) as MapLocation[]
        setLocations(geocodedResults)

        // 4. 지도에 마커 표시
        if (geocodedResults.length > 0) {
          geocodedResults.forEach((location) => {
            const markerPosition = new window.kakao.maps.LatLng(location.lat, location.lng)
            const marker = new window.kakao.maps.Marker({ position: markerPosition })
            marker.setMap(map)
            window.kakao.maps.event.addListener(marker, "click", () => {
              setSelectedLocation(location)
              map.panTo(markerPosition)
            })
          })
        } else {
          setLoadingMessage("주소를 좌표로 변환하는데 실패했습니다.")
        }
      } catch (error) {
        console.error("데이터 처리 중 오류 발생:", error)
        setLoadingMessage("데이터를 처리하는 중 오류가 발생했습니다.")
      } finally {
        setIsLoading(false)
      }
    })
  }, []) // 이 useEffect는 컴포넌트가 처음 마운트될 때 한 번만 실행됩니다.

  const handleCreateProposal = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId)
    if (location) {
      setCreateFormLocation(location)
      setShowCreateForm(true)
      setSelectedLocation(null)
    }
  }

  const handleBackFromForm = () => {
    setShowCreateForm(false)
    setCreateFormLocation(null)
  }

  const handleSubmitProposal = async (postData: any) => {
    console.log("제출된 데이터:", postData, "위치:", createFormLocation?.address)
    await new Promise((res) => setTimeout(res, 1000))
    if (typeof window !== "undefined") {
      alert("제안이 성공적으로 등록되었습니다!")
    }
    handleBackFromForm()
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* 글 작성 화면 */}
      {showCreateForm && createFormLocation && (
        <PostCreationForm
          locationId={createFormLocation.id}
          locationName={createFormLocation.address}
          onBack={handleBackFromForm}
          onSubmit={handleSubmitProposal}
        />
      )}

      {/* 지도 화면 (숨김 처리) */}
      <div className={cn("flex flex-col h-full", showCreateForm && "hidden")}>
        <div className="bg-card border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="장소 또는 제안 검색" className="pl-10 pr-4" disabled />
            </div>
          </div>
        </div>
        <div className="flex-1 relative">
          <div ref={mapContainer} className="w-full h-full" />
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">{loadingMessage}</p>
            </div>
          )}
        </div>
        {selectedLocation && (
          <MapModal
            location={{
              ...selectedLocation,
              name: `${selectedLocation.address}`,
              usage: `유형분류: ${selectedLocation.usage}`,
            }}
            onClose={() => setSelectedLocation(null)}
            onCreateProposal={handleCreateProposal}
          />
        )}
      </div>
    </div>
  )
}

