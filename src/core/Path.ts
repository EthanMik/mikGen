import type { Control } from "./Coordinate";

export class Segment {
    public contols: Control[];

    constructor(controls: Control[]) {
        this.contols = controls
    }
}

