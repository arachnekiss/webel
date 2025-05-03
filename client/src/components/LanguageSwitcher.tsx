import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageCode, SUPPORTED_LANGUAGES } from '../i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

// 언어별 국기 이모지 및 이름 매핑
const languageInfo: Record<LanguageCode, { name: string; flag: string }> = {
  ko: { name: 'languageSwitcher.ko', flag: '🇰🇷' },
  en: { name: 'languageSwitcher.en', flag: '🇺🇸' },
  ja: { name: 'languageSwitcher.ja', flag: '🇯🇵' },
};

// 모바일 여부 타입 정의
interface LanguageSwitcherProps {
  isMobile?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ isMobile = false }) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  
  const handleLanguageChange = async (language: LanguageCode) => {
    if (language !== currentLanguage) {
      await changeLanguage(language);
    }
  };
  
  // 현재 언어 정보
  const currentLangInfo = languageInfo[currentLanguage];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={isMobile ? "sm" : "default"}
          className="flex items-center gap-1 px-2"
        >
          <Globe className="h-4 w-4 mr-1" />
          <span className="mr-1">{currentLangInfo.flag}</span>
          {!isMobile && <span>{t(currentLangInfo.name)}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang}
            className={`flex items-center gap-2 ${
              currentLanguage === lang ? 'bg-accent' : ''
            }`}
            onClick={() => handleLanguageChange(lang)}
          >
            <span>{languageInfo[lang].flag}</span>
            <span>{t(languageInfo[lang].name)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;