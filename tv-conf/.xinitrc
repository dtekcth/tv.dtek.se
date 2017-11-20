#!/bin/sh

# Openbox starts Midori browser

./nomad.sh

exec /usr/bin/openbox-session

xset s activate
xset s off

xset -dpms
