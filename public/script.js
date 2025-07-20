const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  // Add a placeholder message for the bot's response that we can update later
  const botMessageElement = appendMessage('bot', 'Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      // Read the response body as text ONCE, so we can use it multiple ways.
      const errorBody = await response.text();
      let errorMessage;
      try {
        // Try to parse the text as JSON.
        const errorData = JSON.parse(errorBody);
        errorMessage = errorData.reply || errorData.error;
      } catch (jsonError) {
        // If parsing fails, the body was not JSON. Use the raw text.
        errorMessage = errorBody;
      }
      throw new Error(errorMessage || `Request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // The backend sends { reply: '...' } on success
    botMessageElement.textContent = data.reply;
  } catch (error) {
    console.error('Error fetching chat response:', error);
    botMessageElement.textContent = `Error: ${error.message}`;
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the element so we can update it later
}
