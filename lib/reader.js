"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
class OpenFileError extends Error {
}
class CloseFileError extends Error {
}
class ReadFileError extends Error {
}
class AGenFileReader {
    constructor(params) {
        this.defaultOffset = 0;
        this.defaultReadCharLen = 1;
        this.emptyChar = '';
        this.buffer = [];
        this.position = 0;
        this.filePath = params.filePath;
        this.delimiter = params.delimiter;
    }
    openFile() {
        return new Promise((resolve, reject) => {
            fs.open(this.filePath, 'r', (err, fd) => {
                if (err)
                    return reject(new OpenFileError(err.message));
                this.fd = fd;
                return resolve();
            });
        });
    }
    closeFile() {
        return new Promise((resolve, reject) => {
            fs.close(this.fd, (err) => {
                if (err)
                    return reject(new CloseFileError(err.message));
                return resolve();
            });
        });
    }
    readChar(position) {
        return new Promise((resolve, reject) => {
            const buffer = Buffer.alloc(this.defaultReadCharLen);
            fs.read(this.fd, buffer, this.defaultOffset, this.defaultReadCharLen, position, (err, byteRead, results) => {
                if (err)
                    return reject(new ReadFileError(err.message));
                const char = this.isRead(byteRead)
                    ? results.toString()
                    : this.emptyChar;
                return resolve(char);
            });
        });
    }
    isRead(byteRead) {
        return this.defaultReadCharLen === byteRead;
    }
    isEmptyChar(c) {
        return this.emptyChar === c;
    }
    isDelimiter(c) {
        return this.delimiter === c;
    }
    saveBuffer(c) {
        this.buffer.push(c);
    }
    flushBuffer() {
        return this.buffer.join('');
    }
    initBuffer() {
        this.buffer = [];
    }
    nextPosition() {
        this.position++;
    }
    async *read() {
        try {
            await this.openFile();
            while (true) {
                const char = await this.readChar(this.position);
                const isEmpty = this.isEmptyChar(char);
                const isDelimiter = this.isDelimiter(char);
                if (isEmpty || isDelimiter) {
                    yield this.flushBuffer();
                    if (isEmpty)
                        break;
                    else
                        this.initBuffer();
                }
                else {
                    this.saveBuffer(char);
                }
                this.nextPosition();
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
exports.default = AGenFileReader;
//# sourceMappingURL=reader.js.map