var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var Redirect = Router.Redirect;
var Application = require('components/application');
var ControlPanel = require('components/control-panel');

Router.run(
    <Route path="/" handler={Application}>
        <Route name="settings" handler={ControlPanel} />
    </Route>,
    function (Handler) {
        React.render(<Handler/>, document.body);
    }
);
