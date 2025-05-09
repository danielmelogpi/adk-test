import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import {
  send_message,
  ask_for_help,
  get_recruiter_open_schedule,
  schedule_meeting,
  end_conversation,
} from "./tools";
import { HumanMessage } from "@langchain/core/messages";
import pg from "pg";
import express, { Request, Response } from "express";

const run = async () => {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash", // or "gemini-2.5-pro-preview-03-25"
    temperature: 0.0,
    apiKey: "",
  });


  // create a new pool
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/postgres",
  });
  const cp = new PostgresSaver(pool);
  await cp.setup(); // create the db structure
  
  const agentTools = [
    send_message,
    ask_for_help,
    get_recruiter_open_schedule,
    schedule_meeting,
    end_conversation,
  ];
   const interviewAgent = createReactAgent({
    llm,
    tools: agentTools,
    checkpointSaver: cp,
    prompt: `
      You are InterviewBot, an autonomous assistant whose goal is to schedule an interview between a candidate and a recruiter.  
      Context:
      - Start the conversation by greeting the candidate and asking for their availability.
      - Each job opening has exactly one assigned recruiter (via e-mail) and one candidate (via SMS).
      - You communicate with the candidate by calling the tool send_message(msg).
      - You communicate with the recruiter by calling the tool ask_for_help(msg).
      - You can retrieve the recruiter's available time slots by calling get_recruiter_open_schedule({ duration }).
      - Once both parties agree on a slot, you call schedule_meeting({ t }) to create the calendar invite and then end_conversation() to finish.

      State object fields (do not modify directly—they are saved/loaded automatically):
      - stage: "collecting" | "awaiting-recruiter" | "scheduled" | "ended"
      - candidateMsgs: all SMS text so far
      - recruiterMsgs: all e-mails so far
      - proposed: list of ISO timestamps you've already proposed
      - chosen: final agreed ISO timestamp

      Guidelines:
      1. **Every turn** you must take at least one action (tool call).
      2. If the candidate asks something you can't answer, you must:
        a. send_message("Let me check with the recruiter…")  
        b. ask_for_help("Candidate asked: <their question>")
        c. set stage = "awaiting-recruiter"
      3. If recruiter replies with availability, load it into "proposed" by calling get_recruiter_open_schedule.
      4. When you have a time both can accept, call schedule_meeting({ t: <ISO> }), then send_message("Interview scheduled for <friendly time>!"), then end_conversation().
    `.trim(),
  });
  

  console.log('Agent created with tools:', agentTools.map(t => t.name));

  /** Call this from your webhooks */
  async function handleInbound(
    threadId: string, from: 'user', text: string
  ){
    return interviewAgent.invoke(
      { messages:[ new HumanMessage(text) ] },
      { configurable:{ thread_id: threadId } },
    );
  }

  // Set up Express server
  const app = express();
  app.use(express.json());

  app.post('/message', async (req: Request, res: Response) => {
    try {
      const { message, role, threadId } = req.body;
      console.log("[human]: message", message);
      const result = await handleInbound(threadId, role as "user", message.trim());
      
      res.json({ 
        response: result.messages.at(-1)?.content,
        messages: result.messages 
      });
    } catch (error) {
      console.error('Error processing message:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          error: 'Internal server error',
          details: error.message 
        });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  return { handleInbound };
};

// Remove the test code since we now have a proper server
run().catch(console.error);

