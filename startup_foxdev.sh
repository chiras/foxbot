until node --prof foxbot-dev.js; do
    echo "FOXBOT crashed with exit code $?.  Respawning.." >&2
    sleep 1
done