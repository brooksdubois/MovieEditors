
export interface FetchResponse<T = any> {
    ok: boolean;
    status: number;
    json: () => Promise<T>;
    text: () => Promise<string>;
}

export class FetchAdapter {
    async fetch<T>(url: string, options?: RequestInit): Promise<FetchResponse<T>> {
        const response = await fetch(url, options);
        return response as FetchResponse<T>;
    }
}
