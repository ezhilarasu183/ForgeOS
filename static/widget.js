    console.log("Chatbot Widget Script Executing");
    
    // Define the main logic function
    function initChatWidget() {
        console.log("Chatbot Widget Script Loaded");
        
        let doc = document;
        try {
            if (window.parent && window.parent.document) {
                doc = window.parent.document;
            }
        } catch(e) {
            console.error("Cannot access parent document:", e);
            // Fallback to current doc (likely iframe) just so we see something? No, meaningless.
            throw new Error("Cannot access parent document: " + e.message);
        }
        
        console.log("Target Document:", doc);

        // Check if widget already exists
        if (doc.getElementById('chat-widget-container')) {
            console.log("Widget already exists.");
            return;
        }

        // Create Container
        const container = doc.createElement('div');
        container.id = 'chat-widget-container';
        doc.body.appendChild(container);

        // Floating Button
        const btn = doc.createElement('div');
        btn.className = 'chat-widget-btn';
        btn.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
        `;
        container.appendChild(btn);

        // Chat Window
        const window = doc.createElement('div');
        window.className = 'chat-widget-window';
        window.innerHTML = `
            <div class="chat-header">
                <h3>AI Assistant</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="chat-messages" id="widget-messages">
                <div class="message ai">
                    Hello! I can help you schedule meetings or manage tasks.
                </div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="widget-input" placeholder="Type a message..." autocomplete="off">
                <button id="widget-send">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                    </svg>
                </button>
            </div>
        `;
        container.appendChild(window);

        // Elements
        const messagesDiv = doc.getElementById('widget-messages');
        const input = doc.getElementById('widget-input');
        const sendBtn = doc.getElementById('widget-send');
        const closeBtn = window.querySelector('.close-btn');

        // Toggle logic
        btn.addEventListener('click', () => {
            window.classList.toggle('open');
            if (window.classList.contains('open')) input.focus();
        });

        closeBtn.addEventListener('click', () => {
            window.classList.remove('open');
        });

        // Send logic
        async function sendMessage() {
            const text = input.value.trim();
            if (!text) return;

            addMessage(text, 'user');
            input.value = '';
            input.disabled = true;

            try {
                const response = await fetch('http://localhost:8000/intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });

                const data = await response.json();
                const reply = data.reply || `Processed action: ${data.action}`;
                addMessage(reply, 'ai');

            } catch (err) {
                console.error(err);
                addMessage("Error connecting to AI server.", 'ai');
            } finally {
                input.disabled = false;
                input.focus();
            }
        }

        function addMessage(text, sender) {
            const div = doc.createElement('div');
            div.className = `message ${sender}`;
            div.textContent = text;
            messagesDiv.appendChild(div);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Run immediately
    initChatWidget();

