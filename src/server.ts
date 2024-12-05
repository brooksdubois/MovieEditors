import appFramework from "./app";

declare module 'fastify' {
    interface FastifyInstance {
        config: { // this should be same as the confKey in options
            // specify your typing here
            HTTP_PORT: number,
            HTTP_HOST: string,
            DEBUG_LEVEL: string,
            API_TOKEN: string
        };
    }
}

async function initAppServer() {
    // Trigger the application framework to load
    const app = await appFramework();

    // Start the server
    try {
        await app.listen({
            port: app.config.HTTP_PORT,
            host: app.config.HTTP_HOST,
        });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}
initAppServer()