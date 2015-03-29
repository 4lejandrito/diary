var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var Application = require('components/application');
var ActiveReaders = require('components/control-panel/active-readers');
var AvailableReaders = require('components/control-panel/available-readers');
var NewReader = require('components/control-panel/new-reader');
var EventsYear = require('components/events-year');
var EventsMonth = require('components/events-month');
var EventsDay = require('components/events-day');

Router.run(
    <Route path="/" handler={Application}>
        <DefaultRoute handler={EventsYear}/>
        <Route path="events/:year"             handler={EventsYear} name="year"/>
        <Route path="events/:year/:month"      handler={EventsMonth} name="month"/>
        <Route path="events/:year/:month/:day" handler={EventsDay} name="day"/>
        <Route path="services"                 handler={ActiveReaders}/>
        <Route path="services/new"             handler={AvailableReaders}/>
        <Route path="services/new/:type"       handler={NewReader} name="new"/>
    </Route>,
    function (Handler, state) {
        React.render(<Handler params={state.params}/>, document.body);
    }
);
