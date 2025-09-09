"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users, CheckCircle, AlertCircle } from "lucide-react"
import { PostDetailView } from "./post-detail-view"

interface Proposal {
  id: string
  title: string
  location: string
  timeAgo: string
  description: string
  recommendCount: number
  totalSlots: number
  status: "recruiting" | "completed"
  image: string
}

// Mock data based on the provided images
const mockProposals: Proposal[] = [
  {
    id: "1",
    title: "대전역 인근 커뮤니티 가든 조성",
    location: "대전역 부지",
    timeAgo: "2시간 전",
    description: "지역 주민들이 함께 가꾸는 도시농업 공간을 만들어보려고 합니다. 다 함께하실 분들을 모집합니다.",
    recommendCount: 8,
    totalSlots: 15,
    status: "recruiting",
    image: "/community-garden-with-vegetables-and-flowers.jpg",
  },
  {
    id: "2",
    title: "서대전역 소규모 문화공간",
    location: "서대전역 부지",
    timeAgo: "5시간 전",
    description: "지역 예술가들을 위한 전시 및 공연 공간을 만들고 싶습니다. 월 1-2회 정기 전시와 소규모 공연을...",
    recommendCount: 12,
    totalSlots: 20,
    status: "completed",
    image: "/small-cultural-space-with-art-exhibition.jpg",
  },
  {
    id: "3",
    title: "복합터미널 근처 팝업스토어",
    location: "대전복합터미널 부지",
    timeAgo: "1일 전",
    description: "젊은 창업자들을 위한 팝업스토어 공간을 제안합니다. 저렴한 임대료로 창업 기회를 제공하고...",
    recommendCount: 6,
    totalSlots: 10,
    status: "recruiting",
    image: "/modern-popup-store-with-young-entrepreneurs.jpg",
  },
]

export function HomeScreen() {
  const [proposals] = useState<Proposal[]>(mockProposals)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const totalProposals = proposals.length

  const handleShowPostDetail = (postId: string) => {
    setSelectedPostId(postId)
  }

  const handleBackToHome = () => {
    setSelectedPostId(null)
  }

  if (selectedPostId) {
    return <PostDetailView postId={selectedPostId} onBack={handleBackToHome} />
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">장소 협의 및 계획</h1>
            <p className="text-muted-foreground mt-1">지역 주민들의 참여 제안</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{totalProposals}</div>
            <div className="text-sm text-muted-foreground">총 제안</div>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {proposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} onCardClick={handleShowPostDetail} />
        ))}
      </div>
    </div>
  )
}

interface ProposalCardProps {
  proposal: Proposal
  onCardClick: (postId: string) => void
}

function ProposalCard({ proposal, onCardClick }: ProposalCardProps) {
  const handleCardClick = () => {
    onCardClick(proposal.id)
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div className="flex-shrink-0">
            <img
              src={proposal.image || "/placeholder.svg"}
              alt={proposal.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground text-lg leading-tight">{proposal.title}</h3>
              <StatusBadge status={proposal.status} />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{proposal.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{proposal.timeAgo}</span>
              </div>
            </div>

            <p className="text-sm text-foreground mb-3 line-clamp-2">{proposal.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm">
                <Users size={16} className="text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {proposal.recommendCount}/{proposal.totalSlots}명
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatusBadgeProps {
  status: "recruiting" | "completed"
}

function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "recruiting") {
    return (
      <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground border-secondary/30">
        <AlertCircle size={12} className="mr-1" />
        모집중
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/30">
      <CheckCircle size={12} className="mr-1" />
      완료
    </Badge>
  )
}
