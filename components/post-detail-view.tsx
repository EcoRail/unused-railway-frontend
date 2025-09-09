"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Heart,
  Reply,
  MoreHorizontal,
  Edit2,
  Trash2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PostDetailProps {
  postId: string
  onBack: () => void
}

interface Comment {
  id: string
  author: string
  content: string
  timeAgo: string
  avatar?: string
  likes: number
  replies?: Comment[]
  isLiked?: boolean
}

interface PostDetail {
  id: string
  title: string
  content: string
  author: string
  location: string
  timeAgo: string
  recommendCount: number
  totalSlots: number
  status: "recruiting" | "completed"
  image: string
  likes: number
  dislikes: number
  comments: Comment[]
}

// Mock data for post detail
const mockPostDetail: PostDetail = {
  id: "1",
  title: "대전역 인근 커뮤니티 가든 조성",
  content: `지역 주민들이 함께 가꾸는 도시농업 공간을 만들어보려고 합니다. 

이 프로젝트의 목표는 다음과 같습니다:
• 지역 주민들의 소통과 화합의 장 마련
• 친환경 도시농업을 통한 지속가능한 생활 실천
• 아이들에게 자연과 농업의 소중함 교육
• 수확한 농산물을 통한 지역 경제 활성화

현재 대전역 인근 유휴부지 약 500㎡ 규모의 공간을 활용하여 커뮤니티 가든을 조성하고자 합니다. 텃밭 구획, 공용 도구 보관소, 휴게 공간 등을 계획하고 있습니다.

관심 있으신 분들의 많은 참여 부탁드립니다!`,
  author: "김철수",
  location: "대전역 부지",
  timeAgo: "2시간 전",
  recommendCount: 8,
  totalSlots: 15,
  status: "recruiting",
  image: "/community-garden-with-vegetables-and-flowers.jpg",
  likes: 24,
  dislikes: 2,
  comments: [
    {
      id: "1",
      author: "박영희",
      content: "정말 좋은 아이디어네요! 아이들과 함께 참여하고 싶습니다.",
      timeAgo: "1시간 전",
      likes: 3,
      isLiked: false,
      replies: [
        {
          id: "1-1",
          author: "김철수",
          content: "감사합니다! 아이들과 함께 하시면 더욱 의미있을 것 같아요.",
          timeAgo: "50분 전",
          likes: 1,
          isLiked: false,
        },
      ],
    },
    {
      id: "2",
      author: "이민수",
      content: "농업 경험이 있어서 도움이 될 수 있을 것 같아요. 언제 시작 예정인가요?",
      timeAgo: "30분 전",
      likes: 5,
      isLiked: true,
      replies: [],
    },
    {
      id: "3",
      author: "최지영",
      content: "우리 동네에 이런 공간이 생긴다면 정말 좋겠어요. 어떻게 참여할 수 있나요?",
      timeAgo: "15분 전",
      likes: 2,
      isLiked: false,
      replies: [],
    },
  ],
}

