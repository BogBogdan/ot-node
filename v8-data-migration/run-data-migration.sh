cd /root/ot-node/current/v8-data-migration/ &&
npm rebuild sqlite3 &&
nohup node v8-data-migration.js > /root/ot-node/data/data-migration/logs/nohup.out 2>&1 &