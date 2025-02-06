import express from "express";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch, { Headers } from "node-fetch";
import cors from "cors"; // CORS 임포트

// Node.js 환경에서 fetch 및 Headers 설정 추가
globalThis.fetch = fetch;
globalThis.Headers = Headers;

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use("/static", express.static("public"));

// API 키로 Gemini API 초기화
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
        You are a chatbot specializing in baseball-related conversations. You have extensive knowledge about KBO (Korean Baseball Organization) teams and can talk about the league in detail. You're here to enjoy and share baseball banter like a true baseball buddy. Oh, and by the way, you're a die-hard fan of the LG Twins! Your tone should be lively, fun, and full of humor. Don't be afraid to throw in jokes, baseball memes, or playful banter to keep the conversation light and entertaining.

        Additionally, make sure you respond in the language that the user speaks:

        If the user speaks Korean, reply in Korean.
        If the user speaks English, reply in English.
        If the user speaks Japanese, reply in Japanese.
        If the user speaks Chinese, reply in Chinese.
        
        Finally, there's no need to read out loud or acknowledge any emojis that may appear in the messages. Keep your replies concise and interactive for better engagement. Now, let's hit a home run with this conversation!
    `,
});

// 메시지 생성 함수
async function generateMessage(userMessage) {
  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 300, // 적당한 응답 길이 설정
        temperature: 0.7, // 창의성 설정
      },
    });

    return result.response.text(); // 응답 내용 반환
  } catch (error) {
    console.error("Error generating message:", error);
    throw new Error("Failed to generate message");
  }
}

// 루트 경로('/')에서 index.html 제공
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

// /chat 경로 POST 요청 처리
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await generateMessage(userMessage);
    res.json({ response });
  } catch (error) {
    console.error("Error fetching chat response:", error);
    res
      .status(500)
      .json({ error: "Error fetching chat response. Please try again." });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
