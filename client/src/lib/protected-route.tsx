import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

// 인증이 필요한 라우트를 위한 컴포넌트
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  // 로딩 중일 때는 로딩 인디케이터 표시
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // 사용자가 로그인하지 않았을 경우 로그인 페이지로 리디렉션
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // 사용자가 로그인한 경우 해당 컴포넌트 렌더링
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}

// 관리자 권한이 필요한 라우트를 위한 컴포넌트
export function AdminRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isAdmin, isLoading } = useAuth();

  // 로딩 중일 때는 로딩 인디케이터 표시
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // 사용자가 로그인하지 않았거나 관리자가 아닌 경우
  if (!user || !isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // 관리자인 경우 해당 컴포넌트 렌더링
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}