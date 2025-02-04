require("dotenv").config(); // .env 파일에서 환경 변수 로드

const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
app.use(express.json());

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "public")));

// 기본 경로에 index.html 반환
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 환경변수에서 API 키 가져오기
const API_KEY = process.env.OPENAI_API_KEY;

// 요약 요청 엔드포인트
app.post("/summarize", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "요약할 텍스트가 없습니다." });
    }

    // OpenAI API 요청 보내기
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "너는 메모를 요약해주는 데 특화된 20년차 메모 요약 전문가야.",
          },
          {
            role: "user",
            content: `이 내용을 총 50자가 넘지 않게 요약해줘. ${text}`,
          },
        ],
        max_tokens: 100,
        temperature: 0.5,
      }),
    });

    // 상태 코드가 정상(200~299)이 아니면 에러 처리
    if (!response.ok) {
      const errorDetails = await response.text();
      console.error(`OpenAI API 오류 상태 코드: ${response.status}`);
      console.error(`오류 내용: ${errorDetails}`);
      throw new Error(`OpenAI API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content.trim();

    res.json({ summary });
  } catch (error) {
    console.error("요약 처리 중 오류:", error);
    res.status(500).json({ error: "요청 처리 중 오류 발생" });
  }
});

// 서버 시작
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`서버가 ${port} 포트에서 실행 중입니다.`);
});
