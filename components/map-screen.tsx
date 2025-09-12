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

export function MapScreen({ onOpenPost }: { onOpenPost?: (postId: number) => void }) {
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("지도 데이터를 불러오는 중...")
  const [query, setQuery] = useState("")
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([]) // 마커 인스턴스를 관리하기 위한 ref

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormLocation, setCreateFormLocation] = useState<MapLocation | null>(null)

  // 지도 초기화, 데이터 로딩 및 지오코딩을 위한 useEffect
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      setLoadingMessage("카카오맵 스크립트를 불러올 수 없습니다.")
      setIsLoading(false)
      return
    }

    const initAndLoadData = async () => {
      // 1. 지도 생성 (아직 생성되지 않았을 경우에만)
      if (mapContainer.current && !mapInstanceRef.current) {
        const options = {
          center: new window.kakao.maps.LatLng(36.3504119, 127.3845475), // 대전 중심
          level: 8,
        }
        mapInstanceRef.current = new window.kakao.maps.Map(mapContainer.current, options)
      }

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
              // Kakao API의 요청 제한을 피하기 위해 약간의 지연을 줍니다.
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

        if (geocodedResults.length > 0) {
          setLocations(geocodedResults)
        } else {
          setLoadingMessage("주소를 좌표로 변환하는데 실패했습니다.")
          setIsLoading(false)
        }
      } catch (error) {
        console.error("데이터 처리 중 오류 발생:", error)
        setLoadingMessage("데이터를 처리하는 중 오류가 발생했습니다.")
        setIsLoading(false)
      }
    }

    window.kakao.maps.load(initAndLoadData)
  }, []) // 이 useEffect는 컴포넌트가 처음 마운트될 때 한 번만 실행됩니다.

  // `locations` 상태가 변경될 때 마커를 지도에 표시하는 useEffect
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !window.kakao) return

    // 1. 기존에 생성된 마커가 있다면 지도에서 제거
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    if (locations.length > 0) {
        // 2. 새로운 `locations` 데이터로 마커를 생성하고 지도에 추가
        const newMarkers: any[] = []
        const filtered = query.trim() ? locations.filter(l => l.address.includes(query.trim())) : locations
        filtered.forEach((location) => {
          const markerPosition = new window.kakao.maps.LatLng(location.lat, location.lng)
          const marker = new window.kakao.maps.Marker({ position: markerPosition })

          marker.setMap(map)

          // 마커에 클릭 이벤트 리스너 추가
          window.kakao.maps.event.addListener(marker, "click", () => {
            setSelectedLocation(location)
            map.panTo(markerPosition) // 클릭된 마커 위치로 지도 중심 이동
          })

          newMarkers.push(marker)
        })
        // 생성된 마커들을 ref에 저장하여 나중에 관리할 수 있도록 함
        markersRef.current = newMarkers
    }
    
    // 위치 데이터가 있거나, 없을 경우(빈 배열) 모두 로딩 상태를 종료함
    setIsLoading(false)
  }, [locations, query]) // `locations`나 검색어 변경 시 실행

  const handleCreateProposal = async (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId)
    if (!location) return
    try {
      // 주소로 RailwayProperty를 조회해서 정확한 backend id를 얻음
      const addr = location.address
      const res = await fetch(`/api/map/properties/?search=${encodeURIComponent(addr)}`.replace('/api','http://127.0.0.1:8000/api'))
      const data = await res.json()
      const list = data.results || data
      const exact = list?.find((p: any) => p.address === addr) || list?.[0]
      const resolved = exact ? { ...location, id: String(exact.id) } : location
      setCreateFormLocation(resolved)
      setShowCreateForm(true)
      setSelectedLocation(null)
    } catch (e) {
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
          railwayPropertyId={Number(createFormLocation.id)}   // RailwayProperty ID 전달
          onPostCreated={() => {
            handleBackFromForm();   // 등록 성공 후 돌아가기
          }}
          onCancel={handleBackFromForm}   // ← 취소 버튼 동작 연결
        />
      )}


      {/* 지도 화면 (숨김 처리) */}
      <div className={cn("flex flex-col h-full", showCreateForm && "hidden")}>
        <div className="bg-card border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="장소 검색 (예: 중구)" className="pl-10 pr-4" value={query} onChange={(e) => setQuery(e.target.value)} />
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
            onOpenPost={onOpenPost}
          />
        )}
      </div>
    </div>
  )
}

