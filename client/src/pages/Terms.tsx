import React from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';

const Terms: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <Helmet>
        <title>
          {language === 'ko' ? '이용약관 - Webel' : 
           language === 'jp' ? '利用規約 - Webel' : 
           'Terms of Service - Webel'}
        </title>
      </Helmet>
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8 mb-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 border-gray-200 dark:border-gray-700">
            {language === 'ko' ? '이용약관' : 
             language === 'jp' ? '利用規約' : 
             'Terms of Service'}
          </h1>
          
          <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
            {language === 'ko' ? (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">최종 수정 일자: 2025-05-06</p>
                
                <h2>1. 서비스 이용 약관의 목적 및 효력</h2>
                <p>이 약관은 Webel(이하 "회사")이 제공하는 온라인 플랫폼 및 관련 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임 사항을 규정합니다. 이 약관에 동의하고 서비스에 가입함으로써 약관의 효력이 발생합니다.</p>
                
                <h2>2. 서비스 이용 계약의 성립</h2>
                <p>서비스 이용 계약은 이용자가 본 약관에 동의하고 회사가 제공하는 회원가입 양식에 필요한 정보를 입력한 후, 회사가 이를 승인함으로써 성립됩니다. 회사는 관련 법령에 따라 이용 신청을 승인하지 않거나, 제한할 수 있습니다.</p>
                
                <h2>3. 서비스 이용 및 제한</h2>
                <p>이용자는 본 약관과 관련 법령을 준수하는 범위 내에서 서비스를 이용할 수 있습니다. 회사는 다음과 같은 경우 서비스 이용을 제한할 수 있습니다:</p>
                <ul>
                  <li>타인의 개인정보, 계정을 도용하거나 부정하게 사용하는 행위</li>
                  <li>회사의 서비스를 이용하여 법령 또는 이 약관이 금지하는 행위를 하는 경우</li>
                  <li>공공질서나 미풍양속에 위배되는 내용을 게시하거나 전송하는 행위</li>
                  <li>회사의 운영을 고의로 방해하는 행위</li>
                  <li>기타 관련 법령에 위배되는 행위</li>
                </ul>
                
                <h2>4. 콘텐츠 이용 및 지적재산권</h2>
                <p>이용자가 서비스에 게시하는 콘텐츠에 대한 저작권 및 기타 지적재산권은 해당 이용자에게 귀속됩니다. 다만, 회사는 서비스 운영, 개선 및 홍보 등을 위해 이용자가 작성한 콘텐츠를 무상으로 사용할 수 있는 권리를 가집니다. 이용자는 타인의 지적재산권을 침해하지 않는 범위 내에서 콘텐츠를 게시해야 합니다.</p>
                
                <h2>5. 서비스 변경 및 중단</h2>
                <p>회사는 운영상, 기술상의 필요에 따라 제공하는 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다. 서비스의 내용, 이용방법, 이용시간에 대하여 변경 또는 중단이 있는 경우에는 변경 또는 중단될 서비스의 내용 및 사유와 일자 등을 포함하여 서비스 내에 공지합니다.</p>
                
                <h2>6. 계약 해지 및 이용 제한</h2>
                <p>이용자는 언제든지 회사에 해지 의사를 통지함으로써 이용계약을 해지할 수 있습니다. 회사는 이용자가 본 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우, 서비스 이용을 제한하거나 계약을 해지할 수 있습니다. 이용계약이 해지된 경우, 회사는 관련 법령 및 개인정보처리방침에 따라 이용자의 정보를 처리합니다.</p>
                
                <h2>7. 책임 제한</h2>
                <p>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지, 기타 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임을 지지 않습니다. 또한, 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</p>
                
                <h2>8. 준거법 및 관할</h2>
                <p>본 약관은 대한민국 법률에 따라 규율되며, 서비스 이용과 관련하여 회사와 이용자 간에 발생한 분쟁에 대해서는 민사소송법상의 관할법원에 소를 제기할 수 있습니다.</p>
                
                <h2>9. 기타</h2>
                <p>본 약관에 명시되지 않은 사항은 관련 법령 및 회사가 정한 서비스의 세부 이용 지침 등의 규정에 따릅니다.</p>
              </>
            ) : language === 'jp' ? (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">最終更新日: 2025-05-06</p>
                
                <h2>1. 利用規約の目的と効力</h2>
                <p>本規約は、Webel（以下「当社」）が提供するオンラインプラットフォームおよび関連サービス（以下「本サービス」）の利用に関して、当社とユーザー間の権利、義務、責任事項を定めるものです。本規約に同意し、サービスに登録することにより、本規約の効力が発生します。</p>
                
                <h2>2. サービス利用契約の成立</h2>
                <p>サービス利用契約は、ユーザーが本規約に同意し、当社が提供する会員登録フォームに必要な情報を入力した後、当社がこれを承認することによって成立します。当社は関連法令に基づき、利用申請を承認しない、または制限することがあります。</p>
                
                <h2>3. サービスの利用と制限</h2>
                <p>ユーザーは本規約および関連法令を遵守する範囲内でサービスを利用できます。当社は以下の場合、サービスの利用を制限することがあります：</p>
                <ul>
                  <li>他人の個人情報、アカウントを不正に使用する行為</li>
                  <li>当社のサービスを利用して法令または本規約が禁止する行為を行う場合</li>
                  <li>公序良俗に反するコンテンツを投稿または送信する行為</li>
                  <li>当社の運営を意図的に妨害する行為</li>
                  <li>その他関連法令に違反する行為</li>
                </ul>
                
                <h2>4. コンテンツの利用と知的財産権</h2>
                <p>ユーザーがサービスに投稿するコンテンツの著作権およびその他の知的財産権は、当該ユーザーに帰属します。ただし、当社はサービスの運営、改善、宣伝などのためにユーザーが作成したコンテンツを無償で使用する権利を有します。ユーザーは他人の知的財産権を侵害しない範囲内でコンテンツを投稿する必要があります。</p>
                
                <h2>5. サービスの変更および中断</h2>
                <p>当社は運営上、技術上の必要に応じて提供するサービスの全部または一部を変更または中断することがあります。サービスの内容、利用方法、利用時間について変更または中断がある場合は、変更または中断されるサービスの内容、理由、日付などを含めてサービス内にお知らせします。</p>
                
                <h2>6. 契約解除および利用制限</h2>
                <p>ユーザーはいつでも当社に解約の意思を通知することにより、利用契約を解除することができます。当社はユーザーが本規約に違反したり、サービスの正常な運営を妨害した場合、サービスの利用を制限したり、契約を解除することがあります。利用契約が解除された場合、当社は関連法令および個人情報保護方針に従ってユーザーの情報を処理します。</p>
                
                <h2>7. 責任制限</h2>
                <p>当社は天災地変、戦争、電気通信事業者のサービス停止、その他これに準ずる不可抗力によりサービスを提供できない場合、サービス提供に関する責任を負いません。また、ユーザーの責任によるサービス利用の障害については責任を負いません。</p>
                
                <h2>8. 準拠法および管轄</h2>
                <p>本規約は日本国法に準拠し、サービス利用に関して当社とユーザー間に発生した紛争については、民事訴訟法上の管轄裁判所に訴えを提起することができます。</p>
                
                <h2>9. その他</h2>
                <p>本規約に明示されていない事項については、関連法令および当社が定めるサービスの詳細な利用ガイドラインなどの規定に従います。</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Last Updated: May 6, 2025</p>
                
                <h2>1. Purpose and Effect of Terms of Service</h2>
                <p>These Terms govern the use of the online platform and related services (the "Service") provided by Webel (the "Company") and establish the rights, obligations, and responsibilities between the Company and users. By agreeing to these Terms and registering for the Service, these Terms become effective.</p>
                
                <h2>2. Formation of Service Agreement</h2>
                <p>The Service agreement is formed when a user agrees to these Terms, enters the required information in the registration form provided by the Company, and the Company approves the registration. The Company may decline or restrict registration applications in accordance with relevant laws and regulations.</p>
                
                <h2>3. Service Use and Restrictions</h2>
                <p>Users may use the Service within the scope of compliance with these Terms and relevant laws. The Company may restrict the use of the Service in the following cases:</p>
                <ul>
                  <li>Impersonating others or misusing personal information or accounts</li>
                  <li>Using the Service to engage in activities prohibited by law or these Terms</li>
                  <li>Posting or transmitting content that violates public order or morals</li>
                  <li>Deliberately interfering with the Company's operations</li>
                  <li>Other activities that violate relevant laws and regulations</li>
                </ul>
                
                <h2>4. Content Usage and Intellectual Property Rights</h2>
                <p>Copyright and other intellectual property rights for content posted by users on the Service belong to the respective users. However, the Company reserves the right to use content created by users free of charge for the purposes of operating, improving, and promoting the Service. Users must post content within the scope that does not infringe upon the intellectual property rights of others.</p>
                
                <h2>5. Service Changes and Discontinuation</h2>
                <p>The Company may change or discontinue all or part of the Service according to operational or technical needs. In case of any changes or discontinuation of the Service content, usage method, or usage time, the Company will notify users through the Service, including details of the changes or discontinuation, reasons, and dates.</p>
                
                <h2>6. Termination of Agreement and Usage Restrictions</h2>
                <p>Users may terminate the Service agreement at any time by notifying the Company of their intention to terminate. The Company may restrict the use of the Service or terminate the agreement if a user violates these Terms or disrupts the normal operation of the Service. Upon termination of the agreement, the Company will process user information in accordance with relevant laws and the Privacy Policy.</p>
                
                <h2>7. Limitation of Liability</h2>
                <p>The Company shall not be liable for any inability to provide the Service due to force majeure events such as natural disasters, war, suspension of telecommunication service providers, or other similar circumstances beyond its control. Additionally, the Company shall not be liable for any Service disruptions caused by the user's own actions.</p>
                
                <h2>8. Governing Law and Jurisdiction</h2>
                <p>These Terms shall be governed by the laws of the Republic of Korea, and any disputes arising between the Company and users in relation to the Service may be filed in the competent courts in accordance with the Civil Procedure Act.</p>
                
                <h2>9. Miscellaneous</h2>
                <p>Matters not specified in these Terms shall be governed by relevant laws and regulations and the detailed guidelines for using the Service as established by the Company.</p>
              </>
            )}
            
            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {language === 'ko' ? 
                  '본 이용약관에 대해 문의사항이 있으시면 연락주세요:' : 
                  language === 'jp' ? 
                  '本利用規約に関するお問い合わせは以下までご連絡ください:' : 
                  'If you have any questions about these Terms, please contact us:'}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-sm">arachnekiss@hotmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;