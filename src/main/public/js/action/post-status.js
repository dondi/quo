$(function () {
  $("#post-this").click(function () {
    $.getJSON("/tweet/" + encodeURIComponent($("#status").val()), function() {
      $("#status").val("").change();
    });
  });
});
