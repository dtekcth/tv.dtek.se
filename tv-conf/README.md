TV configuration (or how to set up a raspberry pi to work with this project)
=========================

So you want to set up a TV of your own or have someone stolen the Raspberry Pi that was used for the TV 
in Basen. Well continue reading along and you'll learn plenty.

Steps to recreate the Raspberry Pi
-------------

1. Install Rasbian (light version) on a SD card on a Raspberry Pi
2. Put the files in this directory in `/home/pi`. Beware of the dot files! `.config/`, `.bashrc`, `.xinitrc` and `.xserverrc` as well needs to be copied as well!
3. Change user ´pi´ password
4. Go to `/etc/sudoers.d/` and move the shit in the "No password" file to the file `/etc/sudoers` but remove the no password shit.
5. Run this command to install stuff `sudo apt-get update; sudo apt-get dist-upgrade; sudo apt-get install xorg openbox midori`
6. Run `crontab -e` as `pi` user and copy the crontab.txt file contents into it.
7. Setup NOMAD user and password in the nomad.sh file.
7. Profit

Who to complain to
------------------
Emil Hemdal
