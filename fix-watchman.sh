#!/bin/bash

# Stop watchman service if running
watchman shutdown-server

# Clear watchman cache
rm -rf ~/Library/Caches/Watchman/*
rm -rf ~/.watchman

# Create a launchd.conf file to increase limits for the current session
echo "limit maxfiles 524288 524288" | sudo tee -a /etc/launchd.conf > /dev/null

# Apply limits for current session
sudo launchctl limit maxfiles 524288 524288

# Restart watchman
watchman watch-del-all
watchman shutdown-server 