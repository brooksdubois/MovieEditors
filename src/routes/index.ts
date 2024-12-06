import fastifyPlugin from "fastify-plugin";
import {FastifyInstance, FastifyReply, FastifyRequest, FastifyServerOptions} from "fastify";
import { yearSchema } from "../schemas/year.js"
import { pluck } from "ramda";

interface YearBody {
    year: number
}

interface DiscoverMovie {
    id: number,
    title: string,
    release_date: string,
    vote_average: string,
}

interface EditorsById {
    id: number
    editors: [string]
}

interface DiscoverResponse {
    results: [DiscoverMovie]
}

interface CastMember {
    name: string
    known_for_department: string
}
interface CreditsResponse {
    id: number
    cast:[CastMember]
}

interface ApiResponse {
    title: string,
    release_date: string,
    vote_average: string,
    editors: [string]
}

async function indexRoutes(server: FastifyInstance, options: FastifyServerOptions) {
    server.post("/",
        { schema: yearSchema},
        async (request: FastifyRequest, reply:FastifyReply) => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer ' + server.config.API_TOKEN
            }
        };
        const body = request.body as YearBody
        const discoverUrl = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&primary_release_year=${body.year}&language=en-US&page=1&sort_by=popularity.desc`;


        const discoverResponse = await fetch(discoverUrl, options)
        const { results: discoverJson } = await discoverResponse.json() as DiscoverResponse

        const movieIdUrls = discoverJson.map((it: DiscoverMovie) => `https://api.themoviedb.org/3/movie/${it.id}/credits`)

        const movieCredits = await Promise.all(
            movieIdUrls.map(async url => {
                const response = await fetch(url, options)
                return await response.json()
            })
        )
        const editorsById = movieCredits.map((it: CreditsResponse)=> {
            const editorsObjects = it.cast.filter(castMember =>
                castMember.known_for_department === "Editing"
            )
            const editors = pluck("name")(editorsObjects)
            return { id: it.id, editors }
        })

        return discoverJson.map(movie => {
            const { id, title, release_date, vote_average } = movie
            const { editors } = editorsById.find(it => it.id == id) ?? { editors: [] }
            return { title, release_date, vote_average, editors }
        })
    });
}

export default fastifyPlugin(indexRoutes);