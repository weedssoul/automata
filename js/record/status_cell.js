var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var api = require('../api');
var Loading = require('../loading');
var Status = require('./status');

module.exports = React.createClass({
    mixins: [Router.Navigation, Loading.Mixin],

    onEdit: function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            editing: 'edit'
        });
    },

    onCancel: function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            editing: 'done'
        });
    },

    changeState: function(e) {
        var id = ['report', this.props.report, 'submit'].reduce(function(r, k) {
            if (typeof r[k] === 'undefined') r[k] = {};
            return r[k];
        }, this.props.user);
        var new_status = e.target.value;
        api.post({
            api: 'admin_log',
            data: {
                id: id,
                user: this.props.user.token,
                report: this.props.report,
                status: new_status
            },
            ownError: true
        }).done(function() {
            this.props.updateStatus(this.props.user.token,
                                    this.props.report,
                                    new_status);
        }.bind(this)).fail(function() {
          alert('提出状況の変更に失敗しました．課題が提出済みであるか，提出ファイルの更新がないかを確認してください．');
        }).always(function() {
            this.setState({
                editing: 'done'
            });
        }.bind(this));

        this.setState({
            editing: 'exec'
        });
    },

    disable: function(e) {
        e.stopPropagation();
    },

    getDefaultProps: function() {
        return {
            unRead: 0
        };
    },

    getInitialState: function() {
        return {
            editing: 'done',
        };
    },

    nowLoading: function() { return this.state.editing === 'exec'; },

    afterLoading: function() {
        switch (this.state.editing) {
        case 'edit':
            return <a className="edit" href="javascript:void(0)"
                      title="キャンセル" onClick={this.onCancel}>
                       <i className="fa fa-times edit"/>
                   </a>;
            break;
        default:
            return <a className="edit" href="javascript:void(0)"
                      title="変更する" onClick={this.onEdit}>
                       <i className="fa fa-pencil-square-o edit"/>
                   </a>;
        }
    },

    render: function() {
        var status = ['report', this.props.report, 'status'].reduce(function(r, k) {
            if (typeof r[k] === 'undefined') r[k] = {};
            return r[k];
        }, this.props.user);
        if (typeof status !== 'string') {
            status = 'none';
        }
        var props = {
            className: 'status ' + status.replace(/:/g, '-')
        };
        if (this.props.isSelected) {
            props.className += ' selected';
        }
        if (!this.props.isSelected && this.props.isButton) {
            var transTo = function() {
                this.transitionTo('user', {
                    token: this.props.user.token,
                    report: this.props.report,
                });
            }.bind(this);
            props.className += ' selectable';
            props.onClick = transTo;
        }
        var content;
        if (this.state.editing === 'edit') {
            var opts = Object.keys(Status.terms).map(function(key) {
                var name;
                if (key === 'none') {
                    name = '(' + Status.terms[key] + ')';
                } else {
                    name = key + ' (' + Status.terms[key] + ')';
                }
                return (
                        <option value={key}>{name}</option>
                );
            }.bind(this));
            content = (
                    <select defaultValue={status} onClick={this.disable} onChange={this.changeState}>
                    {opts}
                    </select>
            );
        } else if (this.props.isSelected) {
            content = Status.terms[status];
        } else {
            content = (
                    <Link to="user" params={{
                        token: this.props.user.token,
                        report: this.props.report
                    }}>{Status.terms[status]}</Link>
            );
        }
        var edit = this.props.admin && this.renderLoading();
        var unreads = this.props.comment.unreads;
        unreads = (unreads > 0) ? (
            <div className="unread">
                <span className="base"><i className="fa fa-circle"/></span>
                <span className="text">{unreads}</span>
            </div>
        ) : null;
        var stars = this.props.comment.stars;
        stars = (stars > 0) ? (
                <div className="star">
                <span className="base"><i className="fa fa-star"/></span>
                <span className="colored"><i className="fa fa-star-o"/></span>
                </div>
        ) : null;
        var all_comments = this.props.comment.comments;
        all_comments = (all_comments > 0) ? (
                <div className="all_comments">
                <span className="base"><i className="fa fa-circle"/></span>
                <span className="text">{all_comments}</span>
                </div>
        ) : null;
        return (
                <td {...props}>
                    <div className="notify">{unreads}{stars}{all_comments}</div>
                    {content}{edit}
                </td>
        );
    }
});
