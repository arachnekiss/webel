import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const SponsorshipBanner: React.FC = () => {
  return (
    <section className="mb-12">
      <div className="bg-gray-100 rounded-xl p-8 md:flex items-center justify-between">
        <div className="md:w-2/3 mb-6 md:mb-0">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">Webel 서비스를 후원해주세요</h3>
          <p className="text-gray-600">
            여러분의 후원은 더 많은 무료 리소스와 서비스를 제공하는데 큰 도움이 됩니다.
            후원자에게는 특별한 배지와 프리미엄 기능 이용 혜택이 제공됩니다.
          </p>
        </div>
        <div>
          <Link href="/sponsor">
            <Button className="px-6 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors shadow-md w-full md:w-auto">
              후원하기
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SponsorshipBanner;
