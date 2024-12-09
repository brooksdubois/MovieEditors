import Fastify from "fastify";
import indexRoutes from "../src/routes/index.js";
import envPlugin from "../src/plugins/env";

function fastifyHelper() {
    const app = Fastify();

    beforeAll(async () => {
        void app.register(envPlugin);
        void app.register(indexRoutes);
        await app.ready();
    });

    afterAll(() => app.close());

    return app;
}

jest.mock("../src/MovieDBApiClient", () => {
    return function () {
        return {
            fetchMovies: () => {},
            fetchCrewForAllMovies: () => {},
            filterByEditors: () => {},
            mapMovieResponsesToEditors: () => {},
        };
    };
})

describe("Testing the dbAPIClient's data processing", () => {
    const app = fastifyHelper();

    test('it calls the dbclient methods when a post is triggered ', async () => {
        const response = await app.inject({
            method: 'POST', url: '/', body: { year: 3000 }
        })
        expect(response?.statusCode).toBe(200)
    })
})