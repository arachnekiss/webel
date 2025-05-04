import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

export default function NotFound() {
  const { t, formatUrl, language } = useLanguage();
  
  // 디버깅용 타이틀과 메시지
  const title = t('errorPages.404_title');
  const message = t('errorPages.404_message');
  const homeText = t('goToHome');
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">{title || '404 Page Not Found'}</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            {message || 'The page you requested could not be found. Please check the URL.'}
          </p>
          
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <p>Debug info:</p>
            <p>Current language: {language}</p>
            <p>Title key: {title ? 'Found' : 'Missing'}</p>
            <p>Message key: {message ? 'Found' : 'Missing'}</p>
          </div>
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
