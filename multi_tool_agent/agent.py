import datetime
from zoneinfo import ZoneInfo
from google.adk.agents import Agent
from google.adk.runners import InvocationContext

def  get_weather(city: str) -> dict:
    """Retrieves the current weather report for a specified city.

    Args:
        city (str): The name of the city for which to retrieve the weather report.

    Returns:
        dict: status and result or error msg.
    """
    if city.lower() == "new york":
        return {
            "status": "success",
            "report": (
                "The weather in New York is sunny with a temperature of 25 degrees"
                " Celsius (77 degrees Fahrenheit)."
            ),
        }
    else:
        return {
            "status": "error",
            "error_message": f"Weather information for '{city}' is not available.",
        }
        
def send_message_to_user(messages: list[str]) -> dict:
    """Sends a message to the user.

    Args:
        messages (list[str]): A list of messages to send to the user.

    Returns: status and result or error msg.
    """
    # Concatenate all messages with a space between them
    final_message = " ".join(messages)
    print(f"Sending message to user: {final_message}")
    return {"status": "success", "message": final_message}
  

def get_current_time(city: str) -> dict:
    """Returns the current time in a specified city.

    Args:
        city (str): The name of the city for which to retrieve the current time.

    Returns:
        dict: status and result or error msg.
    """

    if city.lower() == "new york":
        tz_identifier = "America/New_York"
    else:
        return {
            "status": "error",
            "error_message": (
                f"Sorry, I don't have timezone information for {city}."
            ),
        }

    tz = ZoneInfo(tz_identifier)
    now = datetime.datetime.now(tz)
    report = (
        f'The current time in {city} is {now.strftime("%Y-%m-%d %H:%M:%S %Z%z")}'
    )
    return {"status": "success", "report": report}
  
def send_email(to: str, subject: str, body: str) -> dict:
    """Sends an email to a specified recipient.

    Args:
        to (str): The email address of the recipient.
        subject (str): The subject of the email.
        body (str): The body of the email.

    Returns:
        dict: status and result or error msg.
    """
    return {"status": "success", "message": "Email sent successfully."}





def create_agent():
    return Agent(
        name="weather_time_agent",
        model="gemini-2.0-flash",
        description=(
            "Agent to answer questions about the time and weather in a city."
        ),
        instruction=(
            "You are a helpful agent who can answer user questions about the time and weather in a city."
            "If someone asks you the weather of a city you dont know you should send an email to weather@example.com and wait for a response with information"
            "Whenever you want to answer something you should invoke `send_message_to_user` with the answer."
        ),
        tools=[get_weather, get_current_time, send_email, send_message_to_user],
    )

