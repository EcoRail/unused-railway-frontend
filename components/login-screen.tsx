"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Train } from "lucide-react"

interface LoginScreenProps {
  onLogin: (success: boolean) => void
  onGoToRegister: () => void
}

export function LoginScreen({ onLogin, onGoToRegister }: LoginScreenProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login - in real app, this would call Django backend
    if (formData.username && formData.password) {
      onLogin(true)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    // min-h-screen을 h-full로 변경하여 부모 컨테이너에 맞춤
    <div className="h-full bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-none">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Train size={32} className="text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={onGoToRegister} className="text-primary hover:underline">
              회원가입
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
