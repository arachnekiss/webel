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

const About: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* 배경 요소 */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
      
      <div className="container max-w-6xl mx-auto py-16 px-4 sm:px-6 relative z-10">
        {/* 히어로 섹션 */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
            <div className="flex-1">
              <Badge className="mb-6 px-3 py-1.5 text-sm bg-blue-100 text-blue-800 hover:bg-blue-100">
                혁신적인 오픈 제작 플랫폼
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">
                Webel – 누구나 만들 수 있도록
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                아이디어를 가진 누구나 원하는 것을 직접 만들어낼 수 있도록 돕는 오픈 제작 플랫폼으로, 
                <span className="inline-flex items-center text-blue-600 font-medium mx-1">
                  상상에서 현실로 <Zap className="h-4 w-4 ml-1" />
                </span>
                아이디어를 실현시켜 드립니다.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/resources">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center">
                    리소스 둘러보기
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </Link>
                <Link href="/services/type/engineer">
                  <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium py-3 px-6 rounded-lg transition-colors">
                    엔지니어 찾기
                  </button>
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-xl transform rotate-1 bg-gradient-to-br from-blue-600 to-indigo-600 p-1">
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                  <div className="relative z-10">
                    <Code className="h-20 w-20 text-blue-500 opacity-80" />
                  </div>
                  <div className="absolute w-32 h-32 bg-blue-100/50 rounded-full -bottom-10 -right-10 blur-xl"></div>
                  <div className="absolute w-24 h-24 bg-indigo-100/50 rounded-full -top-8 -left-8 blur-xl"></div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg transform -rotate-6 flex items-center justify-center">
                <div className="bg-white w-full h-full m-1 rounded-md flex items-center justify-center">
                  <Lightbulb className="h-12 w-12 text-amber-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
            <div className="prose prose-lg max-w-none text-slate-700">
              <p className="lead text-center md:text-left font-medium text-lg">
                <strong className="text-blue-600">Webel</strong>은 아이디어를 가진 누구나 원하는 것을 직접 만들어낼 수 있도록 돕는 오픈 제작 플랫폼입니다. 
                사용자는 다양한 리소스를 자유롭게 활용할 수 있으며, 필요할 경우 AI 에이전트, 전문 엔지니어, 생산업체의 도움을 받을 수 있습니다. 
                설계부터 조립, 대량생산까지 복잡했던 제작 과정을 Webel을 통해 쉽고 빠르며 경제적으로 해결할 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        {/* 핵심 목적 섹션 */}
        <section className="mb-24">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 md:p-16 relative overflow-hidden border border-blue-100">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rotate-45 rounded-3xl"></div>
            <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-indigo-500/5 rotate-12 rounded-3xl"></div>
            
            <div className="relative">
              <h2 className="text-4xl font-bold mb-8 text-slate-800">Webel의 핵심 목적</h2>
              <div className="max-w-3xl">
                <p className="text-lg text-slate-600 mb-6">
                  Webel의 설립 목적은 명확합니다.
                </p>
                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm mb-6 border-l-4 border-blue-500">
                  <p className="text-2xl font-bold text-blue-700">
                    기술 리소스가 자유롭게 순환하고, 엔지니어가 성장하며, 누구나 원하는 것을 생산할 수 있는 사회를 만드는 것.
                  </p>
                </div>
                <p className="text-lg text-slate-600">
                  이는 단순히 도구와 기능을 제공하는 것을 넘어, 소비자와 엔지니어, 제조업체가 함께 성장하는 순환형 생태계를 실현하려는 시도입니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 기능 섹션 */}
        <section className="mb-24">
          <div className="text-center mb-14">
            <Badge className="mb-4 px-3 py-1.5 text-sm">플랫폼 기능</Badge>
            <h2 className="text-4xl font-bold mb-4">Webel에서 할 수 있는 일</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              리소스 공유부터 전문가 연결, 제품 생산까지 원스톱으로 제공하는 Webel의 다양한 기능을 확인하세요.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-md transition-all border-slate-200 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <LayoutGrid className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">리소스 열람 및 다운로드</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  하드웨어 설계도, 소프트웨어, 3D 모델링, AI 모델 등 다양한 디지털 자료를 분야별로 체계적으로 제공합니다.
                  회원가입 없이도 모든 리소스를 즉시 열람하고 다운로드할 수 있습니다.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/resources" className="text-blue-600 font-medium inline-flex items-center text-sm hover:text-blue-700">
                  리소스 살펴보기
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="group hover:shadow-md transition-all border-slate-200 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <CircleUser className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">엔지니어에게 제작 요청</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  맞춤형 제작이 필요할 경우, 전문 엔지니어에게 제작을 요청할 수 있습니다. 
                  무료로 도움을 주는 엔지니어부터 유료로 정밀한 작업을 진행하는 전문가까지 폭넓은 협력 방식이 가능합니다.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/services/type/engineer" className="text-indigo-600 font-medium inline-flex items-center text-sm hover:text-indigo-700">
                  엔지니어 찾기
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="group hover:shadow-md transition-all border-slate-200 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-4 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  <Layers className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">조립 과정 지원</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  직접 조립을 시도하는 과정에서 어려움을 겪을 경우, Webel에 등록된 엔지니어에게 도움을 요청할 수 있습니다. 
                  복잡한 부품이나 장치의 조립 방법에 대해 안내를 받고 원격 지원을 받을 수 있습니다.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/remote-support" className="text-cyan-600 font-medium inline-flex items-center text-sm hover:text-cyan-700">
                  원격 지원 알아보기
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="group hover:shadow-md transition-all border-slate-200 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Factory className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">제조업체 연결</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  프로토타입 완성 후 제품을 대량으로 생산하고자 할 때, Webel에 등록된 다양한 제조업체를 통해 쉽게 연결할 수 있습니다. 
                  조건에 맞는 업체를 찾아 견적을 비교하고, 최적의 파트너를 선택할 수 있습니다.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/services/type/manufacturing" className="text-amber-600 font-medium inline-flex items-center text-sm hover:text-amber-700">
                  제조업체 찾기
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="group hover:shadow-md transition-all border-slate-200 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Briefcase className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">서비스 등록</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  엔지니어와 제조업체는 누구나 Webel에 자신의 기술 서비스를 등록할 수 있습니다. 
                  무료로 지식을 나누거나 전문적인 유료 서비스를 제공하는 등 다양한 방식으로 참여할 수 있습니다.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/services/register" className="text-emerald-600 font-medium inline-flex items-center text-sm hover:text-emerald-700">
                  서비스 등록하기
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="group hover:shadow-md transition-all border-slate-200 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">본인 인증 시스템</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Webel은 유료 서비스 제공 및 금전적 거래의 안전성을 보장하기 위해 체계적인 본인 인증 시스템을 운영합니다. 
                  휴대폰 본인 인증과 계좌 등록 과정을 통해 사용자의 신원을 확인하고 안전한 환경을 구축합니다.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/my/verification" className="text-purple-600 font-medium inline-flex items-center text-sm hover:text-purple-700">
                  인증 방법 알아보기
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
                <h2 className="text-3xl md:text-4xl font-bold">본인 인증 시스템</h2>
              </div>
              
              <p className="text-indigo-100 text-lg max-w-3xl mb-10">
                Webel은 높은 보안 수준과 안전한 거래 보장을 위해 강력한 인증 시스템을 구축했습니다. 이러한 인증 절차는 플랫폼의 신뢰성을 높이고 사용자 간의 원활한 거래를 가능하게 합니다.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">휴대폰 본인 인증</h3>
                      <p className="text-indigo-200 text-sm">첫 번째 인증 단계</p>
                    </div>
                  </div>
                  <p className="text-indigo-100">
                    Webel은 유료 서비스 제공을 위해 휴대폰 본인 인증을 필수 절차로 도입했습니다. 
                    사용자의 실제 휴대폰 번호로 SMS 인증번호를 발송하고 이를 검증함으로써, 
                    가입자의 신원을 확인하고 서비스의 신뢰성을 높입니다. 
                    <span className="block mt-2 text-white font-medium">본인 인증은 3분 이내에 간편하게 완료할 수 있습니다.</span>
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">계좌 등록 인증</h3>
                      <p className="text-indigo-200 text-sm">두 번째 인증 단계</p>
                    </div>
                  </div>
                  <p className="text-indigo-100">
                    휴대폰 인증 이후, 유료 서비스를 제공하고자 하는 사용자는 계좌 등록 과정을 거쳐야 합니다. 
                    계좌 정보는 정산과 금융 거래의 안전성을 위해 필수적이며, 
                    Webel의 서비스 제공자와 이용자 간의 원활한 거래를 보장합니다. 
                    <span className="block mt-2 text-white font-medium">등록된 계좌 정보는 철저하게 보호됩니다.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 기술의 선순환 섹션 */}
        <section className="mb-24">
          <div className="text-center mb-14">
            <Badge className="mb-4 px-3 py-1.5 text-sm">플랫폼 철학</Badge>
            <h2 className="text-4xl font-bold mb-4">Webel이 만드는 기술의 선순환</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              자원의 공유와 협력을 기반으로 한 지속가능한 기술 생태계를 통해 모두가 함께 성장합니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-200 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <Download className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">자원 공유</h3>
                <p className="text-slate-600">
                  사용자는 다양한 리소스를 자유롭게 활용하여 제품 제작을 시작합니다. 이 과정에서 새로운 아이디어가 발생하고 공유됩니다.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-200 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">기술 협력</h3>
                <p className="text-slate-600">
                  제작 과정에서 엔지니어의 기술과 경험이 더해져 더 나은 결과물이 탄생합니다. 이 과정에서 모두의 역량이 성장합니다.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-8 hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-cyan-200 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <RefreshCcw className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">지속적 순환</h3>
                <p className="text-slate-600">
                  완성된 결과물과 개선된 리소스는 다시 Webel에 등록되어 다른 사용자의 제작을 돕고, 이 순환은 계속됩니다.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
            <div className="prose prose-lg max-w-none">
              <p className="lead text-center font-medium">
                Webel의 순환 구조는 단순한 소비가 아닌 공유와 발전의 선순환을 만들어냅니다:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 list-none pl-0">
                <li className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">01</span>
                  <p className="m-0">소비자는 리소스를 활용하여 제품 제작을 시작합니다.</p>
                </li>
                <li className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">02</span>
                  <p className="m-0">제작 과정에서 엔지니어의 기술과 경험이 더해집니다.</p>
                </li>
                <li className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">03</span>
                  <p className="m-0">완성된 결과물과 개선된 리소스는 다시 Webel에 등록됩니다.</p>
                </li>
                <li className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">04</span>
                  <p className="m-0">안전한 본인 인증 시스템은 사용자 간 신뢰를 구축합니다.</p>
                </li>
              </ul>
              <p className="text-center text-slate-700 my-6">
                이처럼 기술과 아이디어, 그리고 신뢰는 일방적으로 소비되는 것이 아니라, 서로 순환하며 공유되고 발전합니다. 
                그 결과, 제작 시간과 비용은 줄어들고, 기술 발전과 창의성의 확산은 가속화됩니다.
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
              Webel은 누구나 원하는 것을 쉽게, 안전하게 만들 수 있는 세상을 지향합니다
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              지금 바로 Webel을 사용해서, 당신의 아이디어를 직접 만들어보세요.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/resources">
                <button className="bg-white text-blue-700 font-medium py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center">
                  리소스 둘러보기
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </Link>
              <Link href="/services/register">
                <button className="bg-blue-700/30 border border-blue-400/30 text-white font-medium py-3 px-8 rounded-lg hover:bg-blue-700/40 transition-colors">
                  서비스 등록하기
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