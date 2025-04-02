import fastifyPlugin from "fastify-plugin";
import {FastifyInstance, FastifyReply, FastifyRequest, FastifyServerOptions} from "fastify";
import { yearSchema } from "../schemas/year.js"
import MovieDBApiClient from "../MovieDBApiClient";

interface YearBody {
    year: number
}


async function indexRoutes(server: FastifyInstance, options: FastifyServerOptions) {

    server.post("/", { schema: yearSchema }, async (request: FastifyRequest, reply:FastifyReply) => {
        const { year } = request.body as YearBody
        const movieDBClient = new MovieDBApiClient(server.config.API_TOKEN)
        const movieResults= await movieDBClient.fetchMovies(year)
        const movieCredits = await movieDBClient.fetchCrewForAllMovies(movieResults)
        const editorsById = movieDBClient.filterByEditors(movieCredits)
        return movieDBClient.mapMovieResponsesToEditors(movieResults, editorsById)
    });
}

export default fastifyPlugin(indexRoutes);