import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { 
  Loader2, 
  ArrowLeft, 
  FileText, 
  Trash2, 
  Edit, 
  Eye, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Filter,
  PlusCircle
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface Resource {
  id: number;
  title: string;
  description: string;
  resourceType: string;
  tags: string[] | null;
  imageUrl: string | null;
  downloadUrl: string | null;
  downloadFile: string | null;
  downloadCount: number;
  category: string | null;
  createdAt: string;
  isFeatured?: boolean;
  userId?: number | null;
}

interface ResourcesResponse {
  items: Resource[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// 리소스 타입을 사람이 읽기 쉬운 형태로 변환
const resourceTypeLabels: Record<string, string> = {
  'hardware_design': '하드웨어 설계',
  'software': '소프트웨어',
  '3d_model': '3D 모델',
  'free_content': '무료 콘텐츠',
  'ai_model': 'AI 모델',
  'flash_game': '플래시 게임'
};

// 카테고리 목록
const categoryOptions = [
  { value: 'tutorial', label: '튜토리얼' },
  { value: 'tool', label: '도구' },
  { value: 'game', label: '게임' },
  { value: 'library', label: '라이브러리' },
  { value: 'template', label: '템플릿' },
  { value: 'design', label: '디자인' },
  { value: 'other', label: '기타' },
];

// 리소스 업로드 폼 스키마
const resourceFormSchema = z.object({
  title: z.string().min(3, "제목은 최소 3자 이상이어야 합니다"),
  description: z.string().min(10, "설명은 최소 10자 이상이어야 합니다"),
  resourceType: z.string().min(1, "리소스 유형을 선택해주세요"),
  category: z.string().nullable().optional(),
  tags: z.string().nullable().optional().transform(val => 
    val ? val.split(',').map(tag => tag.trim()) : []
  ),
  downloadUrl: z.string().url("유효한 URL을 입력해주세요").nullable().optional(),
  imageUrl: z.string().url("유효한 URL을 입력해주세요").nullable().optional(),
  howToUse: z.string().nullable().optional(),
  assemblyInstructions: z.string().nullable().optional(),
});

// 폼 기본값
const defaultValues = {
  title: "",
  description: "",
  resourceType: "",
  category: null,
  tags: "",
  downloadUrl: "",
  imageUrl: "",
  howToUse: "",
  assemblyInstructions: "",
};

export default function AdminResourceManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

  // 리소스 목록 가져오기
  const { data: resourcesData, isLoading, error } = useQuery<ResourcesResponse>({
    queryKey: ['/api/admin/resources'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  
  // 리소스 목록 추출
  const resources = resourcesData?.items || [];

  // 업데이트 뮤테이션 (추천 기능 제거로 현재 사용 X)

  // 리소스 삭제 뮤테이션
  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId: number) => {
      const res = await apiRequest("DELETE", `/api/resources/${resourceId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "리소스 삭제 완료" });
      // 모든 리소스 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      // 모달 닫기
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "리소스 삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // 리소스 생성 뮤테이션은 별도 페이지로 이동하여 제거

  // 리소스 삭제 다이얼로그 열기
  const openDeleteDialog = (resource: Resource) => {
    setSelectedResource(resource);
    setIsDeleteDialogOpen(true);
  };

  // 리소스 삭제 핸들러
  const handleDeleteResource = () => {
    if (selectedResource) {
      deleteResourceMutation.mutate(selectedResource.id);
    }
  };

  // 추천 기능 제거로 관련 핸들러 제거됨

  // 타입 필터 선택 핸들러 - 라디오 버튼 형태로 동작
  const selectTypeFilter = (type: string) => {
    if (type === "all") {
      setTypeFilter([]);
    } else {
      setTypeFilter([type]);
    }
  };

  // 검색어와 필터로 리소스 필터링
  const filteredResources = resources.filter(resource => {
    // 검색어 필터링
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    // 타입 필터링
    const matchesType = 
      typeFilter.length === 0 || 
      typeFilter.includes(resource.resourceType);
    
    return matchesSearch && matchesType;
  });

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-destructive mb-2">오류 발생</h1>
        <p className="text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center mb-6">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">리소스 관리</h1>
        <div className="ml-auto">
          <Link href="/admin/resources/upload">
            <Button className="gap-1">
              <PlusCircle className="h-4 w-4" />
              리소스 업로드
            </Button>
          </Link>
        </div>
      </div>

      {/* 필터링 및 검색 */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                카테고리
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>카테고리 선택</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => selectTypeFilter("all")}
                className={typeFilter.length === 0 ? "bg-accent" : ""}
              >
                모든 리소스
              </DropdownMenuItem>
              {Object.entries(resourceTypeLabels).map(([type, label]) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => selectTypeFilter(type)}
                  className={typeFilter.includes(type) ? "bg-accent" : ""}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Input
            type="text"
            placeholder="리소스 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
        </div>

        <ResourceTable 
          resources={filteredResources || []} 
          onDelete={openDeleteDialog}
        />
      </div>

      {/* 리소스 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>리소스 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 "{selectedResource?.title}" 리소스를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없으며, 해당 리소스의 모든 데이터가 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={handleDeleteResource}
              disabled={deleteResourceMutation.isPending}
            >
              {deleteResourceMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              삭제
            </Button>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}

// 리소스 테이블 컴포넌트
function ResourceTable({ 
  resources, 
  onDelete
}: { 
  resources: Resource[]; 
  onDelete: (resource: Resource) => void;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>제목</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>다운로드</TableHead>
            <TableHead>날짜</TableHead>
            <TableHead>액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.length > 0 ? (
            resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>{resource.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[250px]">{resource.title}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                      {resource.description.substring(0, 50)}
                      {resource.description.length > 50 ? '...' : ''}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {resourceTypeLabels[resource.resourceType] || resource.resourceType}
                  </Badge>
                </TableCell>
                <TableCell>{resource.downloadCount || 0}</TableCell>
                <TableCell>{new Date(resource.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        액션
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/resources/${resource.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          상세보기
                        </Link>
                      </DropdownMenuItem>
                      
                      {(resource.downloadUrl || resource.downloadFile) && (
                        <DropdownMenuItem asChild>
                          <a 
                            href={resource.downloadUrl || `/api/resources/${resource.id}/download`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            다운로드
                          </a>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/resources/edit/${resource.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          수정
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(resource)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                리소스가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}