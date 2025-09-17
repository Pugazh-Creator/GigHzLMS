
var notificationList = [];

function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    loadResources();
    loadDashboard();
    $('.systemUpdate').click(function () {
        checkForUpdates(function (updateAvailable) {
            if (!updateAvailable) {
                showOkayAlert("No updates available", "Great! The system is up to date.", function (button, element) {
                    element.remove();
                });
            }
        });
    });
}

var loadResources = function () {
    $('.levelsImage').attr('src', lmsServer + '/Content/File?name=page/levels.png');
    $('.allCoursesCardImage').attr('src', lmsServer + '/Content/File?name=Courses/all.jpg');
    $('.videoImage').html("<source src='" + lmsServer + "/Content/File?name=Others/learning.mp4' type='video/mp4'>");
}

var loadNotifications = function () {
    loadUnreadNotifications(notificationList);
}

var loadDashboard = function () {
    $.ajax({
        url: lmsServer + "/Content/UserDashboard?token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading your dashboard.. Please wait.");
        },
        success: function (response) {
            getUserCompletion(function (completion, apiError) {
                if (apiError == null || completion != null) {
                    var points = 0;
                    var questionnaires = 0;
                    var assignments = 0;
                    var courses = [];
                    $.each(response.courseDetails, function (index, details) {
                        var course = details.item1;
                        courses.push(course);
                        var image = lmsServer + "/Content/File?name=" + encodeURIComponent("Courses/" + course.id + ".jpg");
                        var card = $("<div class='card image-card'><h3>" + course.name + "</h3><img src='" + image + "' alt='" +
                            course.name + "'><p>" + course.description + "</p><button class='btnDashboardType1'>Enter</button></div>");
                        card.find('.btnDashboardType1').click(function () {
                            location.href = "Course.html?id=" + course.id;
                        });
                        enableSpeech(card.find('p'));
                        $('.cards').append(card);

                        points = points + course.points;
                        questionnaires = questionnaires + course.questionnaires;
                        assignments = assignments + course.assignments;

                        setData("UserLevel-" + course.id, course.level, function () {
                            var courseStat = $("<div class='courseStat'></div>");
                            var innerDiv = $("<div></div>");
                            var stars = undefined;
                            if (course.level == 0 || course.level == 3) {
                                stars = $("<div class='statLevels'><span style='color:gold;'>★★★</span></div>");
                            }
                            if (course.level == 1) {
                                stars = $("<div class='statLevels'><span style='color:gold;'>★</span>★★</div>");
                            }
                            if (course.level == 2) {
                                stars = $("<div class='statLevels'><span style='color:gold;'>★★</span>★</div>");
                            }
                            innerDiv.append(stars);
                            var statCourseName = $("<div class='statCourseName'>" + course.name + "</div>");
                            innerDiv.append(statCourseName);
                            courseStat.append(innerDiv);
                            var levelDesc = $("<div class='statLevelDesc'><span>" + getUserLevel(course.level) + "</span></div> ");
                            courseStat.append(levelDesc);

                            var courseStatWrapper = $("<div></div>");
                            courseStatWrapper.append(courseStat);
                            var totalAssessments = course.assignments + course.pendingAssessmentsInLevel;
                            if (totalAssessments == 0) {
                                courseStatWrapper.append("<div class='courseStatPending'>Error! No assessments found</div>");
                            } else {
                                if (course.pendingAssessmentsInLevel == totalAssessments) {
                                    courseStatWrapper.append("<div class='courseStatPending'>Complete " + course.pendingAssessmentsInLevel + " assessments to level up</div>");
                                } else {
                                    if (course.pendingAssessmentsInLevel == 0) {
                                        if (course.amountDue > 0) {
                                            courseStatWrapper.append("<div class='courseStatPending'>Click <a href='Settings.html'>here</a> to clear due amout</div>");
                                        } else {
                                            if (course.level == 3) {
                                                courseStatWrapper.append("<div class='courseStatPending'><a href='#' class='aCompletion' courseId='" + course.id + "'>Complete Course</a></div>");
                                            } else {
                                                courseStatWrapper.append("<div class='courseStatPending'>Click <a href='#' class='aCompletion' courseId='" + course.id + "'>here</a> to level up</div>");
                                            }
                                        }
                                    } else {
                                        courseStatWrapper.append("<div class='courseStatPending'>Complete " + course.pendingAssessmentsInLevel + " more assessments to level up</div>");
                                    }


                                    courseStatWrapper.find('.aCompletion').click(function () {
                                        var courseId = $(this).attr('courseId');
                                        $.ajax({
                                            url: lmsServer + "/Content/CourseCompletion?courseId=" + courseId + "&token=" + encodeURIComponent(token),
                                            type: "GET",
                                            beforeSend: function () {
                                                showLoading("Working on it.. Please wait.");
                                            },
                                            dataType: "JSON",
                                            contentType: "application/json; charset=utf-8",
                                            success: function (response) {
                                                if (!response.isSuccess) {
                                                    showOkayAlert("Error", response.message, function (button, element) {
                                                        element.remove();
                                                    });
                                                }
                                            },
                                            complete: function (response) {
                                                hideLoading();
                                            },
                                            error: function (xhr, status, error) {
                                                var e = eval("(" + xhr.responseText + ")");
                                                if (e == undefined) {
                                                    e = "Unable to load dashboard, the server is not reachable.";
                                                    showError(e);
                                                } else {
                                                    showError("Error: " + e.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to go to login.");
                                                }
                                            }
                                        });
                                        return false;
                                    });


                                }
                            }
                            $('.userStats').append(courseStatWrapper);
                        });
                    });

                    $('.statPoints').html(points);
                    $('.statQuestionnaires').html(questionnaires);
                    $('.statAssignments').html(assignments);
                    $('.welcomeMessage').html("Hello " + response.username + ", welcome to your dashboard.");
                    sessionStorage.setItem("username", response.username);
                    $('.btnLevelInfo').click(function () {
                            var msg = "<div style='display:flex;justify-content: space-around;'><div style='padding: 25px;'><span style='color:gold;font-size:2rem;'>★</span><span style='color:#d63384;font-size:2rem;'>★★</span><br/>" + getUserLevel(1) + "</div>";
                            msg += "<div style='padding: 25px;'><span style='color:gold;font-size:2rem;'>★★</span><span style='color:#d63384;font-size:2rem;'>★</span><br/>" + getUserLevel(2) + "</div>";
                            msg += "<div style='padding: 25px;'><span style='color:gold;font-size:2rem;'>★★★</span><br/>" + getUserLevel(3) + "</div></div>";
                            showOkayAlert("User Levels", msg, function (button, dialog) {
                                dialog.remove();
                            });
                    });

                    $('.btnExploreCourses').click(function () {
                        var strWindowFeatures = "location=yes,height=" + window.innerHeight + ",width=" + window.innerWidth + ",scrollbars=yes,status=yes";
                        window.open(lmsServer + "/courses.html", "_blank", strWindowFeatures);
                    });

                    $('.btnAboutus').click(function () {
                        var strWindowFeatures = "location=yes,height=" + window.innerHeight + ",width=" + window.innerWidth + ",scrollbars=yes,status=yes";
                        window.open(lmsServer + "/index.html#why-us", "_blank", strWindowFeatures);
                    });


                    if (response.event != null) {
                        var eventImage = lmsServer + "/Content/File?name=" + encodeURIComponent("Events/" + response.event.id + ".jpg");
                        var eventCard = $("<div class='card image-card' aria-label='Upcoming Event'><h3 class='event-title'>Upcoming Event</h3><img src='" + eventImage + "' alt='" + response.event.name +
                            "' class='event-img-top'><div class='event-body'><h3 class='event-title'>" + response.event.name +
                            "</h3><table class='event-table'><tbody><tr><th>Date:</th><td>" + response.event.date +
                            "</td></tr><tr><th>Time:</th><td>" + response.event.timeSpan + "</td></tr><tr><th>Location:</th><td>" + response.event.location +
                            "</td></tr><tr><th>Details:</th><td class='ttsEnabled'>" + response.event.details + "</td></tr></tbody></table><button class='event-button'>Go to Events</button></div></div>");
                        if (response.event.isRegistered) {
                            eventCard.find('.event-button').prop('disabled', true).html("Registered").addClass('disabled-event-button');
                        } else {
                            eventCard.find('.event-button').click(function () {
                                location.href = "Events.html";
                            });
                        }
                        
                        enableSpeech(eventCard.find('.ttsEnabled'));

                        $('.cards').append(eventCard);
                    }
                    notificationList = response.notifications;
                    setData("notifications", JSON.stringify(response.notifications), loadNotifications);
                    setData("coursesDetails", JSON.stringify(response.courseDetails), function () {
                        setData("courses", JSON.stringify(courses), hideLoading);
                    });
                } else {
                    var message = "";
                    if (apiError == undefined) {
                        message = "Unable to get user course completion status";
                    } else {
                        message = "Error getting user course completion status: " + e.title;
                    }
                    showOkayAlert("Error", message, function (button, element) {
                        element.remove();
                        location.href = "Login.html";
                    });
                }
            });
            getApplicationShortcuts(function (shortcuts) {
                $.each(shortcuts, function (index, shortcut) {
                    var shortcutElement = $("<div class='shortcut-card' sid=" + shortcut.Item1 + "><div class='shortcut-icon'><img src='data:image/png;base64," + shortcut.Item3 + "'/></div><div class='shortcut-title'>" + shortcut.Item2 + "</div></div>");
                    shortcutElement.click(function () {
                        openShortcutApplication(shortcut.Item1, function (success) {
                            if (!success) {
                                showOkayAlert("Error", "Unable to open the application. Click <a href='Help.html'>here</a> to go to support.", function (button, element) {
                                    element.remove();
                                });
                            }
                        });
                    });

                    $('.shortcut-grid').append(shortcutElement);
                });
            });
            if (response.assistant != undefined || response.assistant != null) {
                if (response.textAssistant == null || response.textAssistant == undefined) {
                    response.textAssistant = "";
                }
                if (response.enhancedTextAssistant == null || response.enhancedTextAssistant == undefined) {
                    response.enhancedTextAssistant = "";
                }
                initAssistant(response.assistant, response.textAssistant, response.enhancedTextAssistant, function () {

                });
            }
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load dashboard, the server is not reachable.";
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

