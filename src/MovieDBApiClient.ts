import {pluck} from "ramda";
import {FetchAdapter} from "./FetchAdapter";

interface DiscoverMovie {
    id: number,
    title: string,
    release_date: string,
    vote_average: string,
}

interface DiscoverResponse {
    results: [DiscoverMovie]
}

type EditorsById = {[key: number]: string[]};

interface CastMember {
    name: string
    known_for_department: string
}

interface CreditsResponse {
    id: number
    cast:[CastMember]
}

export default class MovieDBApiClient {
    fetchOptions = {}
    baseURL = "https://api.themoviedb.org/3"
    fetchAdapter: FetchAdapter = new FetchAdapter()

    constructor(apiKey?: string | null, fetchAdapter?: FetchAdapter | null) {
        this.fetchOptions = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer ' + apiKey
            }
        };
        if(fetchAdapter) this.fetchAdapter = fetchAdapter
    }

    fetchMovies = async (year: number) => {
        const discoverUrl = `${this.baseURL}/discover/movie?include_adult=false&include_video=false&primary_release_year=${year}&language=en-US&page=1&sort_by=popularity.desc`;
        const discoverResponse = await this.fetchAdapter.fetch(discoverUrl, this.fetchOptions)
        const discoverJson = await discoverResponse?.json() as DiscoverResponse
        return discoverJson?.results
    }

    fetchCrewForAllMovies = async(movieResults: DiscoverMovie[]) => {
        const movieIdUrls = movieResults.map((it: DiscoverMovie) => `${this.baseURL}/movie/${it.id}/credits`)
        const movieFetches = movieIdUrls.map(async url => {
            const response = await this.fetchAdapter.fetch(url, this.fetchOptions)
            return await response.json() as CreditsResponse
        })
        return await Promise.all(movieFetches)
    }

    filterByEditors = (movieCredits: CreditsResponse[]) =>
        movieCredits.reduce((acc: EditorsById, it: CreditsResponse)=> {
            const editorsObjects = it.cast.filter(castMember =>
                castMember.known_for_department === "Editing"
            )
            acc[it.id] = pluck("name")(editorsObjects)
            return acc
        }, {} as EditorsById)

   mapMovieResponsesToEditors = (movieResults: DiscoverMovie[], editorsById: EditorsById) =>
        movieResults.map((movie: DiscoverMovie) => {
            const { id, title, release_date, vote_average } = movie
            const editors = editorsById[id] ?? [];
            return { title, release_date, vote_average, editors }
        })
}