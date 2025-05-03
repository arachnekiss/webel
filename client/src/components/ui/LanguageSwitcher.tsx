import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'default' | 'minimal';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'default' 
}) => {
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
  
  // 현재 선택된 언어 정보
  const currentLanguageInfo = availableLanguages.find(lang => lang.code === currentLanguage);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 gap-1 px-2"
        >
          <Globe className="h-4 w-4" />
          {variant === 'default' && (
            <span className="text-sm">
              {currentLanguageInfo?.name || 'Language'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-40">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className={`flex items-center gap-2 text-sm cursor-pointer ${
              currentLanguage === language.code ? 'bg-accent font-medium' : ''
            }`}
            onClick={() => changeLanguage(language.code)}
          >
            <span className="ml-2">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;