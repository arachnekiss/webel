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
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">최종 수정일: 2025-05-06</p>
                
                <p>본 약관은 오픈 제작 플랫폼 Webel(이하 "회사")이 제공하는 모든 서비스(웹사이트, 모바일 앱 등 포함, 이하 "서비스")의 이용 조건 및 절차, 이용자와 회사의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
                
                <h2>제1조 (목적)</h2>
                <p>이 약관은 회사가 제공하는 서비스 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
                
                <h2>제2조 (정의)</h2>
                <ol>
                  <li>"서비스"란 회사가 Webel 브랜드로 제공하는 웹사이트, 모바일 앱 및 관련 제반 서비스를 의미합니다.</li>
                  <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 모든 개인 및 법인을 말합니다.</li>
                  <li>"회원"이란 회사와 서비스 이용 계약을 체결하고 계정을 부여받은 자를 말합니다.</li>
                  <li>"리소스"란 Webel 플랫폼을 통해 업로드, 제공되는 모든 디지털 자료(하드웨어 설계도, 오픈소스, AI모델 등)를 의미합니다.</li>
                </ol>
                
                <h2>제3조 (약관의 효력 및 변경)</h2>
                <ol>
                  <li>이 약관은 회사가 서비스를 통해 공지하거나, 이용자가 동의함으로써 효력이 발생합니다.</li>
                  <li>회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경된 약관은 사전 공지 후 효력을 가집니다.</li>
                  <li>이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
                </ol>
                
                <h2>제4조 (회원 가입 및 관리)</h2>
                <ol>
                  <li>회원 가입은 이용자가 약관에 동의하고, 회사가 요구하는 정보를 정확하게 입력하여 신청함으로써 성립합니다.</li>
                  <li>회사는 다음 각 호에 해당하는 경우 회원 가입을 거부하거나 사후에 이용 계약을 해지할 수 있습니다.
                    <ul>
                      <li>타인의 정보를 도용한 경우</li>
                      <li>허위 정보를 기재한 경우</li>
                      <li>기타 부정한 용도 또는 목적을 가진 경우</li>
                    </ul>
                  </li>
                  <li>회원은 등록된 정보를 항상 최신 상태로 유지할 책임이 있으며, 정보 불일치로 인한 불이익은 회사가 책임지지 않습니다.</li>
                </ol>
                
                <h2>제5조 (회원의 의무)</h2>
                <ol>
                  <li>이용자는 관계 법령, 약관, 회사의 정책 및 공지사항을 준수해야 합니다.</li>
                  <li>이용자는 다음 각 호의 행위를 하여서는 안 됩니다:
                    <ul>
                      <li>타인의 정보 도용, 허위 정보 등록</li>
                      <li>회사 및 제3자의 지적재산권 침해</li>
                      <li>서비스 운영을 방해하거나 회사에 손해를 입히는 행위</li>
                      <li>유해한 코드·스팸 전송, 무단 크롤링 등 부정한 기술적 접근</li>
                    </ul>
                  </li>
                </ol>
                
                <h2>제6조 (서비스 이용)</h2>
                <ol>
                  <li>회사는 이용자에게 다양한 오픈 리소스 열람, 다운로드, 제작 의뢰, 엔지니어/제조업체 매칭 등의 서비스를 제공합니다.</li>
                  <li>회사는 서비스의 품질 향상과 안정성 확보를 위해 사전 고지 없이 일부 서비스를 변경하거나 종료할 수 있습니다.</li>
                  <li>회사는 연중무휴 24시간 서비스를 제공하나, 시스템 점검·고장·천재지변 등 불가피한 사유로 일시 중단될 수 있습니다.</li>
                </ol>
                
                <h2>제7조 (지적재산권)</h2>
                <ol>
                  <li>서비스 내 콘텐츠(텍스트, 이미지, 코드 등)에 대한 저작권은 해당 게시자에게 있으며, 회사는 서비스 제공 목적 내에서 이를 사용할 수 있습니다.</li>
                  <li>이용자는 회사의 사전 동의 없이 서비스에 포함된 자료를 복제, 수정, 배포할 수 없습니다.</li>
                  <li>이용자가 직접 업로드한 콘텐츠에 대해 타인의 저작권을 침해하지 않도록 책임져야 하며, 분쟁 발생 시 이용자 본인이 책임을 집니다.</li>
                </ol>
                
                <h2>제8조 (계약 해지 및 서비스 탈퇴)</h2>
                <ol>
                  <li>회원은 언제든지 서비스 내 설정 메뉴 또는 이메일 요청(<a href="mailto:arachnekiss@hotmail.com" className="text-blue-600 dark:text-blue-400">arachnekiss@hotmail.com</a>)을 통해 이용 계약을 해지할 수 있습니다.</li>
                  <li>회사는 다음과 같은 사유 발생 시 사전 통보 없이 계정을 해지할 수 있습니다:
                    <ul>
                      <li>약관 위반 행위 반복 또는 중대한 위반</li>
                      <li>불법적 또는 유해한 콘텐츠 게시</li>
                      <li>장기간 비활성 상태(1년 이상 로그인 없음)</li>
                    </ul>
                  </li>
                </ol>
                
                <h2>제9조 (면책조항)</h2>
                <ol>
                  <li>회사는 천재지변, 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
                  <li>이용자의 귀책사유로 인한 서비스 이용 장애에 대해서는 책임지지 않습니다.</li>
                  <li>회사는 이용자가 서비스 내에서 게시한 자료의 정확성, 신뢰성에 대해 보증하지 않습니다.</li>
                </ol>
                
                <h2>제10조 (분쟁 해결)</h2>
                <ol>
                  <li>본 약관 및 서비스 이용과 관련하여 회사와 이용자 간에 발생한 분쟁은 상호 협의하여 원만히 해결하도록 노력합니다.</li>
                  <li>협의가 이루어지지 않을 경우 대한민국 민사소송법에 따라 관할 법원은 서울중앙지방법원으로 합니다.</li>
                </ol>
                
                <div className="mt-8 pt-4 text-center italic text-gray-600 dark:text-gray-400">
                  <p>Webel은 누구나 만들 수 있는 세상을 위해, 항상 신뢰받는 플랫폼이 되도록 노력하겠습니다.</p>
                </div>
              </>
            ) : language === 'jp' ? (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">最終更新日: 2025-05-06</p>
                
                <p>本規約は、オープン製作プラットフォームWebel（以下「当社」）が提供するすべてのサービス（ウェブサイト、モバイルアプリなどを含む、以下「本サービス」）の利用条件および手順、利用者と当社の権利、義務および責任事項、その他必要な事項を規定することを目的とします。</p>
                
                <h2>第1条（目的）</h2>
                <p>本規約は、当社が提供するサービスの利用に関して、当社と利用者間の権利、義務および責任事項、その他必要な事項を規定することを目的とします。</p>
                
                <h2>第2条（定義）</h2>
                <ol>
                  <li>「サービス」とは、当社がWebelブランドで提供するウェブサイト、モバイルアプリおよび関連するすべてのサービスを意味します。</li>
                  <li>「利用者」とは、本規約に従って当社が提供するサービスを利用するすべての個人および法人を言います。</li>
                  <li>「会員」とは、当社とサービス利用契約を締結し、アカウントが付与された者を言います。</li>
                  <li>「リソース」とは、Webelプラットフォームを通じてアップロード、提供されるすべてのデジタル資料（ハードウェア設計図、オープンソース、AIモデルなど）を意味します。</li>
                </ol>
                
                <h2>第3条（規約の効力および変更）</h2>
                <ol>
                  <li>本規約は、当社がサービスを通じて公示するか、利用者が同意することにより効力が発生します。</li>
                  <li>当社は関連法令に違反しない範囲内で規約を変更することができ、変更された規約は事前通知後に効力を持ちます。</li>
                  <li>利用者は変更された規約に同意しない場合、サービスの利用を中断し退会することができます。</li>
                </ol>
                
                <h2>第4条（会員登録および管理）</h2>
                <ol>
                  <li>会員登録は、利用者が規約に同意し、当社が要求する情報を正確に入力して申請することにより成立します。</li>
                  <li>当社は以下の各号に該当する場合、会員登録を拒否したり、事後に利用契約を解除したりすることができます：
                    <ul>
                      <li>他人の情報を不正に使用した場合</li>
                      <li>虚偽情報を記載した場合</li>
                      <li>その他不正な用途または目的を持つ場合</li>
                    </ul>
                  </li>
                  <li>会員は登録された情報を常に最新の状態に維持する責任があり、情報の不一致による不利益については当社が責任を負いません。</li>
                </ol>
                
                <h2>第5条（会員の義務）</h2>
                <ol>
                  <li>利用者は関係法令、規約、当社のポリシーおよび公知事項を遵守しなければなりません。</li>
                  <li>利用者は以下の各号の行為をしてはなりません：
                    <ul>
                      <li>他人の情報の不正使用、虚偽情報の登録</li>
                      <li>当社および第三者の知的財産権侵害</li>
                      <li>サービスの運営を妨害したり、当社に損害を与える行為</li>
                      <li>有害なコード・スパムの送信、無断クローリングなどの不正な技術的アクセス</li>
                    </ul>
                  </li>
                </ol>
                
                <h2>第6条（サービス利用）</h2>
                <ol>
                  <li>当社は利用者に様々なオープンリソースの閲覧、ダウンロード、制作依頼、エンジニア/製造業者マッチングなどのサービスを提供します。</li>
                  <li>当社はサービスの品質向上と安定性確保のために事前告知なく一部のサービスを変更または終了することがあります。</li>
                  <li>当社は年中無休24時間サービスを提供しますが、システム点検・故障・天災地変など不可避の事由により一時的に中断されることがあります。</li>
                </ol>
                
                <h2>第7条（知的財産権）</h2>
                <ol>
                  <li>サービス内のコンテンツ（テキスト、画像、コードなど）に対する著作権は該当投稿者に帰属し、当社はサービス提供目的の範囲内でこれを使用することができます。</li>
                  <li>利用者は当社の事前同意なくサービスに含まれる資料を複製、修正、配布することはできません。</li>
                  <li>利用者が直接アップロードしたコンテンツについて他人の著作権を侵害しないよう責任を負い、紛争発生時には利用者本人が責任を負います。</li>
                </ol>
                
                <h2>第8条（契約解除およびサービス退会）</h2>
                <ol>
                  <li>会員はいつでもサービス内の設定メニューまたはEメールリクエスト（<a href="mailto:arachnekiss@hotmail.com" className="text-blue-600 dark:text-blue-400">arachnekiss@hotmail.com</a>）を通じて利用契約を解除することができます。</li>
                  <li>当社は以下のような事由が発生した場合、事前通報なくアカウントを解除することができます：
                    <ul>
                      <li>規約違反行為の繰り返しまたは重大な違反</li>
                      <li>違法または有害なコンテンツの投稿</li>
                      <li>長期間の非アクティブ状態（1年以上ログインなし）</li>
                    </ul>
                  </li>
                </ol>
                
                <h2>第9条（免責条項）</h2>
                <ol>
                  <li>当社は天災地変、不可抗力的事由によるサービス中断について責任を負いません。</li>
                  <li>利用者の帰責事由によるサービス利用障害については責任を負いません。</li>
                  <li>当社は利用者がサービス内で投稿した資料の正確性、信頼性について保証しません。</li>
                </ol>
                
                <h2>第10条（紛争解決）</h2>
                <ol>
                  <li>本規約およびサービス利用に関して当社と利用者間に発生した紛争は相互協議して円満に解決するよう努力します。</li>
                  <li>協議が行われない場合、韓国民事訴訟法に従い管轄裁判所はソウル中央地方裁判所とします。</li>
                </ol>
                
                <div className="mt-8 pt-4 text-center italic text-gray-600 dark:text-gray-400">
                  <p>Webelは誰もが作れる世界のために、常に信頼されるプラットフォームになるよう努力します。</p>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Last Updated: May 6, 2025</p>
                
                <p>These Terms govern the use of Webel's open manufacturing platform (hereinafter "Company") and all services provided (including website, mobile apps, etc., hereinafter "Service"), establishing the conditions, procedures, rights, obligations, and responsibilities between users and the Company.</p>
                
                <h2>Article 1 (Purpose)</h2>
                <p>These Terms aim to establish the rights, obligations, responsibilities, and other necessary matters between the Company and users regarding the use of services provided by the Company.</p>
                
                <h2>Article 2 (Definitions)</h2>
                <ol>
                  <li>"Service" refers to the website, mobile application, and all related services provided by the Company under the Webel brand.</li>
                  <li>"User" refers to all individuals and legal entities who use the services provided by the Company in accordance with these Terms.</li>
                  <li>"Member" refers to a person who has entered into a service agreement with the Company and has been granted an account.</li>
                  <li>"Resource" refers to all digital materials (hardware designs, open source, AI models, etc.) uploaded and provided through the Webel platform.</li>
                </ol>
                
                <h2>Article 3 (Effect and Modification of Terms)</h2>
                <ol>
                  <li>These Terms take effect when announced by the Company through the Service or when the user agrees to them.</li>
                  <li>The Company may modify these Terms within the scope that does not violate relevant laws, and the modified Terms will take effect after prior notice.</li>
                  <li>If a user does not agree to the modified Terms, they may discontinue use of the Service and withdraw their membership.</li>
                </ol>
                
                <h2>Article 4 (Membership Registration and Management)</h2>
                <ol>
                  <li>Membership registration is established when a user agrees to these Terms and accurately submits the information required by the Company.</li>
                  <li>The Company may refuse membership registration or terminate the service agreement subsequently in the following cases:
                    <ul>
                      <li>When a person's information is misappropriated</li>
                      <li>When false information is provided</li>
                      <li>When there is any other improper purpose or intent</li>
                    </ul>
                  </li>
                  <li>Members are responsible for keeping their registered information up to date, and the Company is not responsible for any disadvantages resulting from information discrepancies.</li>
                </ol>
                
                <h2>Article 5 (User Obligations)</h2>
                <ol>
                  <li>Users must comply with relevant laws, these Terms, Company policies, and notices.</li>
                  <li>Users shall not engage in the following activities:
                    <ul>
                      <li>Misappropriating others' information or registering false information</li>
                      <li>Infringing on the intellectual property rights of the Company or third parties</li>
                      <li>Interfering with service operations or causing damage to the Company</li>
                      <li>Transmitting harmful code, spam, unauthorized crawling, or other improper technical access</li>
                    </ul>
                  </li>
                </ol>
                
                <h2>Article 6 (Service Use)</h2>
                <ol>
                  <li>The Company provides users with various services including access to open resources, downloads, production requests, and engineer/manufacturer matching.</li>
                  <li>The Company may modify or terminate certain services without prior notice to improve quality and ensure stability.</li>
                  <li>The Company provides 24/7 service year-round, but service may be temporarily suspended due to unavoidable reasons such as system maintenance, failures, or natural disasters.</li>
                </ol>
                
                <h2>Article 7 (Intellectual Property Rights)</h2>
                <ol>
                  <li>Copyrights and other intellectual property rights for content (text, images, code, etc.) within the Service belong to the respective posters, and the Company may use them within the purpose of providing the Service.</li>
                  <li>Users may not reproduce, modify, or distribute materials included in the Service without the prior consent of the Company.</li>
                  <li>Users are responsible for ensuring that content they directly upload does not infringe on others' copyrights, and in the event of a dispute, the user themselves will bear responsibility.</li>
                </ol>
                
                <h2>Article 8 (Termination of Agreement and Service Withdrawal)</h2>
                <ol>
                  <li>Members may terminate the service agreement at any time through the settings menu in the Service or by email request (<a href="mailto:arachnekiss@hotmail.com" className="text-blue-600 dark:text-blue-400">arachnekiss@hotmail.com</a>).</li>
                  <li>The Company may terminate an account without prior notice for the following reasons:
                    <ul>
                      <li>Repeated or serious violations of these Terms</li>
                      <li>Posting illegal or harmful content</li>
                      <li>Long-term inactive status (no login for more than 1 year)</li>
                    </ul>
                  </li>
                </ol>
                
                <h2>Article 9 (Disclaimer)</h2>
                <ol>
                  <li>The Company is not responsible for service interruptions due to natural disasters or force majeure.</li>
                  <li>The Company is not responsible for service disruptions caused by the user's own actions.</li>
                  <li>The Company does not guarantee the accuracy or reliability of materials posted by users within the Service.</li>
                </ol>
                
                <h2>Article 10 (Dispute Resolution)</h2>
                <ol>
                  <li>Disputes arising between the Company and users regarding these Terms and Service use shall be resolved amicably through mutual consultation.</li>
                  <li>If consultation is not reached, the Seoul Central District Court shall have jurisdiction in accordance with the Civil Procedure Act of the Republic of Korea.</li>
                </ol>
                
                <div className="mt-8 pt-4 text-center italic text-gray-600 dark:text-gray-400">
                  <p>Webel strives to be a trusted platform for a world where anyone can create.</p>
                </div>
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