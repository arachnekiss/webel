import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Resource } from '@/types';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gamepad2, 
  ExternalLink, 
  Play, 
  X, 
  Maximize, 
  Minimize,
  Info,
  Heart,
  Share2,
  ThumbsUp
} from 'lucide-react';

interface FlashGame {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  gameUrl: string;
  category?: string;
  author?: string;
  rating?: number;
  playCount?: number;
  releaseDate?: string;
  controls?: string;
  tags?: string[];
}

const FlashGames: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<FlashGame | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 플래시 게임 데이터 가져오기
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ['/api/resources/type/flash_game'],
    retry: false
  });

  // 리소스를 게임 형식으로 변환
  const games: FlashGame[] = resources?.map(resource => ({
    id: resource.id,
    title: resource.title,
    description: resource.description,
    imageUrl: resource.imageUrl || '/placeholder-game.jpg',
    gameUrl: resource.downloadUrl, // HTML5 게임 URL
    category: resource.tags?.[0],
    tags: resource.tags || [],
    author: "Webel 게임 스튜디오",
    playCount: resource.downloadCount || 0,
    rating: Math.floor(Math.random() * 5) + 1, // 실제로는 DB에서 가져와야 함
    releaseDate: new Date(resource.createdAt || Date.now()).toLocaleDateString(),
    controls: "방향키: 이동, 스페이스바: 점프/액션"
  })) || [];

  // 카테고리별로 게임 분류
  const gamesByCategory: Record<string, FlashGame[]> = {};
  games.forEach(game => {
    const category = game.category || '기타';
    if (!gamesByCategory[category]) {
      gamesByCategory[category] = [];
    }
    gamesByCategory[category].push(game);
  });

  // 게임 재생
  const playGame = (game: FlashGame) => {
    setSelectedGame(game);
  };

  // 전체화면 토글
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 게임 종료
  const closeGame = () => {
    setSelectedGame(null);
    setIsFullscreen(false);
  };

  // 카테고리 목록
  const categories = Object.keys(gamesByCategory);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">플래시 게임</h1>
          <p className="text-slate-600">HTML5 기반으로 Webel 내에서 즉시 플레이 가능한 게임들을 만나보세요!</p>
        </div>
      </div>

      {selectedGame ? (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'}`}>
          {/* 게임 플레이어 */}
          <div className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'col-span-3' : 'lg:col-span-2'}`}>
            <div className="flex justify-between items-center bg-slate-800 text-white p-3">
              <h2 className="font-bold">{selectedGame.title}</h2>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize className="h-4 w-4 mr-1" /> : <Maximize className="h-4 w-4 mr-1" />}
                  {isFullscreen ? '창 모드' : '전체화면'}
                </Button>
                <Button variant="ghost" size="sm" onClick={closeGame}>
                  <X className="h-4 w-4 mr-1" />
                  닫기
                </Button>
              </div>
            </div>
            <div className="relative" style={{ height: isFullscreen ? 'calc(100vh - 54px)' : '500px' }}>
              <iframe 
                src={selectedGame.gameUrl} 
                className="w-full h-full border-0" 
                title={selectedGame.title}
                allowFullScreen
              />
            </div>
          </div>
          
          {/* 게임 정보 패널 - 전체 화면이 아닐 때만 표시 */}
          {!isFullscreen && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">{selectedGame.title}</h2>
              
              <div className="flex items-center space-x-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ThumbsUp 
                    key={i} 
                    className={`h-4 w-4 ${i < (selectedGame.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                  />
                ))}
                <span className="text-xs text-slate-500 ml-2">({selectedGame.rating}/5)</span>
              </div>
              
              <div className="mb-4">
                <p className="text-slate-600 dark:text-slate-300">{selectedGame.description}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-slate-500 dark:text-slate-400 w-24 text-sm">개발자:</span>
                  <span className="text-sm">{selectedGame.author}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-slate-500 dark:text-slate-400 w-24 text-sm">출시일:</span>
                  <span className="text-sm">{selectedGame.releaseDate}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-slate-500 dark:text-slate-400 w-24 text-sm">플레이 횟수:</span>
                  <span className="text-sm">{selectedGame.playCount}회</span>
                </div>
                <div className="flex items-start">
                  <span className="text-slate-500 dark:text-slate-400 w-24 text-sm">조작 방법:</span>
                  <span className="text-sm">{selectedGame.controls}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2 text-sm">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedGame.tags?.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6">
                <Button variant="outline" size="sm" className="flex-1">
                  <Heart className="h-4 w-4 mr-1" />
                  좋아요
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="h-4 w-4 mr-1" />
                  공유하기
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-slate-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-5 bg-slate-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-1"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <Tabs defaultValue={categories[0]}>
              <TabsList className="mb-6 overflow-x-auto flex flex-nowrap max-w-full">
                {categories.map(category => (
                  <TabsTrigger key={category} value={category} className="min-w-max">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              {categories.map(category => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {gamesByCategory[category].map(game => (
                      <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                        <div 
                          className="h-48 bg-cover bg-center relative"
                          style={{ backgroundImage: `url(${game.imageUrl})` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button onClick={() => playGame(game)} className="bg-primary hover:bg-primary/90 mb-2">
                              <Play className="mr-2 h-4 w-4" />
                              지금 플레이
                            </Button>
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <ThumbsUp 
                                  key={i} 
                                  className={`h-3 w-3 ${i < (game.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          {/* 카테고리 배지 */}
                          {game.category && (
                            <Badge className="absolute top-2 left-2 bg-black/60 text-white hover:bg-black/60">
                              {game.category}
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold mb-1 truncate group-hover:text-primary transition-colors">{game.title}</h3>
                          <p className="text-sm text-slate-500 line-clamp-2 h-10">{game.description}</p>
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex flex-col">
                              <div className="flex items-center text-xs text-slate-400 mb-1">
                                <Gamepad2 className="h-3 w-3 mr-1" />
                                <span className="mr-1">HTML5</span> 
                                {game.playCount > 0 && (
                                  <span>· {game.playCount}회 플레이</span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">
                                {game.author && (
                                  <span>개발: {game.author}</span>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => playGame(game)}
                              className="text-primary hover:bg-primary/10"
                            >
                              플레이
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-20">
              <Gamepad2 className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold mb-2">아직 등록된 게임이 없습니다</h3>
              <p className="text-slate-500 mb-6">곧 다양한 HTML5 기반 게임들이 추가될 예정입니다!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FlashGames;