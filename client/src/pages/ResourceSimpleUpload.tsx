import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

/**
 * 임시 리소스 업로드 페이지
 * 원본 파일 수정 중 오류가 발생하여 생성한 간소화된 버전입니다.
 */
const ResourceSimpleUpload: React.FC = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  // 임시 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setUploading(true);
    
    try {
      // 성공 메시지
      toast({
        title: "알림",
        description: "현재 리소스 업로드 페이지가 유지보수 중입니다.",
      });
    } catch (error) {
      console.error("오류:", error);
      toast({
        title: "오류 발생",
        description: "작업 중 문제가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">리소스 업로드</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <p className="text-amber-600">
              현재 리소스 업로드 페이지가 유지보수 중입니다. 곧 복구될 예정입니다.
            </p>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={uploading}
              >
                {uploading ? "처리 중..." : "확인"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ResourceSimpleUpload;