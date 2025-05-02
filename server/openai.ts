import OpenAI from 'openai';
import { Buffer } from 'buffer';

// OpenAI 클라이언트 초기화
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// OpenAI 클라이언트 싱글톤 인스턴스
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 30000,
});

// 텍스트 기반 대화
export async function getChatResponse(messages: any[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    console.error('OpenAI API 오류:', error.message);
    throw new Error(`AI 응답을 가져오는 중 오류가 발생했습니다: ${error.message}`);
  }
}

// 이미지 분석 (비전 기능)
export async function analyzeImage(base64Image: string, prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    console.error('OpenAI Vision API 오류:', error.message);
    throw new Error(`이미지 분석 중 오류가 발생했습니다: ${error.message}`);
  }
}

// 이미지 분석 결과를 JSON 형식으로 요청
export async function analyzeImageWithStructuredResponse(base64Image: string, prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "다음 이미지를 분석하고 구조화된 JSON 형식으로 응답하세요. 응답에는 필요한 부품, 조립 단계, 문제점 등이 포함되어야 합니다."
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error: any) {
    console.error('OpenAI Vision JSON API 오류:', error.message);
    throw new Error(`이미지 분석 중 오류가 발생했습니다: ${error.message}`);
  }
}

// 결과를 JSON 형식으로 요청
export async function getJSONResponse(messages: any[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 1000
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error: any) {
    console.error('OpenAI JSON API 오류:', error.message);
    throw new Error(`JSON 응답을 가져오는 중 오류가 발생했습니다: ${error.message}`);
  }
}

// 음성을 텍스트로 변환 (Whisper API)
export async function transcribeAudio(audioBase64: string) {
  try {
    // base64 형식에서 실제 오디오 데이터만 추출
    const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Note: For server-side implementation we need to handle File differently than in browser
    // Create a temporary file path for the audio data
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    
    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);
    fs.writeFileSync(tempFilePath, buffer);
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "ko"
    });
    
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    
    return transcription.text;
  } catch (error: any) {
    console.error('OpenAI Whisper API 오류:', error.message);
    throw new Error(`음성 변환 중 오류가 발생했습니다: ${error.message}`);
  }
}

// 이미지 생성 (DALL-E API)
export async function generateImage(prompt: string) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard"
    });
    
    if (!response.data || response.data.length === 0) {
      throw new Error('이미지 생성 결과가 없습니다.');
    }
    
    return response.data[0].url || '';
  } catch (error: any) {
    console.error('OpenAI DALL-E API 오류:', error.message);
    throw new Error(`이미지 생성 중 오류가 발생했습니다: ${error.message}`);
  }
}