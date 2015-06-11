var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var Application = require('pages/application');
var ActiveReaders = require('pages/control-panel/active-readers');
var AvailableReaders = require('pages/control-panel/available-readers');
var NewReader = require('pages/control-panel/new-reader');
var Year = require('pages/year');
var Month = require('pages/month');
var Day = require('pages/day');

Router.run(
    <Route path="/" handler={Application}>
        <DefaultRoute handler={Year}/>
        <Route path="events/:year"             handler={Year} name="year"/>
        <Route path="events/:year/:month"      handler={Month} name="month"/>
        <Route path="events/:year/:month/:day" handler={Day} name="day"/>
        <Route path="services"                 handler={ActiveReaders}/>
        <Route path="services/new"             handler={AvailableReaders}/>
        <Route path="services/new/:type"       handler={NewReader} name="new"/>
    </Route>,
    function (Handler, state) {
        React.render(<Handler params={state.params}/>, document.body);
    }
);
