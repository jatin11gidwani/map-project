//location data
let locations = [
  {
    title: "Padmini Hotel",
    location: {lat: 24.876523445644953, lng: 74.62123166344225}

  },
  {
    title: "Chittorgarh Railway Station",
      location: {lat: 24.875425290024115, lng: 74.62345061238463}
  },
  {
    title: "Victory Tower",
    location: {lat: 24.874298061759678, lng: 74.62350208250916}
  },
  {
    title: "Chaukhi Dani Restaurant",
    location: {lat: 24.8886984447, lng: 74.6263380814}
  },
  {
    title: "luv kush hotel",
    location: {lat: 24.88680048780488, lng: 74.62643536585365}
  },
  {
    title: "vinayak hotel",
    location: {lat: 24.888460190139472, lng: 74.62404537732607}
  }
];

// Create a new blank array for all the listing markers.
let markers = [];

let map;
let largeInfowindow;
let bounds;

function initMap() {

  //Constructor creates a new map-only center and zoom are reqired.
  map = new google.maps.Map(document.getElementById('map'), {
    // center: {lat: 40.7413549, lng: -73.9980244},
    center: locations[0].location,
    zoom: 13,
    mapTypeControl: false
  });

  largeInfowindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();

  ko.applyBindings(new ViewModel());
}

// Function to handle google maps API error
function mapError() {
  alert("Google Maps can't be reached at this moment. Please try again later.");
}

//Marker Objects Model
let makeMarker = function(location) {
  let self = this;
  this.title = location.title;
  this.position = location.location;
  this.visible = ko.observable(true);

    // Create a marker per location, and put into markers array
    this.marker = new google.maps.Marker({
        position: this.position,
        title: this.title,
        animation: google.maps.Animation.DROP
    });

    self.filterMarkers = ko.computed(function () {
        // set marker and extend bounds (showListings)
        if(self.visible() === true) {
            self.marker.setMap(map);
            bounds.extend(self.marker.position);
            map.fitBounds(bounds);
        } else {
            self.marker.setMap(null);
        }
    });

    var clientID = 'ILXTLUPABSFZF4AD4SHQGYHYOGSQX3ZCF21WHQE5L42YXMI5';
    var clientSecret = 'MM14P0YDL0S2QWJEPRCX4CSAKFQEURWTWQGEIRJLB3NVAHGN';

    // get JSON request of foursquare data
    var reqURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.position.lat + ',' + this.position.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&name=' + this.title;

    $.getJSON(reqURL).done(function(query) {
		var results = query.response.venues[0];
        self.address = results.location.address ? results.location.address : "Chittorgarh, Rajasthan" ;
    }).fail(function() {
        alert('ForeSqaure APi is not available at this moment.');
    });

    // Create an onclick event to open an infowindow at each marker.
    self.marker.addListener('click', function() {
          toggleDrop(this);
          populateInfoWindow(this, self.address, largeInfowindow);
    });

    // show item info when selected from list
    this.show = function(location) {
        google.maps.event.trigger(self.marker, 'click');
    };

    // creates bounce effect when item selected
    this.bounce = function(place) {
      google.maps.event.trigger(self.marker, 'click');
	  };
};

//function to make markers have Drop effect
function toggleDrop(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.DROP);
  }
  // marker.setAnimation(null);
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker,address, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + ',' + '</div>' + '<div>' + address + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });
  }
}

var ViewModel = function() {
    var self = this;

    this.searchItem = ko.observable('');

    this.locations_list = ko.observableArray([]);

    // add location markers for each location
    locations.forEach(function(location) {
        self.locations_list.push( new makeMarker(location) );
    });

    // locations viewed on map
    this.filtered_list = ko.computed(function() {
        var searchFilter = self.searchItem().toLowerCase();
        if (searchFilter) {
            return ko.utils.arrayFilter(self.locations_list(), function(location) {
                var str = location.title.toLowerCase();
                var result = str.includes(searchFilter);
                location.visible(result);
				return result;
			});
    }
        self.locations_list().forEach(function(location) {
            location.visible(true);
        });
        return self.locations_list();
    }, self);
};

/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
