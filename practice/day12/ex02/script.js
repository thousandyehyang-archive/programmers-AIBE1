const recordBtn = document.getElementById("recordBtn");
const chatContainer = document.getElementById("chatContainer");
const langSelect = document.getElementById("langSelect");

let isRecognizing = false;

if (!("webkitSpeechRecognition" in window)) {
  alert(
    "이 브라우저에서는 음성 인식을 지원하지 않습니다. Chrome을 사용해 주세요."
  );
} else {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "ko-KR";

  langSelect.addEventListener("change", () => {
    recognition.lang = langSelect.value;
    console.log(`언어가 변경되었습니다: ${recognition.lang}`);
  });

  recognition.onstart = () => {
    addMessage("음성 인식 중...", "ai");
  };

  recognition.onresult = async (event) => {
    const userMessage = event.results[0][0].transcript;
    console.log("음성 입력:", userMessage);
    addMessage(userMessage, "user");

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(
          `서버 응답 실패: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const aiResponse = data.response;

      addMessage(aiResponse, "ai");

      window.speechSynthesis.cancel(); // 기존 음성을 중단
      const utterance = new SpeechSynthesisUtterance(aiResponse);
      utterance.lang = recognition.lang;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("서버 통신 오류:", error);
      addMessage("서버 통신에 실패했습니다.", "ai");
    }
  };

  recognition.onerror = (event) => {
    console.error("음성 인식 오류:", event.error);
    addMessage("음성 인식에 실패했습니다.", "ai");
  };

  recognition.onend = () => {
    console.log("음성 인식 종료");
    isRecognizing = false;
  };

  recordBtn.addEventListener("click", () => {
    if (isRecognizing) {
      addMessage("이미 음성 인식이 진행 중입니다.", "ai");
      return;
    }

    isRecognizing = true;
    recognition.start();
  });
}

// 메시지 추가 함수
function addMessage(text, sender) {
  const messageElement = document.createElement("div");
  messageElement.className = `message ${sender}`;

  const contentElement = document.createElement("div");
  contentElement.className = "content";
  contentElement.textContent = text;

  messageElement.appendChild(contentElement);
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight; // 최신 메시지로 스크롤 이동
}
