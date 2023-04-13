$(document).ready(function () {
    //$("#mytest").click(function () {
        //$("#mytest").toggle();
    //});
	$("#musicpage").load("music.html");
	$("#homepage").load("homepage.html");
	$("#travelpage").load("travels.html");
	$("#workpage").load("workstuff.html");
	$("#myNavbar2").click(function(){
		$(window).scrollTop(0);
	});
	//$("#musicpage").load("workstuff_bkp.html");
	$('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
  		tmap.invalidateSize();
	});

});
