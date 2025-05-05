const fs = require('fs');
const path = require('path');

// ResourceUploadPage.tsx 파일 읽기
const filePath = path.join(process.cwd(), 'client/src/pages/ResourceUploadPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 모든 미디어 버튼 그룹을 renderMediaButtons 함수 호출로 대체
// 정규식 패턴: 미디어 버튼 그룹을 찾아서 필드 이름을 추출하고 렌더링 함수로 대체
const buttonGroupPattern = /<div className="flex flex-wrap border-b p-2 gap-2 bg-muted\/10">[\s\S]*?<Button[\s\S]*?onClick={\(\) => handleMediaImageSelect\("([^"]+)"\)}[\s\S]*?<\/Button>[\s\S]*?<\/div>/g;

content = content.replace(buttonGroupPattern, (match, fieldName) => {
  return `{renderMediaButtons("${fieldName}")}`;
});

// 모든 placeholder 텍스트에서 동영상, GIF, 파일, URL 관련 메시지 제거
content = content.replace(/위 버튼을 이용하여 이미지, 동영상, GIF, 파일, URL 등을 첨부할 수 있습니다/g, '이미지 버튼을 클릭하여 이미지를 첨부할 수 있습니다');

// 수정된 내용을 파일에 저장
fs.writeFileSync(filePath, content, 'utf8');
console.log('ResourceUploadPage.tsx 파일의 미디어 버튼이 성공적으로 수정되었습니다.');
