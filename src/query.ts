import google from 'googlethis';
import { Client } from '@googlemaps/google-maps-services-js';
import { escape } from 'querystring';

// @ts-ignore
import { getIpLocation } from 'ipapi-tools';

const client = new Client({});

export async function GetGoogleQuery(query: string): Promise<string> {
    const response = await google.search(query, { page: 1 });
    console.log('g', response);
    return response?.results[0]?.url ?? 'https://google.com/search?q=' + escape(query);
}

export async function GetAmazonQuery(query: string): Promise<string> {
    return await GetGoogleQuery("amazon " + query);
}

export async function GetMapsQuery(query: string, ip: string): Promise<string> {
    const { lat, lon } = await getIpLocation(ip);
    console.log(lat, lon, ip);

    const response = await client.placesNearby({
        params: {
            location: `${lat},${lon}`,
            keyword: query,
            key: process.env.GOOGLE_MAPS_API_KEY!,
        },
    }).catch(err => err);
    console.log('m', lat, lon);
    if(response instanceof Error) return 'sad';

    return response.data.results[0].vicinity!;
}