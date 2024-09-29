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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGoogleQuery = GetGoogleQuery;
exports.GetAmazonQuery = GetAmazonQuery;
exports.GetMapsQuery = GetMapsQuery;
const googlethis_1 = __importDefault(require("googlethis"));
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const querystring_1 = require("querystring");
// @ts-ignore
const ipapi_tools_1 = require("ipapi-tools");
const client = new google_maps_services_js_1.Client({});
function GetGoogleQuery(query) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const response = yield googlethis_1.default.search(query, { page: 1 });
        console.log('g', response);
        return (_b = (_a = response === null || response === void 0 ? void 0 : response.results[0]) === null || _a === void 0 ? void 0 : _a.url) !== null && _b !== void 0 ? _b : 'https://google.com/search?q=' + (0, querystring_1.escape)(query);
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
        console.log(lat, lon, ip);
        const response = yield client.placesNearby({
            params: {
                location: `${lat},${lon}`,
                keyword: query,
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        }).catch(err => err);
        console.log('m', lat, lon);
        if (response instanceof Error)
            return 'sad';
        return response.data.results[0].vicinity;
    });
}
