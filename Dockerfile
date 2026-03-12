FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH="${ANDROID_HOME}/build-tools/34.0.0:${ANDROID_HOME}/platform-tools:${PATH}"

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl unzip openjdk-17-jdk-headless nodejs npm \
    && rm -rf /var/lib/apt/lists/*

# Install Android SDK command-line tools
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    curl -o /tmp/cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
    unzip /tmp/cmdline-tools.zip -d ${ANDROID_HOME}/cmdline-tools && \
    mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest && \
    rm /tmp/cmdline-tools.zip

# Accept licenses & install build tools + platform
RUN yes | ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager --licenses && \
    ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager \
    "build-tools;34.0.0" \
    "platforms;android-34"

# App setup
WORKDIR /app
COPY package.json ./
RUN npm install
COPY server.js ./

EXPOSE 3000
CMD ["node", "server.js"]
