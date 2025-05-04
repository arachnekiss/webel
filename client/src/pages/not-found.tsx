import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFound() {
  const { language } = useLanguage();

  // 다국어 텍스트
  const pageTitle = language === 'ko' 
    ? '404 페이지를 찾을 수 없습니다' 
    : language === 'jp' 
      ? '404 ページが見つかりません' 
      : '404 Page Not Found';

  const pageMessage = language === 'ko' 
    ? '요청하신 페이지를 찾을 수 없습니다. 주소를 확인해 주세요.' 
    : language === 'jp' 
      ? 'お探しのページが見つかりませんでした。URLを確認してください。' 
      : 'The page you requested could not be found. Please check the URL.';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            {pageMessage}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
