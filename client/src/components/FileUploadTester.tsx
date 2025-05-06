import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  AlertCircle, 
  FileText, 
  Upload, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Globe
} from 'lucide-react';

import * as tus from 'tus-js-client';
import { createTestFiles, createMultilingualFilename } from '@/utils/fileUploadTest';

interface TestResult {
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  message?: string;
  url?: string;
  isMultilingual?: boolean;
  language?: string;
}

const FileUploadTester: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [summary, setSummary] = useState<{
    total: number;
    success: number;
    failed: number;
    multilingual: {
      total: number;
      success: number;
    }
  }>({
    total: 0,
    success: 0,
    failed: 0,
    multilingual: {
      total: 0,
      success: 0
    }
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadInstancesRef = useRef<tus.Upload[]>([]);
  
  const languages = ['korean', 'japanese', 'chinese', 'arabic', 'thai', 'mixed'];
  
  // 테스트 실행 함수
  const runTests = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    abortControllerRef.current = new AbortController();
    uploadInstancesRef.current = [];
    
    // 결과 초기화
    setResults([]);
    setSummary({
      total: 0,
      success: 0,
      failed: 0,
      multilingual: {
        total: 0,
        success: 0
      }
    });
    
    try {
      // 파일 타입별 테스트
      const testByType = async (type: string, extension: string, mimeType: string) => {
        // 일반 ASCII 파일명 테스트
        const normalFile = new File(
          [new ArrayBuffer(1024 * 1024)], // 1MB
          `test_${type}.${extension}`,
          { type: mimeType }
        );
        
        await uploadFile(normalFile, `${type}_normal`);
        
        // 다국어 파일명 테스트
        for (const lang of languages) {
          const multilingualFilename = createMultilingualFilename(`test_${type}.${extension}`, lang as any);
          const multilingualFile = new File(
            [new ArrayBuffer(1024 * 1024)],
            multilingualFilename,
            { type: mimeType }
          );
          
          await uploadFile(multilingualFile, `${type}_${lang}`, true, lang);
        }
      };
      
      // 다양한 파일 타입 테스트
      await testByType('image', 'jpg', 'image/jpeg');
      await testByType('video', 'mp4', 'video/mp4');
      await testByType('document', 'pdf', 'application/pdf');
      await testByType('model3d', 'stl', 'model/stl');
      await testByType('archive', 'zip', 'application/zip');
      
    } catch (error) {
      console.error('테스트 실행 중 오류 발생:', error);
      
      // 오류 결과 추가
      setResults(prev => [
        ...prev,
        {
          name: '테스트 오류',
          size: 0,
          status: 'error',
          progress: 0,
          message: error instanceof Error ? error.message : '알 수 없는 오류'
        }
      ]);
    } finally {
      setIsRunning(false);
    }
  };
  
  // 개별 파일 업로드 함수
  const uploadFile = (file: File, testId: string, isMultilingual = false, language = ''): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      // 초기 결과 상태 추가
      const initialResult: TestResult = {
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0,
        isMultilingual,
        language
      };
      
      // 기존 결과에 추가
      setResults(prev => [...prev, initialResult]);
      const resultIndex = results.length;
      
      // tus 업로드 설정
      const upload = new tus.Upload(file, {
        endpoint: '/uploads/',
        retryDelays: [0, 1000, 3000, 5000],
        metadata: {
          filename: file.name,
          filetype: file.type
        },
        onError: (error) => {
          console.error(`파일 업로드 오류 (${file.name}):`, error);
          
          // 결과 업데이트 - 오류
          setResults(prev => {
            const updated = [...prev];
            updated[resultIndex] = {
              ...updated[resultIndex],
              status: 'error',
              message: error.message
            };
            return updated;
          });
          
          // 요약 업데이트
          setSummary(prev => ({
            ...prev,
            total: prev.total + 1,
            failed: prev.failed + 1,
            multilingual: {
              ...prev.multilingual,
              total: isMultilingual ? prev.multilingual.total + 1 : prev.multilingual.total
            }
          }));
          
          resolve();
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = (bytesUploaded / bytesTotal) * 100;
          
          // 결과 업데이트 - 진행 상태
          setResults(prev => {
            const updated = [...prev];
            updated[resultIndex] = {
              ...updated[resultIndex],
              status: 'uploading',
              progress: percentage
            };
            return updated;
          });
        },
        onSuccess: () => {
          // 파일 정보 URL 구하기
          const uniqueId = (upload.url as string).split('/').pop() || '';
          
          // 결과 업데이트 - 성공
          setResults(prev => {
            const updated = [...prev];
            updated[resultIndex] = {
              ...updated[resultIndex],
              status: 'success',
              progress: 100,
              url: `/uploads/${file.name}`
            };
            return updated;
          });
          
          // 요약 업데이트
          setSummary(prev => ({
            ...prev,
            total: prev.total + 1,
            success: prev.success + 1,
            multilingual: {
              ...prev.multilingual,
              total: isMultilingual ? prev.multilingual.total + 1 : prev.multilingual.total,
              success: isMultilingual ? prev.multilingual.success + 1 : prev.multilingual.success
            }
          }));
          
          resolve();
        }
      });
      
      // 업로드 인스턴스 저장 및 시작
      uploadInstancesRef.current.push(upload);
      upload.start();
    });
  };
  
  // 테스트 중단 함수
  const stopTests = () => {
    if (!isRunning) return;
    
    // 현재 업로드 작업 중단
    uploadInstancesRef.current.forEach(upload => {
      if (upload && typeof upload.abort === 'function') {
        upload.abort();
      }
    });
    
    // Abort 컨트롤러 트리거
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setIsRunning(false);
    
    // 모든 진행 중인 테스트를 오류로 표시
    setResults(prev => 
      prev.map(result => 
        result.status === 'uploading' || result.status === 'pending'
          ? { ...result, status: 'error', message: '사용자에 의해 중단됨' }
          : result
      )
    );
  };
  
  // 결과 필터링 함수
  const getFilteredResults = () => {
    if (activeTab === 'all') return results;
    if (activeTab === 'multilingual') return results.filter(r => r.isMultilingual);
    if (activeTab === 'success') return results.filter(r => r.status === 'success');
    if (activeTab === 'failed') return results.filter(r => r.status === 'error');
    
    // 특정 언어별 필터링
    return results.filter(r => r.language === activeTab);
  };
  
  // 필터링된 결과
  const filteredResults = getFilteredResults();
  
  // 테스트 결과 렌더링 함수
  const renderResultItem = (result: TestResult) => {
    const statusMap = {
      pending: { icon: <Loader2 className="w-4 h-4 animate-spin" />, color: 'bg-slate-200', text: '대기 중' },
      uploading: { icon: <RefreshCw className="w-4 h-4 animate-spin" />, color: 'bg-blue-200', text: '업로드 중' },
      success: { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, color: 'bg-green-100', text: '성공' },
      error: { icon: <XCircle className="w-4 h-4 text-red-500" />, color: 'bg-red-100', text: '실패' }
    };
    
    const status = statusMap[result.status];
    
    return (
      <div className={`p-4 rounded-md mb-2 ${status.color} flex items-start`}>
        <div className="mr-2 mt-1">
          {status.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{result.name}</h4>
            <Badge variant="outline">{(result.size / (1024 * 1024)).toFixed(2)} MB</Badge>
            {result.isMultilingual && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> {result.language}
              </Badge>
            )}
          </div>
          
          {result.status === 'uploading' && (
            <Progress value={result.progress} className="h-2 mb-2" />
          )}
          
          <div className="text-sm flex justify-between">
            <span>{status.text}</span>
            {result.message && <span className="text-red-500">{result.message}</span>}
          </div>
          
          {result.status === 'success' && result.url && (
            <div className="mt-2 text-sm text-blue-600">
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                {result.url}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">파일 업로드 테스트</CardTitle>
          <CardDescription>
            다양한 파일 유형과 다국어 파일명에 대한 업로드 테스트를 실행합니다.
            각 파일 유형별로 기본 ASCII 파일명과 여러 언어로 된 파일명을 테스트합니다.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              테스트 실행
            </Button>
            
            <Button 
              variant="outline" 
              onClick={stopTests} 
              disabled={!isRunning}
              className="flex items-center gap-2"
            >
              테스트 중단
            </Button>
          </div>
          
          {results.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{summary.total}</div>
                      <div className="text-sm text-muted-foreground">전체 테스트</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{summary.success}</div>
                      <div className="text-sm text-muted-foreground">성공</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-600">{summary.multilingual.success}/{summary.multilingual.total}</div>
                      <div className="text-sm text-muted-foreground">다국어 성공률</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Separator className="my-6" />
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">전체 ({results.length})</TabsTrigger>
                  <TabsTrigger value="multilingual">다국어 ({results.filter(r => r.isMultilingual).length})</TabsTrigger>
                  <TabsTrigger value="success">성공 ({results.filter(r => r.status === 'success').length})</TabsTrigger>
                  <TabsTrigger value="failed">실패 ({results.filter(r => r.status === 'error').length})</TabsTrigger>
                  {languages.map(lang => (
                    <TabsTrigger key={lang} value={lang}>
                      {lang === 'korean' && '한국어'}
                      {lang === 'japanese' && '일본어'}
                      {lang === 'chinese' && '중국어'}
                      {lang === 'arabic' && '아랍어'}
                      {lang === 'thai' && '태국어'}
                      {lang === 'mixed' && '혼합언어'}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <div className="space-y-2">
                  {filteredResults.length > 0 ? (
                    filteredResults.map((result, index) => (
                      <div key={index}>
                        {renderResultItem(result)}
                      </div>
                    ))
                  ) : (
                    <Alert>
                      <AlertTitle>결과 없음</AlertTitle>
                      <AlertDescription>
                        선택한 필터에 해당하는 테스트 결과가 없습니다.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </Tabs>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="text-sm text-muted-foreground">
            <p>테스트는 각 파일 유형에 대해 일반 ASCII 파일명과 다국어 파일명으로 업로드를 시도합니다.</p>
            <p>다국어 테스트는 한국어, 일본어, 중국어, 아랍어, 태국어, 혼합언어로 진행됩니다.</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FileUploadTester;