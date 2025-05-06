import React from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { LucideArrowLeft, LucideFileUp } from 'lucide-react';
import FileUploadTester from '@/components/FileUploadTester';

const FileUploadTest: React.FC = () => {
  const [, setLocation] = useLocation();
  
  return (
    <div>
      <div className="container py-4 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/resources/upload-tus')}
            className="mr-2"
          >
            <LucideArrowLeft className="w-4 h-4 mr-2" />
            업로드 페이지로 돌아가기
          </Button>
          <h1 className="text-2xl font-bold">파일 업로드 테스트</h1>
        </div>
      </div>
      
      <FileUploadTester />
    </div>
  );
};

export default FileUploadTest;