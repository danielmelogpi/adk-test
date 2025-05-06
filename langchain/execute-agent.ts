import { DynamicTool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
// Load API key from environment

const model = new ChatGoogleGenerativeAI({
  apiKey: '', // set this in your .env
  model: "gemini-2.0-flash",
  temperature: 0.8,
});

// Define a tool Gemini can call
const tools = [
  new DynamicTool({
    name: "get_current_time",
    description: "Returns the current time in ISO format",
    func: async () => 'Its August 6th, 2025 at 10:00 AM',
  }),
  new DynamicTool({
    name: "send_user_message",
    description: "Sends a message to the user",
    func: async (message: string) => {
      console.log({message});
    },
  }),
];

// add tools
model.bindTools(tools);

// We can't use await at top level in CommonJS, so wrap in async function
const run = async () => {
  // First response with tool calls
  const initialResponse = await model.invoke([
    new SystemMessage(`You are a friendly and conversational AI assistant. When using tools:
      1. First use any required tools to gather information
      2. Then craft a natural, conversational response incorporating the tool's output
      3. Always maintain a friendly, helpful tone
      
      For time-related questions, use the get_current_time tool and incorporate its response naturally.
      When you have a response, use the send_user_message tool to send it to the user.`),
    new HumanMessage("What time is it now?")
  ], {
    tools,
  });

  // Execute tool calls if any
  const toolResults = [];
  if (initialResponse.tool_calls) {
    for (const toolCall of initialResponse.tool_calls) {
      const tool = tools.find(t => t.name === toolCall.name);
      if (tool) {
        const result = await tool.func(typeof toolCall.args === 'string' ? toolCall.args : '');
        toolResults.push({ tool: toolCall.name, result });
      }
    }
  }

  // Get final response incorporating tool results
  const finalResponse = await model.invoke([
    new SystemMessage(`You are a friendly and conversational AI assistant. Create a natural response incorporating the tool results.`),
    new HumanMessage("What time is it now?"),
    new AIMessage({ content: `Tool results: ${JSON.stringify(toolResults)}` })
  ], {
    tools,
  });

  console.log("Final response:", finalResponse.content);
};

run()
