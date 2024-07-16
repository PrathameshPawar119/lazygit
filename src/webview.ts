export function getWebviewContent() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Chat with LLM</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f9;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                #root {
                    width: 80%;
                    max-width: 800px;
                    background: #fff;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    overflow: hidden;
                }
                #chat-container {
                    padding: 20px;
                    height: 60vh;
                    overflow-y: auto;
                    border-bottom: 1px solid #ddd;
                }
                #chat-container div {
                    margin-bottom: 10px;
                }
                input[type="text"] {
                    width: calc(100% - 110px);
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    margin-right: 10px;
                    margin-top: 10px;
                }
                button {
                    padding: 10px 20px;
                    border: none;
                    background: #007acc;
                    color: #fff;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                }
                button:hover {
                    background: #005f99;
                }
                code {
                    background: #f4f4f9;
                    padding: 6px 10px;
                    border-radius: 4px;
                }
                .message-user {
                    margin-bottom: 10px;
                    padding: 10px;
                    border-radius: 4px;
                    background: #007acc;
                    color: white;
                    width: fit-content;
                }
                .message-bot {
                    margin-bottom: 10px;
                    padding: 10px;
                    border-radius: 4px;
                    background: #ddd;
                    color: black;
                    width: fit-content;
                }
                .button-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            </style>
        </head>
        <body>
            <div id="root">
                <div id="chat-container"></div>
                <div class="button-container">
                    <input type="text" value="" id="input" />
                    <button id="send-button">Send</button>
                </div>
            </div>
            <script src="https://unpkg.com/react/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/babel-standalone/babel.min.js"></script>
            <script type="text/babel">
                class Chat extends React.Component {
                    constructor(props) {
                        super(props);
                        this.state = { messages: [], input: '' };
                    }

                    sendMessage = () => {
                        const { input, messages } = this.state;
                        const vscode = acquireVsCodeApi();
                        vscode.postMessage({ command: 'sendMessage', text: input });
                        this.setState({ messages: [...messages, { user: input, bot: [] }], input: '' });
                    }

                    handleInputChange = (e) => {
                        this.setState({ input: e.target.value });
                    }

                    render() {
                        return (
                            <div>
                                <div id="chat-container">
                                    {this.state.messages.map((msg, index) => (
                                        <div key={index}>
                                            <div className="message-user"><strong>User:</strong> {msg.user}</div>
                                            <div className="message-bot">
                                                <strong>Bot:</strong> 
                                                {msg.bot.map((cmd, idx) => (
                                                    <div key={idx}>
                                                        
                                                        <code>{cmd}</code>
                                                        <button onClick={() => {
                                                            const vscode = acquireVsCodeApi();
                                                            console.log('running command', cmd);
                                                            vscode.postMessage({ command: 'runGitCommand', text: cmd });
                                                        }}>
                                                            Run
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div class="button-container">
                                    <input type="text" value={this.state.input} onChange={this.handleInputChange} />
                                    <button onClick={this.sendMessage}>Send</button>
                                </div>
                            </div>
                        );
                    }
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'displayCommands') {
                        const newMessages = [...chat.state.messages];
                        newMessages[newMessages.length - 1].bot = message.commands;
                        chat.setState({ messages: newMessages });
                    }
                });

                const chat = ReactDOM.render(<Chat />, document.getElementById('root'));
            </script>
        </body>
        </html>
    `;
}
