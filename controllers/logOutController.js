const User  = require('../model/User');
 const jwt = require('jsonwebtoken');

 const handleLogOut  = async (req, res) => {
    // On client, also delete the access token

    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204); // No content
    const refreshToken = cookies.jwt

    // is refresh token in db?
   const foundUser = await User.findOne({refreshToken}).exec();
   if(!foundUser) {
     res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true})
    return res.sendStatus(204); //Forbidden
   }
   // delete refresh token in db
   foundUser.refreshToken = '';
   const result = await foundUser.save();

   res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true}); // secure: true - only serves https
   res.sendStatus(204);
}

 module.exports = { handleLogOut };