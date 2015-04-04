Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
        // Show new tasks first
        return Tasks.find({}, {sort : {createdAt: -1}});
    }
  });

  Template.body.events({
        "submit .new-task" : function(event) {
            var taskValue = event.target.text.value;

            Tasks.insert({
               text: taskValue,
               createdAt: new Date()
            })

            event.target.text.value = "";

            // Prevent default form submit
            return false;
        }
  });


  Template.task.events({
      "click .toggle-checked" : function () {
          // Set the checked property to the opposite of its current value
          Tasks.update(this._id, {$set: {checked: ! this.checked}});
      },

      "click .delete" : function () {
          Tasks.remove(this._id);
      }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
