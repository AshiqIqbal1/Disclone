import express, { Request, Response } from "express";
import { loginUser, refreshToken, registerUser } from "./services/auth.js";
import { connectDB } from "./config/dbConfig.js"
import cors from "cors";
import user, { DateOfBirth } from "./models/user.js";
import { acceptFriendRequest, getFriends, sendFriendRequest } from "./services/managingFriends.js";
import { AuthenticatedRequest, authenticateToken, verifyToken } from "./utils/verifyToken.js";
import http from "http";
import { Server } from "socket.io";
import { getDirectMessageList, getUserDirectMessages, sendMessage } from "./services/manageDirectManages.js";
import { getProfileInfo, profileInfo } from "./services/manageUsers.js";
import { createServer, createServerChannel, getChannelInformation, getServerInformation, getServerList, joinFriendServer, textChannelSendMessage } from "./services/manageServers.js";
import Servers, { ServerType } from "./models/servers.js";

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const changeUserStatus = async (userid: string, newStatus: string) => {
    const userOnline = await user.findById(userid);
    userOnline.status = newStatus;
    await userOnline.save();

    userOnline.friends.forEach(
        async (friend) =>  
        io.to(friend.id.toString()).emit("updateFriendList", await getFriends(friend.id.toString()))
    );
}

io.on("connection", async (socket) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        console.log("No token provided. Disconnecting...");
        socket.disconnect();
        return;
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            socket.emit("error", { message: "Forbidden: Invalid token." });
            socket.disconnect();
            return;
        }

        const userid = decoded.id;
        console.log(`User ${userid} connected`);
        changeUserStatus(userid, "Online");
        socket.join(userid);

        socket.on("disconnect", () => {
            changeUserStatus(userid, "Offline");
            console.log(`User ${userid} disconnected`);
        });

        socket.on("offer", (data) => {
            socket.broadcast.emit("offer", data);
        });
    
        socket.on("answer", (data) => {
            socket.broadcast.emit("answer", data);
        });
    
        socket.on("ice-candidate", (data) => {
            socket.broadcast.emit("ice-candidate", data);
        });
    
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });

    } catch (err) {
        console.log("Invalid token. Disconnecting...");
        socket.disconnect();
    }
});

app.get("/", (req, res) => {
    res.send("Hello, Backend is working!");
});

app.post("/register", async (req: Request, res: Response) => {
    try {
        const { email, displayName, username, password, day, month, year } = req.body;
        const dateOfBirth: DateOfBirth = {
            day: day,
            month: month,
            year: year
        }
        const user = await registerUser(email, displayName, username, password, dateOfBirth);
        res.status(201).json({ user: user, message: "User created successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const token: string = await loginUser(email, password);
        res.json({ token: token });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.post("/refreshToken", async (req: Request, res: Response) => {
    try {
        const token = req.header("Authorization");
        const newToken: string = await refreshToken(token);
        res.json({ newToken: newToken });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.get("/user/info", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.user.id;
        const profile: profileInfo = await getProfileInfo(id);
        res.status(201).json({ profile: profile, message: "profile retrieved successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.get("/profile/:requestid", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { requestid } = req.params;
        const profile: profileInfo = await getProfileInfo(requestid);
        res.status(201).json({ profile: profile, message: "profile retrieved successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.post("/friendRequest", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const senderUsername = req.user.username;
        const { username } = req.body;
        await sendFriendRequest(senderUsername, username);

        const sender = await user.findOne({ username: senderUsername });
        const receiver = await user.findOne({ username: username });
        io.to(sender.id).emit("updateFriendList", sender.friends);
        io.to(receiver.id).emit("updateFriendList", receiver.friends);

        res.status(201).json({ message: "Friend request sent successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.post("/acceptFriendRequest", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { friendid } = req.body;
        const id = req.user.id;
        const friends = await acceptFriendRequest(id, friendid);

        const requestingUser = await user.findById(id);
        const receivingUser = await user.findById(friendid);

        io.to(id).emit("updateFriendList", requestingUser.friends);
        io.to(friendid).emit("updateFriendList", receivingUser.friends);

        res.status(201).json({ friends: friends, message: "Friend requests retrieved successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.get("/friendList", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.user.id;
        const friends = await getFriends(id);
        res.status(201).json({ friends: friends, message: "Friends list retrieved successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.get("/directMessageList", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.user.id;
        const directMessages = await getDirectMessageList(id);
        res.status(201).json({ directMessages: directMessages, message: "Direct Messages list retrieved successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.get("/directMessage/:recipient", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.user.id;
        const { recipient } = req.params;
        const directMessages = await getUserDirectMessages(id, recipient);
        res.status(201).json({ directMessages: directMessages, message: "Messages retrieved successfully" });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.post("/sendMessage", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.user.id;
        const { recipient, content } = req.body;
        const newMessage = await sendMessage(id, recipient, "string", content);
        
        io.to(id).emit("receiveMessages", newMessage);
        io.to(recipient).emit("receiveMessages", newMessage);
        res.status(201).json({ message: "Message sent successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.post("/createServer", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.user.id;
        const { name } = req.body;
        await createServer(id, name);
        res.status(201).json({ message: "Message sent successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.get("/serverInfo/:serverid", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { serverid } = req.params;
        const server = await getServerInformation(serverid);
        res.status(201).json({ server: server,  message: "Message sent successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.get("/serverList", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.user.id;
        const serverList = await getServerList(id);
        res.status(201).json({ servers: serverList,  message: "Servers retrieved successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.get("/channelInfo/:serverid/:channelid", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.user.id;
        const { serverid, channelid } = req.params;
        const channel = await getChannelInformation(serverid, channelid, id);
        res.status(201).json({ channel: channel,  message: "Message sent successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.post("/channels/sendMessage", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.user.id;
        const { serverid, channelid, content } = req.body;
        const newMessage = await textChannelSendMessage(serverid, channelid, id, content);

        const server:ServerType | null = await Servers.findOne({ _id: serverid });
        if (!server) {
            throw new Error('Server not found');
        }

        for (let member of server.members) {
            io.to(member.toString()).emit("receiveChannelMessages", newMessage);
        }

        res.status(201).json({ newMessage: newMessage,  message: "Message sent successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.post("/createChannel", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, serverid } = req.body;
        await createServerChannel(name, serverid);
        res.status(201).json({ message: "Message sent successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.post("/serverInviteFriend", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.user.id;
        const { recipient, content } = req.body;
        const newMessage = await sendMessage(id, recipient, "invitation", content);
        
        io.to(id).emit("receiveMessages", newMessage);
        io.to(recipient).emit("receiveMessages", newMessage);
        res.status(201).json({ message: "Message sent successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

app.post("/friendJoinServer", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.user.id;
        const { serverid } = req.body;
        await joinFriendServer(id, serverid);
        res.status(201).json({ message: "Message sent successfully"});
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

connectDB()
    .then(() => {
        server.listen(5001, () => {
            console.log(`Listening to Port 5001`)
        })
    })
    .catch(console.log)
