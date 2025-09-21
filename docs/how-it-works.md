# How Jena AI Works

This page outlines the architecture, data flow, and runtime behavior.

## Runtime components

- **CLI / launcher**: boots the kernel and loads configured agents
- **Kernel / orchestrator**: dispatches messages to agents, enforces policies
- **Agent pool**: instantiated agents that perform tasks (dialog, animation, data fetch)
- **Connectors**: I/O layer to streaming platforms, TTS engines, or hardware

## Message flow

1. Input arrives via a connector (chat, websocket, voice input)
2. Kernel routes to relevant agents based on message metadata
3. Agents may produce outputs (text, TTS, animation commands)
4. Kernel forwards outputs to connector(s) to be emitted

## State and memory

- **Short-term memory**: per-session buffers kept in memory for immediate context
- **Long-term memory**: optional stores (files or vector DB) for persistent knowledge

## Scaling

- Run multiple kernels behind a load-balancer for concurrent streams
- Use persistent message queues when reliability is required