import type { EZconstants } from "./EZConstants";
import type { PID } from "./PID";

export function ez_wait(mode: EZconstants["wait"], pid: PID, current_dist: number, chain_target_start: number, chain_constant: number) {
    switch (mode) {
        case "wait": return pid_wait(pid);
        case "wait_quick": return pid_wait_quick(pid, current_dist, chain_target_start);
        case "wait_quick_chain": return pid_wait_quick_chain(pid, current_dist, chain_target_start, chain_constant);
    }
}

function pid_wait(pid: PID): boolean {
    return pid.exit_condition() !== "RUNNING";
}

function pid_wait_quick(pid: PID, current_dist: number, chain_target_start: number): boolean {
    if (Math.sign(chain_target_start - current_dist) !== Math.sign(chain_target_start)) {
        pid.timers_reset();
        return true;
    }
    if (pid.exit_condition() !== "RUNNING") {
        return true;
    }
    return false;
}

let chain_started = false;

function pid_wait_quick_chain(pid: PID, current_dist: number, chain_target_start: number, chain_constant: number): boolean {
    if (!chain_started) {
        chain_started = true;
        pid.target_set(pid.target_get() + chain_constant * Math.sign(chain_target_start));
    }

    if (pid_wait_quick(pid, current_dist, chain_target_start)) {
        chain_started = false;
        return true;
    }

    return false;
}
