import * as fs from 'fs';

class OpenFileError extends Error {}
class CloseFileError extends Error {}
class ReadFileError extends Error {}

interface AGenFileReaderConstructor {
    readonly filePath: string;
    readonly delimiter: string;
}

export default class AGenFileReader {
    private readonly filePath: string;
    private readonly delimiter: string;

    private readonly defaultOffset: number = 0;
    private readonly defaultReadCharLen: number = 1;
    private readonly emptyChar: string = '';
    private buffer: Array<string> = [];
    private position: number = 0;
    private fd: number | undefined;

    constructor(params: AGenFileReaderConstructor) {
        this.filePath = params.filePath;
        this.delimiter = params.delimiter;
    }

    private openFile(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.open(this.filePath, 'r', (err, fd) => {
                if (err) return reject(new OpenFileError(err.message));

                this.fd = fd;
                return resolve();
            });
        });
    }

    private closeFile(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.close(this.fd!, (err) => {
                if (err) return reject(new CloseFileError(err.message));

                return resolve();
            });
        });
    }

    private readChar(position: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const buffer = Buffer.alloc(this.defaultReadCharLen);

            fs.read(this.fd!, buffer, this.defaultOffset, this.defaultReadCharLen, position, (err, byteRead, results) => {
                if (err) return reject(new ReadFileError(err.message));

                const char = this.isRead(byteRead)
                    ? results.toString()
                    : this.emptyChar;
                
                return resolve(char);
            });
        });
    }

    private isRead(byteRead: number) {
        return this.defaultReadCharLen === byteRead;
    }

    private isEmptyChar(c: string) {
        return this.emptyChar === c;
    }

    private isDelimiter(c: string) {
        return this.delimiter === c;
    }

    private saveBuffer(c: string) {
        this.buffer.push(c);
    }

    private flushBuffer(): string {
        return this.buffer.join('');
    }

    private initBuffer() {
        this.buffer = [];
    }

    private nextPosition() {
        this.position++;
    }

    async *read(): AsyncIterableIterator<string> {
        try {
            await this.openFile();

            while (true) {
                const char = await this.readChar(this.position);
                const isEmpty = this.isEmptyChar(char);
                const isDelimiter = this.isDelimiter(char);

                if (isEmpty || isDelimiter) {
                    yield this.flushBuffer();
                    if (isEmpty) break;
                    else this.initBuffer();
                } else {
                    this.saveBuffer(char);
                }

                this.nextPosition();
            }
        } catch (e) {
            throw e;
        } finally {
            await this.closeFile();
        }
    }
}