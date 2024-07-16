import * as vscode from 'vscode';
import { getWebviewContent } from './webview';
// import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('lazygit.openChat', () => {
            const panel = vscode.window.createWebviewPanel(
                'chat',
                'Chat with LLM',
                vscode.ViewColumn.One,
                {
                    enableScripts: true
                }
            );

            panel.webview.html = getWebviewContent();

            panel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.command) {
                        case 'sendMessage':
                            const commands = await fetchGitCommands(message.text);
                            panel.webview.postMessage({ command: 'displayCommands', commands });
                            break;
                        case 'runGitCommand':
                            console.log("terminal: ", message.text);
                            const terminal = vscode.window.createTerminal('Git Terminal');
                            terminal.show();
                            terminal.sendText(message.text);
                            break;
                    }
                },
                undefined,
                context.subscriptions
            );

            panel.webview.onDidReceiveMessage(
                message => {
                    switch (message.command) {
                        case 'runGitCommand':
                            console.log("terminal: ", message.text);
                            const terminal = vscode.window.createTerminal('Git Terminal');
                            terminal.show();
                            terminal.sendText(message.text);
                            break;
                    }
                },
                undefined,
                context.subscriptions
            );

        })
    );
}
async function fetchGitCommands(query: string): Promise<string[]> {


    // const client = new OpenAI({
    //     apiKey: "<BLAH__BLAH__BLAH>",
    //     baseURL: "https://aiforcause.deepnight.tech/openai/"
    // });
    const client = new GoogleGenerativeAI("api_key_here");
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });


    try {
        console.log("Making API request");
        // const data = await client.chat.completions.create({
        //     messages: [{ role: "system", content: `Convert the following natural language command to Git commands:\n\n${query}` }],
        //     model: "gpt-3.5-turbo",
        //     stream: false
        // });
        const response = await model.generateContent(`Convert the following natural language command to Git commands (only give commands each on new line nothing extra):\n\n${query}`);
        const data = await response.response;
        const text = data.text();

        if (!text) {
            console.error('Unexpected API response format:', data);
            return [];
        }

        console.log("data", text);

        return text.trim().split('\n');
    } catch (error) {
        console.error('Error fetching Git commands:', error);
        return [];
    }
}


export function deactivate() { }
