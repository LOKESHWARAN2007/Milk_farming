module.exports = {
    isLoggedIn: (req, res, next) => {
        if (req.session.userId) {
            return next();
        } else {
            res.redirect('/login.html');
        }
    },
    isNotLoggedIn: (req, res, next) => {
        if (!req.session.userId) {
            return next();
        } else {
            res.redirect('/dashboard.html');
        }
    }
};
