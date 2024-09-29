"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGoogleQuery = GetGoogleQuery;
exports.GetAmazonQuery = GetAmazonQuery;
exports.GetMapsQuery = GetMapsQuery;
//import { search } from 'google-sr';
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const querystring_1 = require("querystring");
const googleapis_1 = require("googleapis");
require("dotenv/config");
// @ts-ignore
const ipapi_tools_1 = require("ipapi-tools");
const client = new google_maps_services_js_1.Client({});
const search = googleapis_1.google.customsearch('v1');
function GetGoogleQuery(query) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const response = yield search.cse.list({
            q: query,
            key: process.env.GOOGLE_SEARCH_API_KEY,
            cx: process.env.GOOGLE_SEARCH_CX_KEY,
            num: 4
        });
        const resp = (_a = response.data.items) === null || _a === void 0 ? void 0 : _a.find(x => { var _a; return !((_a = x.link) === null || _a === void 0 ? void 0 : _a.includes('google.com/maps')); });
        return {
            link: resp.link || 'https://google.com/search?q=' + (0, querystring_1.escape)(query),
            title: resp.title || query,
            description: resp.snippet || 'Google search for: ' + query
        };
    });
}
function GetAmazonQuery(query) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield GetGoogleQuery("amazon " + query);
    });
}
function GetMapsQuery(query, ip) {
    return __awaiter(this, void 0, void 0, function* () {
        const { lat, lon } = yield (0, ipapi_tools_1.getIpLocation)(ip);
        const response = yield client.placesNearby({
            params: {
                location: `${lat},${lon}`,
                keyword: query,
                radius: 20000,
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        }).catch(err => err);
        if (response instanceof Error)
            return (yield GetGoogleQuery("google maps " + query + " near me")).link;
        return response.data.results[0].vicinity;
    });
}
