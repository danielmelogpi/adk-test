// tools.ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const send_message = tool(
  async ({ msg }) => {
    console.log("SMS ▶", msg);
    return {result: "ok"};
  },
  {
    name: "send_message",
    description: "Send SMS to the candidate",
    schema: z.object({ msg: z.string() })
  }
);

export const ask_for_help = tool(
  async ({ msg }) => {
    console.log("E‑mail ▶ recruiter:", msg);
    return {result: "sent"};
  },
  {
    name: "ask_for_help",
    description: "Ask recruiter something",
    schema: z.object({ msg: z.string() })
  }
);

export const get_recruiter_open_schedule = tool(
  async ({ duration }) => {
    const slots = [
      { start: "2025-05-09T13:00:00-03:00", end: "2025-05-09T14:00:00-03:00", duration: "15min" },
    ];
    return {result: slots};
  },
  {
    name: "get_recruiter_open_schedule",
    description: "Return free recruiter slots",
    schema: z.object({ duration: z.number().describe("minutes") })
  }
);

export const schedule_meeting = tool(
  async ({ t }) => {
    console.log("calendar invite for", t);
    return {result: "created"};
  },
  {
    name: "schedule_meeting",
    description: "Create calendar invite",
    schema: z.object({ t: z.string().describe("ISO date/time") })
  }
);

export const end_conversation = tool(
  async () => {
    console.log("convo ended");
    return {result: "bye"};
  },
  {
    name: "end_conversation",
    description: "End conversation",
    schema: z.object({})
  }
);