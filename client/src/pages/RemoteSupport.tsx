import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Video, Users, Monitor, Clock, Calendar, ArrowRight, CheckCircle, MessageSquare, Share2, ExternalLink, Info, Search, Upload, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RemoteSupport: React.FC = () => {
  const { toast } = useToast();
  
  return (
    <main className="container mx-auto px-4 py-6">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl overflow-hidden shadow-lg mb-12">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              전문가와 함께하는 원격 조립 지원
            </h1>
            <p className="text-indigo-100 mb-6">
              어려운 하드웨어 조립, 복잡한 설정 과정을 실시간 원격 지원으로 해결해드립니다.
              언제 어디서나 전문 엔지니어의 도움을 받아보세요.
            </p>
            <a href="https://discord.gg/webel-community" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
              <Button className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors w-full text-center">
                디스코드 참여하기
              </Button>
            </a>
          </div>
          <div className="md:w-1/2 p-6 hidden md:flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1581092921461-fd0e5756a5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="원격 조립 지원" 
              className="rounded-lg shadow-md max-h-80 object-cover" 
            />
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">디스코드 커뮤니티 특징</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <Video className="h-12 w-12 text-indigo-500 mb-2" />
              <CardTitle>음성 및 영상 채널</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Discord의 영상 및 음성 채널을 통해 실시간으로 전문가와 소통하고 문제 해결에 필요한 도움을 받을 수 있습니다.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Users className="h-12 w-12 text-indigo-500 mb-2" />
              <CardTitle>열린 커뮤니티</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                여러 분야의 전문가들과 도움이 필요한 사용자들이 모여 자유롭게 지식을 공유하고 DIY 결과물을 자랑하는 열린 공간입니다.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Monitor className="h-12 w-12 text-indigo-500 mb-2" />
              <CardTitle>정보 및 자료 공유</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                웨블 리소스와 연계한 다양한 정보, 설계도, 문서 등을 공유하고 다른 사용자들의 노하우를 배울 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* 디스코드 서버 정보 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">디스코드 서버 안내</h2>
        
        <Card className="border-2 border-discord overflow-hidden">
          <div className="bg-[#5865F2] text-white p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h3 className="text-2xl font-bold mb-2">Webel 디스코드 커뮤니티</h3>
                <p className="opacity-90 mb-4">
                  하드웨어 조립, 3D 프린팅, 소프트웨어 설정 등 다양한 주제에 대해 
                  실시간으로 도움을 주고받을 수 있는 Webel 커뮤니티에 초대합니다.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="bg-white/20 border-none text-white flex items-center gap-1">
                    <Users className="h-3 w-3" /> 자유롭게 소통하는 커뮤니티
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 border-none text-white flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> 텍스트 및 음성 채널
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 border-none text-white flex items-center gap-1">
                    <Share2 className="h-3 w-3" /> 화면 공유 기능
                  </Badge>
                </div>
              </div>
              <div className="w-full md:w-auto">
                <a href="https://discord.gg/webel-community" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-[#5865F2] hover:bg-white/90 flex gap-2 w-full md:w-auto" size="lg">
                    <ExternalLink className="h-5 w-5" />
                    디스코드 서버 참여하기
                  </Button>
                </a>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">디스코드 사용 방법</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">서버 참여하기</span>
                      <p className="text-sm text-gray-600">디스코드 계정으로 Webel 서버에 참여하세요.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">채널 선택하기</span>
                      <p className="text-sm text-gray-600">왼쪽 사이드바에서 주제별 채널을 선택하세요.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">텍스트/음성 채널 이용하기</span>
                      <p className="text-sm text-gray-600">채널 목록에서 # 표시는 텍스트 채널, 🔊 표시는 음성 채널입니다.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">화면 공유하기</span>
                      <p className="text-sm text-gray-600">음성 채널에 참여한 후 화면 공유 버튼을 눌러 실시간으로 도움을 받으세요.</p>
                    </div>
                  </li>
                </ul>
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">자발적 엔지니어 참여</h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-700">
                          엔지니어링 지식이 있으신가요? 어려움을 겪는 사용자들에게 자발적으로 도움을 제공해보세요. 
                          별도 신청 과정 없이 누구나 자유롭게 지식을 공유하고 도움을 줄 수 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">주요 채널 안내</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-gray-800"># 공지사항</h4>
                        <p className="text-sm text-gray-600">웨블 커뮤니티 공지사항과 업데이트 정보</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-gray-800"># 자기소개</h4>
                        <p className="text-sm text-gray-600">커뮤니티 멤버 자기소개 채널</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-gray-800"># 질문-답변</h4>
                        <p className="text-sm text-gray-600">다양한 주제에 대한 질문과 답변</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-gray-800">🔊 음성-채널</h4>
                        <p className="text-sm text-gray-600">실시간 음성 채팅 및 화면 공유</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">디스코드 커뮤니티 혜택</h3>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">사용자 간 지식 공유</span>
                      <p className="text-sm text-gray-600">다른 DIY 제작자들과 지식과 경험을 나누며 문제를 해결하세요</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">실시간 문제 해결</span>
                      <p className="text-sm text-gray-600">조립 과정에서 발생한 문제를 실시간으로 도움받을 수 있습니다</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">자료 및 프로젝트 공유</span>
                      <p className="text-sm text-gray-600">완성된 프로젝트나 유용한 자료를 커뮤니티와 공유할 수 있습니다</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <footer className="text-center text-gray-500 text-sm mt-16 mb-8">
        © 2025 Webel. 모든 권리 보유.
      </footer>
    </main>
  );
};

export default RemoteSupport;