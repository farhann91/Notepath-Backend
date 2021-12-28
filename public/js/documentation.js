$("document").ready(() => {
  //Changing the color of the achtive button
  $(".aside_item").click(function () {
    $(".aside_item").removeClass("acthive").addClass("inactive");
    $(this).removeClass("inactive").addClass("acthive");
  });
  //Create user button trigger
  $("#create_user").click(() => {
    $(".mainContent").html("...Loading");
    $(".mainContent").load("page_sections/create_user.html");
  });
  //Login user button trigger
  $("#login_user").click(() => {
    $(".mainContent").html("...Loading");
    $(".mainContent").load("page_sections/login_user.html");
  });
  //Logout user button trigger
  $("#logout_user").click(() => {
    $(".mainContent").html("...Loading");
    $(".mainContent").load("page_sections/logout_user.html");
  });
  //Logout user button trigger
  $("#logout_all").click(() => {
    $(".mainContent").html("Loading...");
    $(".mainContent").load("page_sections/logout_all.html");
  });
  //Delete user button trigger
  $("#delete_user").click(() => {
    $(".mainContent").load("page_sections/delete_user.html");
  });
  //Update user button trigger
  $("#update_user").click(() => {
    $(".mainContent").load("page_sections/update_user.html");
  });
  //Read one user button trigger
  $("#read_one_user").click(() => {
    $(".mainContent").load("page_sections/read_one_user.html");
  });
  //Read all users button trigger
  $("#read_all_users").click(() => {
    $(".mainContent").load("page_sections/read_all_users.html");
  });
  //Delete all users button trigger
  $("#delete_all_users").click(() => {
    $(".mainContent").load("page_sections/delete_all_users.html");
  });
  //Update password button trigger
  $("#update_password").click(() => {
    $(".mainContent").load("page_sections/update_password.html");
  });
  //Reset user button trigger
  $("#account_recovery").click(() => {
    $(".mainContent").load("page_sections/account_recovery.html");
  });
  //Create attendance button trigger
  $("#create_attendance").click(() => {
    $(".mainContent").load("page_sections/create_attendance.html");
  });
  //Create attendance button trigger
  $("#update_attendance").click(() => {
    $(".mainContent").load("page_sections/update_attendance.html");
  });
  //Read all attendances button trigger
  $("#read_all_attendances").click(() => {
    $(".mainContent").load("page_sections/read_all_attendances.html");
  });
  //Delete attendance button trigger
  $("#delete_all_attendances").click(() => {
    $(".mainContent").load("page_sections/delete_all_attendances.html");
  });

  //::::::::::::::::::::::::::::::::Controling the dropdown:::::::::::::::::::::::::::::::::::
  $("#user_related_items").click(function () {
    $("#user_list").toggle("slow");
    $("#attendance_list").hide("slow");
  });

  // Attendance related dropdown menu
  $("#attendace_related_items").click(function () {
    $("#attendance_list").toggle("slow");
    $("#user_list").hide("slow");
  });

  // :::::::::::::::::::::::::::::::::::::::::::::::Hidding and showing the sidebar:::::::::::::::::::::::
  const hamBtn = document.getElementById("hamBtn");
  const aside = document.getElementById("aside");
  const mainContent = document.getElementById("mainContent");

  hamBtn.addEventListener("click", () => {
    if (aside.classList.contains("passive")) {
      aside.classList.remove("passive");
      mainContent.classList.remove("passive");
      hamBtn.classList.remove("passive");
    } else {
      aside.classList.add("passive");
      mainContent.classList.add("passive");
      hamBtn.classList.add("passive");
    }
  });
});
