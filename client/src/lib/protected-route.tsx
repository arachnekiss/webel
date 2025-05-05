import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import React from "react";

// 인증이 필요한 라우트를 위한 컴포넌트
export function ProtectedRoute({
  path,
  component: Component,
  children,
}: {
  path?: string;
  component?: () => React.JSX.Element;
  children?: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  // 로딩 중일 때는 로딩 인디케이터 표시
  if (isLoading) {
    return path ? (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 사용자가 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  if (!user) {
    return path ? (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    ) : (
      <Redirect to="/auth" />
    );
  }

  // 사용자가 로그인한 경우 해당 컴포넌트 또는 자식 요소 렌더링
  if (path && Component) {
    return (
      <Route path={path}>
        <Component />
      </Route>
    );
  }
  
  return <>{children}</>;
}

// 관리자 권한이 필요한 라우트를 위한 컴포넌트
export function AdminRoute({
  path,
  component: Component,
  children,
}: {
  path?: string;
  component?: () => React.JSX.Element;
  children?: React.ReactNode;
}) {
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();

  // 디버깅용 로그 추가
  console.log("[AdminRoute] 상태:", { path, location, isLoading, user, isAdmin });

  // 로딩 중일 때는 로딩 인디케이터 표시
  if (isLoading) {
    return path ? (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">관리자 권한 확인 중...</p>
        </div>
      </Route>
    ) : (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-muted-foreground">관리자 권한 확인 중...</p>
      </div>
    );
  }

  // 사용자가 로그인하지 않았거나 관리자가 아닌 경우
  if (!user || !isAdmin) {
    // 접근 제한 메시지 표시
    toast({
      title: "접근 제한",
      description: "관리자 권한이 필요한 페이지입니다.",
      variant: "destructive",
    });
    
    return path ? (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    ) : (
      <Redirect to="/" />
    );
  }

  // 관리자인 경우 해당 컴포넌트 또는 자식 요소 렌더링
  if (path && Component) {
    return (
      <Route path={path}>
        <Component />
      </Route>
    );
  }
  
  return <>{children}</>;
}