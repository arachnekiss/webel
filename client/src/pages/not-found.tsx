import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

export default function NotFound() {
  const { t, formatUrl, language } = useLanguage();
  
  // 언어별 번역 텍스트 직접 가져오기
  let title = '';
  let message = '';
  
  // 언어에 따른 기본값 설정
  if (language === 'ko') {
    title = '404 페이지를 찾을 수 없음';
    message = '요청하신 페이지를 찾을 수 없습니다. URL을 확인해 주세요.';
  } else if (language === 'en') {
    title = '404 Page Not Found';
    message = 'The page you requested could not be found. Please check the URL.';
  } else if (language === 'jp') {
    title = '404 ページが見つかりません';
    message = 'リクエストされたページが見つかりませんでした。URLを確認してください。';
  }
  
  // 번역 키를 통해 텍스트 가져오기 시도
  const translatedTitle = t('errorPages.404_title');
  const translatedMessage = t('errorPages.404_message');
  const homeText = t('goToHome');
  
  // 번역된 텍스트가 있으면 사용, 없으면 기본값 사용
  if (translatedTitle !== 'errorPages.404_title' && translatedTitle !== '404_title') {
    title = translatedTitle;
  }
  
  if (translatedMessage !== 'errorPages.404_message' && translatedMessage !== '404_message') {
    message = translatedMessage;
  }
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            {message}
          </p>
        </CardContent>
        <CardFooter>
          <Link href={formatUrl('/')}>
            <Button variant="default">
              {homeText || 'Go to Home'}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
