until node --prof foxbot-dev-sharded.js; do
    echo "FOXBOT crashed with exit code $?.  Respawning.." >&2
    sleep 1
done