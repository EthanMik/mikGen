import { makeId } from "./Util";

export class Control {
    public id: string;

    public x: number;
    public y: number;
    public heading: number;


    constructor(x: number, y: number, heading: number) {
        this.x = x;
        this.y = y;
        this.heading = heading
        this.id = makeId(10)
    }
}

export class Segment {
    public points: Control[]

    constructor(conte)
}