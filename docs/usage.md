# Usage & Examples

This page contains concrete examples and configuration options.

## Configuration

- **config.json**: runtime options, connectors, and agent manifests
- **.env**: secrets like API keys (never commit these)

## Example: run with a custom voice

  VOICE_PROVIDER=example npm start

## Example agent manifest

```json
{
  "agents": [
    { "id": "chat", "type": "llm", "entry": "agents/chat.js" },
    { "id": "anim", "type": "animation", "entry": "agents/anim.js" }
  ]
}
```

## Debugging

- Start with DEBUG=true to enable verbose logs
- Use the sample debug connector to replay inputs