#!/bin/sh

# Author: Chuks Onwuneme
# Script to start node server on reboot
# V1.1

### BEGIN INIT INFO
# Provides:          pillsyenterpriseweb_startup
# Required-Start:    $local_fs $network networking pillsybackend_startup
# Required-Stop:     $local_fs 
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Pillsy Enterprise
# Description:       Pillsy Enterprise Web App service startup script
### END INIT INFO

su - devops /home/devops/projects/Pillsy/PharmacyEnterpriseWebApp/scripts/start_pillsyenterpriseweb_service.sh