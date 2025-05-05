import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  ArrowLeft, 
  Wrench, 
  Trash2, 
  Edit, 
  Eye, 
  Star, 
  StarOff,
  MapPin,
  Filter,
  CheckCircle2, 
  XCircle 
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

// 서비스 타입 인터페이스
interface Service {
  id: number;
  userId: number | null;
  title: string;
  description: string;
  serviceType: '3d_printing' | 'manufacturing' | 'engineer';
  location: {
    lat: number;
    long: number;
    address: string;
    city?: string;
    country?: string;
  } | null;
  rating: number | null;
  ratingCount: number | null;
  tags: string[] | null;
  imageUrl: string | null;
  createdAt: string;
  isVerified?: boolean;
  isPaid?: boolean;
  price?: number;
  contactEmail?: string;
  contactPhone?: string;
  printerModel?: string;
  specializations?: string[];
  hourlyRate?: number;
}

// 서비스 타입 라벨 - 모든 지원되는 서비스 타입에 대한 한글 레이블
const serviceTypeLabels: Record<string, string> = {
  // 하드웨어 관련 서비스
  '3d_printing': '3D 프린팅',
  'manufacturing': '생산업체',
  // 인적 자원 서비스
  'engineer': '엔지니어'
};

export default function AdminServiceManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  // 모든 서비스를 표시하는 단일 탭만 사용
  const [activeTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

  // 모든 서비스 목록 가져오기
  const { data: servicesData, isLoading, error } = useQuery<{ items: Service[], meta: any }>({
    queryKey: ['/api/admin/services'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  
  // 실제 서비스 배열 (items 필드에서 추출)
  const services = servicesData?.items || [];

  // 유료/무료 상태 변경 기능 제거

  // 서비스 삭제 뮤테이션
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/services/${serviceId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "서비스가 성공적으로 삭제되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "서비스 삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 삭제 다이얼로그 열기
  const openDeleteDialog = (service: Service) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  // 서비스 삭제 핸들러
  const handleDeleteService = () => {
    if (selectedService) {
      deleteServiceMutation.mutate(selectedService.id);
    }
  };

  // 유료/무료 변경 기능 제거

  // 타입 필터 토글 핸들러
  const toggleTypeFilter = (type: string) => {
    setTypeFilter(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // 검색어와 필터로 서비스 필터링
  const filteredServices = services?.filter(service => {
    // 검색어 필터링
    const matchesSearch = 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.tags && service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (service.location?.address && service.location.address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 탭 필터링 - 모든 서비스 표시(유료/무료 구분 탭 제거)
    const matchesTab = true;

    // 타입 필터링
    const matchesType = 
      typeFilter.length === 0 || 
      typeFilter.includes(service.serviceType);
    
    return matchesSearch && matchesTab && matchesType;
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
        <h1 className="text-3xl font-bold">서비스 관리</h1>
      </div>

      {/* 탭 및 필터링 */}
      <div className="mb-6">
        <Tabs defaultValue="all" value={activeTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">모든 서비스</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    서비스 타입
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>서비스 타입 선택</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(serviceTypeLabels).map(([type, label]) => (
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
                placeholder="서비스 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </div>

          <TabsContent value="all">
            <ServiceTable 
              services={filteredServices || []} 
              onDelete={openDeleteDialog}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* 서비스 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>서비스 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 "{selectedService?.title}" 서비스를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없으며, 해당 서비스의 모든 데이터가 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={handleDeleteService}
              disabled={deleteServiceMutation.isPending}
            >
              {deleteServiceMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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

// 서비스 테이블 컴포넌트
function ServiceTable({ 
  services, 
  onDelete
}: { 
  services: Service[]; 
  onDelete: (service: Service) => void;
}) {
  // 평점 포맷팅 함수
  const formatRating = (rating: number | null, count: number | null) => {
    if (rating === null || count === null || count === 0) {
      return "평가 없음";
    }
    return `${rating.toFixed(1)} (${count})`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>서비스명</TableHead>
            <TableHead>유형</TableHead>
            <TableHead>위치</TableHead>
            <TableHead>평점</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length > 0 ? (
            services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[200px]">{service.title}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {service.description.substring(0, 50)}
                      {service.description.length > 50 ? '...' : ''}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {serviceTypeLabels[service.serviceType] || service.serviceType}
                  </Badge>
                </TableCell>
                <TableCell>
                  {service.location ? (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="text-sm">{service.location.address}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">정보 없음</span>
                  )}
                </TableCell>
                <TableCell>
                  {service.rating ? (
                    <div className="flex items-center">
                      <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                      <span>{formatRating(service.rating, service.ratingCount)}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">평가 없음</span>
                  )}
                </TableCell>
                <TableCell>
                  {service.isPaid || (service.price && service.price > 0) ? (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">유료</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">무료</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Wrench className="h-4 w-4 mr-1" />
                        액션
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/services/${service.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          상세보기
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/services/edit/${service.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          수정
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(service)}
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
                서비스가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}