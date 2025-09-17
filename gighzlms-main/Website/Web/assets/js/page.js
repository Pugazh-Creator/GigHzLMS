var hideAllMsgs = function () {
    $('.divLoading').hide();
    $('.divErrorMsg').hide();
    $('.divSuccessMsg').hide();
}

var showLoading = function (msg) {
    hideAllMsgs();
    $('.divLoading').html(msg);
    $('.divLoading').show();
}

var showError = function (msg) {
    hideAllMsgs();
    $('.divErrorMsg').html(msg);
    $('.divErrorMsg').show();
}

var showSuccess = function (msg) {
    hideAllMsgs();
    $('.divSuccessMsg').html(msg);
    $('.divSuccessMsg').show();
}

var showPreloader = function () {
    var preloader = $("#preloader");
    if (preloader.length == 0) {
        preloader = $("<div id='preloader'></div>");
        $('body').append(preloader);
    }
}

var removePreloader = function () {
    $("#preloader").remove();
}

$(document).ready(function () {

    $('.accountDropdown').hide();

    $('.loginForm').unbind('submit').submit(function (e) {
        login($('.txtusername').val(), $('.txtpassword').val());
        return false;
    });

    $('.btnLogout').click(function () {
        sessionStorage.removeItem("token");
        location.href = "Index.html";
        return false;
    });

    $('.passwordReset').unbind('submit').submit(function () {
        getHint($('.txtUsername').val(), $('.txtEmail').val(), function (response) {
            if (String(response.message).toLowerCase().indexOf("contact gighz") > 0) {
                showError(response.message);
            } else {
                showSuccess(response.message);
            }
            $('.resetSubmit').hide();
            $('.cancelReset').html("Okay");
        });
        return false;
    });

    $('.passwordChangeForm').unbind('submit').submit(function () {
        var newPass = $('.txtnewpassword').val();
        var confirmPass = $('.txtconfirmpassword').val();
        var oldPass = $('.txtoldpassword').val();
        if (newPass != confirmPass) {
            showError('Passwords do not match, try again');
            return false;
        }
        if (oldPass == newPass) {
            showError('The new and old passwords are same, try again');
            return false;
        }
        resetPassword(oldPass, newPass);
        return false;
    });

    $('.contactForm').unbind('submit').submit(function () {
        webMessage();
        return false;
    });

    $('.signupForm').unbind('submit').submit(function () {
        var pass = $('.txtpassword').val();
        var cPass = $('.txtconfirmpassword').val();
        if (pass != cPass) {
            $('.divPassError').show();
        } else {
            signup(function (response) {
                if (response == null) {
                    showError("Failed to create account");
                    $('.btnCreateAccount').show();
                } else {
                    if (response.success) {
                        location.href = "login.html";
                    } else {
                        showError("Error: " + response.message);
                        $('.btnCreateAccount').show();
                    }
                }
            });
        }
        return false;
    });

    $('.newsletterForm').unbind('newsletterForm').submit(function () {
        newsletter();
        return false;
    });

    $('.preRegistationForm').unbind('submit').submit(function () {
        addContact(function (response) {
            if (response.success) {
                showSuccess("Information saved, proceeding to payment");
                alert("Payment pending");
            } else {
                showError(response.message);
                $('.btnPreRegister').show();
            }
        });
        return false;
    });

    if (isLoggedIn()) {
        $('.accountDropdown').show();
        $('.btnLogin').hide();
    } else {
        $('.btnGetStarted').attr("href", "signup.html").html("Create Account");
    }
    if ($("input[name='password']").length > 0) {
        passwordLength(function (minlength) {
            $("input[name='password']").attr('minlength', minlength);
        });
    }
});

var webMessage = function () {
    var url = window.location.origin + "/Website/WebMessage";
    var token = getToken();
    $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify({
            "message": $('.txtMessage').val(),
            "email": $('.txtEmail').val(),
            "name": $('.txtName').val(),
            "subject": $('.txtSubject').val(),
            "token": token == null ? "" : token
        }),
        beforeSend: function () {
            $('.btnContactSubmit').hide();
            showLoading("Sending message.. Please wait.");
        },
        success: function (response) {
            hideAllMsgs();
            if (response) {
                showSuccess("Message sent, thank you.");
            } else {
                showError("Failed to send the message.");
                $('.btnContactSubmit').show();
            }
        },
        error: function (xhr, status, error) {
            showError("Failed to send the message.");
            $('.btnContactSubmit').show();
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {

        }
    });
}

var isLoggedIn = function () {
    if (getToken() != null) {
        return true;
    }
    return false;
}

