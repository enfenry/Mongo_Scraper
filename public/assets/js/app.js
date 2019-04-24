$(document).ready(function () {

  // Grab the articles as a json
  // $.getJSON("/articles", function (data) {
  //   res.render('index',{Article: data})
  // });

  // // Grab starred articles as a JSON
  // $.getJSON("/articles/starred", function (data) {

  // });

  // When someone clicks the comment logo
  $(document).on("click", "i.comment", function () {
    var thisId = $(this).parent().data("id");
    // console.log("thisId",thisId);

    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function (data) {
        // console.log("data",data);
        // The title of the article
        $(".modal-title").empty();
        $(".modal-body").empty();
        $(".modal-footer").empty();
        $(".modal-title").append("<h2>" + data.title + "</h2>");

        for (var i = 0; i < data.notes.length; i++) {
          $(".modal-body").append("<p data-id=" + data.notes[i]._id + "></textarea>");
        }
        // A textarea to add a new note body
        $(".modal-body").append("<textarea id='bodyinput' name='body'></textarea>");

        // A button to submit a new note, with the id of the article saved to it
        $(".modal-footer").append("<button type='button' class='btn btn-primary' data-id='" + data._id + "' id='savenote' data-dismiss='modal'>Save Note</button>");
        $(".modal-footer").append('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>')

        // If there's a note in the article
        if (data.notes) {
          // Place the body of the note in the body textarea
          // $("#bodyinput").val(data.notes.body);
        }
      });

    $("#modal").modal("show");
  });


  // When someone clicks the star logo
  $(document).on("click", "i.star", function () {
    var thisId = $(this).parent().data("id");
    // console.log("thisId",thisId);

    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      .then((data) => {
        data.starred = !data.starred;
        if (!data.starred) {
          $(this).attr("class", "far fa-star star");
        }
        else {
          $(this).attr("class", "fas fa-star star");
        }

        // console.log(data);
        // Run a POST request to change starred property
        $.ajax({
          method: "POST",
          url: "/star/" + thisId,
          data: {
            starred: data.starred
          }
        })
      })

  });

  // When you click the savenote button
  $(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).data("id");
    // console.log('thisId',thisId);

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
  });


  // When you click the deletenote button
  $(document).on("click", "#deletenote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).data("id");
    // console.log('thisId',thisId);

    // Run a DELETE request to change the note, using what's entered in the inputs
    $.ajax({
      method: "DELETE",
      url: "/notes/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
  });

});