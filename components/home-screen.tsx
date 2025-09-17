"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, MessageCircle } from "lucide-react"
import { WelcomeModal } from "@/components/welcome-modal"

// API 응답 데이터에 대한 타입 정의
interface Post {
  id: number;
  title: string;
  content: string;
  author_username: string;
  recommendation_count: number;
  created_at: string;
  is_recommended: boolean;
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
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  
  // "이번 세션에서 모달/데이터 로딩을 시작했는지" 기억하는 상태
  const [initialLoadStarted, setInitialLoadStarted] = useState(false);

  const fetchPosts = (latitude?: number, longitude?: number) => {
    let url = 'https://port-0-unused-railway-backend-mfof24a94652eacb.sel3.cloudtype.app/api/posts/';
    setLoading(true);
    fetchWithAuth(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
      })
      .then(data => {
        setPosts(data.results || data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching posts:", error);
        setLoading(false);
      });
  };
  
  // 위치 정보와 함께 게시글을 불러오는 함수
  const loadPostsWithGeo = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchPosts(position.coords.latitude, position.coords.longitude),
        (error) => {
          console.warn("Could not get location, fetching posts without sorting.", error);
          fetchPosts();
        }
      );
    } else {
      fetchPosts();
    }
  };

  // 컴포넌트가 처음 로드될 때 딱 한 번만 실행되는 로직
  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('hasSeenWelcomeModal');
    if (hasSeenModal) {
      // 모달을 본 적이 있다면, 바로 데이터 로딩 시작
      setLoading(false);
      loadPostsWithGeo();
    } else {
      // 본 적이 없다면, 모달을 띄우고 "로딩중" 상태를 해제
      setIsWelcomeModalOpen(true);
      setLoading(false); 
    }
  }, []); // 의존성 배열이 비어있어 최초 1회만 실행

  // 모달의 상태가 변경될 때 (특히 닫힐 때) 데이터 로딩을 시작
  useEffect(() => {
    // 모달이 닫혔고, 아직 포스트가 로딩되지 않았다면 (최초 로딩 방지)
    if (!isWelcomeModalOpen && posts.length === 0 && !initialLoadStarted) {
      setInitialLoadStarted(true); // 로딩 시작을 기록
      loadPostsWithGeo();
    }
  }, [isWelcomeModalOpen, posts.length, initialLoadStarted]);
  
  const handleRecommend = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const response = await fetchWithAuth(`https://port-0-unused-railway-backend-mfof24a94652eacb.sel3.cloudtype.app/api/posts/${postId}/recommend/`, {
        method: 'POST'
    });
    if (response.ok) {
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
      <WelcomeModal 
        isOpen={isWelcomeModalOpen} 
        onOpenChange={setIsWelcomeModalOpen} 
      />
      <h1 className="text-2xl font-bold">제안 목록</h1>
      {posts.map((post) => (
        <Card key={post.id} onClick={() => onPostSelect(post.id)} className="cursor-pointer hover:bg-muted/50 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{post.title}</CardTitle>
            <div className="text-sm text-muted-foreground flex justify-between">
              <span>{post.railway_property_address}</span>
              <span>{post.status_display}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-2 text-sm text-foreground">{post.content}</p>
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