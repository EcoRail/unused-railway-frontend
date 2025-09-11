"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { MapModal } from "@/components/map-modal"

// 카카오맵 API에서 사용할 타입들을 정의합니다.
declare global {
  interface Window {
    kakao: any
  }
}

// CSV 데이터의 형식을 정의합니다.
interface RawRailwaySite {
  일련번호: string
  "재산 소재지": string
  "공부상 면적": string
  사용여부: string
  "향후 사용계획 및 추진사항": string
  [key: string]: string // 다른 컬럼들도 허용
}

// 지도에 표시될 최종 데이터 형식을 정의합니다.
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
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("지도 데이터를 불러오는 중...")
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null) // 지도 인스턴스를 ref로 관리

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.load) {
      setLoadingMessage("카카오맵 스크립트를 불러오는데 실패했습니다.")
      setIsLoading(false)
      return
    }

    window.kakao.maps.load(async () => {
      // 1. 지도 생성
      if (mapContainer.current && !mapInstanceRef.current) {
        const options = {
          center: new window.kakao.maps.LatLng(36.3504119, 127.3845475), // 대전 중심
          level: 8,
        }
        mapInstanceRef.current = new window.kakao.maps.Map(mapContainer.current, options)
      }

      const map = mapInstanceRef.current

      // 2. CSV 데이터 불러오기 및 처리
      try {
        console.log("CSV 데이터 불러오기를 시작합니다.")
        const response = await fetch("/korail_data.csv")
        
        // EUC-KR 인코딩으로 데이터를 디코딩합니다.
        const buffer = await response.arrayBuffer();
        const decoder = new TextDecoder('euc-kr');
        const text = decoder.decode(buffer);

        const rows = text.split("\n").slice(1).filter(row => row.trim() !== ''); // 헤더 제외 및 빈 줄 제거
        const headers = text.split("\n")[0].split(",").map((h) => h.trim())
        console.log(`총 ${rows.length}개의 데이터를 파싱합니다.`);

        const parsedData = rows.map((row) => {
          const values = row.split(",")
          return headers.reduce((obj, header, i) => {
            obj[header] = values[i] ? values[i].trim() : ""
            return obj
          }, {} as any) as RawRailwaySite
        });

        const filteredData = parsedData.filter(
          (site) =>
            site["재산 소재지"]?.includes("대전광역시") &&
            site["사용여부"] === "미사용",
        )
        console.log(`필터링된 데이터 ('대전광역시', '미사용'):`, filteredData.length, "개", filteredData);

        if (filteredData.length === 0) {
          setLoadingMessage("조건에 맞는 유휴부지 데이터가 없습니다.")
          setIsLoading(false)
          return
        }

        // 3. 주소를 좌표로 변환 (지오코딩)
        setLoadingMessage(`총 ${filteredData.length}개의 주소를 좌표로 변환 중입니다...`)
        const geocoder = new window.kakao.maps.services.Geocoder()
        const geocodePromises = filteredData.map(
          (site) =>
            new Promise<MapLocation | null>((resolve) => {
              // 주소 변환 요청 시 약간의 딜레이를 주어 API 요청 제한을 피합니다.
              setTimeout(() => {
                geocoder.addressSearch(site["재산 소재지"], (result: any, status: any) => {
                  if (status === window.kakao.maps.services.Status.OK) {
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
                     console.warn("좌표 변환 실패:", site["재산 소재지"], status);
                    resolve(null)
                  }
                })
              }, 50); // 50ms 딜레이
            }),
        )

        const geocodedResults = (await Promise.all(geocodePromises)).filter(Boolean) as MapLocation[]
        console.log("좌표 변환 완료:", geocodedResults.length, "개", geocodedResults);


        // 4. 지도에 마커 표시
        if (geocodedResults.length > 0) {
            console.log("마커를 생성합니다...");
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
            console.warn("마커를 생성할 데이터가 없습니다.");
            setLoadingMessage("주소를 좌표로 변환하는데 실패했습니다. 주소 형식을 확인해주세요.");
        }


      } catch (error) {
        console.error("데이터 처리 중 오류 발생:", error)
        setLoadingMessage("데이터를 처리하는 중 오류가 발생했습니다.")
      } finally {
        setIsLoading(false)
      }
    })
  }, [])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Search */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="장소 또는 제안 검색" className="pl-10 pr-4" disabled />
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">{loadingMessage}</p>
          </div>
        )}
      </div>

      {/* Map Modal */}
      {selectedLocation && (
        <MapModal
          location={{
            ...selectedLocation,
            name: `${selectedLocation.address}`,
            usage: `유형분류: ${selectedLocation.usage}`,
          }}
          onClose={() => setSelectedLocation(null)}
          onCreateProposal={(locationId) => {
            console.log("Create proposal for:", locationId)
          }}
        />
      )}
    </div>
  )
}

