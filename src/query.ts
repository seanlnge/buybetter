import { search } from 'google-sr';
import { Client } from '@googlemaps/google-maps-services-js';
import { escape } from 'querystring';
import 'dotenv/config';

// @ts-ignore
import { getIpLocation } from 'ipapi-tools';

const client = new Client({});

export async function GetGoogleQuery(query: string): Promise<Record<string, string>> {
    const response = await search({ query });
    const link = response[0].link ?? 'https://google.com/search?q=' + escape(query);
    const title = response[0].title ?? 'Google';
    const description = response[0].description ?? 'Google search for: ' + query;
    return { link, title, description };
}

export async function GetAmazonQuery(query: string): Promise<Record<string, string>> {
    return await GetGoogleQuery("amazon " + query);
}

export async function GetMapsQuery(query: string, ip: string): Promise<string> {
    const { lat, lon } = await getIpLocation(ip);
    const response = await client.placesNearby({
        params: {
            location: `${lat},${lon}`,
            keyword: query,
            radius: 20000,
            key: process.env.GOOGLE_MAPS_API_KEY!,
        },
    }).catch(err => err);

    if(response instanceof Error) return (await GetGoogleQuery("google maps " + query + " near me")).link;

    return response.data.results[0].vicinity!;
}