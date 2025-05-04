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
import { useLanguage } from '@/contexts/LanguageContext';

const RemoteSupport: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  return (
    <main className="container mx-auto px-4 py-6">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl overflow-hidden shadow-lg mb-12">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('features.remoteSupport.title')}
            </h1>
            <p className="text-indigo-100 mb-6">
              {t('features.remoteSupport.description')}
            </p>
            <a href="https://discord.gg/webel-community" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
              <Button className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors w-full text-center">
                {t('features.remoteSupport.joinDiscord')}
              </Button>
            </a>
          </div>
          <div className="md:w-1/2 p-6 hidden md:flex items-center justify-center">
            <img 
              src="/images/remote-support-hero.png" 
              alt={t('features.remoteSupport.title')} 
              className="rounded-lg shadow-lg max-h-96 object-cover" 
            />
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('features.remoteSupport.discordFeatures')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <Video className="h-12 w-12 text-indigo-500 mb-2" />
              <CardTitle>{t('features.remoteSupport.voiceVideo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {t('features.remoteSupport.voiceVideoDesc')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Users className="h-12 w-12 text-indigo-500 mb-2" />
              <CardTitle>{t('features.remoteSupport.openCommunity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {t('features.remoteSupport.openCommunityDesc')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Monitor className="h-12 w-12 text-indigo-500 mb-2" />
              <CardTitle>{t('features.remoteSupport.infoSharing')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {t('features.remoteSupport.infoSharingDesc')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* 디스코드 서버 정보 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('features.remoteSupport.discordGuide')}</h2>
        
        <Card className="border-2 border-discord overflow-hidden">
          <div className="bg-[#5865F2] text-white p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h3 className="text-2xl font-bold mb-2">{t('features.remoteSupport.webelDiscord')}</h3>
                <p className="opacity-90 mb-4">
                  {t('features.remoteSupport.discordDesc')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="bg-white/20 border-none text-white flex items-center gap-1">
                    <Users className="h-3 w-3" /> {t('features.remoteSupport.freeCommunity')}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 border-none text-white flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> {t('features.remoteSupport.textVoiceChannels')}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 border-none text-white flex items-center gap-1">
                    <Share2 className="h-3 w-3" /> {t('features.remoteSupport.screenSharing')}
                  </Badge>
                </div>
              </div>
              <div className="w-full md:w-auto">
                <a href="https://discord.gg/webel-community" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-[#5865F2] hover:bg-white/90 flex gap-2 w-full md:w-auto" size="lg">
                    <ExternalLink className="h-5 w-5" />
                    {t('features.remoteSupport.joinServer')}
                  </Button>
                </a>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">{t('features.remoteSupport.howToUse')}</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{t('features.remoteSupport.server')}</span>
                      <p className="text-sm text-gray-600">{t('features.remoteSupport.serverDesc')}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{t('features.remoteSupport.channel')}</span>
                      <p className="text-sm text-gray-600">{t('features.remoteSupport.channelDesc')}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{t('features.remoteSupport.textVoice')}</span>
                      <p className="text-sm text-gray-600">{t('features.remoteSupport.textVoiceDesc')}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{t('features.remoteSupport.screen')}</span>
                      <p className="text-sm text-gray-600">{t('features.remoteSupport.screenDesc')}</p>
                    </div>
                  </li>
                </ul>
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">{t('features.remoteSupport.engineers')}</h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-700">
                          {t('features.remoteSupport.engineersDesc')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('features.remoteSupport.channels')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-gray-800"># {t('features.remoteSupport.announcements')}</h4>
                        <p className="text-sm text-gray-600">{t('features.remoteSupport.announcementsDesc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-gray-800"># {t('features.remoteSupport.introductions')}</h4>
                        <p className="text-sm text-gray-600">{t('features.remoteSupport.introductionsDesc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-gray-800"># {t('features.remoteSupport.qa')}</h4>
                        <p className="text-sm text-gray-600">{t('features.remoteSupport.qaDesc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-gray-800">🔊 {t('features.remoteSupport.voice')}</h4>
                        <p className="text-sm text-gray-600">{t('features.remoteSupport.voiceDesc')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">{t('features.remoteSupport.benefits')}</h3>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{t('features.remoteSupport.knowledgeSharing')}</span>
                      <p className="text-sm text-gray-600">{t('features.remoteSupport.knowledgeSharingDesc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{t('features.remoteSupport.realtime')}</span>
                      <p className="text-sm text-gray-600">{t('features.remoteSupport.realtimeDesc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{t('features.remoteSupport.projectSharing')}</span>
                      <p className="text-sm text-gray-600">{t('features.remoteSupport.projectSharingDesc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <footer className="text-center text-gray-500 text-sm mt-16 mb-8">
        {t('features.remoteSupport.copyright')}
      </footer>
    </main>
  );
};

export default RemoteSupport;