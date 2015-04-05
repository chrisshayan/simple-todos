Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
    // This code only runs on the client
    Template.body.helpers({
        tasks: function () {
            if (Session.get("hideCompleted")) {
                // If hide completed is checked, filter tasks
                return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
            } else {
                // Otherwise, return all of the tasks
                return Tasks.find({}, {sort: {createdAt: -1}});
            }
        },

        hideCompleted: function () {
            return Session.get("hideCompleted");
        },

        incompleteCount: function () {
            return Tasks.find({checked: {$ne: true}}).count();
        }
    });

    Template.body.events({
        "submit .new-task": function (event) {
            var taskValue = event.target.text.value;
            Meteor.call("addTask", taskValue);
            event.target.text.value = "";

            // Prevent default form submit
            return false;
        },

        "change .hide-completed input": function (event) {
            Session.set("hideCompleted", event.target.checked);
        }
    });


    Template.task.events({
        "click .toggle-checked": function () {
            // Set the checked property to the opposite of its current value
            Meteor.call("setChecked", this._id, ! this.checked);
        },

        "click .delete": function () {
            Meteor.call("deleteTask", this._id);
        }
    });

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        Accounts.onCreateUser(function(options, user) {
            // We're enforcing at least an empty profile object to avoid needing to check
            // for its existence later.
            user.profile = options.profile ? options.profile : {};
            return user;
        });
    });
}

Meteor.methods({
    addTask: function (text) {
        if(! Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        Tasks.insert({
            text: text,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().profile.name
        })
    },
    deleteTask: function (taskId) {
        Tasks.remove(taskId);
    },
    setChecked: function(taskId, setChecked) {
        Tasks.update(taskId, {$set: {checked: setChecked}});
    }
});
