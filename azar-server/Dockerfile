#
# Stage 1: Build Java JAR using Maven
#
FROM maven:3.9.9-eclipse-temurin-23 AS maven-build
WORKDIR /home/app
COPY src /home/app/src
COPY pom.xml /home/app/
RUN mvn clean package -DskipTests

#
# Stage 2: Compile Native Image using GraalVM
#
FROM ghcr.io/graalvm/graalvm-community:23.0.2-ol8-20250121 AS native-build
WORKDIR /home/app
# The JAR is built with the updated logback.xml (which disables file logging)
COPY --from=maven-build /home/app/target/azar-1.0-jar-with-dependencies.jar /home/app/
RUN native-image --no-fallback \
    --initialize-at-build-time=ch.qos.logback,ch.qos.logback.classic.Logger \
    -jar /home/app/azar-1.0-jar-with-dependencies.jar -o /home/app/azar

#
# Stage 3: Minimal Runtime Image
#
FROM busybox:glibc AS runtime
WORKDIR /app
COPY --from=native-build /home/app/azar /app/azar
EXPOSE 8080
CMD ["/app/azar"]
