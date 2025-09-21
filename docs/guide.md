# Jena AI — Official Guide

This official guide explains the design goals, common workflows, and recommended patterns for building characters and experiences with Jena AI.

## Design goals

- Composability: small agents that can be composed into complex behaviors
- Observability: clear logs, traces, and a debug mode for live testing
- Extensibility: plugin points for connectors, TTS, animation drivers, and overlays

## Core Concepts

- **Agent**: the basic unit for behavior (dialogue agent, animation agent, scheduler)
- **Kernel**: a coordinator that routes messages and manages agent lifecycles
- **Connector**: integration adapters for external systems (OBS, voice providers, chat services)
- **Profile**: the character definition including personality, short-term memory, and assets

## Recommended workflow

1. Define a Profile: name, persona, assets, and default voice
2. Create small agents for responsibilities (chat, animation, music)
3. Test locally in debug mode with simulated inputs
4. Add connectors for streaming or chat platforms
5. Iterate and monitor performance

## Examples

- Simple chat agent: respond to chat messages using a LLM with a persona prompt
- Animation agent: map logical states to animation triggers

## Developer tips

- Keep agents single-responsibility
- Use environment variables for secrets
- Add tests around agent behavior and serialization