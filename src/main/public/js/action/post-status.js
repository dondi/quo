$(function () {
  $("#post-this").click(function () {
    $.getJSON("/tweet/" + encodeURIComponent($("#status").val()), function(data) {
    	if (data.error) {
    		$("#error-alert").fadeIn("slow");
    		$("#error-message").text(data.error);
    	}
      $("#status").val("").change();
    });
  });
});
