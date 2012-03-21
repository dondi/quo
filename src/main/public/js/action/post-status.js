$(function () {
  $("#post-this").click(function () {
    $.getJSON("/tweet/" + encodeURIComponent($("#status").val()), function(data) {
    	if (data.error) {
    		$("#error-message").fadeIn("slow")
    		                   .text(data.error);
    	}
      $("#status").val("").change();
    });
  });
});
