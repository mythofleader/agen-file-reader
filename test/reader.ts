import path from "path";
import { expect } from 'chai';
import AGenFileReader from "../lib/reader";

describe('AGenFileReader', () => {
    it('read .txt file', async () => {
        const expectResults = [
            "hello_world_1",
            "hello_world_2",
            "hello_world_3",
            "hello_world_4",
            "hello_world_5",
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