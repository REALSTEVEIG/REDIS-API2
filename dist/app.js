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
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const connect_1 = require("./config/connect");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 7000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
function isDataModified() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get("https://pleasant-newt-girdle.cyclic.app/api/modified");
        return response.data.modified;
    });
}
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get("https://pleasant-newt-girdle.cyclic.app/api/users");
        return response.data;
    });
}
app.use("/get-users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let result;
    let isCahed;
    try {
        const data = yield isDataModified();
        if (data === true) {
            result = yield getAllUsers();
            isCahed = false;
            yield connect_1.client.set("all_users", JSON.stringify(result));
        }
        else {
            const isCahedInRedis = yield connect_1.client.get("all_users");
            if (isCahedInRedis) {
                isCahed = true;
                result = JSON.parse(isCahedInRedis);
            }
            else {
                result = yield getAllUsers();
                isCahed = false;
                yield connect_1.client.set("all_users", JSON.stringify(result));
            }
        }
        return res.status(200).json({
            isCahed,
            result: result
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
}));
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield connect_1.client.connect();
        app.listen(PORT, () => {
            console.log(`Server is connected to redis and is listening on port ${PORT}`);
        });
    }
    catch (error) {
        console.log(error);
    }
});
start();
