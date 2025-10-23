import { makeId } from "./Util";

export interface Coordinate {
    x: number
    y: number
}

export class Control {
    public id: string;

    public position: Coordinate
    public heading: number;

    constructor(position: Coordinate, heading: number) {
        this.position = position
        this.heading = heading
        this.id = makeId(10)
    }
}

// export class Segment {
//     public points: Control[]

//     constructor(conte)
// }