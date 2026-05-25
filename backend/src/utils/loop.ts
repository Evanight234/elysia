export function range(start: number, end?: number, step = 1): number[] {
    if (end === undefined) {
        end = start;
        start = 0;
    }
    const result: number[] = [];
    for (let i = start; i < end; i += step) {
        result.push(i);
    }
    return result;
}

export function times<T>(n: number, fn: (i: number) => T): T[] {
    return Array.from({ length: n }, (_, i) => fn(i));
}

export async function timesAsync<T>(n: number, fn: (i: number) => Promise<T>): Promise<T[]> {
    const results: T[] = [];
    for (let i = 0; i < n; i++) {
        results.push(await fn(i));
    }
    return results;
}

export function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

export async function retry<T>(
    fn: () => Promise<T>,
    attempts = 3,
    delay = 1000
): Promise<T> {
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === attempts - 1) throw error;
            await new Promise(r => setTimeout(r, delay * (i + 1)));
        }
    }
    throw new Error("unreachable");
}
