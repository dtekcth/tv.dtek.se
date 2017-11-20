#!/bin/sh

USER="user"
PASS="password"

DUCKDNSTOKEN="f91b4cec-aed7-4fda-a41b-cf2d556a9b12"

URL="https://login.nomad.chalmers.se:8003/index.php?zone=nomad"
HOST="'Host: login.nomad.chalmers.se:8003'"
DATA="'auth_user=$USER%2Fnet&auth_pass=$PASS&auth_voucher=&redirurl=https:%2F%2Flogin.nomad.chalmers.se&zone=nomad&accept=Login'"
CONTENTTYPE="'Content-Type: application/x-www-form-urlencoded'"
REFERER="'Referer: https://login.nomad.chalmers.se:8003/index.php?zone=nomad'"

if ping -c 1 google.com >> /dev/null 2>&1; then
    echo "online"
else
    echo ""
    echo ""
    echo "Logging in to nomad!"
    echo ""
    echo ""
    curl $URL -H $HOST -H $CONTENTTYPE -H $REFERER --data $DATA
    echo ""
    echo ""
    echo "Who knows? Maybe it signed in?"
    echo ""
    echo ""
fi

## Updates the IP-address for tvrpi.duckdns.org

echo url="https://www.duckdns.org/update?domains=tvrpi&token=$DUCKDNSTOKEN&ip=" | curl -k -o /home/pi/duck.log -K -
