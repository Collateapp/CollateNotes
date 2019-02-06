#!/bin/bash
# This is a build script for electron meant to be run on a mac.
# It will build for all three platforms.
# Make sure to follow the instructions found here:
# https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build
#
# Ensure these packages are installed:
# brew install wine --without-x11
# brew install mono
# brew install gnu-tar graphicsmagick xz
# brew install rpm
# brew install dpkg
# brew install gdrive
# brew install awscli

# Make sure to set aws-cli access keys with `aws configure`

# Echo colored text
# echoc "green" "hello world"
function echoc () {
  case $1 in
    "black" )
      echo -e "\033[0;30m${2}\033[0m\n"
      ;;
    "red" )
      echo -e "\033[0;31m${2}\033[0m\n"
      ;;
    "green" )
      echo -e "\033[0;32m${2}\033[0m\n"
      ;;
    "yellow" )
      echo -e "\033[0;33m${2}\033[0m\n"
      ;;
    "blue" )
      echo -e "\033[0;34m${2}\033[0m\n"
      ;;
    "purple" )
      echo -e "\033[0;35m${2}\033[0m\n"
      ;;
    "cyan" )
      echo -e "\033[0;36m${2}\033[0m\n"
      ;;
    "white" )
      echo -e "\033[0;37m${2}\033[0m\n"
      ;;
    * )
      echo ${2}
      ;;
  esac
}

if [[ $OSTYPE != darwin* ]]
then
  echoc "red" "${OSTYPE} not supported."
  exit 1
fi

clear
echoc "cyan" "********************************\n⁑     Collate Build Script     ⁑\n********************************"
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echoc "green" "Package version: $PACKAGE_VERSION"
echoc "green" "Beginning builds"

echoc "green"  "Clear dist folders"
rm -r ./build/
rm -r ./dist

echoc "green" "Deleting node modules folders"
rm -r ./node_modules/

echoc "green" "Pulling latest from git, master branch"
git pull
git checkout master

echoc "green" "Installing dependencies"
npm install

echoc "green" "Scrape licenses"
npm run scrape:licenses

echoc "green" "Packing and shipping"
npm run publish --verbose

# Write version number to VERSION file for autoupdate
# http://electron.rocks/building-and-deploying-application/
echo "$PACKAGE_VERSION" > ./build/mac/VERSION

echoc "green" "Rearranging build"
mkdir ./build/$PACKAGE_VERSION
mkdir ./build/$PACKAGE_VERSION/linux
mkdir ./build/$PACKAGE_VERSION/win
mkdir ./build/$PACKAGE_VERSION/mac

mv ./build/*.tar.gz ./build/$PACKAGE_VERSION/linux
mv ./build/*.deb ./build/$PACKAGE_VERSION/linux
mv ./build/*.rpm ./build/$PACKAGE_VERSION/linux
mv ./build/*.AppImage ./build/$PACKAGE_VERSION/linux

mv ./build/*.dmg ./build/$PACKAGE_VERSION/mac

mv ./build/*.exe ./build/$PACKAGE_VERSION/win

rm -r ./build/win-unpacked/
rm -r ./build/win-ia32-unpacked
rm -r ./build/linux-unpacked/
rm -r ./build/mac/
rm -r ./build/*.zip
rm -r ./build/*.json
rm -r ./build/*.yml

echoc "yellow" 'Build complete.  Huzzah!'
