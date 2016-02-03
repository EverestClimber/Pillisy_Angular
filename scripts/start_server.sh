#!/bin/sh

# Author: Chuks Onwuneme
# Script to start node server on reboot
# V1.0

supervisor /home/devops/projects/Pillsy/PillsyEnterpriseWebApp/bin/www 2>&1 | logrotate-stream /home/devops/projects/Pillsy/PillsyEnterpriseWebApp/logs/server.log --keep 5 --size '100k' --compress &
