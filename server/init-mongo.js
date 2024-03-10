/* global db */
db.createUser({
  user: 'hieple',
  pwd: 'hieple',
  roles: [
    {
      role: 'readWrite',
      db: 'TwitterDev'
    }
  ]
})
