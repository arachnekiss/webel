import React from "react";
import { 
  LayoutGrid, 
  CircleUser, 
  Factory, 
  Shield, 
  Briefcase, 
  Layers, 
  RefreshCcw, 
  ShieldCheck, 
  Phone,
  CreditCard,
  Zap,
  ChevronRight,
  Code,
  Lightbulb,
  Download,
  Users
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const About: React.FC = () => {
  const { language } = useLanguage();
  return (
    <div className="relative overflow-hidden">
      {/* 배경 요소 */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
      
      <div className="container max-w-6xl mx-auto py-16 px-4 sm:px-6 relative z-10">
        {/* 히어로 섹션 */}
        <section className="mb-24">
          <div className="mb-16 max-w-3xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
                {language === 'ko' 
                  ? 'Webel – 누구나 만들 수 있도록'
                  : language === 'jp' 
                    ? 'Webel – 誰でも作れるように'
                    : 'Webel – Making Creation Accessible to Everyone'}
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                {language === 'ko' 
                  ? '아이디어를 가진 누구나 원하는 것을 직접 만들어낼 수 있도록 돕는 오픈 메이커 플랫폼입니다.'
                  : language === 'jp' 
                    ? 'アイデアを持つ誰もが自分の欲しいものを直接作り出せるよう支援するオープンメーカープラットフォームです。'
                    : 'An open maker platform that helps anyone with an idea to create what they want.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3 text-blue-600">
                  <LayoutGrid className="h-5 w-5" />
                  <h3 className="font-medium">
                    {language === 'ko' 
                      ? '다양한 리소스'
                      : language === 'jp' 
                        ? '多様なリソース'
                        : 'Various Resources'}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm">
                  {language === 'ko' 
                    ? '하드웨어 설계도, 소프트웨어, 3D 모델링, AI 모델 등 다양한 디지털 자료를 제공하며, 회원가입 없이도 즉시 다운로드할 수 있습니다.'
                    : language === 'jp' 
                      ? 'ハードウェア設計図、ソフトウェア、3Dモデリング、AIモデルなど多様なデジタル資料を提供し、会員登録なしでもすぐにダウンロードできます。'
                      : 'Provides various digital materials such as hardware designs, software, 3D modeling, and AI models that can be downloaded immediately without registration.'}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3 text-blue-600">
                  <CircleUser className="h-5 w-5" />
                  <h3 className="font-medium">
                    {language === 'ko' 
                      ? '전문 엔지니어'
                      : language === 'jp' 
                        ? '専門エンジニア'
                        : 'Professional Engineers'}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm">
                  {language === 'ko' 
                    ? '맞춤형 제작이 필요할 경우, 전문 엔지니어에게 제작을 요청하고 안내받을 수 있습니다.'
                    : language === 'jp' 
                      ? 'カスタム製作が必要な場合、専門エンジニアに製作を依頼し、ガイダンスを受けることができます。'
                      : 'If custom production is needed, you can request assistance from professional engineers for guidance and help.'}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3 text-blue-600">
                  <Factory className="h-5 w-5" />
                  <h3 className="font-medium">
                    {language === 'ko' 
                      ? '제조업체 연결'
                      : language === 'jp' 
                        ? 'メーカーとの連携'
                        : 'Manufacturer Connections'}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm">
                  {language === 'ko' 
                    ? '프로토타입 완성 후 대량생산을 원할 때, 조건에 맞는 제조업체를 찾고 연결받을 수 있습니다.'
                    : language === 'jp' 
                      ? 'プロトタイプ完成後に量産を希望する場合、条件に合うメーカーを見つけて連携することができます。'
                      : 'When you want mass production after completing a prototype, you can find and connect with suitable manufacturers.'}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3 text-blue-600">
                  <ShieldCheck className="h-5 w-5" />
                  <h3 className="font-medium">
                    {language === 'ko' 
                      ? '신뢰할 수 있는 거래'
                      : language === 'jp' 
                        ? '信頼できる取引'
                        : 'Trusted Transactions'}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm">
                  {language === 'ko' 
                    ? '본인 인증 시스템을 통해 안전한 거래 환경을 제공하고, 사용자 간 신뢰를 구축합니다.'
                    : language === 'jp' 
                      ? '本人認証システムを通じて安全な取引環境を提供し、ユーザー間の信頼を構築します。'
                      : 'Provides a secure transaction environment through identity verification systems and builds trust between users.'}
                </p>
              </div>
            </div>
            
            <div className="text-center mt-10 mb-8">
              <div className="flex justify-center gap-4">
                <Link href="/resources">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center">
                    {language === 'ko' 
                      ? '리소스 둘러보기'
                      : language === 'jp' 
                        ? 'リソースを見る'
                        : 'Browse Resources'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </Link>
                <Link href="/services/type/engineer">
                  <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium py-3 px-6 rounded-lg transition-colors">
                    {language === 'ko' 
                      ? '엔지니어 찾기'
                      : language === 'jp' 
                        ? 'エンジニアを探す'
                        : 'Find Engineers'}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 핵심 목적 섹션 */}
        <section className="mb-24">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 md:p-16 relative overflow-hidden border border-blue-100">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rotate-45 rounded-3xl"></div>
            <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-indigo-500/5 rotate-12 rounded-3xl"></div>
            
            <div className="relative">
              <h2 className="text-4xl font-bold mb-8 text-slate-800">
                {language === 'ko' 
                  ? 'Webel의 핵심 목적'
                  : language === 'jp' 
                    ? 'Webelの核心目的'
                    : 'Core Purpose of Webel'}
              </h2>
              <div className="max-w-3xl">
                <p className="text-lg text-slate-600 mb-6">
                  {language === 'ko' 
                    ? 'Webel의 설립 목적은 명확합니다.'
                    : language === 'jp' 
                      ? 'Webelの設立目的は明確です。'
                      : 'The founding purpose of Webel is clear.'}
                </p>
                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm mb-6 border-l-4 border-blue-500">
                  <p className="text-2xl font-bold text-blue-700">
                    {language === 'ko' 
                      ? '기술 리소스가 자유롭게 순환하고, 엔지니어가 성장하며, 누구나 원하는 것을 생산할 수 있는 사회를 만드는 것.'
                      : language === 'jp' 
                        ? '技術リソースが自由に循環し、エンジニアが成長し、誰もが望むものを生産できる社会を作ること。'
                        : 'To create a society where technology resources circulate freely, engineers grow, and anyone can produce what they want.'}
                  </p>
                </div>
                <p className="text-lg text-slate-600">
                  {language === 'ko' 
                    ? '이는 단순히 도구와 기능을 제공하는 것을 넘어, 소비자와 엔지니어, 제조업체가 함께 성장하는 순환형 생태계를 실현하려는 시도입니다.'
                    : language === 'jp' 
                      ? 'これは単にツールと機能を提供することを超え、消費者とエンジニア、メーカーが共に成長する循環型エコシステムを実現する試みです。'
                      : 'This goes beyond simply providing tools and features; it is an attempt to realize a circular ecosystem where consumers, engineers, and manufacturers grow together.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 기능 섹션 */}
        <section className="mb-24">
          <div className="text-center mb-14">
            <Badge className="mb-4 px-3 py-1.5 text-sm">
              {language === 'ko' 
                ? '플랫폼 기능'
                : language === 'jp' 
                  ? 'プラットフォーム機能'
                  : 'Platform Features'}
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              {language === 'ko' 
                ? 'Webel에서 할 수 있는 일'
                : language === 'jp' 
                  ? 'Webelでできること'
                  : 'What You Can Do with Webel'}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {language === 'ko' 
                ? '리소스 공유부터 전문가 연결, 제품 생산까지 원스톱으로 제공하는 Webel의 다양한 기능을 확인하세요.'
                : language === 'jp' 
                  ? 'リソース共有から専門家の連携、製品生産まで一括で提供するWebelの多様な機能をご確認ください。'
                  : 'Check out Webel\'s various features that provide everything from resource sharing to expert connections and product manufacturing in one place.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-md transition-all border-slate-200 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <LayoutGrid className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">
                  {language === 'ko' 
                    ? '리소스 열람 및 다운로드'
                    : language === 'jp' 
                      ? 'リソースの閲覧とダウンロード'
                      : 'Browse and Download Resources'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {language === 'ko' 
                    ? '하드웨어 설계도, 소프트웨어, 3D 모델링, AI 모델 등 다양한 디지털 자료를 분야별로 체계적으로 제공합니다. 회원가입 없이도 모든 리소스를 즉시 열람하고 다운로드할 수 있습니다.'
                    : language === 'jp' 
                      ? 'ハードウェア設計図、ソフトウェア、3Dモデリング、AIモデルなど、さまざまなデジタル資料を分野別に体系的に提供します。会員登録なしでもすべてのリソースをすぐに閲覧してダウンロードできます。'
                      : 'We systematically provide various digital materials such as hardware designs, software, 3D modeling, and AI models by field. You can immediately view and download all resources without signing up.'}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/resources" className="text-blue-600 font-medium inline-flex items-center text-sm hover:text-blue-700">
                  {language === 'ko' 
                    ? '리소스 살펴보기'
                    : language === 'jp' 
                      ? 'リソースを見る'
                      : 'Explore Resources'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="group hover:shadow-md transition-all border-slate-200 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <CircleUser className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">
                  {language === 'ko' 
                    ? '엔지니어에게 제작 요청'
                    : language === 'jp' 
                      ? 'エンジニアへの制作依頼'
                      : 'Request Engineering Services'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {language === 'ko' 
                    ? '맞춤형 제작이 필요할 경우, 전문 엔지니어에게 제작을 요청할 수 있습니다. 무료로 도움을 주는 엔지니어부터 유료로 정밀한 작업을 진행하는 전문가까지 폭넓은 협력 방식이 가능합니다.'
                    : language === 'jp' 
                      ? 'カスタム制作が必要な場合、専門エンジニアに制作を依頼できます。無料でサポートするエンジニアから有料で精密な作業を行う専門家まで、幅広い協力方式が可能です。'
                      : 'If you need custom production, you can request it from professional engineers. A wide range of collaboration options are available, from engineers who help for free to experts who perform precise work for a fee.'}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/services/type/engineer" className="text-indigo-600 font-medium inline-flex items-center text-sm hover:text-indigo-700">
                  {language === 'ko' 
                    ? '엔지니어 찾기'
                    : language === 'jp' 
                      ? 'エンジニアを探す'
                      : 'Find Engineers'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="group hover:shadow-md transition-all border-slate-200 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-4 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  <Layers className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">
                  {language === 'ko' 
                    ? '조립 과정 지원'
                    : language === 'jp' 
                      ? '組立過程サポート'
                      : 'Assembly Support'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {language === 'ko' 
                    ? '직접 조립을 시도하는 과정에서 어려움을 겪을 경우, Webel에 등록된 엔지니어에게 도움을 요청할 수 있습니다. 복잡한 부품이나 장치의 조립 방법에 대해 안내를 받고 원격 지원을 받을 수 있습니다.'
                    : language === 'jp' 
                      ? '直接組み立てを試みる過程で困難を経験する場合、Webelに登録されたエンジニアに助けを求めることができます。複雑な部品や装置の組み立て方法についてガイダンスを受け、リモートサポートを受けることができます。'
                      : 'If you encounter difficulties during the assembly process, you can request help from engineers registered with Webel. You can receive guidance on how to assemble complex parts or devices and get remote support.'}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/services/type/engineer" className="text-cyan-600 font-medium inline-flex items-center text-sm hover:text-cyan-700">
                  {language === 'ko' 
                    ? '엔지니어 찾기'
                    : language === 'jp' 
                      ? 'エンジニアを探す'
                      : 'Find Engineers'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="group hover:shadow-md transition-all border-slate-200 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Factory className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">
                  {language === 'ko' 
                    ? '제조업체 연결'
                    : language === 'jp' 
                      ? 'メーカーとの連携'
                      : 'Manufacturer Connections'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {language === 'ko' 
                    ? '프로토타입 완성 후 제품을 대량으로 생산하고자 할 때, Webel에 등록된 다양한 제조업체를 통해 쉽게 연결할 수 있습니다. 조건에 맞는 업체를 찾아 견적을 비교하고, 최적의 파트너를 선택할 수 있습니다.'
                    : language === 'jp' 
                      ? 'プロトタイプ完成後に製品を大量生産したい場合、Webelに登録された様々なメーカーを通じて簡単に連携できます。条件に合う企業を探して見積もりを比較し、最適なパートナーを選択できます。'
                      : 'When you want to mass-produce products after completing a prototype, you can easily connect with various manufacturers registered with Webel. You can find companies that meet your conditions, compare quotes, and select the optimal partner.'}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/services/type/manufacturing" className="text-amber-600 font-medium inline-flex items-center text-sm hover:text-amber-700">
                  {language === 'ko' 
                    ? '제조업체 찾기'
                    : language === 'jp' 
                      ? 'メーカーを探す'
                      : 'Find Manufacturers'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="group hover:shadow-md transition-all border-slate-200 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Briefcase className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">
                  {language === 'ko' 
                    ? '서비스 등록'
                    : language === 'jp' 
                      ? 'サービス登録'
                      : 'Register Services'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {language === 'ko' 
                    ? '엔지니어와 제조업체는 누구나 Webel에 자신의 기술 서비스를 등록할 수 있습니다. 무료로 지식을 나누거나 전문적인 유료 서비스를 제공하는 등 다양한 방식으로 참여할 수 있습니다.'
                    : language === 'jp' 
                      ? 'エンジニアとメーカーは誰でもWebelに自分の技術サービスを登録できます。無料で知識を共有したり、専門的な有料サービスを提供するなど、様々な方法で参加できます。'
                      : 'Engineers and manufacturers can register their technical services on Webel. You can participate in various ways, such as sharing knowledge for free or providing professional paid services.'}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/services/register" className="text-emerald-600 font-medium inline-flex items-center text-sm hover:text-emerald-700">
                  {language === 'ko' 
                    ? '서비스 등록하기'
                    : language === 'jp' 
                      ? 'サービスを登録する'
                      : 'Register Service'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="group hover:shadow-md transition-all border-slate-200 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">
                  {language === 'ko' 
                    ? '본인 인증 시스템'
                    : language === 'jp' 
                      ? '本人認証システム'
                      : 'Identity Verification System'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {language === 'ko' 
                    ? 'Webel은 유료 서비스 제공 및 금전적 거래의 안전성을 보장하기 위해 체계적인 본인 인증 시스템을 운영합니다. 휴대폰 본인 인증과 계좌 등록 과정을 통해 사용자의 신원을 확인하고 안전한 환경을 구축합니다.'
                    : language === 'jp' 
                      ? 'Webelは有料サービス提供および金銭的取引の安全性を保証するため、体系的な本人認証システムを運営しています。携帯電話本人認証と口座登録過程を通じてユーザーの身元を確認し、安全な環境を構築します。'
                      : 'Webel operates a systematic identity verification system to ensure the safety of paid services and financial transactions. We verify user identities through mobile phone verification and account registration processes to build a secure environment.'}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/my/verification" className="text-purple-600 font-medium inline-flex items-center text-sm hover:text-purple-700">
                  {language === 'ko' 
                    ? '인증 방법 알아보기'
                    : language === 'jp' 
                      ? '認証方法を見る'
                      : 'Learn About Verification'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* 본인 인증 시스템 섹션 */}
        <section className="mb-24">
          <div className="bg-gradient-to-br from-indigo-900 to-blue-700 rounded-3xl p-10 lg:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1470')] opacity-10 mix-blend-overlay bg-center bg-cover"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="h-8 w-8" />
                <h2 className="text-3xl md:text-4xl font-bold">
                  {language === 'ko' 
                    ? '본인 인증 시스템'
                    : language === 'jp' 
                      ? '本人認証システム'
                      : 'Identity Verification System'}
                </h2>
              </div>
              
              <p className="text-indigo-100 text-lg max-w-3xl mb-10">
                {language === 'ko' 
                  ? 'Webel은 높은 보안 수준과 안전한 거래 보장을 위해 강력한 인증 시스템을 구축했습니다. 이러한 인증 절차는 오픈 메이커 플랫폼의 신뢰성을 높이고 사용자 간의 원활한 거래를 가능하게 합니다.'
                  : language === 'jp' 
                    ? 'Webelは高いセキュリティレベルと安全な取引保証のために強力な認証システムを構築しました。この認証プロセスはオープンメーカープラットフォームの信頼性を高め、ユーザー間のスムーズな取引を可能にします。'
                    : 'Webel has built a robust authentication system to ensure high security levels and secure transaction guarantees. These verification procedures enhance the reliability of the open maker platform and enable smooth transactions between users.'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {language === 'ko' 
                          ? '휴대폰 본인 인증'
                          : language === 'jp' 
                            ? '携帯電話本人認証'
                            : 'Mobile Phone Verification'}
                      </h3>
                      <p className="text-indigo-200 text-sm">
                        {language === 'ko' 
                          ? '첫 번째 인증 단계'
                          : language === 'jp' 
                            ? '最初の認証ステップ'
                            : 'First verification step'}
                      </p>
                    </div>
                  </div>
                  <p className="text-indigo-100">
                    {language === 'ko' 
                      ? 'Webel은 유료 서비스 제공을 위해 휴대폰 본인 인증을 필수 절차로 도입했습니다. 사용자의 실제 휴대폰 번호로 SMS 인증번호를 발송하고 이를 검증함으로써, 가입자의 신원을 확인하고 서비스의 신뢰성을 높입니다.'
                      : language === 'jp' 
                        ? 'Webelは有料サービスを提供するために、携帯電話認証を必須プロセスとして導入しました。ユーザーの実際の携帯電話番号にSMS認証番号を送信し、これを検証することで、登録者の身元を確認し、サービスの信頼性を高めます。'
                        : 'Webel has introduced mobile phone verification as a mandatory procedure for providing paid services. By sending SMS verification codes to users\' actual mobile phone numbers and verifying them, we confirm the identity of subscribers and increase the reliability of the service.'}
                    <span className="block mt-2 text-white font-medium">
                      {language === 'ko' 
                        ? '본인 인증은 3분 이내에 간편하게 완료할 수 있습니다.'
                        : language === 'jp' 
                          ? '本人認証は3分以内に簡単に完了できます。'
                          : 'Identity verification can be easily completed within 3 minutes.'}
                    </span>
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {language === 'ko' 
                          ? '계좌 등록 인증'
                          : language === 'jp' 
                            ? '口座登録認証'
                            : 'Bank Account Registration'}
                      </h3>
                      <p className="text-indigo-200 text-sm">
                        {language === 'ko' 
                          ? '두 번째 인증 단계'
                          : language === 'jp' 
                            ? '二番目の認証ステップ'
                            : 'Second verification step'}
                      </p>
                    </div>
                  </div>
                  <p className="text-indigo-100">
                    {language === 'ko' 
                      ? '휴대폰 인증 이후, 유료 서비스를 제공하고자 하는 사용자는 계좌 등록 과정을 거쳐야 합니다. 계좌 정보는 정산과 금융 거래의 안전성을 위해 필수적이며, Webel의 서비스 제공자와 이용자 간의 원활한 거래를 보장합니다.'
                      : language === 'jp' 
                        ? '携帯電話認証の後、有料サービスを提供したいユーザーは口座登録プロセスを経る必要があります。口座情報は決済と金融取引の安全性のために不可欠であり、Webelのサービス提供者と利用者間のスムーズな取引を保証します。'
                        : 'After mobile phone verification, users who want to provide paid services must go through an account registration process. Account information is essential for the safety of settlements and financial transactions, and guarantees smooth transactions between Webel\'s service providers and users.'}
                    <span className="block mt-2 text-white font-medium">
                      {language === 'ko' 
                        ? '등록된 계좌 정보는 철저하게 보호됩니다.'
                        : language === 'jp' 
                          ? '登録された口座情報は徹底的に保護されます。'
                          : 'Registered account information is thoroughly protected.'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 기술의 선순환 섹션 */}
        <section className="mb-24">
          <div className="text-center mb-14">
            <Badge className="mb-4 px-3 py-1.5 text-sm">
              {language === 'ko' 
                ? '플랫폼 철학'
                : language === 'jp' 
                  ? 'プラットフォーム哲学'
                  : 'Platform Philosophy'}
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              {language === 'ko' 
                ? 'Webel이 만드는 기술의 선순환'
                : language === 'jp' 
                  ? 'Webelが作る技術の好循環'
                  : 'Virtuous Cycle of Technology Created by Webel'}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {language === 'ko' 
                ? '자원의 공유와 협력을 기반으로 한 지속가능한 기술 생태계를 통해 모두가 함께 성장합니다.'
                : language === 'jp' 
                  ? '資源の共有と協力に基づいた持続可能な技術エコシステムを通じて、皆が共に成長します。'
                  : 'Everyone grows together through a sustainable technology ecosystem based on resource sharing and collaboration.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-200 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <Download className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">
                  {language === 'ko' 
                    ? '자원 공유'
                    : language === 'jp' 
                      ? '資源共有'
                      : 'Resource Sharing'}
                </h3>
                <p className="text-slate-600">
                  {language === 'ko' 
                    ? '사용자는 다양한 리소스를 자유롭게 활용하여 제품 제작을 시작합니다. 이 과정에서 새로운 아이디어가 발생하고 공유됩니다.'
                    : language === 'jp' 
                      ? 'ユーザーは様々なリソースを自由に活用して製品制作を始めます。この過程で新しいアイデアが生まれ、共有されます。'
                      : 'Users freely utilize various resources to start product creation. New ideas emerge and are shared during this process.'}
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-200 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">
                  {language === 'ko' 
                    ? '기술 협력'
                    : language === 'jp' 
                      ? '技術協力'
                      : 'Technical Collaboration'}
                </h3>
                <p className="text-slate-600">
                  {language === 'ko' 
                    ? '제작 과정에서 엔지니어의 기술과 경험이 더해져 더 나은 결과물이 탄생합니다. 이 과정에서 모두의 역량이 성장합니다.'
                    : language === 'jp' 
                      ? '制作過程でエンジニアの技術と経験が加わり、より良い結果物が誕生します。この過程で皆の能力が成長します。'
                      : 'Engineers\' skills and experience are added during the creation process, resulting in better outcomes. In this process, everyone\'s capabilities grow.'}
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-8 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-cyan-200 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <RefreshCcw className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">
                  {language === 'ko' 
                    ? '지속적 순환'
                    : language === 'jp' 
                      ? '持続的循環'
                      : 'Continuous Circulation'}
                </h3>
                <p className="text-slate-600">
                  {language === 'ko' 
                    ? '완성된 결과물과 개선된 리소스는 다시 Webel에 등록되어 다른 사용자의 제작을 돕고, 이 순환은 계속됩니다.'
                    : language === 'jp' 
                      ? '完成した成果物と改善されたリソースは再びWebelに登録され、他のユーザーの制作を手伝い、この循環は続きます。'
                      : 'Completed results and improved resources are registered back to Webel, helping other users\' creations, and this cycle continues.'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
            <div className="prose prose-lg max-w-none">
              <p className="lead text-center font-medium">
                {language === 'ko' 
                  ? 'Webel의 순환 구조는 단순한 소비가 아닌 공유와 발전의 선순환을 만들어냅니다:'
                  : language === 'jp' 
                    ? 'Webelの循環構造は単なる消費ではなく、共有と発展の好循環を生み出します:'
                    : 'Webel\'s circular structure creates a virtuous cycle of sharing and development, not just consumption:'}
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 list-none pl-0">
                <li className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">01</span>
                  <p className="m-0">
                    {language === 'ko' 
                      ? '소비자는 리소스를 활용하여 제품 제작을 시작합니다.'
                      : language === 'jp' 
                        ? '消費者はリソースを活用して製品制作を始めます。'
                        : 'Consumers start product creation using resources.'}
                  </p>
                </li>
                <li className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">02</span>
                  <p className="m-0">
                    {language === 'ko' 
                      ? '제작 과정에서 엔지니어의 기술과 경험이 더해집니다.'
                      : language === 'jp' 
                        ? '制作過程でエンジニアの技術と経験が加わります。'
                        : 'Engineers\' skills and experience are added to the creation process.'}
                  </p>
                </li>
                <li className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">03</span>
                  <p className="m-0">
                    {language === 'ko' 
                      ? '완성된 결과물과 개선된 리소스는 다시 Webel에 등록됩니다.'
                      : language === 'jp' 
                        ? '完成した成果物と改善されたリソースは再びWebelに登録されます。'
                        : 'Completed results and improved resources are registered back to Webel.'}
                  </p>
                </li>
                <li className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">04</span>
                  <p className="m-0">
                    {language === 'ko' 
                      ? '안전한 본인 인증 시스템은 사용자 간 신뢰를 구축합니다.'
                      : language === 'jp' 
                        ? '安全な本人認証システムはユーザー間の信頼を構築します。'
                        : 'The secure identity verification system builds trust between users.'}
                  </p>
                </li>
              </ul>
              <p className="text-center text-slate-700 my-6">
                {language === 'ko' 
                  ? '이처럼 기술과 아이디어, 그리고 신뢰는 일방적으로 소비되는 것이 아니라, 서로 순환하며 공유되고 발전합니다. 그 결과, 제작 시간과 비용은 줄어들고, 기술 발전과 창의성의 확산은 가속화됩니다.'
                  : language === 'jp' 
                    ? 'このように技術とアイディア、そして信頼は一方的に消費されるのではなく、互いに循環しながら共有され発展します。その結果、制作時間とコストが削減され、技術発展と創造性の拡散が加速します。'
                    : 'In this way, technology, ideas, and trust are not consumed unilaterally, but circulate, are shared, and develop together. As a result, production time and costs are reduced, while technological advancement and the spread of creativity are accelerated.'}
              </p>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581094794329-c8112a89f47e?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] opacity-15 mix-blend-overlay bg-center bg-cover"></div>
          
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white max-w-3xl mx-auto leading-tight">
              {language === 'ko' 
                ? 'Webel은 누구나 원하는 것을 쉽게, 안전하게 만들 수 있는 세상을 지향합니다'
                : language === 'jp' 
                  ? 'Webelは誰もが望むものを簡単に、安全に作れる世界を目指します'
                  : 'Webel aims for a world where anyone can easily and safely create what they want'}
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              {language === 'ko' 
                ? '지금 바로 Webel을 사용해서, 당신의 아이디어를 직접 만들어보세요.'
                : language === 'jp' 
                  ? '今すぐWebelを使って、あなたのアイデアを直接作ってみましょう。'
                  : 'Use Webel right now to create your ideas directly.'}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/resources">
                <button className="bg-white text-blue-700 font-medium py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center">
                  {language === 'ko' 
                    ? '리소스 둘러보기'
                    : language === 'jp' 
                      ? 'リソースを見る'
                      : 'Browse Resources'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </Link>
              <Link href="/services/register">
                <button className="bg-blue-700/30 border border-blue-400/30 text-white font-medium py-3 px-8 rounded-lg hover:bg-blue-700/40 transition-colors">
                  {language === 'ko' 
                    ? '서비스 등록하기'
                    : language === 'jp' 
                      ? 'サービスを登録する'
                      : 'Register Service'}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;