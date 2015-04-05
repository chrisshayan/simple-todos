Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
    Meteor.subscribe("tasks");

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
        },

        isOwner: function () {
            return this.owner === Meteor.userId;
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
            Meteor.call("setChecked", this._id, !this.checked);
        },

        "click .delete": function () {
            Meteor.call("deleteTask", this._id);
        },

        "click .toggle-private": function () {
            Meteor.call("setPrivate", this._id, ! this.private);
        }
    });

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}

if (Meteor.isServer) {
    Meteor.publish("tasks", function () {
        return Tasks.find({
            $and: [
                { private: {$ne: true} },
                { owner: this.userId }
            ]
        });
    })
}

Meteor.methods({
    addTask: function (text) {
        if (!Meteor.userId()) {
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
        var task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can delete it
            throw new Meteor.Error("not-authorized");
        }

        Tasks.remove(taskId);
    },

    setChecked: function (taskId, setChecked) {
        var task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can check it off
            throw new Meteor.Error("not-authorized");
        }

        Tasks.update(taskId, {$set: {checked: setChecked}});
    },

    setPrivate: function (taskId, setToPrivate) {
        var task = Tasks.findOne(taskId);

        if(taks.owner === Meteor.userId) {
            Tasks.update(taskId, {$set: {private: setToPrivate}})
        } else {
            throw new Meteor.Error("not-authorized");
        }
    }
});
