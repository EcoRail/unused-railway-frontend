"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Users, CheckCircle, AlertCircle, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MapLocation {
  id: string
  name: string
  area: string
  usage: string
  lat: number
  lng: number
  proposals: Array<{
    id: number
    title: string
    content: string
    image?: string
    status?: "recruiting" | "completed"
    status_display?: string
    recommendCount: number
  }>
}

interface MapModalProps {
  location: MapLocation
  onClose: () => void
  onCreateProposal: (locationId: string) => void
  onOpenPost?: (postId: number) => void
}

export function MapModal({ location, onClose, onCreateProposal, onOpenPost }: MapModalProps) {
  const [currentProposalIndex, setCurrentProposalIndex] = useState(0)
  const [proposals, setProposals] = useState(location.proposals)
  const currentProposal = proposals[currentProposalIndex]

  useEffect(() => {
    const load = async () => {
      try {
        // 1) 주소로 RailwayProperty 조회
        const addr = location.name
        const propRes = await fetch(`http://127.0.0.1:8000/api/map/properties/?search=${encodeURIComponent(addr)}`)
        const propData = await propRes.json()
        const properties = propData.results || propData
        const exact = properties?.find((p: any) => p.address === addr) || properties?.[0]
        if (!exact) {
          setProposals([])
          setCurrentProposalIndex(0)
          return
        }
        // 2) 해당 property id로 posts 조회
        const postsRes = await fetch(`http://127.0.0.1:8000/api/posts/?railway_property=${exact.id}`)
        const postsData = await postsRes.json()
        const list = (postsData.results || postsData)
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((p: any) => ({
          id: p.id,
          title: p.title,
          content: p.content,
          created_at: p.created_at,
          recommendCount: p.recommendation_count ?? 0,
          status_display: p.status_display,
        }))
        setProposals(list)
        setCurrentProposalIndex(0)
      } catch (e) {}
    }
    load()
  }, [location.id, location.name])

  const handlePrevious = useCallback(() => {
    setCurrentProposalIndex((prev) => (prev > 0 ? prev - 1 : location.proposals.length - 1))
  }, [location.proposals.length])

  const handleNext = useCallback(() => {
    setCurrentProposalIndex((prev) => (prev < location.proposals.length - 1 ? prev + 1 : 0))
  }, [location.proposals.length])

  const handleCreateProposal = () => {
    onCreateProposal(location.id)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-md mx-auto rounded-xl" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-0 max-h-[80vh] overflow-auto">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-lg">{location.name}</h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">면적: {location.area}</p>
                <p className="text-sm text-muted-foreground">향후 사용계획 및 추진사항: {location.usage}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {proposals.length > 0 ? (
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">
                  제안 목록 ({proposals.length})
                </h4>
              </div>

              <div className="relative">
                {/* Swipeable Proposal Card */}
                <div
                  className="relative overflow-hidden cursor-grab active:cursor-grabbing"
                  onTouchStart={(e) => {
                    const startX = e.touches[0].clientX
                    const handleTouchEnd = (endEvent: TouchEvent) => {
                      document.removeEventListener("touchend", handleTouchEnd)
                      const endX = endEvent.changedTouches[0].clientX
                      const diff = startX - endX
                      if (Math.abs(diff) > 50) {
                        if (diff > 0) {
                          handleNext()
                        } else {
                          handlePrevious()
                        }
                      }
                    }
                    document.addEventListener("touchend", handleTouchEnd)
                  }}
                  onMouseDown={(e) => {
                    const startX = e.clientX
                    const handleMouseUp = (endEvent: MouseEvent) => {
                      document.removeEventListener("mouseup", handleMouseUp)
                      const endX = endEvent.clientX
                      const diff = startX - endX
                      if (Math.abs(diff) > 50) {
                        if (diff > 0) {
                          handleNext()
                        } else {
                          handlePrevious()
                        }
                      }
                    }
                    document.addEventListener("mouseup", handleMouseUp)
                  }}
                >
                  {/* Status Badge only */}
                  <div className="mb-2">
                    <StatusBadge status={(currentProposal as any)?.status === "completed" ? "completed" : "recruiting"} />
                  </div>

                  {/* Content */}
                  <div className="space-y-3 cursor-pointer" onClick={() => onOpenPost && currentProposal && onOpenPost((currentProposal as any).id)}>
                    <h4 className="font-semibold text-lg">{(currentProposal as any)?.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{(currentProposal as any)?.content}</p>

                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-muted-foreground" />
                      <span className="text-sm font-medium">{(currentProposal as any)?.recommendCount ?? 0}명이 추천</span>
                    </div>
                  </div>

                  {/* Pagination Dots */}
                  {proposals.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      {proposals.map((_, index) => (
                        <button
                          key={index}
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            index === currentProposalIndex ? "bg-primary" : "bg-muted-foreground/30",
                          )}
                          onClick={() => setCurrentProposalIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {proposals.length > 1 && (
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
                    <button
                      aria-label="previous"
                      className="pointer-events-auto w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"
                      onClick={(e) => { e.stopPropagation(); setCurrentProposalIndex((i) => (i > 0 ? i - 1 : proposals.length - 1)) }}
                    >
                      {"<"}
                    </button>
                    <button
                      aria-label="next"
                      className="pointer-events-auto w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"
                      onClick={(e) => { e.stopPropagation(); setCurrentProposalIndex((i) => (i < proposals.length - 1 ? i + 1 : 0)) }}
                    >
                      {">"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Added empty state when no proposals exist */
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">제안 목록 (0)</h4>
              </div>
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-4">아직 제안이 없습니다. 첫 제안을 남겨보세요.</p>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-border">
            <Button onClick={handleCreateProposal} className="w-full flex items-center gap-2">
              <Plus size={16} />
              제안 등록
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface StatusBadgeProps {
  status: "recruiting" | "completed"
}

function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "recruiting") {
    return (
      <span className="inline-flex items-center rounded-full bg-[#D7DF23] text-black px-2 py-0.5 text-xs font-semibold">
        <AlertCircle size={12} className="mr-1" /> 모집중
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-gray-300 text-gray-800 px-2 py-0.5 text-xs font-semibold">
      <CheckCircle size={12} className="mr-1" /> 완료
    </span>
  )
}

