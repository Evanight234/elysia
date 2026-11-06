import { describe, it, expect } from "bun:test";
import { range, times, timesAsync, chunk, retry } from "./loop";

describe("range", () => {
	it("default start=0", () => {
		expect(range(3)).toEqual([0, 1, 2]);
	});
	it("start, end, step", () => {
		expect(range(0, 10, 3)).toEqual([0, 3, 6, 9]);
	});
	it("empty range", () => {
		expect(range(0)).toEqual([]);
	});
});

describe("times / timesAsync", () => {
	it("maps index", () => {
		expect(times(3, (i) => i * 2)).toEqual([0, 2, 4]);
	});
	it("awaits sequentially", async () => {
		expect(await timesAsync(3, (i) => Promise.resolve(i + 1))).toEqual([1, 2, 3]);
	});
});

describe("chunk", () => {
	it("splits and keeps remainder", () => {
		expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
	});
	it("empty array", () => {
		expect(chunk([], 3)).toEqual([]);
	});
});

describe("retry", () => {
	it("returns value on first success", async () => {
		expect(await retry(() => Promise.resolve("ok"))).toBe("ok");
	});
	it("succeeds after failed attempt", async () => {
		let calls = 0;
		const result = await retry(() => {
			calls++;
			return calls < 2 ? Promise.reject(new Error("boom")) : Promise.resolve("ok");
		}, 3, 1);
		expect(result).toBe("ok");
		expect(calls).toBe(2);
	});
	it("rethrows after last attempt", async () => {
		let calls = 0;
		expect(
			retry(() => {
				calls++;
				return Promise.reject(new Error("dead"));
			}, 3, 1)
		).rejects.toThrow("dead");
		expect(calls).toBe(3);
	});
});
