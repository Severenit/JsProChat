import Hapi from '@hapi/hapi';
import { Server } from 'socket.io';

const port = process.env.PORT || 3001;
const host = process.env.NODE_ENV === 'development' ? 'localhost' : null;

const connection = {};

const init = async () => {
    const server = Hapi.server({
        host,
        port,
        routes: {
            cors: {
                origin: ['*'],
                headers: [
                    'Accept',
                    'Authorization',
                    'Content-Type',
                    'If-None-Match',
                ],
                credentials: true,
                additionalHeaders: ['X-Requested-With'],
            },
        },
    });

    const ioServer = server.listener;
    const io = new Server(ioServer, {
        cors: {
            origin: "*",
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.once('start', (name) => {
            connection[socket.id] = {
                name
            };
            io.emit('chat connection', `${name} is online`);
        });

        socket.on('chat message', (msg) => {
            io.emit('chat message', {
                time: Date.now(),
                name: connection[socket.id]?.name,
                msg
            });
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
            io.emit('chat disconnect', `${connection[socket.id].name} is offline`);
            delete connection[socket.id];
        });
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
// import express from 'express';
// import http from 'http';
// import cors from 'cors';
// import { Server } from 'socket.io';
//
// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"],
//         allowedHeaders: ["my-custom-header"],
//         credentials: true
//     }
// });
//
// app.use(cors({
//     credentials: true,
//     origin: '*'
// }));
//
// app.get('/*', (req, res) => {
//     res.send('Hello World!');
// });
//
//

//
//
//
// server.listen(3001, () => {
//     console.log('listening on *:3001');
// });
