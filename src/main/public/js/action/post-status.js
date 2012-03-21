$(function () {
  $("#post-this").click(function () {
    $.getJSON("/tweet/" + encodeURIComponent($("#status").val()), function(data) {
    	console.log(data);
      $("#status").val("").change();
    });
  });
});
