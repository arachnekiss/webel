import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n"; // i18n 초기화 불러오기
import React from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// 로딩 상태 컴포넌트
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Suspense로 감싸서 언어 리소스 로딩 중에 로딩 UI 표시
createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<Loading />}>
    <App />
  </Suspense>
);
