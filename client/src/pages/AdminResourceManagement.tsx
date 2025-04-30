import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  Filter
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function AdminResourceManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

  // 리소스 목록 가져오기
  const { data: resourcesData, isLoading, error } = useQuery<ResourcesResponse>({
    queryKey: ['/api/admin/resources'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  
  // 리소스 목록 추출
  const resources = resourcesData?.items;

  // 리소스 변경 뮤테이션 (featured 상태 변경)
  const updateResourceMutation = useMutation({
    mutationFn: async ({ resourceId, data }: { resourceId: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/resources/${resourceId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "리소스 업데이트 완료" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resources'] });
    },
    onError: (error: Error) => {
      toast({
        title: "리소스 업데이트 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 리소스 삭제 뮤테이션
  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId: number) => {
      const res = await apiRequest("DELETE", `/api/resources/${resourceId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "리소스 삭제 완료" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resources'] });
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

  // 리소스 피처링 상태 변경 핸들러
  const handleToggleFeatured = (resource: Resource) => {
    updateResourceMutation.mutate({
      resourceId: resource.id,
      data: { isFeatured: !resource.isFeatured }
    });
  };

  // 타입 필터 토글 핸들러
  const toggleTypeFilter = (type: string) => {
    setTypeFilter(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // 검색어와 필터로 리소스 필터링
  const filteredResources = resources && Array.isArray(resources) ? resources.filter(resource => {
    // 검색어 필터링
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    // 탭 필터링
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "featured" && resource.isFeatured);

    // 타입 필터링
    const matchesType = 
      typeFilter.length === 0 || 
      typeFilter.includes(resource.resourceType);
    
    return matchesSearch && matchesTab && matchesType;
  }) : [];

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
      </div>

      {/* 탭 및 필터링 */}
      <div className="mb-6">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">모든 리소스</TabsTrigger>
              <TabsTrigger value="featured">추천 리소스</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    리소스 타입
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>리소스 타입 선택</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(resourceTypeLabels).map(([type, label]) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={typeFilter.includes(type)}
                      onCheckedChange={() => toggleTypeFilter(type)}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Input
                type="text"
                placeholder="리소스 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </div>

          <TabsContent value="all">
            <ResourceTable 
              resources={filteredResources || []} 
              onDelete={openDeleteDialog}
              onToggleFeatured={handleToggleFeatured}
            />
          </TabsContent>
          
          <TabsContent value="featured">
            <ResourceTable 
              resources={filteredResources || []} 
              onDelete={openDeleteDialog}
              onToggleFeatured={handleToggleFeatured}
            />
          </TabsContent>
        </Tabs>
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
  onDelete,
  onToggleFeatured
}: { 
  resources: Resource[]; 
  onDelete: (resource: Resource) => void;
  onToggleFeatured: (resource: Resource) => void;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>제목</TableHead>
            <TableHead>타입</TableHead>
            <TableHead>다운로드</TableHead>
            <TableHead>추천</TableHead>
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
                <TableCell>
                  {resource.isFeatured ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">추천</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">일반</Badge>
                  )}
                </TableCell>
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
                      
                      <DropdownMenuItem onClick={() => onToggleFeatured(resource)}>
                        {resource.isFeatured ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            추천 해제
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            추천으로 표시
                          </>
                        )}
                      </DropdownMenuItem>
                      
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
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                리소스가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}