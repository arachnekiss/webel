import React from 'react';
import TopLink from '@/components/ui/TopLink';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
  // Using TopLink so no separate scrollToTop function is needed
  const { language } = useLanguage();

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd"></path>
              </svg>
              <h2 className="text-xl font-bold">Webel</h2>
            </div>
            <p className="text-gray-400 mb-4">
              {language === 'ko' ? '창작자와 엔지니어를 위한 오픈 리소스 플랫폼' : 
               language === 'jp' ? '創作者とエンジニアのためのオープンリソースプラットフォーム' : 
               'Open resource platform for creators and engineers'}
            </p>
            <div className="flex space-x-4">
              <TopLink href="https://twitter.com" forceReload={true}>
                <span className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </span>
              </TopLink>
              <TopLink href="https://github.com" forceReload={true}>
                <span className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                  </svg>
                </span>
              </TopLink>
              <TopLink href="https://instagram.com" forceReload={true}>
                <span className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                  </svg>
                </span>
              </TopLink>
              {/* YouTube icon */}
              <TopLink href="https://youtube.com" forceReload={true}>
                <span className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </span>
              </TopLink>
              {/* Discord icon */}
              <TopLink href="https://discord.com" forceReload={true}>
                <span className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.608 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1634-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                </span>
              </TopLink>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {language === 'ko' ? '서비스' : 
               language === 'jp' ? 'サービス' : 
               'Services'}
            </h3>
            <ul className="space-y-2">
              <li>
                <TopLink href="/services/type/3d_printing" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? '근처 3D 프린터 찾기' : 
                     language === 'jp' ? '近くの3Dプリンターを探す' : 
                     'Find Nearby 3D Printers'}
                  </span>
                </TopLink>
              </li>
              <li>
                <TopLink href="/ai-assembly" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? 'AI 조립 비서' : 
                     language === 'jp' ? 'AI組立アシスタント' : 
                     'AI Assembly Assistant'}
                  </span>
                </TopLink>
              </li>
              <li>
                <TopLink href="/remote-support" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? '조립 원격 지원' : 
                     language === 'jp' ? '組立リモートサポート' : 
                     'Remote Assembly Support'}
                  </span>
                </TopLink>
              </li>
              <li>
                <TopLink href="/services/type/engineer" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? '엔지니어 찾기' : 
                     language === 'jp' ? 'エンジニアを探す' : 
                     'Find Engineers'}
                  </span>
                </TopLink>
              </li>
              <li>
                <TopLink href="/services/type/manufacturing" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? '생산업체 찾기' : 
                     language === 'jp' ? '製造業者を探す' : 
                     'Find Manufacturers'}
                  </span>
                </TopLink>
              </li>
              <li>
                <TopLink href="/sponsor" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? 'Webel 후원하기' : 
                     language === 'jp' ? 'Webelを支援する' : 
                     'Support Webel'}
                  </span>
                </TopLink>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {language === 'ko' ? '리소스' : 
               language === 'jp' ? 'リソース' : 
               'Resources'}
            </h3>
            <ul className="space-y-2">
              <li>
                <TopLink href="/resources/type/hardware_design" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? '하드웨어 설계도' : 
                     language === 'jp' ? 'ハードウェア設計図' : 
                     'Hardware Designs'}
                  </span>
                </TopLink>
              </li>
              <li>
                <TopLink href="/resources/type/software" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? '소프트웨어 오픈소스' : 
                     language === 'jp' ? 'ソフトウェアオープンソース' : 
                     'Open Source Software'}
                  </span>
                </TopLink>
              </li>
              <li>
                <TopLink href="/resources/type/ai_model" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? 'AI 모델' : 
                     language === 'jp' ? 'AIモデル' : 
                     'AI Models'}
                  </span>
                </TopLink>
              </li>
              <li>
                <TopLink href="/resources/type/3d_model" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? '3D 모델링 파일' : 
                     language === 'jp' ? '3Dモデリングファイル' : 
                     '3D Model Files'}
                  </span>
                </TopLink>
              </li>
              <li>
                <TopLink href="/resources/type/free_content" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? '프리 콘텐츠' : 
                     language === 'jp' ? 'フリーコンテンツ' : 
                     'Free Content'}
                  </span>
                </TopLink>
              </li>
              <li>
                <TopLink href="/resources/type/flash_game" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? '플래시 게임' : 
                     language === 'jp' ? 'フラッシュゲーム' : 
                     'Flash Games'}
                  </span>
                </TopLink>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {language === 'ko' ? '회사 정보' : 
               language === 'jp' ? '会社情報' : 
               'Company Info'}
            </h3>
            <ul className="space-y-2">
              <li>
                <TopLink href="/about" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? 'Webel 소개' : 
                     language === 'jp' ? 'Webelについて' : 
                     'About Webel'}
                  </span>
                </TopLink>
              </li>
              <li>
                <TopLink href="/blog" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? '블로그' : 
                     language === 'jp' ? 'ブログ' : 
                     'Blog'}
                  </span>
                </TopLink>
              </li>
              <li>
                <TopLink href="/api-docs" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? 'API 문서' : 
                     language === 'jp' ? 'APIドキュメント' : 
                     'API Documentation'}
                  </span>
                </TopLink>
              </li>
              <li>
                <TopLink href="/privacy" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? '개인정보 처리방침' : 
                     language === 'jp' ? 'プライバシーポリシー' : 
                     'Privacy Policy'}
                  </span>
                </TopLink>
              </li>
              <li>
                <TopLink href="/terms" showLoadingIndicator={true} forceReload={true}>
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'ko' ? '이용약관' : 
                     language === 'jp' ? '利用規約' : 
                     'Terms of Service'}
                  </span>
                </TopLink>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Webel. {' '}
            {language === 'ko' ? '모든 권리 보유.' : 
             language === 'jp' ? 'すべての権利を保有。' : 
             'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
