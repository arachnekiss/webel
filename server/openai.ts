import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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