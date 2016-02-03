# Dockerfile
FROM quay.io/aptible/autobuild
RUN echo deb http://apt.newrelic.com/debian/ newrelic non-free >> /etc/apt/sources.list.d/newrelic.list
RUN wget -O- https://download.newrelic.com/548C16BF.gpg | apt-key add -
RUN apt-get update
RUN apt-get install -y build-essential 
RUN apt-get install -y checkinstall 
RUN apt-get install -y libkrb5-dev
RUN apt-get install -y apt-utils
RUN apt-get install -y npm
RUN apt-get install -y newrelic-sysmond
RUN npm install -g supervisor
RUN nrsysmond-config --set license_key=c38bcc171584b20163e71d7411e42770bf7e791f
RUN /etc/init.d/newrelic-sysmond start
RUN lsb_release -a

ENV PORT 3200
EXPOSE 3200