var isRegistered = function (callback) {
    if (!isLoggedIn()) {
        callback(false);
        return;
    }
    var url = window.location.origin + "/Website/IsRegistered?token=" + encodeURIComponent(getToken());
    $.ajax({
        url: url,
        type: "GET",
        beforeSend: function () {
            showPreloader();
        },
        success: function (response) {
            removePreloader();
            callback(response);
        },
        error: function (xhr, status, error) {
            removePreloader();
            callback(false);
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {
        }
    });
}

var getToken = function () {
    var token = sessionStorage.getItem("token");
    if (token != undefined && token != null) {
        return token;
    }
    return null;
}

var login = function (username, password) {
    var url = window.location.origin + "/Website/Login";
    $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify({
            "username": username,
            "password": password
        }),
        beforeSend: function () {
            $('.btnLogin').hide();
            showLoading("Logging in.. Please wait.");
        },
        success: function (response) {
            hideAllMsgs();
            if (response.token) {
                sessionStorage.setItem('token', response.token);
                if (response.passwordReset) {
                    location.href = "change-password.html";
                } else {
                    location.href = "Index.html";
                }
            } else {
                showError("Login failed.");
                $('.btnLogin').show();
            }
        },
        error: function (xhr, status, error) {
            showError("Login failed.");
            $('.btnLogin').show();
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {

        }
    });
}

var getHint = function (username, email, callback) {
    var url = window.location.origin + "/Content/PasswordHint?username=" + username + "&mode=email&email=" + encodeURIComponent(email);
    $.ajax({
        url: url,
        type: "GET",
        beforeSend: function () {
            showLoading("Working.. Please wait.");
        },
        success: function (response) {
            hideAllMsgs();
            callback(response);
        },
        error: function (xhr, status, error) {
            showError("Password reset failed.");
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {
        }
    });
}

var resetPassword = function (oldPassword, newPassword) {
    var url = window.location.origin + "/Website/PasswordReset";
    $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify({
            "oldPassword": oldPassword,
            "newPassword": newPassword,
            "token": getToken(),
            "hint": ""
        }),
        beforeSend: function () {
            showLoading("Resetting password.. Please wait.");
        },
        success: function (response) {
            location.href = "Index.html";
        },
        error: function (xhr, status, error) {
            showError("Unable to reset password, please contact GigHz.")
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {

        }
    });
}

var passwordLength = function (callback) {
    var url = window.location.origin + "/Website/PasswordLength";
    $.ajax({
        url: url,
        type: "GET",
        beforeSend: function () {
            showPreloader();
        },
        success: function (response) {
            removePreloader();
            callback(response);
        },
        error: function (xhr, status, error) {
            removePreloader();
            callback(6);
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {
        }
    });
}

var signup = function (callback) {
    var url = window.location.origin + "/Website/Signup";
    $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify({
            "username": $('.txtusername').val(),
            "password": $('.txtpassword').val(),
            "email": $('.txtEmail').val(),
            "FirstName": $('.txtFirstname').val(),
            "MiddleName": $('.txtMiddlename').val(),
            "LastName": $('.txtLastname').val(),
            "Gender": $('.radioMale').is(":checked")?1:0,
            "DOB": $('.txtdob').val()
        }),
        beforeSend: function () {
            $('.btnCreateAccount').hide();
            showLoading("Creating account.. Please wait.");
        },
        success: function (response) {
            hideAllMsgs();
            callback(response);
        },
        error: function (xhr, status, error) {
            callback(null);
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {

        }
    });
}

var newsletter = function () {
    var url = window.location.origin + "/Website/Newsletter?email=" + encodeURIComponent($('.newsletterEmail').val());
    $.ajax({
        url: url,
        type: "GET",
        beforeSend: function () {
            $('.newsletterSubscribe').hide();
            $('.newsletterLoading').html("Requesting.. Please wait.").show();
        },
        success: function (response) {
            $('.newsletterLoading').hide();
            if (response) {
                $('.newsletterSuccess').html("Your subscription request has been sent. Thank you!").show();
            } else {
                $('.newsletterSuccess').html("Subscription request has been sent already.").show();
            }
        },
        error: function (xhr, status, error) {
            $('.newsletterSubscribe').show();
            $('.newsletterError').html("Subscription request failed.").show();
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {

        }
    });
}

var addContact = function (callback) {
    var url = window.location.origin + "/Website/PreRegister";
    $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify({
            "mobile": $('.txtMobile').val(),
            "telephone": $('.txtTelephone').val(),
            "addressLine1": $('.txtAddress1').val(),
            "addressLine2": $('.txtAddress2').val(),
            "addressLine3": $('.txtAddress3').val(),
            "landmark": $('.txtLandmark').val(),
            "city": $('.txtCity').val(),
            "zip": $('.txtZip').val(),
            "state": $('.txtState').val(),
            "country": $('.txtCountry').val(),
            "token": getToken()
        }),
        beforeSend: function () {
            $('.btnPreRegister').hide();
            showLoading("Adding contact information.. Please wait.");
        },
        success: function (response) {
            hideAllMsgs();
            callback(response);
        },
        error: function (xhr, status, error) {
            callback(null);
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {

        }
    });
}