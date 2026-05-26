let active = false;

export const fileOpLock = {
    acquire() { active = true; },
    release() { active = false; },
    isActive() { return active; },
};
