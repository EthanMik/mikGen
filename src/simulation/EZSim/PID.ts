import { SIM_CONSTANTS } from "../../core/ComputePathSim";

export class PID {
    private output = 0;
    private cur = 0;
    public error = 0;
    private target = 0;
    private prev_current = 0;
    private integral = 0;
    private derivative = 0;

    private i = 0;
    private j = 0;
    private k = 0;

    constructor(
        public kp: number,
        public ki: number,
        public kd: number,
        public start_i: number,
        public small_exit_time: number = 0,
        public small_error: number = 0,
        public big_exit_time: number = 0,
        public big_error: number = 0,
        public velocity_exit_time: number = 0,
    ) {}

    public target_set(input: number) { this.target = input; }
    public target_get() { return this.target; }
    public sensor_set(input: number) { this.prev_current = input; }

    public compute_error(err: number, current: number) {
        this.error = err;
        this.cur = current;

        return this.raw_compute();
    }

    public raw_compute() {
        this.derivative = this.cur - this.prev_current;

        if (this.ki !== 0) {
            if (Math.abs(this.error) < this.start_i) 
                this.integral += this.error;
            if (Math.sign(this.error) !== Math.sign(this.prev_current))
                this.integral = 0;
        }

        this.output = (this.error * this.kp) + (this.integral * this.ki) - (this.derivative * this.kd);

        this.prev_current = this.cur;

        return this.output;
    }

    public compute(current: number): number {
        return this.compute_error(this.target - current, current);
    }

    public timers_reset() {
        this.i = 0;
        this.k = 0;
        this.j = 0;
    }

    public exit_condition() {
        if (this.small_error !== 0) {
            if (Math.abs(this.error) < this.small_error) {
                this.j += SIM_CONSTANTS.dt_ms;
                this.i = 0;
                if (this.j > this.small_exit_time) {
                    this.timers_reset();
                    return "SMALL_EXIT"
                } 
            } else {
                this.j = 0;
            }
        } else if (this.big_error !== 0 && this.big_exit_time !== 0) {
            if (Math.abs(this.error) < this.big_error ) {
                this.i += SIM_CONSTANTS.dt_ms;
                if (this.i > this.big_exit_time) {
                    this.timers_reset();
                    return "BIG_EXIT";
                }
            } else {
                this.i = 0;
            }
        }

        if (this.velocity_exit_time !== 0) {
            if (Math.abs(this.derivative) <= 0.05) {
                this.k += SIM_CONSTANTS.dt_ms;
                if (this.k > this.velocity_exit_time) {
                    this.timers_reset();
                    return "VELOCITY_EXIT";
                }
            } else {
                this.k = 0;
            }
        }

        return "RUNNING";
    }
}
