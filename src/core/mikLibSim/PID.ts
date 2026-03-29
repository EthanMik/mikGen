export class PID {
    private accumulated_error = 0;
    private previous_error = 0;
    private time_spent_settled = 0;
    private time_spent_running = 0;
    private exiting = false;

    constructor(
        public kp: number,
        public ki: number,
        public kd: number,
        public starti: number,
        public settle_time: number,
        public settle_error: number,
        public timeout: number,
        public exit_error: number,

    ) {}


    public compute(error: number) {
        if (Math.abs(error) < this.starti){
            this.accumulated_error += error;
        }
        if ((error > 0 && this.previous_error < 0) || (error < 0 && this.previous_error > 0)) { 
            this.accumulated_error = 0; 
        }

        const output = this.kp * error + this.ki * this.accumulated_error + this.kd * (error - this.previous_error);

        this.previous_error = error;

        if(Math.abs(error) < this.settle_error) {
            this.time_spent_settled += 1/60 * 1000; // sim is run at 60 fps
        } else {
            this.time_spent_settled = 0;
        }
        if (Math.abs(error) < this.exit_error) {
            this.exiting = true;
        }

        this.time_spent_running += 1/60 * 1000;

        return output;
    }

    public isSettled(): boolean {
        if (this.time_spent_running > this.timeout && this.timeout != 0) {
            return true;
        }
        if (this.time_spent_settled > this.settle_time) {
            return true;
        }
        if (this.exiting) {
            this.exiting = false;
            return true;
        }
        return false;
    }

    public reset() {
        this.exiting = false;
        this.previous_error = 0;
        this.accumulated_error = 0;
        this.time_spent_running = 0;
        this.time_spent_settled = 0;
    }
}