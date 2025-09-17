
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var getJobs = function (callback) {
    $.ajax({
        url: lmsServer + "/Content/Jobs?token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading jobs.. Please wait.");
        },
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load jobs, the server is not reachable.";
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
}

var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications)
    getJobs(function (jobs) {
        $.each(jobs, function (index, job) {
            var card = $("<div class='job-card'></div>");
            var header = $("<div class='job-header'><div class='job-title'>" + job.title + "</div><div class='job-company'>" + job.company + "</div></div>");
            card.append(header);

            var details1 = $("<div class='job-details'>💰 " + job.package + " | 📅 " + job.notice + " | 📍 " + job.location + "</div>");
            var details2 = $("<div class='job-details'>" + job.details + "</div>");
            var qualification = $("<div class='job-details'><strong>Qualifications: </strong>" + job.qualification + "</div>");
            card.append(details1);
            card.append(details2);
            card.append(qualification);

            var tags = $("<div class='job-tags'></div>");
            $.each(job.tags, function (i, t) {
                var tag = $("<span class='tag'>" + t + "</span>");
                tags.append(tag);
            });
            card.append(tags);

            var actions = $("<div class='job-actions'></div>");

            var apply = $("<button class='job-button'>Apply Now</button>");
            var withdraw = $("<button class='job-button' style='background-color: #eee; color: #333;'>Cancel Application</button>");
            actions.append(apply);
            actions.append(withdraw);
            apply.hide();
            withdraw.hide();

            header.click(function () {
                if (details1.is(":visible")) {
                    details1.hide();
                    details2.hide();
                    qualification.hide();
                    tags.hide();
                    actions.hide();
                } else {
                    details1.show();
                    details2.show();
                    qualification.show();
                    tags.show();
                    actions.show();
                }
            });
            
            apply.click(function () {
                $(this).prop('disabled', true).html("Applying..");
                setJobApplication("1", job.id, function () {
                    apply.prop('disabled', false).html("Apply");
                    apply.hide();
                    withdraw.show();
                });
            });
            withdraw.click(function () {
                $(this).prop('disabled', true).html("Cancelling..");
                setJobApplication("0", job.id, function () {
                    withdraw.prop('disabled', false).html("Cancel");
                    withdraw.hide();
                    apply.show();
                });
            });
            if (job.isApplied) {
                withdraw.show();
            } else {
                apply.show();
            }
            card.append(actions);
            $('.job-portal-section').append(card);
            header.trigger('click');
        });
    });
}

var setJobApplication = function (apply, jobId, callback) {
    $.ajax({
        url: lmsServer + "/Content/UserJobApplication?jobId=" + jobId + "&apply=" + apply + "&token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {

        },
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to apply for the job, the server is not reachable.";
                showError(e);
            } else {
                showError("Error: " + e.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to go to login.");
            }
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {

        }
    });
}