import React from "react";

const DeepLink = (props) => {
  const incomingUrlLink = useRef('')
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [url, setUrl] = useState("");
  const { color, onInitialUrl, onEventUrl } = props;
  if (global.firstPing === undefined) {
    global.firstPing = true
  }
  useEffect(() => {
    const linkingEventListener = (event) => {
      incomingUrlLink.current = event.url;
      setUrl(`addEventListener:${event.url}`);
    }
    if (global.firstPing) {
      global.firstPing = false
      Linking.getInitialURL().then((value) => {
        if (onInitialUrl) {
          if (value.includes('?')) {
            const [page, extra] = value.split('?')
            onInitialUrl(page, extra)
          } else {
            onInitialUrl(value, '');
          }
        }
        setUrl(`initialUrl${value}`);
        console.log(`initialUrl${value}`);
      });
      }
      Linking.addEventListener("url", linkingEventListener);
      return () => {
        try {
          Linking.removeEventListener("url", linkingEventListener)
        } catch (error) {
          console.log(error)
        }
      };
    
  }, []);
  useEffect(() => {
    if (appState) {
    }
    const handleNextAppState = (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (onEventUrl && incomingUrlLink.current) {
          if (incomingUrlLink.current.includes('?')) {
            const [page, extra] = incomingUrlLink.current.split('?')
            onEventUrl(page, extra)
          } else {
            onEventUrl(incomingUrlLink.current, '');
          }
          incomingUrlLink.current = ''
        }
        console.log("App has come to the foreground!");
      }
  
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log("AppState", appState.current);
    }
    AppState.addEventListener("change", handleNextAppState);

    return () => {
			try {
				AppState.removeEventListener('change', handleNextAppState)
			} catch (error) {
        console.log(error)
			}
    };
  }, []);
  return (
    <View style={styles.wrapper}>
      <Text style={{ color }}>{url}</Text>
      <Text style={{ color }}>{appStateVisible}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DeepLink;
