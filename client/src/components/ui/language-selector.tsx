import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/i18n/translations';

interface LanguageOption {
  code: Language;
  label: string;
  shortLabel: string;
  color: string;
}

const languages: LanguageOption[] = [
  { 
    code: 'ko', 
    label: '한국어', 
    shortLabel: 'KO', 
    color: '#000000'
  },
  { 
    code: 'en', 
    label: 'English', 
    shortLabel: 'EN', 
    color: '#0A3161'
  },
  { 
    code: 'jp', 
    label: '日本語', 
    shortLabel: 'JP', 
    color: '#BC002D'
  },
];

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  
  // Find the current language option
  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 px-2 border-none shadow-none">
          <Globe className="h-4 w-4" />
          <span 
            className="hidden sm:inline-block font-semibold" 
            style={{ color: currentLanguage.color }}
          >
            {currentLanguage.shortLabel}
          </span>
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-2 ${language === lang.code ? 'bg-accent text-accent-foreground' : ''}`}
          >
            <span 
              className="font-semibold w-7 text-center text-sm"
              style={{ color: lang.color }}
            >
              {lang.shortLabel}
            </span>
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}