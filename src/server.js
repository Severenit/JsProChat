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
        connection[socket.id] = {};

        socket.once('start', (name) => {
            if (name) {
                connection[socket.id] = {
                    name
                };
                io.emit('chat connection', {
                    time: Date.now(),
                    msg: `${name} is online`,
                    id: socket.id,
                });
            }
        });

        io.emit('chat online', {
            time: Date.now(),
            online: Object.keys(connection).length,
            names: Object.keys(connection).map(item => ({
                id: item,
                name: connection[item],
            }))
        });

        socket.on('chat message', (msg) => {
            io.emit('chat message', {
                time: Date.now(),
                name: connection[socket.id]?.name,
                msg,
                id: socket.id,
            });
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
            io.emit('chat disconnect', {
                time: Date.now(),
                msg: `${connection[socket.id]?.name} is offline`,
                id: socket.id,
            });
            delete connection[socket.id];
            io.emit('chat online', {
                time: Date.now(),
                online: Object.keys(connection).length,
                names: Object.keys(connection).map(item => ({
                    id: item,
                    name: connection[item],
                }))
            });
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
