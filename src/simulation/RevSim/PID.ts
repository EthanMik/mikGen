export class PID {
    private accumulated_error = 0;
    private previous_error = 0;
    private time_spent_settled = 0;
    private time_spent_large_settled = 0;
    private time_spent_stalled = 0;
    private time_spent_running = 0;
    private exiting = false;

    public sign_reset = true;
    public derivative = 0;

    constructor(
        public dt: number,
        public kp: number,
        public ki: number,
        public kd: number,
        public kf: number,
        public start_i: number,
        public settle_error: number,
        public settle_time: number,
        public large_settle_error: number,
        public large_settle_time: number,
        public exit_error: number,
        public stall_timeout: number,
        public timeout: number,
    ) {}

    public compute(error: number): number {
        if (Math.abs(error) < this.start_i) {
            this.accumulated_error += error;
        }
        if (Math.sign(error) !== Math.sign(this.previous_error) && this.sign_reset) {
            this.accumulated_error = 0;
        }

        const derivative = error - this.previous_error;
        const output =
            this.kp * error +
            this.ki * this.accumulated_error +
            this.kd * derivative +
            this.kf * Math.sign(error);

        this.derivative = derivative;
        this.previous_error = error;

        const ms = this.dt * 1000;

        if (Math.abs(error) < this.settle_error) this.time_spent_settled += ms;
        else this.time_spent_settled = 0;

        if (Math.abs(derivative) < 0.05) this.time_spent_stalled += ms;
        else this.time_spent_stalled = 0;

        if (Math.abs(error) < this.large_settle_error) this.time_spent_large_settled += ms;
        else this.time_spent_large_settled = 0;

        if (Math.abs(error) < this.exit_error && this.exit_error !== 0) {
            this.exiting = true;
        }

        this.time_spent_running += ms;

        return output;
    }

    public isSettled(): boolean {
        if (this.time_spent_stalled > this.stall_timeout && this.stall_timeout !== 0 && this.timeout !== 0) {
            return true;
        }
        if (this.time_spent_running > this.timeout && this.timeout !== 0) {
            return true;
        }
        if (this.time_spent_settled > this.settle_time || this.time_spent_large_settled > this.large_settle_time) {
            return true;
        }
        if (this.exiting) {
            this.exiting = false;
            return true;
        }
        return false;
    }

    public reset() {
        this.accumulated_error = 0;
        this.previous_error = 0;
        this.derivative = 0;
        this.exiting = false;
        this.time_spent_settled = 0;
        this.time_spent_large_settled = 0;
        this.time_spent_stalled = 0;
        this.time_spent_running = 0;
    }
}
