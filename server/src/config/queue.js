const { Queue, Worker } = require('bullmq');
const env = require('./env');
const orchestrator = require('../agents/orchestrator');

let executionQueue = null;
let executionWorker = null;
let useRedis = false;

function initQueue() {
  if (env.REDIS_URL) {
    try {
      console.log('🔌 Connecting to Redis instance for BullMQ background queues...');
      const connection = {
        url: env.REDIS_URL,
      };

      // 1. Create Queue
      executionQueue = new Queue('workflow-execution', { connection });

      // 2. Create Worker to process orchestrator jobs
      executionWorker = new Worker(
        'workflow-execution',
        async (job) => {
          console.log(`👷 Worker picked up execution run job ${job.data.executionId}`);
          await orchestrator.executeWorkflowRun(job.data.executionId);
        },
        { connection }
      );

      executionWorker.on('failed', (job, err) => {
        console.error(`❌ Background Job ${job?.id} failed:`, err);
      });

      useRedis = true;
      console.log('✅ BullMQ background queue initialized successfully.');
    } catch (err) {
      console.error('⚠️  Failed to initialize Redis BullMQ, falling back to in-memory setImmediate:', err);
    }
  } else {
    console.log('⚠️  REDIS_URL not configured. Using asynchronous in-memory execution loop for execution runs.');
  }
}

/**
 * Add an execution run job to the queue
 */
async function addExecutionJob(executionId) {
  if (useRedis && executionQueue) {
    console.log(`Queueing execution ${executionId} on BullMQ...`);
    await executionQueue.add('execute', { executionId }, { removeOnComplete: true });
  } else {
    // Fallback: trigger immediately in background thread asynchronously
    console.log(`Executing execution ${executionId} in-memory asynchronously...`);
    setImmediate(() => {
      orchestrator.executeWorkflowRun(executionId).catch((err) => {
        console.error('Background orchestrator task failed:', err);
      });
    });
  }
}

module.exports = {
  initQueue,
  addExecutionJob,
};
