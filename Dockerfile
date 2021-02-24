FROM ubuntu:18.04

WORKDIR /usr/local/app

RUN apt-get update
RUN apt-get install -fy curl
RUN apt-get install -fy wget
RUN apt-get install -fy sudo
RUN apt-get install -fy vim
RUN apt-get install -fy gettext-base
RUN apt-get install -fy supervisor

RUN curl -fsSL https://deb.nodesource.com/setup_12.x | sudo -E bash -
RUN apt-get install -y nodejs

RUN wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
RUN apt-get install apt-transport-https
RUN echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list

RUN apt-get update
RUN apt-get install -fy elasticsearch

COPY . .

RUN npm link
RUN shop server:compile

RUN mkdir /config-templates
RUN cp ./.config/supervisord.template.conf /config-templates/supervisord.template.conf
RUN cp ./.config/start.sh /start.sh
RUN chmod 777 /start.sh
RUN cp ./.config/elasticsearch.yml /etc/elasticsearch/elasticsearch.yml

CMD /start.sh