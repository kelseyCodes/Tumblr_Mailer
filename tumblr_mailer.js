var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('EplyHQXCRD36VyoLHW8UZQ');

var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf-8');

// Authenticate via OAuth

var client = tumblr.createClient({
  consumer_key: '6DygCKF8rxaQAE3DJWbdaVz8MQRocgIWA7OFGmL56vwz7tZwkH',
  consumer_secret: 'pUQN4SS8ZEKOKSt4eAt7XVInJIjq2d9pBx73jgq2hVP9RmyaLB',
  token: 'KhnEEfsoIf4yivcGrvSZYS0ZzRcgWuFfJumqvdZRRGcrIhcBSW',
  token_secret: 'meNzqbWaMZRNldLaUD9avcFwRykhkDtUU0BwVuSzNfdiTy0guf'
});


function csvParse(csvFile){
  var line_array = csvFile.split('\n');
  var array_of_arrays = [];
  
  for (i = 0; i < line_array.length; i++) {
  	array_of_arrays.push(line_array[i].split(","));
  }
  var keys = array_of_arrays[0];
  var object_array = [];
  
  for (j = 1; j < array_of_arrays.length; j++) {
  var object = new Object;
  	for (k = 0; k < keys.length; k++) {
  		object[keys[k]] = array_of_arrays[j][k]
  	}
  	object_array.push(object);
  }
  return object_array;
}





client.posts('kelseycodes.tumblr.com', function(err, blog){
	var posts = blog['posts'];
	var latestPosts = [];
  	
	var currentDate = new Date();
	for (i = 0; i < posts.length; i++) {
  		if (((Math.round((currentDate.getTime())/1000) - posts[i]['timestamp'])/86400) <= 7) {
  			latestPosts.push(posts[i]);
  			}
  		}

 csvData = csvParse(csvFile);
	
	csvData.forEach(function(row){
			firstName = row['firstName'];
			numMonthsSinceContact = row['numMonthsSinceContact'];
			copyTemplate = emailTemplate;
	
	var customizedTemplate = ejs.render(copyTemplate, {firstName: firstName,
									   numMonthsSinceContact: numMonthsSinceContact,
									   latestPosts: latestPosts									
			 });	
			 console.log("Email sent");
			 sendEmail(firstName, row["emailAddress"], "Kelsey", "kelseysroberts@gmail.com", "New Project", customizedTemplate);			
		});	

});



function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
	var message = {
	    "html": message_html,
	    "subject": subject,
	    "from_email": from_email,
	    "from_name": from_name,
	    "to": [{
	            "email": to_email,
	            "name": to_name
	        }],
	    "important": false,
	    "track_opens": true,    
	    "auto_html": false,
	    "preserve_recipients": true,
	    "merge": false,
	    "tags": [
	        "Fullstack_Tumblrmailer_Workshop"
	    ]    
	};
	var async = false;
	var ip_pool = "Main Pool";
	mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
	    	      
	}, function(e) {
	    // Mandrill returns the error as an object with name and message keys
	    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
	});
}
