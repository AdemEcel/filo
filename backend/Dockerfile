#
FROM maven:3.8.4-openjdk-17 AS build

# Çalışma dizinini oluşturuyoruz
WORKDIR /app

#
COPY pom.xml .
RUN mvn dependency:go-offline

#
COPY src ./src
RUN mvn clean package -DskipTests

# Temel imaj olarak OpenJDK kullanıyoruz
FROM openjdk:17-jdk-slim

#
WORKDIR /app

# Uygulama jar dosyasını Docker imajına kopyalıyoruz
COPY --from=build /app/target/filo-kiralama-backend-0.0.1-SNAPSHOT.jar .

# Uygulamanın çalışacağı portu açıyoruz
EXPOSE 8080

# Uygulamayı çalıştırıyoruz
ENTRYPOINT ["java", "-jar", "filo-kiralama-backend-0.0.1-SNAPSHOT.jar"]
