import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 현재 파일 위치 구하기 (ES 모듈용)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ResourceUploadPage.tsx 파일 읽기
const filePath = path.join(__dirname, '../client/src/pages/ResourceUploadPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 모든 미디어 버튼 그룹을 renderMediaButtons 함수 호출로 대체
let modified = false;
let count = 0;

// 1. howToUse 필드 미디어 버튼 그룹 찾아 대체
const howToUsePattern = /(<div className="border rounded-md">)\s+<div className="flex flex-wrap border-b p-2 gap-2 bg-muted\/10">\s+<Button[^>]*onClick={\(\) => handleMediaImageSelect\("howToUse"\)}[^>]*>\s+<ImageIcon[^>]*\/> 이미지\s+<\/Button>[\s\S]*?<\/div>/g;
content = content.replace(howToUsePattern, (match, openDiv) => {
  count++;
  modified = true;
  return `${openDiv}\n                                  {renderMediaButtons("howToUse")}`;
});

// 2. assemblyInstructions 필드 미디어 버튼 그룹 찾아 대체
const assemblyPattern = /(<div className="border rounded-md">)\s+<div className="flex flex-wrap border-b p-2 gap-2 bg-muted\/10">\s+<Button[^>]*onClick={\(\) => handleMediaImageSelect\("assemblyInstructions"\)}[^>]*>\s+<ImageIcon[^>]*\/> 이미지\s+<\/Button>[\s\S]*?<\/div>/g;
content = content.replace(assemblyPattern, (match, openDiv) => {
  count++;
  modified = true;
  return `${openDiv}\n                                  {renderMediaButtons("assemblyInstructions")}`;
});

// 3. description 필드도 있다면 수정
const descriptionPattern = /(<div className="border rounded-md">)\s+<div className="flex flex-wrap border-b p-2 gap-2 bg-muted\/10">\s+<Button[^>]*onClick={\(\) => handleMediaImageSelect\("description"\)}[^>]*>\s+<ImageIcon[^>]*\/> 이미지\s+<\/Button>[\s\S]*?<\/div>/g;
content = content.replace(descriptionPattern, (match, openDiv) => {
  count++;
  modified = true;
  return `${openDiv}\n                                  {renderMediaButtons("description")}`;
});

// 4. 모든 placeholder 텍스트에서 동영상, GIF, 파일, URL 관련 메시지 제거
content = content.replace(/위 버튼을 이용하여 이미지, 동영상, GIF, 파일, URL 등을 첨부할 수 있습니다/g, '이미지 버튼을 클릭하여 이미지를 첨부할 수 있습니다');
content = content.replace(/미디어 요소를 추가하여 더 명확하게 설명할 수 있습니다/g, '이미지를 추가하여 더 명확하게 설명할 수 있습니다');

// 수정된 내용을 파일에 저장
if (modified) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`ResourceUploadPage.tsx 파일의 미디어 버튼 그룹이 성공적으로 수정되었습니다. (${count}개 수정)`);
} else {
  console.log('수정할 미디어 버튼 그룹을 찾지 못했습니다.');
}
