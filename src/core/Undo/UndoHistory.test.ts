import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The autosave round trip. saveSnapshot writes the live store to localStorage and FileSchema reads
 * it back at import time, so a state that cannot be read is a white screen on every reload until
 * the user clears storage by hand. These cases are the ones that used to brick it.
 */

let storage: Record<string, string> = {};
vi.stubGlobal("localStorage", {
    getItem: (k: string) => storage[k] ?? null,
    setItem: (k: string, v: string) => { storage[k] = v; },
    removeItem: (k: string) => { delete storage[k]; },
});
const alertSpy = vi.fn();
vi.stubGlobal("alert", alertSpy);

/** Boots a fresh copy of the store modules against whatever is currently in storage. */
async function boot() {
    vi.resetModules();
    const { VALIDATED_APP_STATE } = await import("../FileSchema");
    return VALIDATED_APP_STATE;
}

afterEach(() => {
    storage = {};
    alertSpy.mockClear();
});

describe("autosave", () => {
    it("restores a snapshot it just wrote", async () => {
        const { seedFileFormat } = await import("../FileSchema");
        const { everyKindSegments } = await import("../FileSchema.fixtures");
        const { fileFormatStore } = await import("../../hooks/useFileFormat");
        const { saveSnapshot } = await import("./UndoHistory");

        const before = seedFileFormat({
            format: "LemLib",
            field: "pushback-v5-skills",
            path: { name: "Left-Side-AWP", segments: everyKindSegments("LemLib") },
        });
        fileFormatStore.setState(before);
        saveSnapshot();

        const after = await boot();
        expect(after.format).toBe("LemLib");
        expect(after.field).toBe("pushback-v5-skills");
        expect(after.path.name).toBe("Left-Side-AWP");
        expect(after.path.segments.map(s => s.kind)).toEqual(before.path.segments.map(s => s.kind));
        expect(after.path.segments.map(s => s.constants)).toEqual(before.path.segments.map(s => s.constants));
    });

    it.each([
        ["unparseable json", "{{{"],
        ["an empty string", ""],
        ["a json null", "null"],
        ["a bare array", "[]"],
        ["an unknown format", '{"format":"BananaLib"}'],
        ["an unknown format with a formatDef", '{"format":"BananaLib","formatDef":{"segments":{}}}'],
        ["an unknown segment kind", '{"path":{"segments":[{"kind":"teleport"}]}}'],
        ["a segment with no constants", '{"format":"LemLib","path":{"segments":[{"kind":"bezierCurve"}]}}'],
        ["a non-array segment list", '{"path":{"segments":{}}}'],
        ["a pre-refactor raw snapshot", 'mikGen v1.0.0\n{"format":"mikLib","path":{"name":"p","segments":[]}}'],
    ])("boots on defaults rather than throwing for %s", async (_label, poison) => {
        storage.appState = poison;

        const { expectValidFileFormat } = await import("../FileSchema.fixtures");
        expectValidFileFormat(await boot(), _label);
    });

    it("never interrupts startup with an alert, however bad the saved state", async () => {
        storage.appState = '{"format":"BananaLib","path":{"segments":[{"kind":"teleport"}]}}';
        await boot();

        expect(alertSpy).not.toHaveBeenCalled();
    });
});
