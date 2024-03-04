// Initialize conversation history
const conversation_history = []

document.addEventListener('DOMContentLoaded', function () {
  console.log('Script loaded and executed.')

  const chatBox = document.getElementById('chat-box')
  const userInput = document.getElementById('user-input')
  const sendButton = document.getElementById('send-button')

  console.log('chatBox:', chatBox)
  console.log('userInput:', userInput)
  console.log('sendButton:', sendButton)

  sendButton.addEventListener('click', sendMessage)

  function sendMessage() {
    console.log('sendMessage function executed.')

    const userMessage = userInput.value
    console.log('User Message:', userMessage)
    appendMessage('User', userMessage) // Append user message
    // Display a loading message after a delay
    setTimeout(function () {
      appendMessage('Chatbot', 'Thinking...', 'thinking-message')
    }, 450) // Adjust the delay time as needed

    // Send user message to the Flask API
    sendUserMessageToAPI(userMessage)
    // Clear user input
    userInput.value = ''
  }

  function appendMessage(sender, message, className) {
    const messageElement = document.createElement('div')
    if (className) {
      messageElement.classList.add(className)
    }
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`
    chatBox.appendChild(messageElement)

    // Scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight
  }

  function sendUserMessageToAPI(message) {
    // Send a POST request to the Flask API
    fetch('http://127.0.0.1:5000/generate_response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'user_query=' + encodeURIComponent(message)
    })
      .then((response) => response.json())
      .then((data) => {
        const botResponse = data.response
        console.log('Full Chatbot Response:', botResponse)

        // Remove the "Thinking..." message
        const thinkingMessage = document.querySelector('.thinking-message')
        if (thinkingMessage) {
          thinkingMessage.remove()
        }
        const lastEntry = conversation_history[conversation_history.length - 1]
        // Check if the last entry is not a duplicate
        if (
          !lastEntry ||
          lastEntry.user !== message ||
          lastEntry.bot !== botResponse
        ) {
          conversation_history.push({ user: message, bot: botResponse }) // Update conversation history
        }
        displayConversation() // Display entire conversation
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  }

  function displayConversation() {
    // Clear chat box
    chatBox.innerHTML = ''

    // Append entire conversation to the chat box
    conversation_history.forEach((entry) => {
      appendMessage('User', entry.user)
      appendMessage('Chatbot', entry.bot)
    })

    // Scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight
  }
})
