export class LemExitCondition {
    private range: number;
    private time: number;
    private timeInRange: number = 0;
    private done: boolean = false;

    constructor(range: number, time: number) {
        this.range = range;
        this.time = time;
    }

    getExit(): boolean {
        return this.done;
    }

    update(input: number, dt: number): boolean {
        if (Math.abs(input) > this.range) {
            this.timeInRange = 0;
        } else {
            this.timeInRange += dt * 1000;
            if (this.timeInRange >= this.time) this.done = true;
        }
        return this.done;
    }

    reset(): void {
        this.timeInRange = 0;
        this.done = false;
    }
}
