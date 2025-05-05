import os
from dotenv import load_dotenv
from multi_tool_agent.agent import create_agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Google AI API
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")
genai.configure(api_key=api_key)

def invoke_agent_with_instruction(instruction: str):
    # Create the agent
    agent = create_agent()
    
    # Set up session service
    session_service = InMemorySessionService()
    
    # Create a session
    session = session_service.create_session(
        app_name="weather_time_agent",
        user_id="user123",
        session_id="session123"
    )

    # Create the runner
    runner = Runner(
        agent=agent,
        app_name="weather_time_agent",
        session_service=session_service
    )

    # Create the message content
    content = types.Content(
        role='user',
        parts=[types.Part(text=instruction)]
    )

    # Run the agent
    events = runner.run(
        user_id="user123",
        session_id="session123",
        new_message=content
    )

    # Process the events
    for event in events:
        if event.is_final_response():
            # Print all parts of the response
            for part in event.content.parts:
                if hasattr(part, 'text') and part.text:
                    print("Text Response:", part.text)
                if hasattr(part, 'function_call'):
                    print("Function Call:", part.function_call)

if __name__ == "__main__":
    past_tool_result = {
        "tool_name": "send_email",
        "input": {
            "to": "weather@example.com",
            "subject": "Weather in Goiania",
            "body": "Please provide the weather information for Goiania.",
        },
        "output": {
            "status": "success",
            "message": "Email sent successfully.",
        },
        "response_received": "The weather in Goiania is sunny with a temperature of 25 degrees Celsius (77 degrees Fahrenheit).",
    }

    # Inject this info into the agent's instruction
    instruction = f"""
    You are a helpful agent who can answer user questions about the time and weather in a city.

    Previously, you used the tool `{past_tool_result["tool_name"]}` to send an email to {past_tool_result["input"]["to"]} asking:
    "{past_tool_result["input"]["body"]}"

    The reply you received was:
    "{past_tool_result["response_received"]}"
    """

    # Invoke the agent
    invoke_agent_with_instruction(instruction) 