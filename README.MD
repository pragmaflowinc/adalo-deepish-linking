# Adalo Deep-ish Linking component

This component allows linking custom uri schemes, page identifiers, and extra data into your Adalo app for processing.

It is called deep-ish linking because it is not a true deep link from the root navigator but a round-about way to simulate true deep linking.

## Motivation

The motivation behind this component was to allow developers and administrators to send out links to their end users which will take them directly into a specific area of an app developed on Adalo.

## Running private

Prerequisites

- NodeJS
- Yarn
- Linux/macOS/WSL

Clone the respository and edit the following
```
./scripts/install_android.sh -- change yourChoosenScheme to what you want you prefix to be. i.e. clicking a link with yourChoosenScheme:// will launch your app

./scripts/install_ios.sh -- same as android

./package.json -- change the "name" from your-company-name-deep-links to something unique to you
```

``` bash
$ yarn                # install dependencies
$ npx adalo login     # login to your adalo account
$ npx adalo publish   # deploy the component privately to your account
```

## How to use the component

Once the component is installed you can drag and drop the deep link component onto your app screen. And configure it as follows

| Name | Type | Description |
| --- | --- | --- |
| `Color` | color | The component displays the uri and event that initiated the deep link. This is used for development purpose so once the system is working as intented set the text color to the background color |
| `Trigger on the inital URL` | action | This action is fired if the application was closed and gets opened by a deep link. You would typically connect this even on the `Welcome Screen` and the `Home Screen` of you application. It will give you the url that was used and  optionally any information after a `?` which can be used for filtering data. Example `pragmaflow://users?smckeown` would raise the action having a url of `pragmaflow://users` which can be used to navigate to a page and the extra parameter `smckeown` which can be used to filter a specific user.
| `Trigger on the event URL` | action | This works the same as the initial URL, however it is called when the application is opened in the background and user clicks a deep link to bring it into the foreground. Due to the way Adalo handles the stack, this should be used on every main page in the app |
