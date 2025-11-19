// =============================
// 🔧 CONFIGURATION
// =============================
let _config = {
  openAI_api: "https://alcuino-chatbot.azurewebsites.net/api/OpenAIProxy",
  openAI_model: "gpt-4o-mini",
  ai_instruction: `you are a teacher who gives questions about JavaScript.
  output should be in HTML format,
  no markdown format, answer directly.`,
  response_id: "",
};

// =============================
// 💬 CHATBOT FUNCTIONALITY
// =============================
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Main send message function
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  userInput.value = "";

  // Typing indicator
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("typing");
  typingDiv.textContent = "Bot is typing...";
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const botResponse = await getBotResponse(message);
    typingDiv.remove();
   appendMessage("bot", botResponse);
  } catch {
    typingDiv.remove();
    appendMessage("bot", "⚠️ Error connecting to AI server.");
  }
}

// Add message to chat
function appendMessage(sender, text) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
  messageDiv.innerHTML = text; // Use innerHTML for formatted AI output
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// =============================
// 🤖 AI INTEGRATION
// =============================
async function getBotResponse(input) {
  try {
    const aiResponse = await sendOpenAIRequest(input);
    return aiResponse;
  } catch (err) {
    console.error(err);
    return "⚠️ Sorry, something went wrong.";
  }
}

async function sendOpenAIRequest(text) {
  let requestBody = {
    model: _config.openAI_model,
    input: text,
    instructions: _config.ai_instruction,
    previous_response_id: _config.response_id,
  };

  if (_config.response_id.length === 0) {
    requestBody = {
      model: _config.openAI_model,
      input: text,
      instructions: _config.ai_instruction,
    };
  }

  try {
    const response = await fetch(_config.openAI_api, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    let output = data.output[0].content[0].text;
    _config.response_id = data.id;

    return output;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}