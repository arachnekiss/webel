import { useState } from 'react';
import { useNavigate } from 'wouter';
import TusUploader, { FileInfo } from '@/components/TusUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LucideArrowLeft, LucideImage, LucideFile3d, LucideFileArchive, LucideFileVideo } from 'lucide-react';

const ResourceUpload = () => {
  const [activeTab, setActiveTab] = useState('image');
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // 파일 유형에 따른 허용 확장자 매핑
  const fileTypesMap = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    video: ['.mp4', '.webm', '.mov'],
    model3d: ['.stl', '.obj', '.fbx', '.3ds', '.blend'],
    archive: ['.zip', '.rar', '.7z', '.tar', '.gz']
  };
  
  // 업로드 완료 핸들러
  const handleUploadComplete = (fileInfo: FileInfo) => {
    setUploadedFile(fileInfo);
    toast({
      title: '업로드 성공',
      description: `${fileInfo.filename} 파일이 성공적으로 업로드되었습니다.`,
      variant: 'default',
    });
  };
  
  // 업로드 오류 핸들러
  const handleUploadError = (error: Error) => {
    toast({
      title: '업로드 오류',
      description: error.message || '파일 업로드 중 오류가 발생했습니다.',
      variant: 'destructive',
    });
  };
  
  // 탭 변경 핸들러
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setUploadedFile(null);
  };
  
  // 파일 유형에 맞는 아이콘 표시
  const renderFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <LucideImage className="w-5 h-5 mr-2" />;
      case 'video':
        return <LucideFileVideo className="w-5 h-5 mr-2" />;
      case 'model3d':
        return <LucideFile3d className="w-5 h-5 mr-2" />;
      case 'archive':
        return <LucideFileArchive className="w-5 h-5 mr-2" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/resources')}
          className="mr-2"
        >
          <LucideArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>
        <h1 className="text-2xl font-bold">리소스 업로드</h1>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>파일 업로드</CardTitle>
          <CardDescription>
            업로드하려는 파일 유형을 선택하고 파일을 업로드하세요.
            대용량 파일도 중단 없이 업로드할 수 있습니다.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-6">
              <TabsTrigger value="image" className="flex items-center">
                <LucideImage className="w-4 h-4 mr-2" />
                이미지
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center">
                <LucideFileVideo className="w-4 h-4 mr-2" />
                동영상
              </TabsTrigger>
              <TabsTrigger value="model3d" className="flex items-center">
                <LucideFile3d className="w-4 h-4 mr-2" />
                3D 모델
              </TabsTrigger>
              <TabsTrigger value="archive" className="flex items-center">
                <LucideFileArchive className="w-4 h-4 mr-2" />
                압축 파일
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="image">
              <TusUploader 
                allowedFileTypes={fileTypesMap.image}
                maxFileSize={100 * 1024 * 1024} // 100MB
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                buttonText="이미지 업로드"
              />
            </TabsContent>
            
            <TabsContent value="video">
              <TusUploader 
                allowedFileTypes={fileTypesMap.video}
                maxFileSize={2 * 1024 * 1024 * 1024} // 2GB
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                buttonText="비디오 업로드"
              />
            </TabsContent>
            
            <TabsContent value="model3d">
              <TusUploader 
                allowedFileTypes={fileTypesMap.model3d}
                maxFileSize={500 * 1024 * 1024} // 500MB
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                buttonText="3D 모델 업로드"
              />
            </TabsContent>
            
            <TabsContent value="archive">
              <TusUploader 
                allowedFileTypes={fileTypesMap.archive}
                maxFileSize={2 * 1024 * 1024 * 1024} // 2GB
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                buttonText="압축 파일 업로드"
              />
            </TabsContent>
          </Tabs>
          
          {uploadedFile && (
            <>
              <Separator className="my-6" />
              
              <div className="bg-slate-50 p-4 rounded-md">
                <h3 className="font-medium mb-2 flex items-center">
                  {renderFileTypeIcon(activeTab)}
                  업로드된 파일 정보
                </h3>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>파일명:</strong> {uploadedFile.filename}</div>
                  <div><strong>크기:</strong> {formatFileSize(uploadedFile.size)}</div>
                  <div><strong>타입:</strong> {uploadedFile.mimeType}</div>
                  <div><strong>경로:</strong> {uploadedFile.path}</div>
                </div>
                
                {activeTab === 'image' && uploadedFile.mimeType.startsWith('image/') && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">미리보기</h4>
                    <img 
                      src={uploadedFile.path} 
                      alt={uploadedFile.filename}
                      className="max-h-64 rounded-md border border-slate-200" 
                    />
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={() => setUploadedFile(null)}
                    variant="outline"
                    className="mr-2"
                  >
                    다른 파일 업로드
                  </Button>
                  
                  <Button onClick={() => navigate('/resources')}>
                    리소스 목록으로 이동
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>대용량 파일 업로드 가이드</CardTitle>
          <CardDescription>
            대용량 파일을 업로드할 때 알아두면 좋은 팁
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <ul className="list-disc ml-5 space-y-2">
            <li>업로드가 중단되더라도 다시 동일한 파일을 선택하면 중단된 지점부터 이어서 업로드됩니다.</li>
            <li>대용량 파일의 경우 연결이 안정적인 환경에서 업로드하는 것이 좋습니다.</li>
            <li>업로드 중에는 브라우저 탭을 닫지 마세요. 업로드가 중단될 수 있습니다.</li>
            <li>이미지는 최대 100MB, 동영상과 압축 파일은 최대 2GB, 3D 모델은 최대 500MB까지 업로드할 수 있습니다.</li>
            <li>지원되는 파일 형식: PNG, JPG, GIF, WEBP, SVG, MP4, WEBM, MOV, STL, OBJ, FBX, 3DS, BLEND, ZIP, RAR, 7Z, TAR, GZ</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

// 파일 크기 형식화 함수
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

export default ResourceUpload;