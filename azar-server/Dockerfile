# syntax=docker/dockerfile:1

FROM quay.io/quarkus/ubi-quarkus-mandrel-builder-image:23.1-java21 AS build
USER root
ENV MAVEN_VERSION=3.9.9
RUN curl -fsSL https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz \
    | tar -xz -C /opt \
 && ln -s /opt/apache-maven-${MAVEN_VERSION}/bin/mvn /usr/local/bin/mvn

WORKDIR /project
ENV MAVEN_CONFIG=/project/.m2
RUN mkdir -p /project/.m2

COPY pom.xml .
COPY src/ src/

ENV QUARKUS_NATIVE_RESOURCES_INCLUDES=backup/**

# Build native and assert the runner exists. Move it to a known path.
RUN mvn -B \
  -Dquarkus.package.type=native \
  -Dquarkus.native.fail-on-error=true \
  -DskipTests \
  -Dmaven.repo.local=/project/.m2/repository \
  package \
 && echo "==== TARGET CONTENTS ====" && ls -lah target \
 && RUNNER=$(ls -1 target/*-runner 2>/dev/null | head -n1) \
 && test -n "$RUNNER" || (echo "Native runner not found in target/*-runner" && exit 1) \
 && cp "$RUNNER" /project/application \
 && chmod +x /project/application

# ---- Runtime image ----
FROM quay.io/quarkus/quarkus-micro-image:2.0
WORKDIR /work/
COPY --from=build /project/application /work/application
USER 1001
EXPOSE 8080
ENTRYPOINT ["/work/application","-Dquarkus.http.host=0.0.0.0"]
