import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

export default function NotFound() {
  const { t, formatUrl } = useLanguage();
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">{t('errorPages.404_title')}</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            {t('errorPages.404_message')}
          </p>
        </CardContent>
        <CardFooter>
          <Link href={formatUrl('/')}>
            <Button variant="default">
              {t('goToHome')}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
