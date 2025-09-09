"use client"

import { useState, useRef } from "react"
import { Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapModal } from "@/components/map-modal"
import { PostCreationForm } from "@/components/post-creation-form"

interface MapLocation {
  id: string
  name: string
  area: string
  usage: string
  lat: number
  lng: number
  proposals: Array<{
    id: string
    title: string
    description: string
    image: string
    status: "recruiting" | "completed"
    recommendCount: number
  }>
}

// Mock locations based on Daejeon area
const mockLocations: MapLocation[] = [
  {
    id: "1",
    name: "호남선 유휴부지 (27146)",
    area: "13㎡",
    usage: "활용 · 사용여부: 미사용 · 24년 용도: 미활용 · 향후 사용계획 및 추진사항: 수요와 용도에 따른 사용허가",
    lat: 36.3315,
    lng: 127.4345,
    proposals: [
      {
        id: "1",
        title: "대전역 인근 커뮤니티 가든 조성",
        description: "지역 주민들이 함께 가꾸는 도시농업 공간을 만들어보려고 합니다.",
        image: "/community-garden-with-vegetables-and-flowers.jpg",
        status: "recruiting",
        recommendCount: 8,
      },
      {
        id: "4",
        title: "역사 문화 체험관",
        description: "대전의 철도 역사를 체험할 수 있는 문화 공간 제안입니다.",
        image: "/railway-history-museum-interactive-displays.jpg",
        status: "recruiting",
        recommendCount: 15,
      },
    ],
  },
  {
    id: "2",
    name: "경부선 유휴부지 (15832)",
    area: "25㎡",
    usage: "활용 · 사용여부: 미사용 · 24년 용도: 미활용 · 향후 사용계획 및 추진사항: 검토 중",
    lat: 36.3245,
    lng: 127.3845,
    proposals: [
      {
        id: "2",
        title: "서대전역 소규모 문화공간",
        description: "지역 예술가들을 위한 전시 및 공연 공간을 만들고 싶습니다.",
        image: "/small-cultural-space-with-art-exhibition.jpg",
        status: "completed",
        recommendCount: 12,
      },
    ],
  },
  {
    id: "3",
    name: "충북선 유휴부지 (09421)",
    area: "18㎡",
    usage: "활용 · 사용여부: 미사용 · 24년 용도: 미활용 · 향후 사용계획 및 추진사항: 활용 방안 검토",
    lat: 36.3515,
    lng: 127.3845,
    proposals: [],
  },
]

const filterOptions = [
  { id: "all", label: "전체", color: "bg-primary" },
  { id: "recruiting", label: "모집중", color: "bg-secondary" },
  { id: "completed", label: "완료", color: "bg-muted" },
]

export function MapScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormLocationId, setCreateFormLocationId] = useState<string>("")
  const mapRef = useRef<HTMLDivElement>(null)

  // Mock map implementation - in real app, this would use Google Maps API
  const handleMarkerClick = (location: MapLocation) => {
    setSelectedLocation(location)
  }

  const handleCreateProposal = (locationId: string) => {
    setCreateFormLocationId(locationId)
    setShowCreateForm(true)
    setSelectedLocation(null)
  }

  const handleBackFromForm = () => {
    setShowCreateForm(false)
    setCreateFormLocationId("")
  }

  const handleSubmitProposal = async (postData: any) => {
    console.log("Submitting proposal:", postData, "for location:", createFormLocationId)
    // TODO: Submit to backend

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Close form and show success
    setShowCreateForm(false)
    setCreateFormLocationId("")

    // TODO: Show success message or refresh data
  }

  const filteredLocations = mockLocations.filter((location) => {
    if (selectedFilter === "all") return true
    return location.proposals.some((proposal) => proposal.status === selectedFilter)
  })

  const currentLocation = mockLocations.find((loc) => loc.id === createFormLocationId)

  if (showCreateForm && currentLocation) {
    return (
      <PostCreationForm
        locationId={createFormLocationId}
        locationName={currentLocation.name}
        onBack={handleBackFromForm}
        onSubmit={handleSubmitProposal}
      />
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Search */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="내 근처 공간 찾기"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mt-4">
          {filterOptions.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className="text-xs"
            >
              <div className={`w-2 h-2 rounded-full ${filter.color} mr-2`} />
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full bg-muted/20 relative overflow-hidden">
          {/* Mock Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50">
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" className="text-muted-foreground">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          {/* Mock Map Markers */}
          {filteredLocations.map((location, index) => (
            <div
              key={location.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: `${30 + index * 25}%`,
                top: `${40 + index * 15}%`,
              }}
              onClick={() => handleMarkerClick(location)}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-card px-2 py-1 rounded text-xs font-medium shadow-md whitespace-nowrap">
                  {location.name.split(" ")[0]}
                </div>
              </div>
            </div>
          ))}

          {/* Mock Roads/Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <path
              d="M 20% 60% Q 40% 40% 60% 50% T 90% 45%"
              stroke="#e5e7eb"
              strokeWidth="3"
              fill="none"
              strokeDasharray="5,5"
            />
            <path
              d="M 10% 30% Q 30% 70% 70% 60% T 95% 70%"
              stroke="#e5e7eb"
              strokeWidth="2"
              fill="none"
              strokeDasharray="3,3"
            />
          </svg>
        </div>
      </div>

      {/* Map Modal */}
      {selectedLocation && (
        <MapModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onCreateProposal={handleCreateProposal}
        />
      )}
    </div>
  )
}
