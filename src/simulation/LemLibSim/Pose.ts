export class LemPose {
    x: number;
    y: number;
    theta: number;

    constructor(x: number, y: number, theta: number = 0) {
        this.x = x;
        this.y = y;
        this.theta = theta;
    }

    add(other: LemPose): LemPose {
        return new LemPose(this.x + other.x, this.y + other.y, this.theta);
    }

    sub(other: LemPose): LemPose {
        return new LemPose(this.x - other.x, this.y - other.y, this.theta);
    }

    dot(other: LemPose): number {
        return this.x * other.x + this.y * other.y;
    }

    mulScalar(other: number): LemPose {
        return new LemPose(this.x * other, this.y * other, this.theta);
    }

    divScalar(other: number): LemPose {
        return new LemPose(this.x / other, this.y / other, this.theta);
    }

    lerp(other: LemPose, t: number): LemPose {
        return new LemPose(this.x + (other.x - this.x) * t, this.y + (other.y - this.y) * t, this.theta);
    }

    distance(other: LemPose): number {
        return Math.hypot(this.x - other.x, this.y - other.y);
    }

    angle(other: LemPose): number {
        return Math.atan2(other.y - this.y, other.x - this.x);
    }

    rotate(angle: number): LemPose {
        return new LemPose(
            this.x * Math.cos(angle) - this.y * Math.sin(angle),
            this.x * Math.sin(angle) + this.y * Math.cos(angle),
            this.theta
        );
    }

    toString(): string {
        return `LemPose { x: ${this.x}, y: ${this.y}, theta: ${this.theta} }`;
    }
}
