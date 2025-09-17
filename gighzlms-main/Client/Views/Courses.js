
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications);
    getData("courses", loadCourses);
    LoadOtherCourses();
}

var LoadOtherCourses = function () {
    $.ajax({
        url: lmsServer + "/Content/OtherCourses?token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading recommendations.. Please wait.");
        },
        success: function (response) {
            addCourses(response);
        },
        error: function (e) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load courses, the server is not reachable.";
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

var addCourses = function (coursejson) {
    $.each(coursejson, function (index, course) {
        var image = lmsServer + "/Content/File?name=" + encodeURIComponent("Courses\\" + course.id + ".jpg");
        var card = $("<div class='card image-card'><h3>" + course.name + "</h3><img src='" + image + "' alt='" +
            course.name + "'><p>" + course.shortDescription + "</p><button class='btnDashboardType1 btnExploreCourses'>Explore</button></div>");
        enableSpeech(card.find('p'));

        card.find('.btnExploreCourses').click(function () {
            var strWindowFeatures = "location=yes,height=" + window.innerHeight + ",width=" + window.innerWidth + ",scrollbars=yes,status=yes";
            window.open(lmsServer + "/courses.html", "_blank", strWindowFeatures);
        });


        $('.cards').append(card);
    });
}

var loadCourses = function (coursesJson) {
    var courses = JSON.parse(coursesJson);
    $.each(courses, function (index, course) {
        var stars = undefined;
        if (course.level == 0 || course.level == 3) {
            stars = "<span style='color:#FFBF00;'>★★★</span>";
        }
        if (course.level == 1) {
            stars = "<span style='color:#FFBF00;'>★</span>★★";
        }
        if (course.level == 2) {
            stars = "<span style='color:#FFBF00;'>★★</span>★";
        }
        var image = lmsServer + "/Content/File?name=" + encodeURIComponent("Courses\\" + course.id + ".jpg");
        var card = $("<div class='card image-card'><div class='image-card-header'><h3>" + course.name + "</h3><div class='image-card-header-stars'>" + stars + "</div></div><img src='" + image + "' alt='" +
            course.name + "'><p>" + course.description + "</p>");
        enableSpeech(card.find('p'));
        var courseProgress = "<div class='progress-group'><div class='progress-label'>Course Progress</div><div class='progress-bar'><div class='progress-fill' style='width: " + course.courseProgress + "%;'></div></div></div>";
        var daysProgress = "";
        if (course.gracePeriodType == 0) {
            daysProgress = "<div class='progress-group'><div class='progress-label'>Remaining Course Days: " + course.remainingCourseDays + "/" + course.levelDays + "</div><div class='progress-bar'><div class='progress-fill' style='width: " + course.daysProgress + "%;'></div></div></div>";
        } else if (course.gracePeriodType == 1) {
            daysProgress = "<div class='progress-group'><div class='progress-label'>Grace Period: " + course.remainingCourseDays + "/" + course.levelDays + "</div><div class='progress-bar'><div class='progress-fill-grace' style='width: " + course.daysProgress + "%;'></div></div></div>";
        } else if (course.gracePeriodType == 2) {
            daysProgress = "<div class='progress-group'><div class='progress-label'>Paid Grace Period: " + course.remainingCourseDays + "/" + course.levelDays + "</div><div class='progress-bar'><div class='progress-fill-paid-grace' style='width: " + course.daysProgress + "%;'></div></div></div>";
        }
        card.append(courseProgress);
        card.append(daysProgress);
        var button = $("<button class='btnDashboardType1'>Enter</button></div>");
        button.click(function () {
            location.href = "Course.html?id=" + course.id;
        });
        card.append(button);
        if (course.gracePeriodType == 1) {
            var button2 = "&nbsp; <button class='btnDashboardType1'>Get Grace Period</button></div>";
            card.append(button2);
        }
        $('.cards').append(card);
    });
}

var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}