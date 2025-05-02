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
  CreditCard 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

const About: React.FC = () => {
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <section className="mb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Webel – 누구나 만들 수 있도록</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            아이디어를 가진 누구나 원하는 것을 직접 만들어낼 수 있도록 돕는 오픈 제작 플랫폼
          </p>
        </div>

        <div className="prose prose-lg max-w-4xl mx-auto">
          <p className="lead">
            <strong>Webel</strong>은 아이디어를 가진 누구나 원하는 것을 직접 만들어낼 수 있도록 돕는 오픈 제작 플랫폼입니다. 
            사용자는 다양한 리소스를 자유롭게 활용할 수 있으며, 필요할 경우 AI 에이전트, 전문 엔지니어, 생산업체의 도움을 받을 수 있습니다. 
            설계부터 조립, 대량생산까지 복잡했던 제작 과정을 Webel을 통해 쉽고 빠르며 경제적으로 해결할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Webel의 핵심 목적</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg mb-6">
              Webel의 설립 목적은 명확합니다.
            </p>
            <p className="text-xl font-bold text-primary mb-6">
              기술 리소스가 자유롭게 순환하고, 엔지니어가 성장하며, 누구나 원하는 것을 생산할 수 있는 사회를 만드는 것.
            </p>
            <p className="text-lg">
              이는 단순히 도구와 기능을 제공하는 것을 넘어, 소비자와 엔지니어, 제조업체가 함께 성장하는 순환형 생태계를 실현하려는 시도입니다.
            </p>
          </div>
        </div>
      </section>

      <Separator className="my-12" />

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-10 text-center">Webel에서 할 수 있는 일</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <LayoutGrid className="h-10 w-10 text-primary mb-2" />
              <CardTitle>리소스 열람 및 다운로드</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                하드웨어 설계도, 오픈소스 소프트웨어, 3D 모델링 파일, 인공지능 모델, 프리 콘텐츠, 플래시 게임 등 다양한 디지털 자료를 분야별로 체계적으로 제공합니다.
                회원가입 없이도 모든 리소스를 즉시 열람하고 다운로드할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CircleUser className="h-10 w-10 text-primary mb-2" />
              <CardTitle>엔지니어에게 제작 요청</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                리소스를 기반으로 제품을 직접 만들거나 맞춤형 제작이 필요할 경우, 전문 엔지니어에게 제작을 요청할 수 있습니다. 
                간단한 설명만으로도 의뢰가 가능하며, 무료로 도움을 주는 엔지니어부터 유료로 정밀한 작업을 진행하는 전문가까지 폭넓은 협력 방식이 준비되어 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Layers className="h-10 w-10 text-primary mb-2" />
              <CardTitle>조립 과정 지원</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                직접 조립을 시도하는 과정에서 어려움을 겪을 경우, Webel에 등록된 엔지니어에게 도움을 요청할 수 있습니다. 
                복잡한 부품이나 장치의 조립 방법에 대해 안내를 받을 수 있으며, 일부 엔지니어는 원격으로 조립을 지원합니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Factory className="h-10 w-10 text-primary mb-2" />
              <CardTitle>대량생산을 위한 제조업체 연결</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                프로토타입 완성 후 제품을 대량으로 생산하고자 할 때, Webel에 등록된 다양한 제조업체를 통해 쉽게 연결할 수 있습니다. 
                사용자는 조건에 맞는 업체를 찾아 견적을 비교하고, 최적의 파트너를 선택해 생산을 진행할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Briefcase className="h-10 w-10 text-primary mb-2" />
              <CardTitle>엔지니어 및 생산업체 서비스 등록</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                엔지니어와 제조업체는 누구나 Webel에 자신의 기술 서비스를 등록할 수 있습니다. 
                무료로 지식을 나누고자 하는 기술자부터 전문적인 유료 서비스를 제공하는 엔지니어, 제조 공정을 담당할 수 있는 생산업체까지 모두 자유롭게 참여할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ShieldCheck className="h-10 w-10 text-primary mb-2" />
              <CardTitle>안전한 거래를 위한 본인 인증 시스템</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Webel은 유료 서비스 제공 및 금전적 거래의 안전성을 보장하기 위해 체계적인 본인 인증 시스템을 운영합니다. 
                휴대폰 본인 인증과 계좌 등록 과정을 통해 사용자의 신원을 확인하고, 안전한 서비스 제공 환경을 구축했습니다. 
                특히 유료 서비스를 제공하고자 하는 엔지니어와 제조업체는 본인 인증을 완료해야만 서비스를 등록할 수 있어 플랫폼 내 거래의 투명성과 신뢰성을 높였습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-16">
        <div className="bg-primary/5 rounded-2xl p-8 lg:p-12">
          <h2 className="text-3xl font-bold mb-8 text-center">본인 인증 시스템</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Phone className="h-10 w-10 text-primary mb-2" />
                <CardTitle>휴대폰 본인 인증</CardTitle>
                <CardDescription>첫 번째 인증 단계</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Webel은 유료 서비스 제공을 위해 휴대폰 본인 인증을 필수 절차로 도입했습니다. 
                  사용자의 실제 휴대폰 번호로 SMS 인증번호를 발송하고 이를 검증함으로써, 
                  가입자의 신원을 확인하고 서비스의 신뢰성을 높입니다. 
                  본인 인증은 3분 이내에 간편하게 완료할 수 있습니다.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CreditCard className="h-10 w-10 text-primary mb-2" />
                <CardTitle>계좌 등록 인증</CardTitle>
                <CardDescription>두 번째 인증 단계</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  휴대폰 인증 이후, 유료 서비스를 제공하고자 하는 사용자는 계좌 등록 과정을 거쳐야 합니다. 
                  계좌 정보는 정산과 금융 거래의 안전성을 위해 필수적이며, 
                  Webel의 서비스 제공자와 이용자 간의 원활한 거래를 보장합니다. 
                  등록된 계좌 정보는 철저하게 보호됩니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator className="my-12" />

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Webel이 만드는 기술의 선순환</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 mb-10">
          <div className="text-center max-w-xs">
            <div className="bg-primary/10 rounded-full p-6 inline-flex mb-4">
              <RefreshCcw className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">순환형 생태계</h3>
            <p className="text-muted-foreground">
              Webel은 단순한 리소스 플랫폼이 아닙니다. 기술과 아이디어가 공유되고 발전하는 순환형 생태계를 구축합니다.
            </p>
          </div>
          
          <div className="text-center max-w-xs">
            <div className="bg-primary/10 rounded-full p-6 inline-flex mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">신뢰 기반 환경</h3>
            <p className="text-muted-foreground">
              본인 인증 시스템을 통해 신뢰할 수 있는 거래 환경을 제공하고, 사용자 간의 안전한 상호작용을 보장합니다.
            </p>
          </div>
        </div>
        
        <div className="prose prose-lg max-w-4xl mx-auto">
          <p>
            Webel의 순환 구조는 다음과 같은 흐름을 만들어냅니다:
          </p>
          <ul>
            <li>소비자는 리소스를 활용하여 제품 제작을 시작합니다.</li>
            <li>제작 과정에서 엔지니어의 기술과 경험이 더해집니다.</li>
            <li>완성된 결과물과 개선된 리소스는 다시 Webel에 등록되어 다른 사용자의 제작을 돕습니다.</li>
            <li>안전한 본인 인증 시스템은 이 모든 과정에서 사용자 간 신뢰를 구축합니다.</li>
          </ul>
          <p>
            이처럼 기술과 아이디어, 그리고 신뢰는 일방적으로 소비되는 것이 아니라, 서로 순환하며 공유되고 발전합니다. 
            그 결과, 제작 시간과 비용은 줄어들고, 기술 발전과 창의성의 확산은 가속화됩니다.
          </p>
        </div>
      </section>

      <div className="bg-primary text-white rounded-2xl p-10 text-center">
        <h2 className="text-3xl font-bold mb-4">Webel은 누구나 원하는 것을 쉽게, 안전하게 만들 수 있는 세상을 지향합니다</h2>
        <p className="text-xl mb-6">지금 바로 Webel을 사용해서, 당신의 아이디어를 직접 만들어보세요.</p>
        <Link href="/resources">
          <button className="bg-white text-primary font-medium py-3 px-6 rounded-lg hover:bg-white/90 transition-colors">
            리소스 둘러보기
          </button>
        </Link>
      </div>
    </div>
  );
};

export default About;