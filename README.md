# Disclone

A Discord clone built with React and Node. Text chat in servers and direct messages, friend requests, online status, and peer to peer video calls over WebRTC.

Live client talks to a backend hosted on Railway at `https://discloned.up.railway.app`.

## What it does

- Register and log in with email, username, display name and date of birth. Passwords are hashed with bcrypt and sessions use JWTs that expire after an hour, with a refresh endpoint.
- Send friend requests by username, accept them, and see who is online. Status flips to Online or Offline when a user's socket connects or drops, and every friend gets a live update.
- Direct messages between friends, delivered over Socket.IO so the other side sees them without refreshing.
- Servers with text channels. Create a server, add channels, invite friends through a DM invitation card they can accept to join.
- One to one video calls. Signalling (offer, answer, ICE candidates) goes through the socket server, media goes direct between browsers using Google's public STUN servers.

## Stack

| Layer | Tech |
| --- | --- |
| Client | React 18, TypeScript, Vite, React Router 7, Socket.IO client, Font Awesome |
| Server | Node, Express 4, TypeScript, Socket.IO 4, Mongoose 8, jsonwebtoken, bcryptjs |
| Database | MongoDB |
| Calls | WebRTC with STUN only, no TURN |

## Layout

```
client/   Vite + React app
  src/pages/        login, register, channels (@me), directMessage, servers
  src/components/   sidebar, chat box, friend lists, modals, video call, etc.
  src/providers/    SocketProvider, opens the socket with the stored JWT
server/   Express + Socket.IO API
  src/server.ts     all HTTP routes and socket handlers
  src/services/     auth, friends, direct messages, servers, users
  src/models/       User, Servers, DirectMessages schemas
  src/utils/        JWT helpers and auth middleware
  src/config/       MongoDB connection and JWT secret
```

## Running it locally

You need Node 18 or newer and a MongoDB instance (Atlas free tier works).

### Server

```
cd server
npm install
```

Open `src/config/dbConfig.ts` and set the connection string to your own database. Then:

```
npm run build
npm start
```

The API listens on port 3000. `npm run dev` runs the compiled output under nodemon instead.

The JWT secret in `src/config/jwtConfig.ts` is generated fresh each time the process starts, so every restart logs everyone out. That is fine for development but you will want a fixed secret from an environment variable for anything real.

### Client

```
cd client
npm install
npm run dev
```

Vite serves the app on `http://localhost:5173`. The API base URL is hard coded to the Railway deployment in the page and component files and in `src/providers/socketProvider.tsx`. If you are running the server yourself, search for `discloned.up.railway.app` and swap it for `http://localhost:3000`.

## API

All routes except register, login and refreshToken expect an `Authorization` header carrying the JWT.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/register` | create account |
| POST | `/login` | get access and refresh tokens |
| POST | `/refreshToken` | new access token |
| GET | `/user/info` | current user |
| GET | `/profile/:requestid` | another user's public profile |
| POST | `/friendRequest` | send request by username |
| POST | `/acceptFriendRequest` | accept a pending request |
| GET | `/friendList` | friends with status |
| GET | `/directMessageList` | DM conversations |
| GET | `/directMessage/:recipient` | messages with one user |
| POST | `/sendMessage` | send a DM |
| POST | `/createServer` | new server with a default channel |
| GET | `/serverList` | servers the user belongs to |
| GET | `/serverInfo/:serverid` | server and its channels |
| GET | `/channelInfo/:serverid/:channelid` | channel messages |
| POST | `/channels/sendMessage` | post in a channel |
| POST | `/createChannel` | add a text channel |
| POST | `/serverInviteFriend` | DM a server invite |
| POST | `/friendJoinServer` | accept an invite |

### Socket events

Clients connect with `{ auth: { token } }`. The server joins each socket to a room named after the user id, so pushing to a user is `io.to(userid)`.

Server to client: `updateFriendList`, `receiveMessages`, `receiveChannelMessages`, `newOfferAwaiting`, `answerResponse`, `receivedIceCandidateFromServer`.

Client to server: `newOffer`, `newAnswer`, `sendIceCandidateToServer`.

## Known rough edges

- Call offers are kept in an in memory array on the server and never cleared, so a long running instance will leak them.
- No TURN server, so calls fail between peers behind strict NATs.
- CORS is wide open on both Express and Socket.IO.
- The client has no env file support yet, hence the hard coded API URL.

## License

Apache 2.0, see [LICENSE](LICENSE).
