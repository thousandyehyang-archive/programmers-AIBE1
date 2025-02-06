const recordBtn = document.getElementById('recordBtn');
const outputDiv = document.getElementById('output');

recordBtn.addEventListener('click', () => {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ko-KR';

    recognition.onresult = async (event) => {
        const userMessage = event.results[0][0].transcript;
        outputDiv.textContent = `입력: ${userMessage}`;

        // 서버로 텍스트 전송 후 응답 받기
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();
        const aiResponse = data.response;

        outputDiv.textContent += `\n응답: ${aiResponse}`;

        // 응답을 음성으로 읽어주기
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.lang = 'ko-KR';
        window.speechSynthesis.speak(utterance);
    };

    recognition.start();
});
