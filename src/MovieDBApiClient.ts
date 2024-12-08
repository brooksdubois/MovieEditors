import {pluck} from "ramda";

interface DiscoverMovie {
    id: number,
    title: string,
    release_date: string,
    vote_average: string,
}

interface DiscoverResponse {
    results: [DiscoverMovie]
}

interface EditorsById {
    number: [string]
}

interface CastMember {
    name: string
    known_for_department: string
}

interface CreditsResponse {
    id: number
    cast:[CastMember]
}

export default class MovieDBApiClient {
    fetchOptions: object
    baseURL = "https://api.themoviedb.org/3"

    constructor(apiKey: string) {
        this.fetchOptions = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer ' + apiKey
            }
        };
    }

    fetchMovies = async (year: number) => {
        const discoverUrl = `${this.baseURL}/discover/movie?include_adult=false&include_video=false&primary_release_year=${year}&language=en-US&page=1&sort_by=popularity.desc`;
        return await fetch(discoverUrl, this.fetchOptions)
    }

    movieFetchJson = async (discoverResponse: any) => {
        const discoverJson = await discoverResponse?.json() as DiscoverResponse
        return discoverJson?.results
    }

    fetchCrewForAllMovies = async(movieResults: DiscoverMovie[]) => {
        const movieIdUrls = movieResults.map((it: DiscoverMovie) => `${this.baseURL}/movie/${it.id}/credits`)
        const movieFetches = movieIdUrls.map(async url => {
            const response = await fetch(url, this.fetchOptions)
            return await response.json() as CreditsResponse
        })
        return await Promise.all(movieFetches)
    }

    filterByEditors = (movieCredits: CreditsResponse[]) =>
        movieCredits.reduce((acc: EditorsById, it: CreditsResponse)=> {
            const editorsObjects = it.cast.filter(castMember =>
                castMember.known_for_department === "Editing"
            )
            // @ts-ignore
            acc[it.id] = pluck("name")(editorsObjects)
            return acc
        }, {} as EditorsById)

   mapMovieResponsesToEditors = (movieResults: DiscoverMovie[], editorsById: EditorsById[]) =>
        movieResults.map((movie: DiscoverMovie) => {
            const { id, title, release_date, vote_average } = movie
            const editors = editorsById[id] ?? [];
            return { title, release_date, vote_average, editors }
        })
}