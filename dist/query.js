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
const google_sr_1 = require("google-sr");
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const querystring_1 = require("querystring");
require("dotenv/config");
// @ts-ignore
const ipapi_tools_1 = require("ipapi-tools");
const client = new google_maps_services_js_1.Client({});
function GetGoogleQuery(query) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const response = yield (0, google_sr_1.search)({ query });
        const link = (_a = response[0].link) !== null && _a !== void 0 ? _a : 'https://google.com/search?q=' + (0, querystring_1.escape)(query);
        const title = (_b = response[0].title) !== null && _b !== void 0 ? _b : 'Google';
        const description = (_c = response[0].description) !== null && _c !== void 0 ? _c : 'Google search for: ' + query;
        return { link, title, description };
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
