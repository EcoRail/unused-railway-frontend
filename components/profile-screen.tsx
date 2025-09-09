"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, Heart, LogOut, UserX, MapPin, Users, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Proposal {
  id: string
  title: string
  location: string
  status: "recruiting" | "completed"
  recommendCount: number
  image: string
  createdAt: string
}

interface ProfileScreenProps {
  onLogout: () => void
}

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<"my-proposals" | "recommended">("my-proposals")

  // Mock data - in real app, this would come from API
  const userProfile = {
    nickname: "철도지킴이",
    email: "railway@example.com",
  }

  const myProposals: Proposal[] = [
    {
      id: "1",
      title: "대전역 인근 커뮤니티 가든 조성",
      location: "대전역 부지",
      status: "recruiting" as const,
      recommendCount: 8,
      image: "/community-garden-with-vegetables-and-flowers.jpg",
      createdAt: "2일 전",
    },
    {
      id: "2",
      title: "서대전역 소규모 문화공간",
      location: "서대전 부지",
      status: "completed" as const,
      recommendCount: 12,
      image: "/small-cultural-space-with-art-exhibition.jpg",
      createdAt: "5일 전",
    },
  ]

  const recommendedProposals: Proposal[] = [
    {
      id: "3",
      title: "북한타미널 근처 팝업스토어",
      location: "대전북한타미널 부지",
      status: "recruiting" as const,
      recommendCount: 1,
      image: "/modern-popup-store-with-young-entrepreneurs.jpg",
      createdAt: "1일 전",
    },
    {
      id: "4",
      title: "정성벨테마 철도 역사 박물관",
      location: "정성벨테마 부지",
      status: "recruiting" as const,
      recommendCount: 15,
      image: "/railway-history-museum-interactive-displays.jpg",
      createdAt: "3일 전",
    },
  ]

  const handleDeleteAccount = () => {
    if (confirm("정말로 계정을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      // Handle account deletion
      console.log("Account deletion requested")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-primary/5 to-background p-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 bg-primary/10">
            <AvatarFallback className="text-primary font-semibold text-lg">
              {userProfile.nickname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{userProfile.nickname}</h1>
            <p className="text-muted-foreground text-sm">{userProfile.email}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-4">
        <div className="flex gap-2 bg-muted/30 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("my-proposals")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              activeTab === "my-proposals"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FileText size={16} />
            나의 제안
          </button>
          <button
            onClick={() => setActiveTab("recommended")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              activeTab === "recommended"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Heart size={16} />
            추천한 제안
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        {activeTab === "my-proposals" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">나의 제안 목록</h2>
              <span className="text-sm text-muted-foreground">{myProposals.length}개</span>
            </div>
            {myProposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}

        {activeTab === "recommended" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">내가 추천한 제안</h2>
              <span className="text-sm text-muted-foreground">{recommendedProposals.length}개</span>
            </div>
            {recommendedProposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-8 space-y-3">
        <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-transparent" onClick={onLogout}>
          <LogOut size={20} />
          로그아웃
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-12 text-destructive border-destructive/30 hover:bg-destructive/5 bg-transparent"
          onClick={handleDeleteAccount}
        >
          <UserX size={20} />
          계정 탈퇴
        </Button>
      </div>
    </div>
  )
}

interface ProposalCardProps {
  proposal: Proposal
}

function ProposalCard({ proposal }: ProposalCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          <div className="relative">
            <img
              src={proposal.image || "/placeholder.svg"}
              alt={proposal.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="absolute -top-1 -right-1">
              <StatusBadge status={proposal.status} size="sm" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">{proposal.title}</h3>

            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <MapPin size={12} />
              <span className="truncate">{proposal.location}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users size={12} />
                <span>{proposal.recommendCount}명 추천</span>
              </div>
              <span className="text-xs text-muted-foreground">{proposal.createdAt}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatusBadgeProps {
  status: "recruiting" | "completed"
  size?: "sm" | "default"
}

function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const iconSize = size === "sm" ? 10 : 12
  const className = size === "sm" ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1"

  if (status === "recruiting") {
    return (
      <Badge
        variant="secondary"
        className={cn("bg-secondary/90 text-secondary-foreground border-secondary/30", className)}
      >
        <AlertCircle size={iconSize} className="mr-1" />
        모집중
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={cn("bg-muted/90 text-muted-foreground border-muted-foreground/30", className)}>
      <CheckCircle size={iconSize} className="mr-1" />
      완료
    </Badge>
  )
}
