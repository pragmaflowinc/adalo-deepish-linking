#!/bin/bash
set -e
set -x

dir=$(dirname "${0}")
uriScheme=$("${dir}/get_uri_data.js" uriScheme) 
urlHostname=$("${dir}/get_uri_data.js" urlHostname) 

name=$PROJECT_NAME

plutil -insert CFBundleURLTypes -xml "
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>$uriScheme</string>
    </array>
  </dict>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>$uriHostname</string>
    </array>
  </dict>
</array>" ios/$name/Info.plist

echo "configured iOS"