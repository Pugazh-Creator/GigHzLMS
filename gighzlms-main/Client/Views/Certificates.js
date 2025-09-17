
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications)
    loadCertificates();
}

var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}

var getCertificates = function (callback) {
    $.ajax({
        url: lmsServer + "/Website/GetCertificates?token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading certificates.. Please wait.");
        },
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load certificates, the server is not reachable.";
                showError(e);
            } else {
                showError("Error: " + e.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to go to login.");
            }
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {
            hideLoading();
        }
    });
};


var loadCertificates = function () {
    getCertificates(function (certificates) {
        $.each(certificates, function (index, certificate) {
            var eventCard = $("<div class='event-card'></div>");
            var image = lmsServer + certificate.file;
            var certImage = $("<img class='certImage' src='" + image + "' alt='" + certificate.certificateId + "' />");
            eventCard.append(certImage);
            var eventInfo = $("<div class='event-info'></div>");
            eventInfo.append("<h3 class='event-title'>" + certificate.level + "</h3>");
            eventInfo.append("<p class='event-datetime'>🧑‍🏫 " + certificate.courseName + " · 🕘 " + certificate.completionDate + "</p>");
            var details = $("<p class='event-agenda'>" + certificate.details + "</p>");
            enableSpeech(details);
            eventInfo.append(details);
            eventCard.append(eventInfo);
            $('.event-list').append(eventCard);
            certImage.click(function () {
                var strWindowFeatures = "location=yes,height=" + window.innerHeight + ",width=" + window.innerWidth + ",scrollbars=yes,status=yes";
                window.open(lmsServer + "/Website/Certificate?id=" + certificate.certificateId, "_blank", strWindowFeatures);
            });
        });
    });
}