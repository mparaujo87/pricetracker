# PriceTracker – gerar APK

## Opção A: localmente (Windows, macOS ou Linux)

Pré-requisitos:
- Node.js 18+ (https://nodejs.org)
- Android Studio (https://developer.android.com/studio) – já traz o JDK e o Android SDK

Comandos (dentro da pasta do projeto):

    npm install
    npm run build
    npx cap add android
    npx cap sync android

### Gerar o APK pelo Android Studio
    npx cap open android
Depois: Build > Build Bundle(s) / APK(s) > Build APK(s).

### Ou gerar pelo terminal
    cd android
    ./gradlew assembleDebug        (Windows: gradlew.bat assembleDebug)

O APK sai em: android/app/build/outputs/apk/debug/app-debug.apk

Se o Gradle reclamar do Java, defina JAVA_HOME apontando para o JDK 17
(o do Android Studio fica em "jbr" dentro da pasta de instalação).

## Opção B: na nuvem (sem instalar nada)
Envie a pasta para um repositório no GitHub. Em Actions > Build APK > Run workflow,
e baixe o APK em "Artifacts" ao terminar.

## Testar no navegador
    npm run dev
