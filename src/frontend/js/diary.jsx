var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var Application = require('components/application');
var ActiveReaders = require('components/control-panel/active-readers');
var AvailableReaders = require('components/control-panel/available-readers');
var NewReader = require('components/control-panel/new-reader');

Router.run(
    <Route path="/" handler={Application}>
        <Route path="services"           handler={ActiveReaders}/>
        <Route path="services/new"       handler={AvailableReaders}/>
        <Route path="services/new/:type" handler={NewReader} name="new"/>
    </Route>,
    function (Handler) {
        React.render(<Handler/>, document.body);
    }
);
