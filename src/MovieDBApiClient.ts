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

export interface FetchResponse<T = any> {
    ok: boolean;
    status: number;
    json: () => Promise<T>;
    text: () => Promise<string>;
}


export class FetchAdapter {
    constructor() {}

    async fetch<T>(url: string, options?: RequestInit): Promise<FetchResponse<T>> {
        const response = await fetch(url, options);
        return response as FetchResponse<T>;
    }
}

export default class MovieDBApiClient {
    fetchOptions: object
    baseURL = "https://api.themoviedb.org/3"
    fetchAdapter: FetchAdapter = new FetchAdapter()
    constructor(apiKey: string, fetchAdapter: FetchAdapter) {
        this.fetchOptions = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer ' + apiKey
            }
        };
        this.fetchAdapter = fetchAdapter
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
            // @ts-ignore
            acc[it.id] = pluck("name")(editorsObjects)
            return acc
        }, {} as EditorsById)

   mapMovieResponsesToEditors = (movieResults: DiscoverMovie[], editorsById: EditorsById) =>
        movieResults.map((movie: DiscoverMovie) => {
            const { id, title, release_date, vote_average } = movie
            // @ts-ignore
            const editors = editorsById[id] ?? [];
            return { title, release_date, vote_average, editors }
        })
}