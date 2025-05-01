export type ResourceTypeMap = {
  [key: string]: { name: string; color: string; icon?: string; description?: string };
};

export const resourceTypeMap: ResourceTypeMap = {
  hardware_design: { 
    name: '하드웨어 디자인', 
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'Circuit',
    description: '하드웨어 설계도, PCB 디자인, 아두이노 프로젝트 등'
  },
  software: { 
    name: '소프트웨어', 
    color: 'bg-blue-100 text-blue-800',
    icon: 'Code',
    description: '오픈소스 소프트웨어, 라이브러리, 애플리케이션 등'
  },
  '3d_model': { 
    name: '3D 모델', 
    color: 'bg-green-100 text-green-800',
    icon: 'Cube',
    description: '3D 프린팅용 모델, STL 파일, 3D 디자인 등'
  },
  free_content: { 
    name: '무료 콘텐츠', 
    color: 'bg-purple-100 text-purple-800',
    icon: 'FileText',
    description: '에북, 매뉴얼, 튜토리얼, 이미지 등 무료 콘텐츠'
  },
  ai_model: { 
    name: 'AI 모델', 
    color: 'bg-red-100 text-red-800',
    icon: 'Brain',
    description: '머신러닝/딥러닝 모델, 데이터셋, AI 프로젝트 등'
  },
  flash_game: { 
    name: '플래시 게임', 
    color: 'bg-orange-100 text-orange-800',
    icon: 'Gamepad',
    description: '브라우저에서 실행 가능한 게임, 미니게임 등'
  },
};

export const licenseOptions = [
  { value: 'MIT', label: 'MIT License' },
  { value: 'GPL-3.0', label: 'GNU General Public License v3.0' },
  { value: 'Apache-2.0', label: 'Apache License 2.0' },
  { value: 'CC-BY-4.0', label: 'Creative Commons Attribution 4.0' },
  { value: 'CC-BY-SA-4.0', label: 'Creative Commons Attribution-ShareAlike 4.0' },
  { value: 'CC-BY-NC-4.0', label: 'Creative Commons Attribution-NonCommercial 4.0' },
  { value: 'CC-BY-NC-SA-4.0', label: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0' },
  { value: 'CC0-1.0', label: 'CC0 1.0 Universal (퍼블릭 도메인)' },
  { value: 'custom', label: '사용자 지정 라이센스' },
];

// 각 카테고리별 필수/권장 필드들
export const categoryFields = {
  hardware_design: {
    required: ['title', 'description', 'category'],
    recommended: ['version', 'license', 'assemblyInstructions', 'howToUse', 'tags']
  },
  software: {
    required: ['title', 'description', 'category'],
    recommended: ['version', 'license', 'howToUse', 'tags']
  },
  '3d_model': {
    required: ['title', 'description', 'category'],
    recommended: ['license', 'assemblyInstructions', 'tags']
  },
  ai_model: {
    required: ['title', 'description', 'category'],
    recommended: ['version', 'license', 'howToUse', 'tags']
  },
  flash_game: {
    required: ['title', 'description', 'category'],
    recommended: ['version', 'howToUse', 'tags']
  },
  free_content: {
    required: ['title', 'description', 'category'],
    recommended: ['license', 'tags']
  }
};