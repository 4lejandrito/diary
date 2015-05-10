var React = require('react');
var Icon = require('components/icon');
var Link = require('components/link');
var Gravatar = require('react-gravatar');
var ghURL = 'https://github.com/';

module.exports = React.createClass({
    render: function() {
        var ghEvent = this.props.event.source;
        if (ghEvent.type !== 'PushEvent') return <div>
            <i>{ghEvent.type}</i> is not yet supported
        </div>;

        return <div>
            <header>
                <Icon name="code"/>{' '}
                You pushed to <Link href={ghURL + ghEvent.repo.name}>
                    {ghEvent.repo.name}
                </Link>
            </header>
             <ul>
                 {ghEvent.payload.commits.map(function(commit) {
                     return <li>
                         <Gravatar email={commit.author.email} size={50}/>
                         <Link href={ghURL + ghEvent.repo.name + '/commit/' + commit.sha}>
                             <small>{commit.message}</small>
                         </Link>
                     </li>;
                 })}
             </ul>
        </div>;
    }
});
