# Architecture Deep Dive

This page describes components, data models, and extension points.

## Components

- **Kernel**: lifecycle, message routing, and policy enforcement
- **Agent**: lifecycle, config-driven responsibilities
- **Connector**: I/O abstraction
- **Asset manager**: handles avatars, sprites, audio files

## Extension points

- Agent factories for dynamic agent loading
- Connector adapters for new platforms
- Middleware for message transformations