define([
	'adapt-contrib-core/js/adapt',
	'./views/notifyView',
	'./views/notifyPushView',
	'./models/notifyModel'
], function(Adapt, NotifyView, NotifyPushView, NotifyModel) {

	require.config({
	  map: {
	    '*': {
	      'core/js/notify': 'adapt-contrib-notify/js/notify',
	      'core/js/models/notifyModel': 'adapt-contrib-notify/js/models/notifyModel',
	      'core/js/views/notifyView': 'adapt-contrib-notify/js/views/notifyView',
	      'core/js/views/notifyPushView': 'adapt-contrib-notify/js/views/notifyPushView',
	      'adapt-contrib-core/js/notify': 'adapt-contrib-notify/js/notify',
	      'adapt-contrib-core/js/models/notifyModel': 'adapt-contrib-notify/js/models/notifyModel',
	      'adapt-contrib-core/js/views/notifyView': 'adapt-contrib-notify/js/views/notifyView',
	      'adapt-contrib-core/js/views/notifyPushView': 'adapt-contrib-notify/js/views/notifyPushView',
	    }
	  }
	});

	// Build a collection to store push notifications
	var NotifyPushCollection = Backbone.Collection.extend({

		model: NotifyModel,

		initialize: function() {
			this.listenTo(this, 'add', this.onPushAdded);
			this.listenTo(Adapt, 'notify:pushRemoved', this.onRemovePush);
		},

		onPushAdded: function(model) {
			this.checkPushCanShow(model);
		},

		checkPushCanShow: function(model) {
			if (this.canShowPush()) {
				model.set('_isActive', true);
				this.showPush(model);
			}
		},

		canShowPush: function() {
			var availablePushNotifications = this.where({_isActive:true});
			if (availablePushNotifications.length >= 2) {
				return false;
			}
			return true;
		},

		showPush: function(model) {
			new NotifyPushView({
				model: model
			});
		},

		onRemovePush: function(view) {
			var inactivePushNotifications = this.where({_isActive:false});
			if (inactivePushNotifications.length > 0) {
				this.checkPushCanShow(inactivePushNotifications[0]);
			}
		}

	});

	var NotifyPushes = new NotifyPushCollection();

	Adapt.on('notify:alert', function(notifyObject) {
		addNotifyView('alert', notifyObject);
	});

	Adapt.on('notify:prompt', function(notifyObject) {
		addNotifyView('prompt', notifyObject);
	});

	Adapt.on('notify:popup', function(notifyObject) {
		addNotifyView('popup', notifyObject);
	});

	Adapt.on('notify:push', function(notifyObject) {
		addNotifyView('push', notifyObject);
	});

	function addNotifyView(type, notifyObject) {
		notifyObject._type = type;

		if (type === 'push') {

			NotifyPushes.push(notifyObject);

			return;

		}

		var notify = new NotifyView({
			model: new NotifyModel(notifyObject)
		});

	}

});
