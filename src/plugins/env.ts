import fastifyEnv from "@fastify/env";
import fastifyPlugin from "fastify-plugin";
import {FastifyInstance} from "fastify";

async function configPlugin(server: FastifyInstance, options: FastifyInstance, done: any) {
    const schema = {
        type: "object",
        required: ["HTTP_PORT", "API_TOKEN"],
        properties: {
            API_TOKEN:{
                type: "string",
                default: ""
            },
            HTTP_PORT: {
                type: "number",
                default: 3000,
            },
            HTTP_HOST: {
                type: "string",
                default: "0.0.0.0",
            },
            DEBUG_LEVEL: {
                type: "number",
                default: 1000,
            },
        },
    };

    const configOptions = {
        confKey: "config",
        schema: schema,
        data: process.env,
        dotenv: true,
        removeAdditional: true,
    };

    return fastifyEnv(server, configOptions, done);
}

// @ts-ignore
export default fastifyPlugin(configPlugin);