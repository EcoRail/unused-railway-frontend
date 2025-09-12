"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, MessageCircle } from "lucide-react"

// API 응답 데이터에 대한 타입 정의
interface Post {
  id: number;
  title: string;
  content: string;
  author_username: string;
  recommendation_count: number;
  created_at: string;
  is_recommended: boolean;

  // 조회 전용 필드
  railway_property_address: string;
  status_display: string;
  railway_property_id?: number;
}



interface HomeScreenProps {
  onPostSelect: (postId: number) => void;
}

// API 호출을 위한 헬퍼 함수
async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    return fetch(url, { ...options, headers });
}


export function HomeScreen({ onPostSelect }: HomeScreenProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true);

  const fetchPosts = (latitude?: number, longitude?: number) => {
    let url = 'http://127.0.0.1:8000/api/posts/';
    // 위치 정렬 파라미터는 현재 백엔드에서 사용하지 않으므로 제거

    setLoading(true);
    fetchWithAuth(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
      })
      .then(data => {
          // DRF 페이지네이션 응답 형식에 맞춤
          setPosts(data.results || data);
          setLoading(false);
      })
      .catch(error => {
          console.error("Error fetching posts:", error);
          setLoading(false);
      });
  };

  useEffect(() => {
    // 사용자 위치 정보 요청
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPosts(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Could not get location, fetching posts without sorting.", error);
          fetchPosts(); // 위치 정보 거부 시, 기본 목록 호출
        }
      );
    } else {
      fetchPosts(); // Geolocation API 미지원 브라우저
    }
  }, []);
  
  const handleRecommend = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const response = await fetchWithAuth(`http://127.0.0.1:8000/api/posts/${postId}/recommend/`, {
        method: 'POST'
    });
    if (response.ok) {
        // 추천 성공 시, 상태를 반전시키고 추천 수를 조정합니다.
        setPosts(posts.map(p => {
            if (p.id === postId) {
                const newIsRecommended = !p.is_recommended;
                const newRecommendationCount = newIsRecommended 
                    ? p.recommendation_count + 1 
                    : p.recommendation_count - 1;
                return { 
                    ...p, 
                    is_recommended: newIsRecommended,
                    recommendation_count: newRecommendationCount
                };
            }
            return p;
        }));
    } else {
        alert("추천하려면 로그인이 필요합니다.");
    }
  }

  if (loading) {
    return <div className="p-4">로딩 중...</div>;
  }

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">제안 목록</h1>
      {posts.map((post) => (
        <Card key={post.id} onClick={() => onPostSelect(post.id)} className="cursor-pointer hover:bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{post.title}</CardTitle>
            <div className="text-sm text-muted-foreground flex justify-between">
              <span>{post.railway_property_address}</span>
              <span>{post.status_display}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-2 text-sm text-foreground">{post.content}</p> {/* 내용 2줄만 */}
            <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
              <span>작성자: {post.author_username}</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                <span>{post.recommendation_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      ))}
    </div>
  )
}

