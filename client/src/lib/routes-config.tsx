import { lazy } from 'react';
import { RouteConfig } from './language-routes';

// 주요 페이지 컴포넌트 (lazy loading)
const Home = lazy(() => import('@/pages/Home'));
const Services = lazy(() => import('@/pages/Services'));
const ServiceDetail = lazy(() => import('@/pages/ServiceDetail'));
const Resources = lazy(() => import('@/pages/Resources'));
const ResourceDetail = lazy(() => import('@/pages/ResourceDetail'));
const RegisterServiceUnified = lazy(() => import('@/pages/RegisterServiceUnified'));
const RegisterService = lazy(() => import('@/pages/RegisterService'));
const ResourceManagementPage = lazy(() => import('@/pages/ResourceManagementPage'));
const ResourceUploadPage = lazy(() => import('@/pages/ResourceUploadPage'));
const ResourceUploadPageV2 = lazy(() => import('@/pages/ResourceUploadPageV2'));
const UploadResource = lazy(() => import('@/pages/UploadResource'));
const Auctions = lazy(() => import('@/pages/Auctions'));
const AuctionDetail = lazy(() => import('@/pages/AuctionDetail'));
const AiAssembly = lazy(() => import('@/pages/AiAssembly'));
const RemoteSupport = lazy(() => import('@/pages/RemoteSupport'));
const Sponsor = lazy(() => import('@/pages/Sponsor'));
const About = lazy(() => import('@/pages/About'));
const Engineers = lazy(() => import('@/pages/Engineers'));
const AuthPage = lazy(() => import('@/pages/auth-page'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminUserManagement = lazy(() => import('@/pages/AdminUserManagement'));
const AdminResourceManagement = lazy(() => import('@/pages/AdminResourceManagement'));
const AdminServiceManagement = lazy(() => import('@/pages/AdminServiceManagement'));
const PaymentPage = lazy(() => import('@/pages/PaymentPage'));
const PaymentResult = lazy(() => import('@/pages/PaymentResult'));
const UserVerification = lazy(() => import('@/pages/UserVerification'));

// 모든 앱 라우트 정의
export const appRoutes: RouteConfig[] = [
  // 홈 페이지
  { path: '/', component: Home },
  
  // 서비스 관련 페이지
  { path: '/services/type/:type', component: Services },
  { path: '/services/:id', component: ServiceDetail },
  
  // 서비스 타입별 직접 경로 (추가)
  // 기본 URL
  { path: '/services/type/3d_printing', component: Services, props: { type: '3d_printing' } },
  { path: '/services/type/manufacturing', component: Services, props: { type: 'manufacturing' } },
  { path: '/services/type/engineer', component: Services, props: { type: 'engineer' } },
  // 영어 URL
  { path: '/en/services/type/3d_printing', component: Services, props: { type: '3d_printing' } },
  { path: '/en/services/type/manufacturing', component: Services, props: { type: 'manufacturing' } },
  { path: '/en/services/type/engineer', component: Services, props: { type: 'engineer' } },
  // 일본어 URL
  { path: '/jp/services/type/3d_printing', component: Services, props: { type: '3d_printing' } },
  { path: '/jp/services/type/manufacturing', component: Services, props: { type: 'manufacturing' } },
  { path: '/jp/services/type/engineer', component: Services, props: { type: 'engineer' } },
  
  // 리소스 관련 페이지
  { path: '/resources/type/:type', component: Resources },
  { path: '/resources', component: Resources },
  { path: '/resources/:id', component: ResourceDetail },
  
  // 리소스 타입별 직접 경로 (추가)
  // 기본 URL
  { path: '/resources/type/hardware_design', component: Resources, props: { type: 'hardware_design' } },
  { path: '/resources/type/software', component: Resources, props: { type: 'software' } },
  { path: '/resources/type/3d_model', component: Resources, props: { type: '3d_model' } },
  { path: '/resources/type/ai_model', component: Resources, props: { type: 'ai_model' } },
  { path: '/resources/type/free_content', component: Resources, props: { type: 'free_content' } },
  { path: '/resources/type/flash_game', component: Resources, props: { type: 'flash_game' } },
  // 영어 URL
  { path: '/en/resources/type/hardware_design', component: Resources, props: { type: 'hardware_design' } },
  { path: '/en/resources/type/software', component: Resources, props: { type: 'software' } },
  { path: '/en/resources/type/3d_model', component: Resources, props: { type: '3d_model' } },
  { path: '/en/resources/type/ai_model', component: Resources, props: { type: 'ai_model' } },
  { path: '/en/resources/type/free_content', component: Resources, props: { type: 'free_content' } },
  { path: '/en/resources/type/flash_game', component: Resources, props: { type: 'flash_game' } },
  // 일본어 URL
  { path: '/jp/resources/type/hardware_design', component: Resources, props: { type: 'hardware_design' } },
  { path: '/jp/resources/type/software', component: Resources, props: { type: 'software' } },
  { path: '/jp/resources/type/3d_model', component: Resources, props: { type: '3d_model' } },
  { path: '/jp/resources/type/ai_model', component: Resources, props: { type: 'ai_model' } },
  { path: '/jp/resources/type/free_content', component: Resources, props: { type: 'free_content' } },
  { path: '/jp/resources/type/flash_game', component: Resources, props: { type: 'flash_game' } },
  
  // 플래시 게임 페이지
  { path: '/flash-game', component: Resources, props: { type: 'flash_game' } },
  
  // 경매 관련 페이지
  { path: '/auctions', component: Auctions },
  { path: '/auctions/:id', component: AuctionDetail },
  
  // 서비스 등록 페이지
  { path: '/register-printer', component: RegisterServiceUnified, props: { defaultType: '3d_printing' } },
  { path: '/services/register', component: RegisterServiceUnified },
  { path: '/services/register/3d_printing', component: RegisterServiceUnified, props: { defaultType: '3d_printing' } },
  { path: '/services/register/:type', component: RegisterServiceUnified },
  { path: '/services/register-old', component: RegisterService },
  { path: '/services/register-old/:type', component: RegisterService },
  
  // 리소스 관리 페이지
  { path: '/resources/create', component: ResourceManagementPage },
  { path: '/resources/manage/:id', component: ResourceManagementPage },
  
  // 리소스 업로드 페이지
  { path: '/resources/upload', component: ResourceUploadPage },
  { path: '/resources/upload-v2', component: ResourceUploadPageV2 },
  { path: '/resources/upload-v1', component: UploadResource },
  
  // 기타 페이지
  { path: '/ai-assembly', component: AiAssembly },
  { path: '/remote-support', component: RemoteSupport },
  { path: '/engineers', component: Engineers },
  { path: '/sponsor', component: Sponsor },
  { path: '/about', component: About },
  
  // 인증 관련 페이지
  { path: '/auth', component: AuthPage },
  { path: '/login', component: AuthPage, props: { initialTab: 'login' } },
  { path: '/register', component: AuthPage, props: { initialTab: 'register' } },
  
  // 유저 인증 페이지
  { path: '/my/verification', component: UserVerification },
  
  // 결제 관련 페이지
  { path: '/payment/service/:id', component: PaymentPage },
  { path: '/payment/success', component: PaymentResult, props: { status: 'success' } },
  { path: '/payment/fail', component: PaymentResult, props: { status: 'fail' } },
  
  // 관리자 페이지
  { path: '/admin/dashboard', component: AdminDashboard },
  { path: '/admin/users', component: AdminUserManagement },
  { path: '/admin/resources', component: AdminResourceManagement },
  { path: '/admin/services', component: AdminServiceManagement },
  { path: '/admin/engineers', component: AdminServiceManagement },
  
  // Redirector 수정 - 현재는 직접 라우트 정의 방식 사용 중
];