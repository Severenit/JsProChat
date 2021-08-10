import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
const port = process.env.PORT || 3001;

const init = async () => {
    const server = Hapi.server({
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

    await server.register(Inert);

    server.route({
        method: 'GET',
        path: '/',
        handler: () => {
            return 'Hello My Dear Friend!';
        },
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
