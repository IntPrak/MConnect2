document.addEventListener('DOMContentLoaded', () => {
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotModal = document.getElementById('chatbot-modal');
    const messagesContainer = document.getElementById('chatbot-messages');
    const userInput = document.getElementById('user-input');

    // Check server health on startup
    checkServerHealth();

    setTimeout(() => {
        addMessage('bot', 'Hello! 👋 How can I assist you today?');
    }, 500);

    chatbotButton.addEventListener('click', () => {
        chatbotModal.style.display = 'block';
    });

    window.closeChatbot = () => {
        chatbotModal.style.display = 'none';
    };

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function checkServerHealth() {
        try {
            const response = await fetch('http://localhost:5000/health');
            if (!response.ok) {
                console.error('Server is not responding properly');
                addMessage('bot', 'Server connection issue. Please try again later.');
            }
        } catch (error) {
            console.error('Cannot connect to server:', error);
            addMessage('bot', 'Cannot connect to server. Please ensure the server is running.');
        }
    }

    let messageCount = 0;

    window.sendMessage = async () => {
        const message = userInput.value.trim();
        if (message) {
            const userMessage = message;
            addMessage('user', userMessage);
            userInput.value = '';

            // Show loading message in bot's chat section
            const loadingId = addMessage('bot', 'Thinking...');

            try {
                const botResponse = await getGeminiResponse(userMessage);
                updateMessage(loadingId, 'bot', botResponse);

                messageCount++;
                if (messageCount % 3 === 0) {
                    setTimeout(() => {
                        addMessage('bot', 'Are you satisfied with the responses? If not, you can book a session with a mentor here: [Book Appointment](#)');
                    }, 1000);
                }

            } catch (error) {
                updateMessage(loadingId, 'bot', "Sorry, I couldn't process that request. Please try again.");
                console.error("Error with Gemini API:", error);
            }
        }
    };

    async function getGeminiResponse(userMessage) {
        try {
            const response = await fetch("http://localhost:5000/api/gemini", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    message: `You are an expert student mentor. Keep your answers short and relevant. If a user asks about booking an appointment, reply with "You can book an appointment with a mentor here: <a href='mentor-dashboard.html' target='_blank'>Book Appointment</a>". Now respond to: "${userMessage}"`
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Received from Backend:", data.text);

            return data.text;
        } catch (error) {
            console.error("Error fetching response from backend:", error);
            return "Oops! Something went wrong.";
        }
    }

    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = text; // Use innerHTML for clickable links
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return messageDiv.id = `msg-${Date.now()}`;
    }

    function updateMessage(messageId, sender, text) {
        const messageDiv = document.getElementById(messageId);
        if (messageDiv) {
            messageDiv.innerHTML = text; // Use innerHTML for clickable links
        } else {
            addMessage(sender, text);
        }
    }
});
