# 006 - The Octopus Orgy

- A user can have many sessions. (different devices or browsers, incognito, etc)
- A session can have many WebSockets (same device, different tabs. which fucking sucks but hey it can happen)
- A WebSocket belongs to exactly one session and user

The point where I was losing my mind I told GPT:

> i feel like i'm watching a group of octopus have an orgy sex party and i'm trying to figure out which leg is whose

because initially, the thinking was:

```
   1:N           1:M
user -> sessions -> websockets
```

Therefore needed mappings like:

```
session -> user; for identification. hottest path basically
user -> sessions; for session revocation (log out for all devices)
user -> websockets; for backend event fanout
websocket -> session; for session scoped disconnection
```

Certified octopus orgy moment

## The epiphany: STOMP subscriptions

```
   1:N           1:M         N*M : 1
user -> sessions -> websockets -> topic/user
```
so it converges back to the same logical per-user destination

This is where it clicked

The backend does NOT NEED to manually fan out events to every WebSocket

like what was I thinking? Spring does this shit for me

```
WS1 -> /user/queue/events
WS2 -> /user/queue/events
WS3 -> /user/queue/events
```

and STOMP handles the fanout. nice

Also this would be the part where I can maybe later consider using an external broker like RabbitMQ

# So honestly this does kinda weaken my argument for Sessions over JWT+RT