export function PostDetailView({ postId, onBack }: PostDetailProps) {
  const [post, setPost] = useState<PostDetail>(mockPostDetail)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [userLiked, setUserLiked] = useState(false)
  const [userDisliked, setUserDisliked] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<{ id: string; isReply: boolean; parentId?: string } | null>(
    null,
  )

  const handleLike = () => {
    setUserLiked(!userLiked)
    if (userDisliked) setUserDisliked(false)
  }

  const handleDislike = () => {
    setUserDisliked(!userDisliked)
    if (userLiked) setUserLiked(false)
  }

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        author: "나",
        content: newComment,
        timeAgo: "방금 전",
        likes: 0,
        isLiked: false,
        replies: [],
      }

      setPost((prev) => ({
        ...prev,
        comments: [...prev.comments, newCommentObj],
      }))
      setNewComment("")
    }
  }

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim()) {
      const newReply: Comment = {
        id: `${parentId}-${Date.now()}`,
        author: "나",
        content: replyContent,
        timeAgo: "방금 전",
        likes: 0,
        isLiked: false,
      }

      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((comment) =>
          comment.id === parentId ? { ...comment, replies: [...(comment.replies || []), newReply] } : comment,
        ),
      }))
      setReplyContent("")
      setReplyingTo(null)
    }
  }

  const handleLikeComment = (commentId: string, isReply = false, parentId?: string) => {
    setPost((prev) => ({
      ...prev,
      comments: prev.comments.map((comment) => {
        if (isReply && comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies?.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                    isLiked: !reply.isLiked,
                  }
                : reply,
            ),
          }
        } else if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked,
          }
        }
        return comment
      }),
    }))
  }

  const handleEditComment = (commentId: string, currentContent: string, isReply = false, parentId?: string) => {
    setEditingComment(commentId)
    setEditContent(currentContent)
  }

  const handleSaveEdit = (commentId: string, isReply = false, parentId?: string) => {
    if (editContent.trim()) {
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((comment) => {
          if (isReply && comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies?.map((reply) =>
                reply.id === commentId ? { ...reply, content: editContent } : reply,
              ),
            }
          } else if (comment.id === commentId) {
            return { ...comment, content: editContent }
          }
          return comment
        }),
      }))
      setEditingComment(null)
      setEditContent("")
    }
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
    setEditContent("")
  }

  const handleDeleteComment = (commentId: string, isReply = false, parentId?: string) => {
    setCommentToDelete({ id: commentId, isReply, parentId })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (commentToDelete) {
      setPost((prev) => ({
        ...prev,
        comments: prev.comments
          .map((comment) => {
            if (commentToDelete.isReply && comment.id === commentToDelete.parentId) {
              return {
                ...comment,
                replies: comment.replies?.filter((reply) => reply.id !== commentToDelete.id) || [],
              }
            }
            return comment
          })
          .filter((comment) => comment.id !== commentToDelete.id),
      }))
    }
    setDeleteDialogOpen(false)
    setCommentToDelete(null)
  }

  const canEditComment = (author: string) => author === "나"

  const totalComments = post.comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0)
  }, 0)

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">제안 상세</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Post Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground leading-tight">{post.title}</h2>
                <StatusBadge status={post.status} />
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{post.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{post.timeAgo}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>
                    {post.recommendCount}/{post.totalSlots}명
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{post.author[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">{post.author}</span>
              </div>

              {post.image && (
                <img
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  className="w-full h-48 rounded-lg object-cover mb-4"
                />
              )}

              <div className="prose prose-sm max-w-none">
                <p className="text-foreground whitespace-pre-line leading-relaxed">{post.content}</p>
              </div>

              <div className="border-t border-border mt-6 pt-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant={userLiked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLike}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp size={16} />
                    <span>{post.likes + (userLiked ? 1 : 0)}</span>
                  </Button>
                  <Button
                    variant={userDisliked ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleDislike}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown size={16} />
                    <span>{post.dislikes + (userDisliked ? 1 : 0)}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle size={18} />
                <h3 className="font-semibold">댓글 {totalComments}개</h3>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {/* Comment Input */}
              <div className="flex gap-3 mb-6">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>나</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="댓글을 입력하세요..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <Button size="sm" onClick={handleSubmitComment} disabled={!newComment.trim()}>
                    <Send size={16} />
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="space-y-3">
                    {/* Main Comment */}
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{comment.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                          </div>
                          {canEditComment(comment.author) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-auto p-1">
                                  <MoreHorizontal size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditComment(comment.id, comment.content)}>
                                  <Edit2 size={14} className="mr-2" />
                                  수정
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 size={14} className="mr-2" />
                                  삭제
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        {editingComment === comment.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[60px] resize-none text-sm"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSaveEdit(comment.id)}>
                                저장
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                취소
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-foreground leading-relaxed mb-2">{comment.content}</p>
                        )}

                        {/* Comment Actions */}
                        {editingComment !== comment.id && (
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikeComment(comment.id)}
                              className={`h-auto p-1 ${comment.isLiked ? "text-red-500" : "text-muted-foreground"}`}
                            >
                              <Heart size={14} className={comment.isLiked ? "fill-current" : ""} />
                              <span className="ml-1 text-xs">{comment.likes}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              className="h-auto p-1 text-muted-foreground"
                            >
                              <Reply size={14} />
                              <span className="ml-1 text-xs">답글</span>
                            </Button>
                          </div>
                        )}

                        {/* Reply Input */}
                        {replyingTo === comment.id && (
                          <div className="flex gap-2 mt-3">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">나</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex gap-2">
                              <Textarea
                                placeholder="답글을 입력하세요..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="min-h-[60px] resize-none text-sm"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyContent.trim()}
                              >
                                <Send size={14} />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-11 space-y-3 border-l-2 border-muted pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">{reply.author[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-xs">{reply.author}</span>
                                  <span className="text-xs text-muted-foreground">{reply.timeAgo}</span>
                                </div>
                                {canEditComment(reply.author) && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-auto p-1">
                                        <MoreHorizontal size={12} />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => handleEditComment(reply.id, reply.content, true, comment.id)}
                                      >
                                        <Edit2 size={12} className="mr-2" />
                                        수정
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 size={12} className="mr-2" />
                                        삭제
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>

                              {editingComment === reply.id ? (
                                <div className="space-y-2">
                                  <Textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="min-h-[50px] resize-none text-xs"
                                  />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleSaveEdit(reply.id, true, comment.id)}>
                                      저장
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                      취소
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-foreground leading-relaxed mb-2">{reply.content}</p>
                              )}

                              {/* Reply Actions */}
                              {editingComment !== reply.id && (
                                <div className="flex items-center gap-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLikeComment(reply.id, true, comment.id)}
                                    className={`h-auto p-1 ${reply.isLiked ? "text-red-500" : "text-muted-foreground"}`}
                                  >
                                    <Heart size={12} className={reply.isLiked ? "fill-current" : ""} />
                                    <span className="ml-1 text-xs">{reply.likes}</span>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 댓글을 삭제하시겠습니까? 삭제된 댓글은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
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
