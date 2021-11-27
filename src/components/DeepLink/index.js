import React, { useRef, useState, useEffect, Component, useContext } from "react";
import PropTypes from 'prop-types'
import { AppState, View, Text, StyleSheet, Linking, Button } from 'react-native'
import { actionContextTypes } from '@protonapp/proton-runner/lib/utils/actions'
import { connect } from 'react-redux'

const DeepLinker = (props) => {
  if (props.editor) {
    return <DeepLinking {...props} />
  } else {
    return <ConnectedDeepLinking {...props} />
  }
}

function recusiveLinkSearch(parts, depth, links, params) {
  const shallowCopyParts = [...parts]
  const part = shallowCopyParts.shift()
  let newParams = {...params}
  const matches = links.filter(link => {
    if (!link.pieces[depth]) { return; }
    const isMatch = link.pieces[depth] === part || (link.pieces[depth].startsWith('{') && !isNaN(part))
    Object.keys(link.params).forEach(key => link.params[key] = +part)
    if (isMatch && link.pieces.length === depth + 1) {
      newParams = {
        ...newParams,
        ...link.params
      }
    }
    return isMatch
  })
  if (matches.length === 0) {
    return null
  } else if (shallowCopyParts.length > 0) {
    return recusiveLinkSearch(shallowCopyParts, depth + 1, matches, newParams)
  }
  const exactMatch = matches.find(match => match.pieces.length === parts.length)
  if (exactMatch) {
    return [exactMatch, newParams]
  }
  return null
}

class DeepLinking extends Component {
  static contextTypes = {
    ...actionContextTypes,
  }

  constructor(props) {
    super(props)

    this._handleOpenURL = this._handleOpenURL.bind(this);
    this.findLink = this.findLink.bind(this);
  }

  _handleOpenURL(event) {
    if (this.props.topScreen) {
      this.findLink(event.url)
    }
  }

  findLink(url) {
    let { getBindings, navigate } = this.context
    const { getApp } = this.context
    let app = getApp()
    const deeplinks = Object.keys(app.components).flatMap(key => {
      const elements = app.components[key].objects.filter(element => element.libraryName === "adalo-deep-links")
      let params = {}
      Object.keys(app.components[key].dataBindings).forEach(bindingKey => {
        const binding = app.components[key].dataBindings[bindingKey]
        if (binding.source?.source?.selector.type === "ROUTE_PARAM_SELECTOR") {
          params[`${binding.source?.source?.datasourceId}.${binding.source?.source.tableId}`] = 0
        }
      }) 
      return elements.map(element => ({
        ...element,
        pieces: element.attributes.urlPath.split('/'),
        screenId: key,
        params
      }))  
    })
    const path = url.replace(`${this.props.uriScheme}://${this.props.urlHostname}/`, '')
    const pathPieces = path.split('/')
    const [link, params] = recusiveLinkSearch(pathPieces, 0, deeplinks, {})
    if (link) {
      navigate({ 
        target: link.screenId, 
        transition: "TRANSITION_NONE",
        params: params
      })
    }
  }

  componentDidMount() {
    Linking.getInitialURL().then((url) => {
      if (global.appLoaded === undefined && this.props.topScreen) {
        global.appLoaded = true
        if (url) {
          this.findLink(url)
        }
      }
    }).catch(err => console.error('An error occurred', err));

    Linking.addEventListener('url', this._handleOpenURL);
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this._handleOpenURL);
  }

  render() {
    if (this.props.editor) {
      return (
        <Text>{this.props.uriScheme}://{this.props.urlHostname}/{this.props.urlPath}</Text>
      )
    } else { 
      return <View />
    }
  }
}

const mapStateToProps = (state) => ({ 
	state,
})

const mapDispatchToProps  = (dispatch) => ({ 
	dispatch,
})

const ConnectedDeepLinking = connect(mapStateToProps, mapDispatchToProps)(DeepLinking)

const DeepLink = (props) => {
  const context = useContext(MyContext)
  const incomingUrlLink = useRef('')
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [url, setUrl] = useState("");
  const [app, setApp] = useState({});
  const { color, onInitialUrl, onEventUrl } = props;
  if (global.firstPing === undefined) {
    global.firstPing = true
  }

  useEffect(() => {
    
  // setApp(context.getApp())
  // console.log(context)
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
  console.log(context)
  return (
    <View style={styles.wrapper}>
      <Text style={{ color }}>{url}</Text>
      <Text style={{ color }}>{appStateVisible}</Text>
      <Text>{context.getApp()}</Text>
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

export default DeepLinker;