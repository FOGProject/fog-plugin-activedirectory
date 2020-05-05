# Active Directory

a [Sails](http://sailsjs.org) application

Configuration:
config/adopts.js - Not uploaded to git repo - can contain sensitive data
Example adopts.js file:
```
module.exports = {
  adopts: {
    integrated: false, //Use native windows authentication?
    ldap: {
      url: 'ldap://example.com',
      baseDN: 'dc=example,dc=com',
      username: 'example@example.com',
      password: '3x@mp1ePassword!'
    }
  }
};
``````

Permissions:
config/adperms.js - Not uploaded to git repo - can contain sensitive data.
* The config of permissions is:
```
module.exports = {
  memberOf: {
    '<AD GROUP TO BE MEMBER OF>': ['<ROLE NAME TO ASSOCIATE TO>',],
  }
};
```

This plugin will create a user object under a new collection called AD.

Only attribute contained will be Role and ObjectID. The ID of the this item will be the token generated.
