import { search } from 'google-sr';
import { Client } from '@googlemaps/google-maps-services-js';
import { escape } from 'querystring';
import 'dotenv/config';

// @ts-ignore
import { getIpLocation } from 'ipapi-tools';

const client = new Client({});

export async function GetGoogleQuery(query: string): Promise<Record<string, string>> {
    const response = await search({ query });
    const resp = response.find(x => !x.link?.includes('google.com/maps'))!;

    return {
        link: resp.link || 'https://google.com/search?q=' + escape(query),
        title: resp.title || query,
        description: resp.description || 'Google search for: ' + query
    }
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