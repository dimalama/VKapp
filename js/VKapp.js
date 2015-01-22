/**
 * @fileoverview This code responsible for retrieving frends list and mutual frineds
 * from VK (www.vk.com) using VK Open API 
 *
*/

/**
 * VKapp Class
 * @return {{init: Function}}
*/
var VKapp = function() {
	'use strict';

    // your application id, you can find it if you go to 
    //http://vk.com/apps?act=manage -> edit application -> settings
    var API_ID = '4584589';

	/**
	 * Class scope
	 * @private
	 * @type {{fiendIds: Array}}
	*/
    var _scope = {
    	friendIds: []
    };

	/**
	 * Init VKapp
	*/
    var init = function init() {
        
        // init VK OpenApi
        VK.init({
            apiId: API_ID
        });

        var $getFriendsButton = document.getElementById('get-friends');
        var $mutualFriendsButton = document.getElementById('mutual-friends');
        var $logOutButton = document.getElementById('logout');

        $getFriendsButton.addEventListener('click', function() {
        	_getFriendsList(false);
        });
        $mutualFriendsButton.addEventListener('click', _getMutualFriends);
        $logOutButton.addEventListener('click', _logOut);
    };

	/**
	 * Get Frinds List of current user
	 * @param {Boolean} isMutualFriendsSearch
	 * @param {Function} callback
	 * @private
	*/
    var _getFriendsList = function _getFriendsList(isMutualFriendsSearch, callback) {
    	_getPremissions(function() {
			VK.Api.call('friends.get', {
				user_id: '', //if user id is not defined, the API use current user_id
				fields: [ // the list of field to show
					'nickname', 
					'first_name', 
					'last_name', 
					'domain', 
					'sex', 
					'bdate', 
					'city', 
					'country', 
					'timezone', 
					'photo_50', 
					'photo_100', 
					'photo_200_orig', 
					'has_mobile', 
					'contacts', 
					'education', 
					'online', 
					'relation', 
					'last_seen', 
					'status', 
					'can_write_private_message', 
					'can_see_all_posts', 
					'can_post', 
					'universities'
				]}, function(responseObj) { 
				if(responseObj.response) {
					if(isMutualFriendsSearch) {
						responseObj.response.forEach(function(element) {
							_scope.friendIds.push(element.user_id);
						});
						if(typeof callback === 'function') {
							callback();
						}
						return true;
					}
					document.body.innerHTML = responseObj.response.map(function(element) {
						return JSON.stringify(element);
					});
				} 
			});
        });
    };

	/**
	 * Get Mutual Friends of current user
	 * @private
	*/
    var _getMutualFriends = function _getMutualFriends() {
    	_getPremissions(function() {
			_getFriendsList(true, function() {
				VK.Api.call('friends.getMutual', { target_uids: _scope.friendIds }, function(responseObj) {
					if(responseObj.error) {
						alert(responseObj.error.error_msg);
						return true;
					}
					if(responseObj.response) {
						document.body.innerHTML = responseObj.response.map(function(element){
							return JSON.stringify(element);
						});
					} else {
						alert('Current user do not have common friends with his/her friends');
					}
				}); 	
			});
    	});
    };

	/**
	 * Get Premissions to access user's friends
	 * @private
	 * @return {Boolean} false - if callback is not passed as param
	*/
    var _getPremissions = function _getPremissions(callback) {
    	if(typeof callback !== 'function') {
    		return false;
    	}
		VK.Auth.getLoginStatus(function(response) { 
			if (response.session) { 
				// Authorized Open API user 
				callback();
			} else { 
				// Not authorized Open API user  
				VK.Auth.login(function(response) { 
					if (response.session) {
						// user successfully authorized 
						callback();
						if (response.settings) { 
							// Selected user's access settings, if they has been required 
						} 
					} else { 
						// user has pushed Cancel at the authorization window   
					} 
				}, 2); // bit mask showing what premissions we want to require from a user (2 = friends)
			} 
		});
    };

	/**
	 * Log Out fomr Open API
	 * @private
	*/
    var _logOut = function _logOut() {
    	VK.Auth.logout(function(response) {
    		if(!response.session) {
    			alert('User Open API session is over');
    		}
    	});
    };
	
    return {
        init: init
    };
};

var vkApp = new VKapp();
vkApp.init();