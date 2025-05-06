https://github.com/astral-sh/uv

```bash
brew install uv

uv venv # setups Python version

uv sync # install deps
uv add dep # install dep
uv lock # update project descriptor

uv run start # init agent
```

To invoke the normal adk stuff

```bash
adk web --port 9823;
```

To tell the agent he got the response back:

```bash
uv run python invoke_agent.py
```
