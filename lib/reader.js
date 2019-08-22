"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class Chunk {
    constructor() {
        this.tempStorage = [];
    }
    init() {
        this.tempStorage = [];
    }
    save(c) {
        this.tempStorage.push(c);
    }
    flush() {
        return this.tempStorage.join(' ');
    }
}
class AGenFileReader {
    constructor(params) {
        this.EMPTY_CHAR = '';
        this.filePath = params.filePath;
        this.delimiter = params.delimiter;
        this.readConfig = {
            offset: 0,
            position: 0,
            readCharLen: 1,
        };
    }
    async openFile() {
        this.fileHandle = await fs_1.promises.open(this.filePath, 'r');
    }
    async closeFile() {
        if (this.fileHandle)
            await this.fileHandle.close();
    }
    async readChar(position) {
        const buffer = Buffer.alloc(this.readConfig.readCharLen);
        const result = await this.fileHandle.read(buffer, this.readConfig.offset, this.readConfig.readCharLen, position);
        return this.isRead(result.bytesRead)
            ? result.buffer.toString()
            : this.EMPTY_CHAR;
    }
    isRead(byteRead) {
        return this.readConfig.readCharLen === byteRead;
    }
    isEmptyChar(c) {
        return this.EMPTY_CHAR === c;
    }
    isDelimiter(c) {
        return this.delimiter === c;
    }
    nextPosition() {
        this.readConfig.position++;
    }
    async *read() {
        try {
            await this.openFile();
            this.chunk = new Chunk();
            while (true) {
                const char = await this.readChar(this.readConfig.position);
                const isEmpty = this.isEmptyChar(char);
                const isDelimiter = this.isDelimiter(char);
                if (isEmpty || isDelimiter) {
                    yield this.chunk.flush();
                    if (isEmpty)
                        break;
                    this.chunk.init();
                }
                else {
                    this.chunk.save(char);
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