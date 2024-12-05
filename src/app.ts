import fastify from "fastify";

import indexRoutes from "./routes/index.js";
import envPlugin from "./plugins/env.js";

export default async function appFramework() {
    const server = fastify({ logger: true });
    server.register(envPlugin);
    server.register(indexRoutes);

    await server.ready();

    return server;
}