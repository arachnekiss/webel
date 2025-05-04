import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Language, useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  // 언어 이름 표시
  const languageNames: Record<Language, string> = {
    ko: '한국어',
    en: 'English',
    jp: '日本語',
  };

  // 언어 변경 핸들러
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 flex items-center px-2 text-foreground hover:bg-background/80"
        >
          <Globe className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline-block">{languageNames[language]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem
          onClick={() => handleLanguageChange('ko')}
          className={`cursor-pointer ${language === 'ko' ? 'bg-primary/10 text-primary' : ''}`}
        >
          한국어
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('en')}
          className={`cursor-pointer ${language === 'en' ? 'bg-primary/10 text-primary' : ''}`}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('jp')}
          className={`cursor-pointer ${language === 'jp' ? 'bg-primary/10 text-primary' : ''}`}
        >
          日本語
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;