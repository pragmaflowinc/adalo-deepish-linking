#!/bin/bash
set -e
set -x

isosx() {
  if [[ $OSTYPE == darwin* ]]; then
    return 0 # in bash 0 is true!
  else
    return 1
  fi
}

vsed() {
  if isosx; then
    /usr/bin/sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

dir=$(dirname "${0}")
uriScheme=$("${dir}/get_uri_data.js" uriScheme) 
urlHostname=$("${dir}/get_uri_data.js" urlHostname) 

# AndroidManifest.xml
TARGET_FILEPATH=android/app/src/main/AndroidManifest.xml

SEARCH_PATTERN='.MainActivity'
LINE_NUMBER=$(grep -n "$SEARCH_PATTERN" "$TARGET_FILEPATH" | cut -d ':' -f 1)

LINES_TO_ADD=("            <intent-filter>"
"        <action android:name='android.intent.action.VIEW' \/>"
"        <category android:name='android.intent.category.DEFAULT' \/>"
"        <category android:name='android.intent.category.BROWSABLE' \/>"
"        <data android:scheme='${uriScheme}' android:host='${urlHostname}' \/>"
"      <\/intent-filter>"
)

LINE_TO_APPEND_AFTER=$(grep "$SEARCH_PATTERN" "$TARGET_FILEPATH")
LINE_TO_APPEND_AFTER=$(echo $LINE_TO_APPEND_AFTER | sed -e 's/[]\/$*.^[]/\\&/g')

INDEX=$((${#LINES_TO_ADD[@]}-1))
while [ $INDEX -ge 0 ];
do
  vsed "s/$LINE_TO_APPEND_AFTER/&"$'\\\n'"${LINES_TO_ADD[$INDEX]}/" $TARGET_FILEPATH
  INDEX=$(($INDEX-1))
done

echo "configured android"