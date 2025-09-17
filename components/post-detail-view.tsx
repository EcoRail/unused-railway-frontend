"use client"

import { useState, useEffect, type JSX } from "react"
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Trash2,
  Edit2,
  Reply,
  X,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Comment {
  id: number
  author_username: string
  content: string
  created_at: string
  parent: number | null
  replies?: Comment[]
}
interface PostDetail {
  id: number
  title: string
  content: string
  author_username: string
  created_at: string
  recommendation_count: number
  dislike_count: number
  is_recommended: boolean
  is_disliked: boolean
  comments: Comment[]
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("accessToken")
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  return fetch(url, { ...options, headers })
}

export function PostDetailView({
  postId,
  onBack,
}: {
  postId: number
  onBack: () => void
}) {
  const [post, setPost] = useState<PostDetail | null>(null)
  const [newComment, setNewComment] = useState("")
  const [replyContent, setReplyContent] = useState("")
  const [replyTarget, setReplyTarget] = useState<number | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    fetch("http://127.0.0.1:8000/api/auth/user/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCurrentUser(data.username))
      .catch(() => setCurrentUser(null))
  }, [])

  const fetchPostDetail = () => {
    fetchWithAuth(`http://127.0.0.1:8000/api/posts/${postId}/`)
      .then((res) => res.json())
      .then((data) => setPost(data))
  }

  useEffect(() => {
    fetchPostDetail()
  }, [postId])

  const rootComments = post?.comments.filter((c) => c.parent === null) || []
  const countAllFromRoots = (roots: Comment[]): number => {
    const seen = new Set<number>()
    const walk = (arr: Comment[]) => {
      for (const c of arr) {
        if (!seen.has(c.id)) {
          seen.add(c.id)
          if (c.replies?.length) walk(c.replies)
        }
      }
    }
    walk(roots)
    return seen.size
  }
  const totalComments = countAllFromRoots(rootComments)

  const handleAction = async (action: "recommend" | "dislike") => {
    const res = await fetchWithAuth(
      `http://127.0.0.1:8000/api/posts/${postId}/${action}/`,
      { method: "POST" }
    )
    if (res.ok) fetchPostDetail()
  }

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return
    const res = await fetchWithAuth(
      `http://127.0.0.1:8000/api/posts/${postId}/comments/`,
      {
        method: "POST",
        body: JSON.stringify({ content: newComment, parent: null }),
      }
    )
    if (res.ok) {
      setNewComment("")
      fetchPostDetail()
    }
  }

  const handleReplySubmit = async (parentId: number) => {
    if (!replyContent.trim()) return
    const res = await fetchWithAuth(
      `http://127.0.0.1:8000/api/posts/${postId}/comments/`,
      {
        method: "POST",
        body: JSON.stringify({ content: replyContent, parent: parentId }),
      }
    )
    if (res.ok) {
      setReplyContent("")
      setReplyTarget(null)
      fetchPostDetail()
    }
  }

  const handleUpdateComment = async (commentId: number) => {
    const res = await fetchWithAuth(
      `http://127.0.0.1:8000/api/posts/${postId}/comments/${commentId}/`,
      {
        method: "PUT",
        body: JSON.stringify({ content: editingContent }),
      }
    )
    if (res.ok) {
      setEditingCommentId(null)
      setEditingContent("")
      fetchPostDetail()
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (confirm("댓글을 삭제하시겠습니까?")) {
      const res = await fetchWithAuth(
        `http://127.0.0.1:8000/api/posts/${postId}/comments/${commentId}/`,
        { method: "DELETE" }
      )
      if (res.ok) fetchPostDetail()
    }
  }

  const handleDeletePost = async () => {
    if (confirm("글을 삭제하시겠습니까?")) {
      const res = await fetchWithAuth(
        `http://127.0.0.1:8000/api/posts/${postId}/`,
        { method: "DELETE" }
      )
      if (res.ok) onBack()
    }
  }

  const toggleReply = (commentId: number) => {
    setReplyTarget((prev) => (prev === commentId ? null : commentId))
    setReplyContent("")
  }

  const renderComment: (comment: Comment, depth?: number) => JSX.Element = (
    comment,
    depth = 0
  ) => (
    <div
      key={comment.id}
      style={{ marginLeft: depth * 20 }}
      className="border-l pl-2 mt-2"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-bold text-sm">{comment.author_username}</div>
          {editingCommentId === comment.id ? (
            <div className="mt-1">
              <Textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
              />
              <div className="flex gap-2 mt-1">
                <Button
                  size="sm"
                  onClick={() => handleUpdateComment(comment.id)}
                >
                  <Check className="w-4 h-4" /> 저장
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingCommentId(null)
                    setEditingContent("")
                  }}
                >
                  <X className="w-4 h-4" /> 취소
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1">{comment.content}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(comment.created_at).toLocaleString()}
          </p>
        </div>
        {comment.author_username === currentUser &&
          editingCommentId !== comment.id && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingCommentId(comment.id)
                  setEditingContent(comment.content)
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteComment(comment.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
      </div>

      {depth < 1 && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-1"
          onClick={() => toggleReply(comment.id)}
        >
          <Reply className="w-3 h-3" /> 답글
        </Button>
      )}

      {replyTarget === comment.id && (
        <div className="flex gap-2 mt-2">
          <Textarea
            placeholder="답글을 입력하세요..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <Button onClick={() => handleReplySubmit(comment.id)}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}

      {depth < 1 &&
        comment.replies?.map((reply) => renderComment(reply, depth + 1))}
    </div>
  )

  if (!post) return <div>로딩 중...</div>

  return (
    <div
      // 👇 여기가 수정한 부분입니다. (네비게이션 바 높이에 맞게 pt-16, pt-20 등으로 조절)
      className="h-[100vh] overflow-y-scroll p-4 pt-5 pb-50"
      style={{ scrollbarGutter: "stable both-edges" }}
    >
      <Button onClick={onBack} variant="ghost" className="mb-4">
        {"< 뒤로가기"}
      </Button>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          {currentUser && post.author_username === currentUser && (
            <Button variant="outline" size="sm" onClick={handleDeletePost}>
              <Trash2 className="w-4 h-4 mr-1" /> 삭제
            </Button>
          )}
        </CardHeader>
        <div className="px-6 text-sm text-muted-foreground flex justify-between">
          <span>작성자: {post.author_username}</span>
          <span>{new Date(post.created_at).toLocaleString()}</span>
        </div>
        <CardContent>
          <p className="whitespace-pre-wrap min-h-[100px]">{post.content}</p>
          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => handleAction("recommend")}
              className="flex items-center gap-2"
            >
              <ThumbsUp
                className={`w-4 h-4 ${
                  post.is_recommended ? "text-blue-500" : ""
                }`}
              />
              추천 {post.recommendation_count}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAction("dislike")}
              className="flex items-center gap-2"
            >
              <ThumbsDown
                className={`w-4 h-4 ${
                  post.is_disliked ? "text-red-500" : ""
                }`}
              />
              비추천 {post.dislike_count}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" /> 댓글 {totalComments}
        </h3>
        <div className="flex gap-2">
          <Textarea
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button onClick={handleCommentSubmit}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <Separator className="my-4" />
        <div className="space-y-2">
          {rootComments.map((comment) => renderComment(comment))}
        </div>
      </div>
    </div>
  )
}