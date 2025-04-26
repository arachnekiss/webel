import { apiRequest } from './queryClient';

// 텍스트 기반 채팅 API 호출
export async function sendChatMessage(messages: any[]) {
  try {
    const res = await apiRequest('POST', '/api/assembly/chat', { messages });
    const data = await res.json();
    
    return data.response;
  } catch (error: any) {
    console.error('Chat API Error:', error);
    throw new Error(error.message || '메시지 전송 중 오류가 발생했습니다.');
  }
}

// 이미지 분석 API 호출
export async function analyzeImage(imageData: string, prompt: string) {
  try {
    const res = await apiRequest('POST', '/api/assembly/analyze-image', { 
      imageData,
      prompt 
    });
    const data = await res.json();
    
    return data.analysis;
  } catch (error: any) {
    console.error('Image Analysis API Error:', error);
    throw new Error(error.message || '이미지 분석 중 오류가 발생했습니다.');
  }
}

// 이미지 파일을 Base64로 변환
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// 음성 녹음 클래스
export class AudioRecorder {
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  
  async start(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();
    } catch (error) {
      console.error('음성 녹음 오류:', error);
      throw new Error('마이크 접근 권한이 필요합니다.');
    }
  }
  
  stop(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('녹음이 시작되지 않았습니다.'));
        return;
      }
      
      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
        } catch (error) {
          reject(error);
        }
      };
      
      this.mediaRecorder.stop();
      // 스트림 트랙 종료
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }
}