"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
app.use(express.static('client'));
app.listen(3000, function () { return console.log('server started'); });
