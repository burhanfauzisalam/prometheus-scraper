// monitor.js (ESM)
import axios from "axios";
import mysql from "mysql2/promise";
import cron from "node-cron";

const PROMETHEUS_URL = `http://localhost:9090/api/v1/query?query=up{job="blackbox-icmp"}`;
const PROBE_DURATION_SECONDS_URL = `http://localhost:9090/api/v1/query?query=probe_duration_seconds{job="blackbox-icmp"}`;
const db = mysql.createPool({
  port: 3308,
  host: "localhost",
  user: "root",
  password: "mysql123",
  database: "prometheus_data",
});

cron.schedule("* * * * *", async () => {
  probe();
  try {
    const response = await axios.get(PROMETHEUS_URL);
    const results = response.data.data.result;

    for (const item of results) {
      const instance = item.metric.instance;
      const status = parseInt(item.value[1]);

      await db.execute(
        "INSERT INTO server_status (instance, status) VALUES (?, ?)",
        [instance, status]
      );
    }

    console.log("Data inserted at", new Date().toISOString());
  } catch (err) {
    console.error(
      "Error querying Prometheus or writing to MySQL:",
      err.message
    );
  }
});

const probe = async () => {
  try {
    const response = await axios.get(PROBE_DURATION_SECONDS_URL);
    const results = response.data.data.result;

    for (const item of results) {
      const instance = item.metric.instance;
      const status = parseInt(item.value[1]);

      await db.execute(
        "INSERT INTO probe_duration_seconds (instance, status) VALUES (?, ?)",
        [instance, status]
      );
    }
  } catch (error) {
    console.error(
      "Error querying Prometheus or writing to MySQL:",
      err.message
    );
  }
};
