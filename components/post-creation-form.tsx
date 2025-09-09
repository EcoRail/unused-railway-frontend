"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, X, MapPin } from "lucide-react"

interface PostCreationFormProps {
  locationId: string
  locationName: string
  onBack: () => void
  onSubmit: (postData: PostFormData) => void
}

interface PostFormData {
  title: string
  content: string
  image?: File
}

export function PostCreationForm({ locationId, locationName, onBack, onSubmit }: PostCreationFormProps) {
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData: PostFormData = {
        ...formData,
        image: selectedImage || undefined,
      }

      await onSubmit(submitData)

      // Reset form
      setFormData({ title: "", content: "" })
      setSelectedImage(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Failed to submit post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.title.trim() && formData.content.trim()

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">제안 등록</h1>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={14} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{locationName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              제목 *
            </Label>
            <Input
              id="title"
              placeholder="제안 제목을 입력하세요"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full"
              maxLength={100}
            />
            <div className="text-xs text-muted-foreground text-right">{formData.title.length}/100</div>
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              내용 *
            </Label>
            <Textarea
              id="content"
              placeholder="제안 내용을 자세히 작성해주세요&#10;&#10;예시:&#10;• 프로젝트 목표&#10;• 기대 효과&#10;• 참여 방법&#10;• 일정 계획"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full min-h-[200px] resize-none"
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">{formData.content.length}/1000</div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">이미지 (선택사항)</Label>

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-border"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                  onClick={handleRemoveImage}
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-6">
                <div className="text-center">
                  <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    이미지를 업로드하여 제안을 더욱 생생하게 표현해보세요
                  </p>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>이미지 선택</span>
                    </Button>
                  </Label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Guidelines */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <h3 className="text-sm font-medium">작성 가이드라인</h3>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 구체적이고 실현 가능한 제안을 작성해주세요</li>
                <li>• 지역 주민들에게 도움이 되는 내용으로 작성해주세요</li>
                <li>• 욕설이나 부적절한 내용은 삭제될 수 있습니다</li>
                <li>• 개인정보나 연락처는 포함하지 마세요</li>
              </ul>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Submit Button */}
      <div className="border-t border-border p-4">
        <Button type="submit" onClick={handleSubmit} disabled={!isFormValid || isSubmitting} className="w-full">
          {isSubmitting ? "등록 중..." : "제안 등록하기"}
        </Button>
      </div>
    </div>
  )
}
