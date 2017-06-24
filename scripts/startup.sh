#!/bin/sh

# Author: Chuks Onwuneme
# Script to start node server on reboot
# V1.1

### BEGIN INIT INFO
# Provides:          pillsy
# Required-Start:    $local_fs $network networking
# Required-Stop:     $local_fs 
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Pillsy service
# Description:       Pillsy service startup script
### END INIT INFO

su - devops /home/devops/projects/Pillsy/PillsyEnterpriseWebApp/scripts/start_server.sh
