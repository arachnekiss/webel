import React from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';

const Privacy: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <Helmet>
        <title>
          {language === 'ko' ? '개인정보 처리방침 - Webel' : 
           language === 'jp' ? 'プライバシーポリシー - Webel' : 
           'Privacy Policy - Webel'}
        </title>
      </Helmet>
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 border-gray-200 dark:border-gray-700">
            {language === 'ko' ? '개인정보 처리방침' : 
             language === 'jp' ? 'プライバシーポリシー' : 
             'Privacy Policy'}
          </h1>
          
          {/* 한국어 콘텐츠 */}
          {language === 'ko' && (
            <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">최종 수정 일자: 2025-05-06</p>
              <p>본 개인정보 처리방침은 Webel(이하 "회사")가 제공하는 서비스(웹사이트, 모바일 앱 및 기타 부가 서비스 포함, 이하 "서비스")에 적용됩니다. 회사는 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, GDPR(해당 시) 등 관련 법령을 준수하며, 이용자의 개인정보를 보호하기 위해 다음과 같이 처리방침을 공지합니다.</p>
              
              <h2>1. 수집하는 개인정보 항목 및 수집 방법</h2>
              
              <h3>1-1. 필수 수집 항목</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">구분</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">항목</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">수집 시점</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">회원 가입</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">이름, 이메일, 비밀번호(해시값)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">회원 가입 시</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">서비스 이용</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">접속‧로그 기록, 쿠키, 기기정보, IP</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">서비스 접속 시 자동 수집</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h3>1-2. 선택 수집 항목</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">구분</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">항목</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">수집 시점</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">프로필</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">프로필 사진, 소개글, SNS 링크</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">회원이 직접 입력 시</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">결제‧정산</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">결제 수단 정보(토큰화), 청구지 주소</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">유료 서비스 이용 시</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 my-4">
                <p className="text-yellow-700 dark:text-yellow-400 font-medium">TIP:</p>
                <p className="text-yellow-700 dark:text-yellow-400">Webel은 제작 의뢰·견적 기능을 제공하므로, 엔지니어/제조업체가 서비스 등록 시 사업자등록증 사본, 연락처 등이 추가로 수집될 수 있습니다.</p>
              </div>
              
              <h3>1-3. 수집 방법</h3>
              <ul>
                <li>회원가입·서비스 이용 과정에서 웹/앱 화면을 통한 입력</li>
                <li>자동 생성 정보 수집(로그 분석, 쿠키)</li>
                <li>외부 플랫폼 OAuth(Google/GitHub 등) 동의 기반 수집</li>
              </ul>
              
              <h2>2. 개인정보 이용 목적</h2>
              <ol>
                <li><strong>회원 관리</strong>: 회원 식별, CS 대응, 불량 이용자 제재</li>
                <li><strong>서비스 제공</strong>: 리소스 다운로드, 제작 의뢰 매칭, 결제 처리</li>
                <li><strong>맞춤형 추천</strong>: 이용 패턴 분석 및 AI 기반 콘텐츠 추천</li>
                <li><strong>통계‧분석</strong>: 서비스 개선 및 신규 기능 연구</li>
                <li><strong>법적 의무 준수</strong>: 전자상거래 기록 보관, 세무 신고 등</li>
              </ol>
              
              <h2>3. 개인정보 보유 및 이용 기간</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">분류</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">보유 기간</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">근거</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">회원 DB(계정 정보)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">탈퇴 후 30일(재가입 방지)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">정보통신망법</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">계약‧결제 기록</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">5년</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">전자상거래법</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">로그 기록(IP 등)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">3개월</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">통신비밀보호법</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">쿠키</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">브라우저 종료 시 또는 12개월</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">이용자 설정</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>탈퇴 요청 시 지체 없이 파기되며, 법령에 따로 보존 의무가 있는 정보는 해당 기간까지 분리 보관 후 즉시 파기합니다.</p>
              
              <h2>4. 개인정보 제3자 제공</h2>
              <p>회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래 경우에는 예외로 합니다.</p>
              <ul>
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령에 의거하거나 수사기관의 적법한 절차에 따른 요청이 있는 경우</li>
              </ul>
              <p>제공 내역 및 범위가 변경될 때에는 사전 동의를 다시 받습니다.</p>
              
              <h2>5. 개인정보 처리 위탁</h2>
              <p>회사는 원활한 서비스를 위해 최소한의 범위에서 아래 업체에 업무를 위탁합니다.</p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">수탁업체</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">위탁 업무</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">보유·이용 기간</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Supabase Inc.</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">데이터베이스·인증 인프라 제공</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">위탁 계약 종료 시</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Stripe Payments</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">결제 처리 및 요금 청구</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">위탁 계약 종료 시</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Microsoft Azure</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">서버 호스팅, 로그 관리</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">위탁 계약 종료 시</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>위탁 계약 체결 시 개인정보 보호 관련 법규 준수를 의무화하며, 수탁사 변경 시 웹사이트 공지 및 본 방침을 업데이트합니다.</p>
              
              <h2>6. 국외 이전</h2>
              <p>회사 서버가 일부 해외 리전에 위치할 수 있으며, 이용자 국적·거주지와 무관하게 서비스 이용에 따른 데이터가 해당 국가로 이전될 수 있습니다. 회사는 GDPR Art. 46 Standard Contractual Clauses(SCC) 등 적정 보호조치를 적용합니다.</p>
              
              <h2>7. 이용자의 권리와 행사 방법</h2>
              <ol>
                <li><strong>열람·정정·삭제</strong>: '설정 → 개인정보' 메뉴를 통해 직접 처리하거나 <a href="mailto:arachnekiss@hotmail.com" className="text-blue-600 dark:text-blue-400">arachnekiss@hotmail.com</a>으로 요청</li>
                <li><strong>처리 정지 요구</strong>: 법령상 예외 사유가 없는 한 지체 없이 조치</li>
                <li><strong>동의 철회</strong>: 마케팅 수신 거부, 계정 탈퇴를 통해 언제든 철회 가능</li>
                <li><strong>대리인 권리 행사</strong>: 법정대리인 또는 위임을 받은 자는 위임장 제출로 권리 행사 가능</li>
              </ol>
              
              <h2>8. 개인정보 파기 절차 및 방법</h2>
              <ul>
                <li><strong>절차</strong>: 목적 달성 시 즉시 파기 → 법정 보관 기간 필요 시 별도 DB로 이동 후 보관 → 기한 만료 시 자동 파기</li>
                <li>
                  <strong>방법</strong>:
                  <ul>
                    <li>전자 파일 – DB <code>DELETE</code>, 논리적 덮어쓰기, 암호화 키 폐기</li>
                    <li>출력물 – 분쇄 또는 소각</li>
                  </ul>
                </li>
              </ul>
              
              <h2>9. 쿠키 등 자동 수집 장치</h2>
              <ul>
                <li><strong>목적</strong>: 로그인 유지, 이용 패턴 분석, 맞춤형 추천</li>
                <li><strong>설정 거부</strong>: 브라우저 설정에서 &apos;쿠키 차단&apos; 선택 가능 (단, 일부 기능이 제한될 수 있음)</li>
              </ul>
              
              <h2>10. 개인정보 보호책임자</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">구분</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">담당</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">연락처</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">개인정보 보호책임자</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><strong>허무</strong></td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <a href="mailto:arachnekiss@hotmail.com" className="text-blue-600 dark:text-blue-400">arachnekiss@hotmail.com</a>, +82-10-5963-5648
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">개인정보 보호담당부서</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Trust & Safety Team</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">+82-10-5963-5648</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>이용자는 개인정보 관련 문의를 위 연락처로 전달할 수 있으며, 회사는 지체 없이 답변·조치합니다.</p>
              
              <h2>11. 권익침해 구제 방법</h2>
              <ul>
                <li>개인정보분쟁조정위원회 (☎ 1833-6972 / <a href="http://www.kopico.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400">www.kopico.go.kr</a>)</li>
                <li>개인정보침해신고센터 (☎ 118 / privacy.kisa.or.kr)</li>
                <li>대검찰청 사이버범죄수사과 (☎ 1301 / spo.go.kr)</li>
                <li>경찰청 사이버수사국 (☎ 182 / ecrm.cyber.go.kr)</li>
              </ul>
              
              <h2>12. 고지의 의무</h2>
              <p>본 방침이 법령·서비스 변경 등으로 수정될 경우, 최소 7일 전 '공지사항' 및 앱 알림으로 고지합니다. 중요 변경(수집 항목·목적·보유 기간 등)의 경우 시행 30일 전에 별도 동의 절차를 진행합니다.</p>
              
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300">Webel은 이용자의 개인정보를 무엇보다 소중히 여기며, 안전하게 보호할 것을 약속드립니다.</p>
              </div>
            </div>
          )}
          
          {/* 일본어 콘텐츠 */}
          {language === 'jp' && (
            <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">最終更新日: 2025-05-06</p>
              
              <p>このプライバシーポリシーは、Webel（以下「当社」）が提供するサービス（ウェブサイト、モバイルアプリおよびその他の付加サービスを含む、以下「本サービス」）に適用されます。当社は、「個人情報保護法」、「情報通信網の利用促進および情報保護に関する法律」、GDPR（該当する場合）などの関連法令を遵守し、利用者の個人情報を保護するために、以下の処理方針を公表します。</p>
              
              <h2>1. 収集する個人情報の項目および収集方法</h2>
              
              <h3>1-1. 必須収集項目</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">区分</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">項目</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">収集時点</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">会員登録</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">名前、メール、パスワード（ハッシュ値）</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">会員登録時</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">サービス利用</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">接続・ログ記録、Cookie、デバイス情報、IP</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">サービス接続時に自動収集</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h3>1-2. 選択収集項目</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">区分</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">項目</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">収集時点</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">プロフィール</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">プロフィール写真、自己紹介、SNSリンク</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">会員が直接入力時</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">決済・精算</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">決済手段情報（トークン化）、請求先住所</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">有料サービス利用時</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 my-4">
                <p className="text-yellow-700 dark:text-yellow-400 font-medium">ヒント:</p>
                <p className="text-yellow-700 dark:text-yellow-400">Webelは製作依頼・見積もり機能を提供しているため、エンジニア/製造業者がサービス登録時に事業者登録証のコピー、連絡先などが追加で収集される場合があります。</p>
              </div>
              
              <h3>1-3. 収集方法</h3>
              <ul>
                <li>会員登録・サービス利用過程でのウェブ/アプリ画面を通じた入力</li>
                <li>自動生成情報の収集（ログ分析、Cookie）</li>
                <li>外部プラットフォームOAuth（Google/GitHubなど）の同意に基づく収集</li>
              </ul>
              
              {/* 残りの部分は同様に日本語で実装... */}
              <h2>2. 個人情報の利用目的</h2>
              <ol>
                <li><strong>会員管理</strong>: 会員識別、CS対応、不正利用者の制裁</li>
                <li><strong>サービス提供</strong>: リソースのダウンロード、製作依頼マッチング、決済処理</li>
                <li><strong>カスタマイズされた推奨</strong>: 利用パターン分析およびAIベースのコンテンツ推奨</li>
                <li><strong>統計・分析</strong>: サービス改善および新機能研究</li>
                <li><strong>法的義務の遵守</strong>: 電子商取引記録の保管、税務申告など</li>
              </ol>
              
              {/* 他のセクションも同様に日本語で実装... */}
              
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300">Webelはユーザーの個人情報を何よりも大切にし、安全に保護することをお約束します。</p>
              </div>
            </div>
          )}
          
          {/* 영어 콘텐츠 */}
          {language !== 'ko' && language !== 'jp' && (
            <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Last Updated: May 6, 2025</p>
              
              <p>This Privacy Policy applies to the services (including website, mobile app, and other additional services, hereinafter "Services") provided by Webel (hereinafter "Company"). The Company complies with relevant laws and regulations, including the "Personal Information Protection Act," the "Act on Promotion of Information and Communications Network Utilization and Information Protection," and the GDPR (where applicable), and announces the following processing policy to protect users' personal information.</p>
              
              <h2>1. Personal Information Items Collected and Collection Methods</h2>
              
              <h3>1-1. Required Collection Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Items</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Collection Point</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Membership</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Name, Email, Password (hash value)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Upon registration</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Service Use</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Access/log records, cookies, device info, IP</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Automatically collected during service access</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h3>1-2. Optional Collection Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Items</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Collection Point</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Profile</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Profile picture, bio, SNS links</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">When directly entered by user</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Payment & Settlement</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Payment method info (tokenized), billing address</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">When using paid services</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 my-4">
                <p className="text-yellow-700 dark:text-yellow-400 font-medium">TIP:</p>
                <p className="text-yellow-700 dark:text-yellow-400">Webel provides manufacturing request and quotation functions, so engineers/manufacturers may additionally provide business registration copies, contact information, etc. when registering services.</p>
              </div>
              
              <h3>1-3. Collection Methods</h3>
              <ul>
                <li>Input through web/app screens during membership registration and service use</li>
                <li>Automatic generation information collection (log analysis, cookies)</li>
                <li>Collection based on external platform OAuth (Google/GitHub, etc.) consent</li>
              </ul>
              
              {/* 나머지 섹션도 영어로 구현... */}
              <h2>2. Purpose of Using Personal Information</h2>
              <ol>
                <li><strong>Member Management</strong>: Member identification, CS response, sanctioning improper users</li>
                <li><strong>Service Provision</strong>: Resource downloads, manufacturing request matching, payment processing</li>
                <li><strong>Customized Recommendations</strong>: Usage pattern analysis and AI-based content recommendations</li>
                <li><strong>Statistics & Analysis</strong>: Service improvement and new feature research</li>
                <li><strong>Legal Compliance</strong>: E-commerce record keeping, tax reporting, etc.</li>
              </ol>
              
              {/* 다른 섹션도 영어로 구현... */}
              
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300">Webel values your personal information above all else and promises to protect it safely.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Privacy;