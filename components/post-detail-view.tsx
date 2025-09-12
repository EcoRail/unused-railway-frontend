"use client"

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Send } from 'lucide-react';
// 경로를 수정했습니다.
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// 타입 정의
interface Comment {
  id: number;
  author_username: string;
  content: string;
  created_at: string;
  parent?: number | null;
  replies?: Comment[];
}
interface PostDetail {
  id: number;
  title: string;
  content: string;
  author_username: string;
  created_at: string;
  recommendation_count: number;
  dislike_count: number;
  is_recommended: boolean;
  is_disliked: boolean;
  comments: Comment[];
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

export function PostDetailView({ postId, onBack }: { postId: number, onBack: () => void }) {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  const fetchPostDetail = () => {
    fetchWithAuth(`http://127.0.0.1:8000/api/posts/${postId}/`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => setPost(data))
      .catch(error => console.error("Failed to fetch post details:", error));
  };

  useEffect(() => {
    fetchPostDetail();
    fetchWithAuth('http://127.0.0.1:8000/api/auth/user/')
      .then(res => res.ok ? res.json() : null)
      .then(data => setCurrentUsername(data?.username || null))
      .catch(() => setCurrentUsername(null))
  }, [postId]);

  const handleAction = async (action: 'recommend' | 'dislike') => {
    const response = await fetchWithAuth(`http://127.0.0.1:8000/api/posts/${postId}/${action}/`, {
      method: 'POST',
    });
    if (response.ok) {
      fetchPostDetail(); // 액션 후 데이터 새로고침
    } else {
      alert('로그인이 필요합니다.');
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const response = await fetchWithAuth(`http://127.0.0.1:8000/api/posts/${postId}/comments/`, {
      method: 'POST',
      body: JSON.stringify({ content: newComment, parent: replyTargetId }),
    });
    if (response.ok) {
      setNewComment('');
      setReplyTargetId(null);
      fetchPostDetail(); // 댓글 작성 후 데이터 새로고침
    } else {
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('글을 삭제하시겠습니까?')) return;
    const res = await fetchWithAuth(`http://127.0.0.1:8000/api/posts/${postId}/`, { method: 'DELETE' });
    if (res.ok) {
      onBack();
    } else {
      alert('삭제 권한이 없거나 실패했습니다.');
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    const res = await fetchWithAuth(`http://127.0.0.1:8000/api/posts/${postId}/comments/${commentId}/`, { method: 'DELETE' });
    if (res.ok) {
      fetchPostDetail();
    } else {
      alert('삭제 권한이 없거나 실패했습니다.');
    }
  }

  if (!post) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="h-full p-4 overflow-auto">
      <Button onClick={onBack} variant="ghost" className="mb-4">{'< 뒤로가기'}</Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          <div className="text-sm text-muted-foreground flex justify-between">
            <span>작성자: {post.author_username}</span>
            <span>{new Date(post.created_at).toLocaleString()}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap min-h-[100px]">{post.content}</p>
          <div className="flex gap-4 mt-6">
            <Button variant="outline" onClick={() => handleAction('recommend')} className="flex items-center gap-2">
              <ThumbsUp className={`w-4 h-4 ${post.is_recommended ? 'text-blue-500' : ''}`} /> 추천 {post.recommendation_count}
            </Button>
            <Button variant="outline" onClick={() => handleAction('dislike')} className="flex items-center gap-2">
              <ThumbsDown className={`w-4 h-4 ${post.is_disliked ? 'text-red-500' : ''}`} /> 비추천 {post.dislike_count}
            </Button>
          </div>
          {currentUsername && currentUsername === post.author_username && (
            <div className="flex justify-end mt-4">
              <Button variant="destructive" onClick={handleDeletePost}>글 삭제</Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" /> 댓글 {post.comments.length}
        </h3>
        {replyTargetId === null && (
          <div className="flex gap-2">
            <Textarea 
              placeholder="댓글을 입력하세요..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button onClick={handleCommentSubmit}><Send className="w-4 h-4" /></Button>
          </div>
        )}
        <Separator className="my-4" />
        <div className="space-y-4">
          {post.comments.filter(c => !c.parent).map(comment => (
            <div key={comment.id} className="border rounded p-3">
              <div className="flex justify-between items-center">
                <div className="font-bold text-sm">{comment.author_username}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setReplyTargetId(comment.id)}>답글</Button>
                  {currentUsername && currentUsername === comment.author_username && (
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteComment(comment.id)}>삭제</Button>
                  )}
                </div>
              </div>
              <p className="text-sm mt-1">{comment.content}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(comment.created_at).toLocaleString()}</p>
              {(comment.replies || []).map(reply => (
                <div key={reply.id} className="mt-3 ml-4 pl-3 border-l">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-xs">{reply.author_username}</div>
                    {currentUsername && currentUsername === reply.author_username && (
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteComment(reply.id)}>삭제</Button>
                    )}
                  </div>
                  <p className="text-sm mt-1">{reply.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(reply.created_at).toLocaleString()}</p>
                </div>
              ))}
              {replyTargetId === comment.id && (
                <div className="mt-3 flex gap-2">
                  <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="답글을 입력하세요..." />
                  <Button onClick={handleCommentSubmit}><Send className="w-4 h-4" /></Button>
                  <Button variant="outline" onClick={() => { setReplyTargetId(null); setNewComment(''); }}>취소</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

