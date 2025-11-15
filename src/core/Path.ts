import { makeId } from "./Util";

export interface Coordinate {
    x: number
    y: number
}

export class Control {
    public id: string;
    public selected: boolean;

    public position: Coordinate
    public heading: number;

    constructor(position: Coordinate, heading = 0) {
        this.position = position
        this.heading = heading
        this.id = makeId(10)
        this.selected = false
    }
}

export interface Segment {
    controls: Control[];
}