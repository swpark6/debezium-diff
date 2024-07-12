FROM arm64v8/openjdk:11-jre-slim

ENV KAFKA_VERSION=2.8.0
ENV DEBEZIUM_VERSION=1.8.1.Final

# Install Kafka Connect
RUN apt-get update && apt-get install -y wget jq net-tools dnsutils iputils-ping curl && \
    wget https://archive.apache.org/dist/kafka/${KAFKA_VERSION}/kafka_2.13-${KAFKA_VERSION}.tgz && \
    tar -xzf kafka_2.13-${KAFKA_VERSION}.tgz && \
    mv kafka_2.13-${KAFKA_VERSION} /kafka && \
    rm kafka_2.13-${KAFKA_VERSION}.tgz

# Download Debezium connectors
RUN mkdir -p /kafka/connect/debezium-connector-mysql && \
    wget https://repo1.maven.org/maven2/io/debezium/debezium-connector-mysql/${DEBEZIUM_VERSION}/debezium-connector-mysql-${DEBEZIUM_VERSION}-plugin.tar.gz && \
    tar -xzf debezium-connector-mysql-${DEBEZIUM_VERSION}-plugin.tar.gz -C /kafka/connect/debezium-connector-mysql && \
    rm debezium-connector-mysql-${DEBEZIUM_VERSION}-plugin.tar.gz

WORKDIR /kafka

COPY connect-distributed.properties /kafka/config/

CMD ["/kafka/bin/connect-distributed.sh", "/kafka/config/connect-distributed.properties"]