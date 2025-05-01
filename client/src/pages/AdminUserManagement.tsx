import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCheck, UserX, UserCog, Shield, ShieldX, ArrowLeft } from "lucide-react";
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
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  isAdmin: boolean | null;
  isServiceProvider: boolean | null;
  createdAt: string;
}

export default function AdminUserManagement() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 사용자 목록 가져오기
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  // 관리자 권한 설정 뮤테이션
  const setAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number; isAdmin: boolean }) => {
      const res = await apiRequest("POST", "/api/admin/set-admin", { userId, isAdmin });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "권한 변경 완료",
        description: "사용자의 관리자 권한이 변경되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "권한 변경 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 사용자 삭제 뮤테이션
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "사용자 삭제 완료",
        description: "사용자가 성공적으로 삭제되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "사용자 삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 관리자 권한 설정/해제 핸들러
  const handleSetAdmin = (user: User, isAdmin: boolean) => {
    setAdminMutation.mutate({ userId: user.id, isAdmin });
  };

  // 사용자 삭제 다이얼로그 열기
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // 사용자 삭제 핸들러
  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  // 검색어로 사용자 필터링
  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => setLocation('/admin/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          돌아가기
        </Button>
        <h1 className="text-3xl font-bold">사용자 관리</h1>
      </div>

      {/* 검색 입력 */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="사용자 검색... (이름, 이메일, 아이디)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* 사용자 목록 테이블 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>사용자명</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.fullName || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.isAdmin && <Badge variant="secondary">관리자</Badge>}
                      {user.isServiceProvider && <Badge>서비스 제공자</Badge>}
                      {!user.isAdmin && !user.isServiceProvider && <Badge variant="outline">일반회원</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <UserCog className="h-4 w-4 mr-1" />
                          관리
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.isAdmin ? (
                          <DropdownMenuItem onClick={() => handleSetAdmin(user, false)}>
                            <ShieldX className="h-4 w-4 mr-2" />
                            관리자 권한 해제
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSetAdmin(user, true)}>
                            <Shield className="h-4 w-4 mr-2" />
                            관리자 권한 부여
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => openDeleteDialog(user)}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          사용자 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  {searchTerm ? "검색 결과가 없습니다." : "사용자가 없습니다."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 사용자 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 {selectedUser?.username} 사용자를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없으며, 해당 사용자의 모든 데이터가 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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