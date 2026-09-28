FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY school-common/pom.xml school-common/
COPY school-service/pom.xml school-service/
COPY data-ingestion-service/pom.xml data-ingestion-service/
COPY . .
ARG SERVICE_MODULE=school-service
RUN mvn clean package -DskipTests -pl school-common,${SERVICE_MODULE} -am

FROM eclipse-temurin:17-jre
WORKDIR /app
ARG SERVICE_MODULE=school-service
COPY --from=build /app/${SERVICE_MODULE}/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]