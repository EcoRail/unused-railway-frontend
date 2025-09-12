"use client"

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// 경로를 수정했습니다.
import { Card, CardContent } from "@/components/ui/card";

// 타입 정의
interface User {
  username: string;
  email: string;
}
interface Post {
  id: number;
  title: string;
}

// 공통 API 호출 함수
async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    return fetch(url, { ...options, headers });
}

export function ProfileScreen({ onLogout, onPostSelect }: { onLogout: () => void, onPostSelect: (postId: number) => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [recommendedPosts, setRecommendedPosts] = useState<any[]>([]);

  useEffect(() => {
    // 사용자 정보 가져오기
    fetchWithAuth('http://127.0.0.1:8000/api/auth/user/')
      .then(res => res.json())
      .then(data => setUser(data));

    // 내가 쓴 글 가져오기
    fetchWithAuth('http://127.0.0.1:8000/api/posts/my_posts/')
      .then(res => res.json())
      .then(data => setMyPosts(data.results || data));

    // 내가 추천한 글 가져오기
    fetchWithAuth('http://127.0.0.1:8000/api/posts/recommended_posts/')
      .then(res => res.json())
      .then(data => setRecommendedPosts(data.results || data));
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await fetchWithAuth('http://127.0.0.1:8000/api/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    onLogout();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('정말로 회원 탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      const response = await fetchWithAuth('http://127.0.0.1:8000/api/auth/user/', {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('회원 탈퇴가 완료되었습니다.');
        handleLogout();
      } else {
        alert('회원 탈퇴에 실패했습니다.');
      }
    }
  };

  if (!user) {
    return <div className="p-4">로딩 중...</div>;
  }

  return (
    <div className="h-full overflow-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-16 h-16">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.username}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Tabs defaultValue="my-posts">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-posts">나의 제안</TabsTrigger>
          <TabsTrigger value="recommended-posts">추천한 제안</TabsTrigger>
        </TabsList>
        <TabsContent value="my-posts">
          {myPosts.map((post: any) => (
            <Card key={post.id} className="mb-2 cursor-pointer hover:bg-muted/50" onClick={() => onPostSelect(post.id)}>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>{post.railway_property_address}</span>
                  <span>{post.status_display}</span>
                </div>
                <div className="font-semibold mt-1">{post.title}</div>
                <div className="text-xs text-muted-foreground mt-1">작성자: {post.author_username}</div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="recommended-posts">
          {recommendedPosts.map((post: any) => (
            <Card key={post.id} className="mb-2 cursor-pointer hover:bg-muted/50" onClick={() => onPostSelect(post.id)}>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>{post.railway_property_address}</span>
                  <span>{post.status_display}</span>
                </div>
                <div className="font-semibold mt-1">{post.title}</div>
                <div className="text-xs text-muted-foreground mt-1">작성자: {post.author_username}</div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <div className="mt-8 space-y-2">
        <Button onClick={handleLogout} variant="outline" className="w-full">로그아웃</Button>
        <Button onClick={handleDeleteAccount} variant="destructive" className="w-full">회원 탈퇴</Button>
      </div>
    </div>
  );
}

