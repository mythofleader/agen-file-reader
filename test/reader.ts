import * as path from "path";
import { expect } from 'chai';
import { AGenFileReader } from "../lib/reader";

describe('AGenFileReader', () => {
    it('read .txt file', async () => {
        const expectResults = [
            "hello",
            "😀 😁",
            "안녕",
            "你好",
            "こんにちは",
            "Olá",
        ];
        const results = [];

        const filePath = path.resolve(__dirname, './test.txt');
        const delimiter = '\n';
        const reader = new AGenFileReader({ filePath, delimiter });
        for await (const result of reader.read()) {
            results.push(result);
        }

        expect(results).to.deep.equal(expectResults);
    });
});
