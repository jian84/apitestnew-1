const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API);
var authenticationURL = 'http://'+process.env.HOSTADDRESS+':'+process.env.HOSTPORT+'/api/verify_email?token=' + auth_token;
const msg = {
    to: req.body.email,
    from: 'admin@horang.id',
    subject: '[HORANG]Your email verification',
    text: 'Welcome to Horang Apps',
    html: '<a target=_blank href=\"' + authenticationURL + '\">Please confirm your email</a>',
};