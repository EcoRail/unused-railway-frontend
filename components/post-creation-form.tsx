"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface PostCreationFormProps {
  railwayPropertyId: number;
  onPostCreated: () => void;
  onCancel: () => void;
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

export function PostCreationForm({ railwayPropertyId, onPostCreated, onCancel }: PostCreationFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("제출 데이터:", {
      title,
      content,
      railway_property: railwayPropertyId,
    });

    const response = await fetchWithAuth('http://127.0.0.1:8000/api/posts/', {
      method: 'POST',
      body: JSON.stringify({
        title,
        content,
        railway_property: railwayPropertyId,
      }),
    });

    const data = await response.json();
    console.log("서버 응답:", response.status, data);

    if (response.ok) {
      alert('제안이 성공적으로 등록되었습니다.');
      onPostCreated();
    } else {
      setError(
        data.railway_property
          ? `잘못된 railway_property ID (${railwayPropertyId})`
          : '제안 등록에 실패했습니다. 로그인 상태를 확인해주세요.'
      );
    }
  };


  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>새로운 제안 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제안의 제목을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="제안의 상세 내용을 입력하세요"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>취소</Button>
              <Button type="submit">제안 등록하기</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

