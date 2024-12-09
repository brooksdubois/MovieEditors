import MovieDBApiClient, {FetchAdapter, FetchResponse} from "../src/MovieDBApiClient";

class StubFetchAdapter extends FetchAdapter{
    mockResponse: object | null = null
    urlCalledWith: string[] = []
    optionsCalledWith: RequestInit | null = null

    constructor(mockResponse: any) {
        super();
        this.mockResponse = mockResponse;
    }

    async fetch<T>(url: string, options?: RequestInit): Promise<FetchResponse<T>> {
        this.urlCalledWith.push(url)
        this.optionsCalledWith = options ?? null
        return {
            ok: true,
            status: 200,
            json: async () => this.mockResponse as T,
            text: async () => JSON.stringify(this.mockResponse),
        };
    }
}



describe("Testing the dbAPIClient's data processing", () => {
    const dbApiClient = new MovieDBApiClient("abcdToken", new StubFetchAdapter({}))
    test('it filters editors by the editor key in the response', () => {
        const movieCredits = [
            {
                id: 1234,
                cast:[
                    {
                        name: "Brooks DuBois",
                        known_for_department: "Editing"
                    },
                    {
                        name: "Elvis Foster",
                        known_for_department: "Filmer"
                    },
                    {
                        name: "George Clooney",
                        known_for_department: "Editing"
                    }
                ]
            },
            {
                id: 3445,
                cast:[
                    {
                        name: "Brooks DuBois",
                        known_for_department: "Filming"
                    },
                    {
                        name: "Elvis Foster",
                        known_for_department: "Filmer"
                    },
                    {
                        name: "George Clooney",
                        known_for_department: "Editing"
                    }
                ]
            }
        ]

        // @ts-ignore
        const result = dbApiClient.filterByEditors(movieCredits)
        const expected = {
            1234: ["Brooks DuBois", "George Clooney"],
            3445: ["George Clooney"]
        }

        expect(result).toEqual(expected)
    });

    test('it looks up editors by id and merges them into a movie', () => {
        const movieResults = [
            {
                id: 1234,
                title: "Some Movie",
                release_date: "December 1st 2020",
                vote_average: 45.3,
            },
            {
                id: 3445,
                title: "Some Other Movie",
                release_date: "January 30th 2020",
                vote_average: 48.3,
            }
        ]

        const editorsById = {
            1234: ["Brooks DuBois", "George Clooney"],
            3445: ["George Clooney"]
        }

        // @ts-ignore
        const result = dbApiClient.mapMovieResponsesToEditors(movieResults, editorsById)
        const expected = [
            {
                title: "Some Movie",
                release_date: "December 1st 2020",
                vote_average: 45.3,
                editors: ["Brooks DuBois", "George Clooney"]
            },
            {
                title: "Some Other Movie",
                release_date: "January 30th 2020",
                vote_average: 48.3,
                editors: ["George Clooney"]
            }
        ]

        expect(result).toEqual(expected)
    });
})

describe("Testing the dpApiClient's fetches", () => {

    test('fetch has been called with the correct year and tokens', () => {
        const year = 2003
        const fetchStub = new StubFetchAdapter({})
        const dbApiClient = new MovieDBApiClient("abcdToken", fetchStub)
        dbApiClient.fetchMovies(year)
        const headers = {"headers": {"Authorization": "Bearer abcdToken", "accept": "application/json"}, "method": "GET"}
        const expectedURL = `${dbApiClient.baseURL}/discover/movie?include_adult=false&include_video=false&primary_release_year=${year}&language=en-US&page=1&sort_by=popularity.desc`
        expect(fetchStub.urlCalledWith).toContain(expectedURL);
        expect(fetchStub.optionsCalledWith).toEqual(headers)
    });

    test('fetch has been called multiple times for all movies', () => {
        const movieResults = [
            {
                id: 122,
                title: "The Lord of the Rings: The Return of the King",
                release_date: "",
                vote_average: ""
            },
            {
                id: 22,
                title: "Pirates of the Caribbean: The Curse of the Black Pearl",
                release_date: "",
                vote_average: ""
            }
        ]
        const fetchStub = new StubFetchAdapter({})
        const dbApiClient = new MovieDBApiClient("abcdToken", fetchStub)
        dbApiClient.fetchCrewForAllMovies(movieResults)
        const headers = {"headers": {"Authorization": "Bearer abcdToken", "accept": "application/json"}, "method": "GET"}
        const expectedURL1 = `${dbApiClient.baseURL}/movie/122/credits`
        const expectedURL2 = `${dbApiClient.baseURL}/movie/22/credits`
        expect(fetchStub.urlCalledWith).toContain(expectedURL1);
        expect(fetchStub.urlCalledWith).toContain(expectedURL2);
        expect(fetchStub.optionsCalledWith).toEqual(headers)
    });
})