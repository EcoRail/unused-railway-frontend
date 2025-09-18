"use client"

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface WelcomeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeModal({ isOpen, onOpenChange }: WelcomeModalProps) {
  const [page, setPage] = useState(1);
  
  const handleDoNotShowAgain = () => {
    sessionStorage.setItem('hasSeenWelcomeModal', 'true');
    onOpenChange(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => setPage(1), 200);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {/* 배경색을 흰색(#ffffff)으로 지정합니다. */}
      <DialogContent
        className="sm:max-w-lg flex flex-col h-[85vh]"
        style={{ backgroundColor: "#ffffff" }}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl">글 등록 방법 🚆</DialogTitle>
          <DialogDescription>
            {page === 1 
              ? "지도에서 제안하고 싶은 장소의 마커를 클릭하세요."
              : "내가 꿈꾸는 공간을 제안하러 가볼까요?"}
          </DialogDescription>
        </DialogHeader>
        
        {/* 이미지 영역 */}
        <div className="flex-1 overflow-y-auto py-4">
          {page === 1 ? (
            <Image
              src="/welcome-guide-1.png"
              alt="유레일카 사용 가이드 1"
              width={1000} height={750}
              className="w-full h-auto"
            />
          ) : (
            <Image
              src="/welcome-guide-2.png"
              alt="유레일카 사용 가이드 2"
              width={1000} height={750}
              className="w-full h-auto"
            />
          )}
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-between items-center pt-4 shrink-0">
          <div className="w-24">
            {page === 2 && (
              <Button variant="ghost" onClick={() => setPage(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
              </Button>
            )}
          </div>

          <span className="text-sm text-gray-500">{page} / 2</span>

          <div className="w-24 flex justify-end">
            {page === 1 ? (
              <Button onClick={() => setPage(2)}>
                다음
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleDoNotShowAgain}>
                다시 보지 않기
              </Button>
            )}
          </div>
        </div>
        
        {page === 2 && (
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        )}
      </DialogContent>
    </Dialog>
  );
}
