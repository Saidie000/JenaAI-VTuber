# Integrations & API

## Connectors

- **OBS**: send scene/scene-item updates via websocket or OBS websocket
- **TTS**: support for cloud TTS providers and local fallback
- **Chat**: Twitch/Discord connectors available via plugins

## Plugin contract

- Each connector must implement init(config), onMessage(msg), send(output)
- Agents must implement start(), stop(), and handleMessage(msg)

Examples will be added as code samples in future revisions.