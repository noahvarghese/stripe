import { User } from "./models/User";

// Authorization middleware
export default (req: any, res: any, next: any) => {
    let url = "";

    if ( 
        (req.originalUrl[0] === "/" && req.originalUrl.length === 1) ||
        (req.originalUrl.length > 1 && req.originalUrl[-1] === "/")
    ) {
        // append a backslash so routes can be compared
        url = req.originalUrl 
    }
    else{ 
        url = req.originalUrl + "/"
    }
    
    console.log("Requested URL:", url)
    console.log("Session user:", req.session!.user)

    //  They went to /customer
    if(url.indexOf('/customer/') > -1) {
        // they are not logged in
        if ( !req.session!.user) {
            res.redirect('/');
            return;
        }
        // they are logged in
        else {
            // they have not confirmed their account
            if ( ! (req.session!.user as User).accountConfirmed) {
                res.redirect("/confirm/");
                return;
            }
            // they do not have a subscriptioan
            else if ( ! req.session!.user.subscriptionId ) {
                res.redirect("/customer/subscription/")
                return
            } 
            else if ( req.session!.user.admin ) {
                res.redirect("/admin/");
                return;
            }
            // else {
            //     // they have a subscription, all is good
            //     next();
            // }
        }
    }
    // They went to admin
    else if (url.indexOf("/admin/") > -1) {
        // if the user is not logged in
        if ( ! req.session!.user ) {
            res.redirect("/");
            return;
        }
        else {
            if ( !(req.session!.user as User).admin ) {
                res.redirect("/customer/");
                return;
            } 
            // else {
            //     next();
            // }
        }
    }
    else {

        // if logged in
        if ( req.session!.user ) {
            // if account confirmed
            if ( (req.session.user as User).accountConfirmed ) {
                // cannot access public pages, redirect to 'home' pages
                if ( req.session!.user.admin ) {
                    res.redirect("/admin/");
                    return
                } 
                else {
                    res.redirect("/customer/");
                    return;
                }
            } 
            // if the user has not confirmed the account code
            else {
                // if the confirmCode is stored in session
                if ( req.session!.confirmCode ) {
                    // and the user is not going to the confirm
                    if ( req.originalUrl.indexOf("/confirm/") < 0 ) {
                        res.redirect("/confirm/");
                    }
                }
                // if confirmCode not in session
                else {
                    // and the user is not going to get a new code
                    if ( url.indexOf("/sendCode/") < 0 ) {
                        // TODO: 
                        // Should also tell user that the code has expired
                        // And that they need to send it again
                        // code expires when session expires
                        // or if using a different device
                        res.redirect("/sendCode/")
                    }
                }
            }
        }
        // only allow not logged in users access to the root, login and register pages
        else {
            if ( 
                // need exact path of root
                ![
                    "/",
                    "/login/",
                    "/register/"
                ].includes(url)
            ) {
                res.redirect("/");
                return;
            }
        }
    }

    // by default continue
    // commented out the cases that must result in next,
    // so I can keep track of the different states while debugging
    console.log("Next:", req.originalUrl);
    next();
};