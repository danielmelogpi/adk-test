import { Annotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { send_message, ask_for_help, get_recruiter_open_schedule, schedule_meeting, end_conversation } from "./tools";

// 1) Define your session‑state shape as channels
const InterviewState = Annotation.Root({
  stage: Annotation<"collecting" | "awaiting-recruiter" | "scheduled" | "ended">(),
  candidateMsgs: Annotation<string[]>({ default: () => [], reducer: (s,v) => s.concat(v) }),
  recruiterMsgs: Annotation<string[]>({ default: () => [], reducer: (s,v) => s.concat(v) }),
  proposed: Annotation<string[]>({ default: () => [], reducer: (s,v) => s.concat(v) }),
  chosen: Annotation<string | undefined>(),
});

// 2) Wrap each tool (and LLM call) as a node
const candidateNode = new ToolNode([send_message]);
const recruiterNode = new ToolNode([ask_for_help]);
const scheduleLookupNode = new ToolNode([get_recruiter_open_schedule]);
const meetingNode = new ToolNode([schedule_meeting]);
const endNode = new ToolNode([end_conversation]);

// 3) Build the graph and wire up the allowed sequence
export const graph = new StateGraph(InterviewState);

// 2) register each node (the keys must match what you use in addEdge)
graph
  .addNode("candidate", candidateNode)
  .addNode("recruiter", recruiterNode)
  .addNode("scheduleLookup", scheduleLookupNode)
  .addNode("meeting", meetingNode)
  .addNode("end", endNode);
