export class LemTimer {
    private period: number;
    private timeWaited: number = 0;
    private paused: boolean = false;

    constructor(time: number) {
        this.period = time;
    }

    public update(dt: number): void {
        if (!this.paused) this.timeWaited += dt * 1000;
    }

    public getTimeSet(): number {
        return this.period;
    }

    public getTimeLeft(): number {
        const delta = this.period - this.timeWaited;
        return delta > 0 ? delta : 0;
    }

    public getTimePassed(): number {
        return this.timeWaited;
    }

    public isDone(): boolean {
        return this.timeWaited >= this.period;
    }

    public isPaused(): boolean {
        return this.paused;
    }

    public set(time: number): void {
        this.period = time;
        this.reset();
    }

    public reset(): void {
        this.timeWaited = 0;
    }

    public pause(): void {
        this.paused = true;
    }

    public resume(): void {
        this.paused = false;
    }
}
