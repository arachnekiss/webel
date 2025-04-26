import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Camera, 
  Lightbulb, 
  Mic, 
  HelpCircle, 
  ArrowRight, 
  Send, 
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// 메시지 인터페이스
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const AiAssembly = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // 고유 ID 생성
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 실제 API 호출 대신 임시 지연 추가
      await new Promise(resolve => setTimeout(resolve, 1500));

      // AI 응답 메시지 (실제로는 OpenAI API 호출 필요)
      const aiResponse: Message = {
        id: generateId(),
        role: 'assistant',
        content: generateAIResponse(),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "메시지 전송 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 임시 AI 응답 생성 (실제로는 OpenAI API 사용)
  const generateAIResponse = () => {
    const responses = [
      "이 부품은 먼저 메인보드의 PCI 슬롯에 딸깍 소리가 날 때까지 꽂아주세요. 그 다음 전원 케이블을 연결해주세요.",
      "배선을 연결할 때는 색상 코드를 확인하세요. 빨간색은 양극(+), 검은색은 음극(-)에 연결합니다.",
      "나사를 조일 때는 너무 세게 조이지 마세요. 부품이 손상될 수 있습니다.",
      "이 단계에서는 방열 그리스를 CPU 표면에 적당량 바른 후 쿨러를 장착해야 합니다.",
      "조립 순서는 일반적으로 메인보드 → CPU → 메모리 → 저장장치 → 그래픽카드 순입니다."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // 채팅 인터페이스 표시
  const handleStartChat = () => {
    setShowChatInterface(true);
    const systemMessage: Message = {
      id: generateId(),
      role: 'system',
      content: '안녕하세요! Webel AI 조립 비서입니다. 제품 조립에 도움이 필요하신가요?',
      timestamp: new Date()
    };
    setMessages([systemMessage]);
  };

  if (showChatInterface) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col h-[calc(100vh-120px)]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center">
              <Lightbulb className="h-6 w-6 text-primary mr-2" />
              AI 조립 비서
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span>GPT-4o</span>
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowChatInterface(false)}
                className="text-gray-500"
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                종료
              </Button>
            </div>
          </div>
          
          {/* 채팅 메시지 영역 */}
          <div className="flex-1 bg-slate-50 rounded-lg p-4 overflow-y-auto mb-4 border border-slate-200">
            {messages.map(message => (
              <div
                key={message.id}
                className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : message.role === 'system'
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {/* 로딩 상태 표시 */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-sm text-slate-500 ml-2">AI가 응답 준비 중...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* 입력 영역 */}
          <div className="border border-slate-200 rounded-lg bg-white p-3">
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <Textarea
                  placeholder="메시지를 입력하세요..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="resize-none pr-10"
                  rows={1}
                />
              </div>
              <Button
                type="button"
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="h-10 w-10 rounded-full p-2"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl overflow-hidden shadow-lg mb-12">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              AI 조립 비서가 도와드립니다
            </h1>
            <p className="text-blue-100 mb-6">
              복잡한 조립 과정을 AI가 단계별로 안내해드립니다. 실시간으로 진행 상황을 분석하고 
              피드백을 제공하여 실수 없이 완성할 수 있습니다.
            </p>
            <Button 
              onClick={handleStartChat}
              className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors w-full md:w-auto text-center"
            >
              지금 시작하기
            </Button>
          </div>
          <div className="md:w-1/2 p-6 hidden md:flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1563770557918-8c5061cf6bdc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="AI 조립 비서" 
              className="rounded-lg shadow-md max-h-80 object-cover" 
            />
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">주요 기능</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <Camera className="h-12 w-12 text-blue-500 mb-2" />
              <CardTitle>실시간 진행 상황 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                카메라를 통해 현재 조립 상태를 인식하고 다음 단계를 실시간으로 안내해드립니다.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Lightbulb className="h-12 w-12 text-blue-500 mb-2" />
              <CardTitle>3D 시각화 가이드</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                복잡한 부품과 조립 방법을 3D로 시각화하여 직관적으로 이해할 수 있습니다.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Mic className="h-12 w-12 text-blue-500 mb-2" />
              <CardTitle>음성 안내 지원</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                양손으로 작업 중에도 음성 안내를 통해 다음 단계를 확인할 수 있습니다.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <HelpCircle className="h-12 w-12 text-blue-500 mb-2" />
              <CardTitle>실시간 문제 해결</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                문제가 발생할 경우 즉시 감지하고 해결 방법을 제안해 드립니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* CTA */}
      <section className="mb-12">
        <div className="bg-gray-50 rounded-xl p-8 md:flex items-center justify-between">
          <div className="md:w-2/3 mb-6 md:mb-0">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">준비되셨나요?</h3>
            <p className="text-gray-600">
              지금 바로 AI 조립 비서와 함께 프로젝트를 시작해보세요.
              어떤 복잡한 조립도 쉽고 빠르게 완성할 수 있습니다.
            </p>
          </div>
          <div>
            <Button 
              className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-md w-full md:w-auto flex items-center justify-center gap-2"
              onClick={handleStartChat}
            >
              <span>시작하기</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AiAssembly;