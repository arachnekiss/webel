import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  CheckCircle, 
  Camera, 
  Lightbulb, 
  Mic, 
  HelpCircle, 
  ArrowRight, 
  Send, 
  Sparkles,
  UploadCloud,
  XCircle,
  Loader,
  Image,
  Wand2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  sendChatMessage, 
  analyzeImage, 
  analyzeImageWithStructure, 
  transcribeAudio, 
  generateImage, 
  fileToBase64 
} from '@/lib/api';

// Simple class for handling audio recording
class SimpleAudioRecorder {
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  
  async start(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();
    } catch (error) {
      console.error('음성 녹음 오류:', error);
      throw new Error('마이크 접근 권한이 필요합니다.');
    }
  }
  
  stop(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('녹음이 시작되지 않았습니다.'));
        return;
      }
      
      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
        } catch (error) {
          reject(error);
        }
      };
      
      this.mediaRecorder.stop();
      // 스트림 트랙 종료
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }
}

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

  // 파일 업로드 상태 관리
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 오디오 녹음 상태 관리
  const [isRecording, setIsRecording] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const audioRecorder = useRef<SimpleAudioRecorder>(new SimpleAudioRecorder());

  // 스크롤 처리
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 진행 표시줄 애니메이션
  useEffect(() => {
    if (isUploadingImage) {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      setUploadProgress(0);
    }
  }, [isUploadingImage]);

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
      // OpenAI API 호출을 위한 메시지 형식 변환
      const apiMessages = messages.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // 시스템 메시지 추가 (없을 경우)
      if (!apiMessages.some(msg => msg.role === 'system')) {
        apiMessages.unshift({
          role: 'system',
          content: '당신은 Webel의 AI 조립 비서입니다. 다양한 부품과 장치의 조립과 관련된 질문에 전문적이고 친절하게 답변해야 합니다. 조립 과정에서 발생할 수 있는 문제점들에 대해 해결책을 제시하고, 안전하고 정확한 조립 방법을 안내해 주세요.'
        });
      }

      // API 호출
      const response = await sendChatMessage(apiMessages);

      // AI 응답 메시지
      const aiResponse: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message || "메시지 전송 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 이미지 파일 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // 이미지 업로드 및 분석
  const handleImageUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploadingImage(true);
    
    try {
      // 파일을 base64로 변환
      const base64String = await fileToBase64(selectedFile);
      
      // 사용자 메시지 (이미지 첨부) 추가
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: `이미지를 업로드했습니다: ${selectedFile.name}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      
      // '이미지 분석 중' 메시지 표시
      const processingMessage: Message = {
        id: generateId(),
        role: 'system',
        content: '이미지를 분석하고 있습니다...',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, processingMessage]);
      
      // 이미지 분석 API 호출 - 구조화된 JSON 응답 사용
      const prompt = "이 이미지는 조립 중인 부품이나 장치를 보여주고 있습니다. 부품을 확인하고 조립 방법에 대해 조언해 주세요. 문제점이 있다면 지적해 주시고 해결 방법도 알려주세요.";
      
      // 구조화된 JSON 응답 가져오기 시도
      let structuredAnalysis;
      try {
        structuredAnalysis = await analyzeImageWithStructure(base64String, prompt);
      } catch (structuredError) {
        console.error('구조화된 이미지 분석 실패, 일반 텍스트 응답으로 대체:', structuredError);
      }
      
      // 처리 중 메시지 제거
      setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id));
      
      if (structuredAnalysis) {
        // 구조화된 응답을 사용하여 포맷된 메시지 생성
        let formattedContent = '';
        
        if (structuredAnalysis.partIdentification) {
          formattedContent += `**식별된 부품:**\n${structuredAnalysis.partIdentification}\n\n`;
        }
        
        if (structuredAnalysis.assemblySteps && Array.isArray(structuredAnalysis.assemblySteps)) {
          formattedContent += '**조립 단계:**\n';
          structuredAnalysis.assemblySteps.forEach((step: string, index: number) => {
            formattedContent += `${index + 1}. ${step}\n`;
          });
          formattedContent += '\n';
        }
        
        if (structuredAnalysis.issuesDetected && Array.isArray(structuredAnalysis.issuesDetected)) {
          formattedContent += '**문제점:**\n';
          structuredAnalysis.issuesDetected.forEach((issue: string, index: number) => {
            formattedContent += `- ${issue}\n`;
          });
          formattedContent += '\n';
        }
        
        if (structuredAnalysis.solutions && Array.isArray(structuredAnalysis.solutions)) {
          formattedContent += '**해결 방법:**\n';
          structuredAnalysis.solutions.forEach((solution: string, index: number) => {
            formattedContent += `- ${solution}\n`;
          });
          formattedContent += '\n';
        }
        
        if (structuredAnalysis.additionalNotes) {
          formattedContent += `**추가 정보:**\n${structuredAnalysis.additionalNotes}`;
        }
        
        // 구조화된 응답 메시지
        const aiResponse: Message = {
          id: generateId(),
          role: 'assistant',
          content: formattedContent || JSON.stringify(structuredAnalysis, null, 2),
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // 구조화된 분석이 실패한 경우 일반 텍스트 분석으로 대체
        const analysis = await analyzeImage(base64String, prompt);
        
        // 일반 텍스트 응답 메시지
        const aiResponse: Message = {
          id: generateId(),
          role: 'assistant',
          content: analysis,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error: any) {
      toast({
        title: "이미지 분석 오류",
        description: error.message || "이미지 분석 중 문제가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsUploadingImage(false);
      setSelectedFile(null);
    }
  };
  
  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      await audioRecorder.current.start();
      setIsRecording(true);
      toast({
        title: "녹음 시작",
        description: "말씀하시는 내용을 녹음 중입니다...",
      });
    } catch (error: any) {
      toast({
        title: "녹음 오류",
        description: error.message || "음성 녹음을 시작할 수 없습니다.",
        variant: "destructive"
      });
    }
  };
  
  // 음성 녹음 종료 및 처리
  const stopRecording = async () => {
    if (!isRecording) return;
    
    try {
      setIsLoading(true);
      const audioBase64 = await audioRecorder.current.stop();
      setIsRecording(false);
      
      // '음성 변환 중' 메시지 표시
      const processingMessage: Message = {
        id: generateId(),
        role: 'system',
        content: '음성을 변환하고 있습니다...',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, processingMessage]);
      
      // OpenAI Whisper API를 사용하여 음성을 텍스트로 변환
      const transcribedText = await transcribeAudio(audioBase64);
      
      // 처리 중 메시지 제거
      setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id));
      
      // 사용자 메시지 추가
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: transcribedText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // 이후 일반 텍스트 메시지처럼 처리
      const apiMessages = messages.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // 시스템 메시지 추가 (없을 경우)
      if (!apiMessages.some(msg => msg.role === 'system')) {
        apiMessages.unshift({
          role: 'system',
          content: '당신은 Webel의 AI 조립 비서입니다. 다양한 부품과 장치의 조립과 관련된 질문에 전문적이고 친절하게 답변해야 합니다. 조립 과정에서 발생할 수 있는 문제점들에 대해 해결책을 제시하고, 안전하고 정확한 조립 방법을 안내해 주세요.'
        });
      }
      
      const response = await sendChatMessage(apiMessages);
      
      const aiResponse: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error: any) {
      toast({
        title: "음성 처리 오류",
        description: error.message || "음성을 처리하는 중 문제가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 이미지 생성 함수
  const handleGenerateImage = async () => {
    // 이미지 생성에 필요한 프롬프트를 현재의 대화 컨텍스트에서 추출
    if (messages.length === 0) {
      toast({
        title: "대화 필요",
        description: "이미지 생성을 위해 먼저 AI와 대화를 시작해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingImage(true);
    setIsLoading(true);
    
    try {
      // 프롬프트 생성 - 최근 3개의 메시지에서 컨텍스트 추출
      const recentMessages = messages.slice(-3);
      const contextPrompt = recentMessages.map(msg => msg.content).join(" ");
      
      // 실제 프롬프트 생성 (조립 관련 부분 강조)
      const imagePrompt = `조립 방법 도표 또는 도해: ${contextPrompt}. 단계별 조립 과정을 보여주는 명확한 다이어그램 또는 그림으로 도식화하세요. 사람의 손이나 정확한 부품 배치를 포함하세요.`;
      
      // '이미지 생성 중' 메시지 표시
      const processingMessage: Message = {
        id: generateId(),
        role: 'system',
        content: '요청하신 조립 이미지를 생성하고 있습니다...',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, processingMessage]);
      
      // 이미지 생성 API 호출
      const imageUrl = await generateImage(imagePrompt);
      
      // 처리 중 메시지 제거
      setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id));
      
      // 생성된 이미지 메시지 추가
      const imageMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `조립 이미지가 생성되었습니다.\n\n![조립 도해](${imageUrl})`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, imageMessage]);
    } catch (error: any) {
      toast({
        title: "이미지 생성 오류",
        description: error.message || "이미지 생성 중 문제가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
      setIsLoading(false);
    }
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
    const { language } = useLanguage();
    
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col h-[calc(100vh-120px)]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center">
              <Lightbulb className="h-6 w-6 text-primary mr-2" />
              {language === 'ko' ? 'AI 조립 비서' :
               language === 'jp' ? 'AI組立アシスタント' :
               'AI Assembly Assistant'}
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
                {language === 'ko' ? '종료' :
                 language === 'jp' ? '終了' :
                 'Exit'}
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
                  <span className="text-sm text-slate-500 ml-2">
                    {language === 'ko' ? 'AI가 응답 준비 중...' :
                     language === 'jp' ? 'AIが応答を準備中...' :
                     'AI is preparing a response...'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* 입력 영역 */}
          <div className="border border-slate-200 rounded-lg bg-white p-3">
            {/* 이미지 업로드 진행 상태 표시 */}
            {isUploadingImage && (
              <div className="mb-3">
                <p className="text-sm text-slate-500 mb-1">
                  {language === 'ko' ? `이미지 업로드 중... ${uploadProgress}%` :
                   language === 'jp' ? `画像アップロード中... ${uploadProgress}%` :
                   `Uploading image... ${uploadProgress}%`}
                </p>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            {/* 파일 선택 표시 */}
            {selectedFile && !isUploadingImage && (
              <div className="mb-3 bg-slate-100 rounded p-2 flex items-center justify-between">
                <div className="flex items-center">
                  <Image className="h-4 w-4 mr-2" />
                  <span className="text-sm text-slate-700 truncate">{selectedFile.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 py-1"
                    onClick={() => setSelectedFile(null)}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    {language === 'ko' ? '취소' :
                     language === 'jp' ? 'キャンセル' :
                     'Cancel'}
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-2 py-1"
                    onClick={handleImageUpload}
                    disabled={isLoading}
                  >
                    <UploadCloud className="h-3.5 w-3.5 mr-1" />
                    {language === 'ko' ? '업로드' :
                     language === 'jp' ? 'アップロード' :
                     'Upload'}
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex items-end gap-2">
              <div className="flex gap-2">
                {/* 이미지 업로드 버튼 */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading || isRecording}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    disabled={isLoading || isRecording || !!selectedFile}
                    aria-label={language === 'ko' ? '이미지 업로드' :
                                language === 'jp' ? '画像アップロード' :
                                'Upload image'}
                    asChild
                  >
                    <div>
                      <Camera className="h-5 w-5 text-slate-500" />
                    </div>
                  </Button>
                </label>
                
                {/* 음성 녹음 버튼 */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={`h-10 w-10 rounded-full ${isRecording ? 'bg-red-50 border-red-200' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading || !!selectedFile}
                  aria-label={isRecording ? 
                    (language === 'ko' ? '녹음 중지' : 
                     language === 'jp' ? '録音停止' : 
                     'Stop recording') : 
                    (language === 'ko' ? '녹음 시작' : 
                     language === 'jp' ? '録音開始' : 
                     'Start recording')}
                >
                  <Mic className={`h-5 w-5 ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
                </Button>
                
                {/* 이미지 생성 버튼 */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={`h-10 w-10 rounded-full ${isGeneratingImage ? 'bg-purple-50 border-purple-200' : ''}`}
                  onClick={handleGenerateImage}
                  disabled={isLoading || isRecording || !!selectedFile || messages.length === 0}
                  aria-label={language === 'ko' ? '이미지 생성' :
                              language === 'jp' ? '画像生成' :
                              'Generate image'}
                  title={language === 'ko' ? 'AI 조립 이미지 생성' :
                         language === 'jp' ? 'AI組立画像生成' :
                         'Generate AI assembly image'}
                >
                  <Wand2 className={`h-5 w-5 ${isGeneratingImage ? 'text-purple-500 animate-pulse' : 'text-slate-500'}`} />
                </Button>
              </div>
              
              <div className="relative flex-1">
                <Textarea
                  placeholder={language === 'ko' ? '메시지를 입력하세요...' :
                               language === 'jp' ? 'メッセージを入力してください...' :
                               'Type your message...'}
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
                  disabled={isLoading || isRecording}
                />
              </div>
              
              <Button
                type="button"
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim() || isRecording}
                className="h-10 w-10 rounded-full p-2"
                aria-label={language === 'ko' ? '메시지 보내기' :
                            language === 'jp' ? 'メッセージを送信' :
                            'Send message'}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { language } = useLanguage();

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl overflow-hidden shadow-lg mb-12">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {language === 'ko' 
                ? 'AI 조립 비서가 도와드립니다' 
                : language === 'jp' 
                  ? 'AI組立アシスタントがお手伝いします' 
                  : 'AI Assembly Assistant at Your Service'}
            </h1>
            <p className="text-blue-100 mb-6">
              {language === 'ko' 
                ? '복잡한 조립 과정을 AI가 단계별로 안내해드립니다. 실시간으로 진행 상황을 분석하고 피드백을 제공하여 실수 없이 완성할 수 있습니다.' 
                : language === 'jp' 
                  ? '複雑な組立プロセスをAIがステップバイステップでご案内します。リアルタイムで進行状況を分析し、フィードバックを提供することでミスなく完成させることができます。' 
                  : 'AI guides you through complex assembly processes step by step. It analyzes your progress in real-time and provides feedback to help you complete without mistakes.'}
            </p>
            <Button 
              onClick={handleStartChat}
              className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors w-full md:w-auto text-center"
            >
              {language === 'ko' 
                ? '지금 시작하기' 
                : language === 'jp' 
                  ? '今すぐ始める' 
                  : 'Start Now'}
            </Button>
          </div>
          <div className="md:w-1/2 p-6 hidden md:flex items-center justify-center">
            <img 
              src="/images/ai-assembly-hero.png" 
              alt={language === 'ko' 
                ? 'AI 조립 비서와 함께 3D 프린터 부품 조립하기' 
                : language === 'jp' 
                  ? 'AIアシスタントと一緒に3Dプリンタのパーツを組み立てる' 
                  : 'Assembling 3D printer parts with AI assistant'}
              className="rounded-lg shadow-lg max-h-96 object-cover" 
            />
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {language === 'ko' 
            ? '주요 기능' 
            : language === 'jp' 
              ? '主な機能' 
              : 'Key Features'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <Camera className="h-12 w-12 text-blue-500 mb-2" />
              <CardTitle>
                {language === 'ko' 
                  ? '실시간 진행 상황 분석' 
                  : language === 'jp' 
                    ? 'リアルタイム進行状況分析' 
                    : 'Real-time Progress Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {language === 'ko' 
                  ? '카메라를 통해 현재 조립 상태를 인식하고 다음 단계를 실시간으로 안내해드립니다.' 
                  : language === 'jp' 
                    ? 'カメラを通じて現在の組立状態を認識し、次のステップをリアルタイムでご案内します。' 
                    : 'Recognizes your current assembly state through the camera and guides you to the next step in real-time.'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Lightbulb className="h-12 w-12 text-blue-500 mb-2" />
              <CardTitle>
                {language === 'ko' 
                  ? '3D 시각화 가이드' 
                  : language === 'jp' 
                    ? '3D可視化ガイド' 
                    : '3D Visualization Guide'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {language === 'ko' 
                  ? '복잡한 부품과 조립 방법을 3D로 시각화하여 직관적으로 이해할 수 있습니다.' 
                  : language === 'jp' 
                    ? '複雑なパーツと組立方法を3Dで可視化し、直感的に理解することができます。' 
                    : 'Visualizes complex parts and assembly methods in 3D for intuitive understanding.'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Mic className="h-12 w-12 text-blue-500 mb-2" />
              <CardTitle>
                {language === 'ko' 
                  ? '음성 안내 지원' 
                  : language === 'jp' 
                    ? '音声ガイド対応' 
                    : 'Voice Guidance Support'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {language === 'ko' 
                  ? '양손으로 작업 중에도 음성 안내를 통해 다음 단계를 확인할 수 있습니다.' 
                  : language === 'jp' 
                    ? '両手で作業中でも音声ガイドを通じて次のステップを確認できます。' 
                    : 'Allows you to check the next step through voice guidance even while working with both hands.'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <HelpCircle className="h-12 w-12 text-blue-500 mb-2" />
              <CardTitle>
                {language === 'ko' 
                  ? '실시간 문제 해결' 
                  : language === 'jp' 
                    ? 'リアルタイム問題解決' 
                    : 'Real-time Troubleshooting'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {language === 'ko' 
                  ? '문제가 발생할 경우 즉시 감지하고 해결 방법을 제안해 드립니다.' 
                  : language === 'jp' 
                    ? '問題が発生した場合、即時に検知し、解決方法を提案します。' 
                    : 'Immediately detects any issues and suggests solutions when problems occur.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* CTA */}
      <section className="mb-12">
        <div className="bg-gray-50 rounded-xl p-8 md:flex items-center justify-between">
          <div className="md:w-2/3 mb-6 md:mb-0">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
              {language === 'ko' 
                ? '준비되셨나요?' 
                : language === 'jp' 
                  ? '準備はできましたか？' 
                  : 'Ready to Start?'}
            </h3>
            <p className="text-gray-600">
              {language === 'ko' 
                ? '지금 바로 AI 조립 비서와 함께 프로젝트를 시작해보세요. 어떤 복잡한 조립도 쉽고 빠르게 완성할 수 있습니다.' 
                : language === 'jp' 
                  ? '今すぐAI組立アシスタントと一緒にプロジェクトを始めましょう。どんな複雑な組立も簡単かつ迅速に完成させることができます。' 
                  : 'Start your project with the AI Assembly Assistant right now. You can complete any complex assembly easily and quickly.'}
            </p>
          </div>
          <div>
            <Button 
              className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-md w-full md:w-auto flex items-center justify-center gap-2"
              onClick={handleStartChat}
            >
              <span>
                {language === 'ko' 
                  ? '시작하기' 
                  : language === 'jp' 
                    ? '始める' 
                    : 'Start'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AiAssembly;