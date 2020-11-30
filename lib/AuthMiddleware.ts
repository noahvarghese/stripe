import DefaultData from "../routes/DefaultData";
import { User } from "./models/User";

// Authorization middleware
export default (req: any, res: any, next: any) => {
    let url = req.originalUrl;

    if ( 
        ! ((req.originalUrl[0] === "/" && req.originalUrl.length === 1) ||
        (req.originalUrl.length > 1 && req.originalUrl[req.originalUrl.length - 1] === "/"))
    ) {
        // append a backslash so routes can be compared
        url += "/"
    }
    
    console.log("Requested URL:", url, "Method:", req.method)

    // specifically allow all asset requests through
    if ( url.includes("assets") ) {
        next();
        return;
    }

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
            else if ( ! req.session!.user.subscriptionId && url !== "/customer/subscriptions/") {
                res.redirect("/customer/subscriptions/")
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
                if ( url !== "/logout/" ) {
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
            } 
            // TODO:
            // Need to fix as user cannot request resend of code
            // currently relies on session not user request
            // if the user has not confirmed the account code
            else {
                // if the confirmCode is stored in session
                console.log("uRL:", url)
                if ( 
                    req.session!.confirmCode && 
                    url !== "/sendCode/?resend=true/"
                  ) {
                    // and the user is not going to the confirm
                    if ( url.indexOf("/confirm/") < 0 ) {
                        res.redirect("/confirm/");
                        return;
                    }
                }
                // if confirmCode not in session
                else {
                    // and the user is not going to get a new code
                    if ( 
                        url.indexOf("/sendCode/") < 0 || 
                        url === "/sendCode/?resend=true/" 
                      ) {
                        // TODO: 
                        // Should also tell user that the code has expired
                        // And that they need to send it again
                        // code expires when session expires
                        // or if using a different device
                        // res.redirect("/sendCode/")
                        const data = {
                            ...DefaultData,
                            error: !req.session!.confirmCode ? "Your session expired, please reenter your email for a new code." : ""
                        }
                        res.render("public/sendCode", data);
                        return;
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