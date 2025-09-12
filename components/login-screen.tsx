"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LoginScreenProps {
  onLogin: (success: boolean) => void
  onGoToRegister: () => void
}

export function LoginScreen({ onLogin, onGoToRegister }: LoginScreenProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null); // 에러 메시지 상태 추가

  // 여기를 수정했습니다!
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); // 이전 에러 메시지 초기화

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // 로그인 성공
        const data = await response.json();
        console.log("로그인 성공:", data);
        // 받은 토큰을 localStorage 등에 저장하는 로직 추가
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        onLogin(true); // 로그인 성공 처리
      } else {
        // 로그인 실패 (예: 아이디 또는 비밀번호 틀림)
        const errorData = await response.json();
        setError(errorData.detail || "아이디 또는 비밀번호가 올바르지 않습니다.");
        onLogin(false);
      }
    } catch (err) {
      // 네트워크 에러 등
      console.error("로그인 요청 에러:", err);
      setError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      onLogin(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Eco Rail Logo" width={80} height={80} />
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
            {/* 에러 메시지 표시 부분 */}
            {error && <p className="text-sm text-red-500">{error}</p>}
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