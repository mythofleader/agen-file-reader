"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const openFile = util_1.default.promisify(fs_1.default.open);
const closeFile = util_1.default.promisify(fs_1.default.close);
const readFile = util_1.default.promisify(fs_1.default.read);
class AGenFileReader {
    constructor(params) {
        this.EMPTY = '';
        this.bufferSize = 1024;
        this.offset = 0;
        this.position = 0;
        this.filePath = params.filePath;
        this.delimiter = params.delimiter;
        this.delimiterCharCode = this.delimiter.charCodeAt(0);
    }
    async openFile() {
        this.fd = await openFile(this.filePath, 'r');
    }
    async closeFile() {
        if (this.fd)
            await closeFile(this.fd);
    }
    async readLine() {
        if (!this.fd)
            return this.EMPTY;
        const buffer = Buffer.alloc(this.bufferSize);
        const result = await readFile(this.fd, buffer, this.offset, this.bufferSize, this.position);
        if (result.bytesRead === 0)
            return this.EMPTY;
        const startIdx = 0;
        const endIdx = this.calculateEndIdx(result.buffer, result.bytesRead);
        this.addPosition(endIdx);
        return result.buffer.slice(startIdx, endIdx).toString();
    }
    calculateEndIdx(buffer, bytesRead) {
        if (bytesRead < this.bufferSize)
            return bytesRead;
        const lastIdx = buffer.lastIndexOf(this.delimiterCharCode);
        return lastIdx === -1 ? bytesRead : lastIdx;
    }
    addPosition(lastReadPosition) {
        this.position += lastReadPosition;
    }
    isEmpty(s) {
        return this.EMPTY === s;
    }
    async *read() {
        try {
            await this.openFile();
            while (true) {
                const str = await this.readLine();
                const isEmpty = this.isEmpty(str);
                if (isEmpty)
                    break;
                const results = str.split(this.delimiter);
                for (const result of results) {
                    yield result;
                }
            }
        }
        catch (e) {
            throw e;
        }
        finally {
            await this.closeFile();
        }
    }
}
exports.AGenFileReader = AGenFileReader;
//# sourceMappingURL=reader.js.map