import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Loader2, Users, Wrench, Archive, Gavel, FileText, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

// 대시보드 데이터 인터페이스
interface DashboardData {
  usersCount: number;
  servicesCount: number;
  resourcesCount: number;
  auctionsCount: number;
  recentUsers: any[];
  recentResources: any[];
}

export default function AdminDashboard() {
  const [_, setLocation] = useLocation();
  
  // 대시보드 데이터 가져오기
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/admin/dashboard'],
    queryFn: getQueryFn({ on401: 'throw' }),
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
      <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>
      
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="사용자" 
          value={data?.usersCount || 0} 
          description="등록된 총 사용자 수" 
          icon={<Users className="h-6 w-6" />} 
        />
        <StatCard 
          title="엔지니어" 
          value={data?.servicesCount || 0} 
          description="제공 중인 총 엔지니어 수" 
          icon={<Wrench className="h-6 w-6" />} 
        />
        <StatCard 
          title="리소스" 
          value={data?.resourcesCount || 0} 
          description="등록된 총 리소스 수" 
          icon={<FileText className="h-6 w-6" />} 
        />
        <StatCard 
          title="서비스" 
          value={data?.auctionsCount || 0} 
          description="등록된 총 서비스 수" 
          icon={<Gavel className="h-6 w-6" />} 
        />
      </div>
      
      {/* 최근 활동 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 최근 가입 사용자 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              최근 가입 사용자
            </CardTitle>
            <CardDescription>최근에 가입한 사용자 목록</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentUsers && data.recentUsers.length > 0 ? (
              <ul className="space-y-2">
                {data.recentUsers.map((user) => (
                  <li key={user.id} className="flex justify-between p-2 border-b">
                    <div>
                      <p className="font-medium">{user.fullName || user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), 'yyyy-MM-dd')}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">사용자 데이터가 없습니다.</p>
            )}
          </CardContent>
        </Card>
        
        {/* 최근 등록 리소스 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Archive className="mr-2 h-5 w-5" />
              최근 등록 리소스
            </CardTitle>
            <CardDescription>최근에 등록된 리소스 목록</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentResources && data.recentResources.length > 0 ? (
              <ul className="space-y-2">
                {data.recentResources.map((resource) => (
                  <li key={resource.id} className="flex justify-between p-2 border-b">
                    <div>
                      <p className="font-medium">{resource.title}</p>
                      <p className="text-sm text-muted-foreground">{resource.resourceType}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(resource.createdAt), 'yyyy-MM-dd')}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">리소스 데이터가 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* 관리 링크 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">관리 기능</h2>
        <Separator className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard 
            title="사용자 관리" 
            description="사용자 계정 및 권한 관리" 
            icon={<Users className="h-5 w-5" />}
            onClick={() => setLocation('/admin/users')}
          />
          <ActionCard 
            title="리소스 관리" 
            description="리소스 등록 및 관리" 
            icon={<Archive className="h-5 w-5" />}
            onClick={() => setLocation('/admin/resources')}
          />
          <ActionCard 
            title="엔지니어 관리" 
            description="엔지니어 등록 및 관리" 
            icon={<Wrench className="h-5 w-5" />}
            onClick={() => setLocation('/admin/engineers')}
          />
        </div>
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({ title, value, description, icon }: { 
  title: string; 
  value: number; 
  description: string; 
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// 액션 카드 컴포넌트
function ActionCard({ title, description, icon, onClick }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={onClick}>
      <CardHeader className="flex flex-row items-center pb-2">
        <div className="mr-2">{icon}</div>
        <CardTitle className="text-md font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}