export class slew {
    private sign = 0;
    private error = 0;
    private x_intercept = 0;
    private y_intercept = 0;
    private slope = 0;
    private last_output = 0;
    private max_speed = 0;
    private is_enabled = false;

    constructor(
        public min_speed: number,
        public distance_to_travel: number,
    ) {}   

    public initialize(enabled: boolean, maximum_speed: number, target: number, current: number) {
        this.is_enabled = maximum_speed < this.min_speed ? false : enabled;
        this.max_speed = maximum_speed;

        this.sign = Math.sign(target - current);
        this.x_intercept = current + ((this.distance_to_travel * this.sign));
        this.y_intercept = this.max_speed * this.sign;
        this.slope = ((this.sign * this.min_speed) - this.y_intercept) / (this.x_intercept - 0 - current);
    }

    public iterate(current: number) {
        if (this.is_enabled) {
            this.error = this.x_intercept - current;

            if (Math.sign(this.error) !== this.sign) {
                this.is_enabled = false;
            } else if (Math.sign(this.error) === this.sign) {
                this.last_output = ((this.slope * this.error) + this.y_intercept) * this.sign;
            }
        } else {
            this.last_output = this.max_speed;
        }

        return this.last_output;
    }
}