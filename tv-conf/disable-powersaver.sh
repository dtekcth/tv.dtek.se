#!/bin/sh

export DISPLAY=:0.0

xset s activate >> /home/pi/powersaver.log
xset s off >> /home/pi/powersaver.log

xset -dpms >> /home/pi/powersaver.log
