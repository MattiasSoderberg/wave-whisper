FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /usr/local/wave-whisper

COPY pom.xml .
COPY src src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

COPY --from=build /usr/local/wave-whisper/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-Dspring.profiles.active=prod","-jar","/app/app.jar"]