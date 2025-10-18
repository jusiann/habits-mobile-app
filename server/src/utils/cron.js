import cron from 'cron';
import http from 'http';
import https from 'https';

const job = new cron.CronJob("*/14 * * * *", function () {
    const url = process.env.PROXY_URL;
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    client
        .get(url, (res) => {
            if(res.statusCode === 200)
                console.log(`[CRON - ${time}] Health check successful ${res.statusCode}`);
            else
                console.log(`[CRON - ${time}] Health check failed ${res.statusCode}`);
        }).on('error', (e) => {
            console.error(`[CRON - ${time}] Health check error:`, e.message);
        });
});

export default job;

// CRON JOB EXPLANATION:
// Cron jobs are scheduled tasks that run periodically at fixed intervals
// we want to send 1 GET request for every 14 minutes

// How to define a "Schedule"?
// You define a schedule using a cron expression, which consists of 5 fields representing:

//! MINUTE, HOUR, DAY OF THE MONTH, MONTH, DAY OF THE WEEK
    
//? EXAMPLES && EXPLANATION:
//* 14 * * * * - Every 14 minutes
//* 0 0 * * 0 - At midnight on every Sunday
//* 30 3 15 * * - At 3:30 AM, on the 15th of every month
//* 0 0 1 1 * - At midnight, on January 1st
//* 0  * * * - Every hour
