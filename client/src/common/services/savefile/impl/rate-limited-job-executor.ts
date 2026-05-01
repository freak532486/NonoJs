/**
 * Performs rate limited jobs. For example, if you assign the 'msBetweenExecutions' a time of five seconds, then
 * when queueing a job execution, it will execute as soon as the last job execution was at least five seconds ago.
 */
export default class RateLimitedJobExecutor
{
    private queued: boolean = false;
    private lastJobExecutionTs: number | undefined;

    constructor(
        private readonly job: () => void,
        private readonly msBetweenExecutions: number
    )
    {}

    /**
     * Queues a sync between server savefile and local savefile.
     */
    queue() {
        if (this.queued) {
            return;
        }

        this.queued = true;
        setTimeout(() => this.job(), this.getTimeToSyncMs());
    }

    /**
     * Returns the number of milliseconds until the next sync will happen. Returns 'undefined' if the local and server
     * state are sync and no sync is planned.
     */
    getTimeToSyncMs(): number | undefined
    {
        if (!this.queued) {
            return undefined;
        }

        if (!this.lastJobExecutionTs) {
            return 0;
        }

        const nextSyncTs = this.lastJobExecutionTs + this.msBetweenExecutions;
        return Math.max(0, nextSyncTs - Date.now());
    }

};