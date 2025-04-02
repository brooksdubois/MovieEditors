import {FetchAdapter, FetchResponse} from "../src/FetchAdapter";

export class StubFetchAdapter extends FetchAdapter {
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
