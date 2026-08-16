export class PID {
    private accumulated_error = 0;
    private previous_error = 0;
    private time_spent_settled = 0;
    private time_spent_running = 0;

    constructor(
        /** Seconds per control tick. Settle and timeout windows are milliseconds, so they need it. */
        public dt: number,
        public error: number,
        public kp: number,
        public ki: number,
        public kd: number,
        public starti: number,
        public settle_error = 0,
        public settle_time = 0,
        public timeout = 0,
    ) { }

    compute(error: number) {
        if (Math.abs(error) < this.starti) {
            this.accumulated_error += error;
        }

        if ((error > 0 && this.previous_error < 0) || (error < 0 && this.previous_error > 0)) {
            this.accumulated_error = 0;
        }

        const output = this.kp * error + this.ki * this.accumulated_error + this.kd * (error - this.previous_error);
        this.previous_error = error;

        if (Math.abs(error) < this.settle_error) {
            this.time_spent_settled += this.dt * 1000;
        } else {
            this.time_spent_settled = 0;
        }
        this.time_spent_running += this.dt * 1000;

        return output;
    }

    is_settled() {
        if (this.timeout !== 0 && this.time_spent_running > this.timeout) {
            return true;
        }

        if (this.time_spent_settled > this.settle_time) {
            return true;
        }
        
        return false;
    }

}
