until node --prof foxbot-sharded.js; do
    echo "FOXBOT crashed with exit code $?.  Respawning.." >&2
    sleep 1
done
