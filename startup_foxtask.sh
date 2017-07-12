until node foxtask.js; do
    echo "FOXTASK crashed with exit code $?.  Respawning.." >&2
    sleep 1
done