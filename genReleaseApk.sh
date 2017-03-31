#!/bin/sh

mkdir -p android/app/src/main/assets
rm -rf android/app/src/main/assets/index.android.*
react-native bundle --platform android --dev false --entry-file index.android.js  --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
cd ./android && ./gradlew assembleRelease
cd ..
echo `pwd`
if test -e android/app/build/outputs/apk/app-release.apk
then
echo "copy app_release.apk..."
currentDate=`date +%Y%m%d`
apkName="cn.egame.browser-release-"${currentDate}".apk"
cp android/app/build/outputs/apk/app-release.apk ${apkName}
else
echo "app_release.apk doesn't exist"
echo `pwd`
fi
