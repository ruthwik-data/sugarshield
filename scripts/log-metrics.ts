import * as fs from 'fs';
import * as path from 'path';

interface MetricEntry {
    app_name: string;
    scenario: string;
    version: 'baseline' | 'improved';
    metric_name: string;
    metric_value: number;
    timestamp: string;
    notes?: string;
}

const LOG_PATH = path.join(process.cwd(), 'metrics-log.csv');

export function logMetric(entry: MetricEntry) {
    const header = 'app_name,scenario,version,metric_name,metric_value,timestamp,notes\n';
    const row = [
        entry.app_name,
        entry.scenario,
        entry.version,
        entry.metric_name,
        entry.metric_value,
        entry.timestamp,
        `"${(entry.notes ?? '').replace(/"/g, '""')}"`
    ].join(',') + '\n';

    if (!fs.existsSync(LOG_PATH)) {
        fs.writeFileSync(LOG_PATH, header);
    }
    fs.appendFileSync(LOG_PATH, row);
    console.log(`✅ Logged: ${entry.app_name} | ${entry.scenario} | ${entry.metric_name}=${entry.metric_value}`);
}
