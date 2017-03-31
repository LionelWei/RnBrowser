#!/bin/sh

mkdir -p android/app/src/main/assets
rm -rf android/app/src/main/assets/index.android.*
react-native bundle --platform android --dev false --entry-file index.android.js  --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
cd ./android && ./gradlew assembleDebug
cd ..
echo `pwd`
if test -e android/app/build/outputs/apk/app-debug.apk
then
echo "copy app_debug.apk..."
currentDate=`date +%Y%m%d`
apkName="cn.egame.browser-debug-"${currentDate}".apk"
cp android/app/build/outputs/apk/app-debug.apk ${apkName}
else
echo "app_debug.apk doesn't exist"
echo `pwd`
fi
