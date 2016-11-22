var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator,
  TouchableOpacity,
  Animated,
  Dimensions
} = React;

var {
  height: deviceHeight
} = Dimensions.get('window');

var TopModal = React.createClass({
  getInitialState: function() {
    return { offset: new Animated.Value(deviceHeight) }
  },
  componentDidMount: function() {
    Animated.timing(this.state.offset, {
      duration: 100,
      toValue: 0
    }).start();
  },
  closeModal: function() {
    Animated.timing(this.state.offset, {
      duration: 100,
      toValue: deviceHeight
    }).start(this.props.closeModal);
  },
  render: function() {
    return (
        <Animated.View style={[styles.modal, styles.flexCenter, {transform: [{translateY: this.state.offset}]}]}>
          <TouchableOpacity onPress={this.closeModal}>
            <Text style={{color: '#FFF'}}>Close Menu</Text>
          </TouchableOpacity>
        </Animated.View>
    )
  }
});
var App = React.createClass({
    render: function() {
      return (
        <View style={styles.flexCenter}>
          <TouchableOpacity onPress={this.props.openModal}>
            <Text>Open Modal</Text>
          </TouchableOpacity>
        </View>
      )
    }
});
var RouteStack = {
  app: {
    component: App
  }
}
var ModalApp = React.createClass({
  getInitialState: function() {
    return {
      modal: false
    };
  },
  renderScene: function(route, navigator) {
    var Component = route.component;
    return (
      <Component openModal={() => this.setState({modal: true})}/>
    )
  },
  render: function() {
    return (
      <View style={styles.container}>
        <Navigator
          initialRoute={RouteStack.app}
          renderScene={this.renderScene}
        />
        {this.state.modal ? <TopModal closeModal={() => this.setState({modal: false}) }/> : null }
      </View>
    );
  }
});
var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    backgroundColor: 'rgba(0,0,0,.8)',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
});
