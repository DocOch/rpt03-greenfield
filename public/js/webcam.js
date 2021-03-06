/*
    JS library reference:
    http://developers.bistri.com/webrtc-sdk/js-library-reference
*/

var room;
var members;
var localStream;

// when Bistri API client is ready, function
// "onBistriConferenceReady" is invoked
onBistriConferenceReady = function () {

    // test if the browser is WebRTC compatible
    if ( !bc.isCompatible() ) {
        // if the browser is not compatible, display an alert
        alert( "your browser is not WebRTC compatible !" );
        // then stop the script execution
        return;
    }

    // initialize API client with application keys
    // these are my personal keys
    bc.init( {
        "appId": "ce62f37f",
        "appKey": "da9d93e2c19414deb35baca093cb7456",
        "debug": true
    } );

    /* Set events handler */

    // when local user is connected to the server
    bc.signaling.bind( "onConnected", function () {
        // show pane with id "pane_1"
        showPanel( "pane_1" );
    } );

    // when an error occured on the server side
    bc.signaling.bind( "onError", function ( error ) {
        // display an alert message
        alert( error.text + " (" + error.code + ")" );
    } );

    // when the user has joined a room
    bc.signaling.bind( "onJoinedRoom", function ( data ) {
        // set the current room name
        room = data.room;
        members = data.members;
        // ask the user to access to his webcam
        bc.startStream( "webcam-sd", function( stream ){
            // affect stream to "localStream" var
            localStream = stream;
            // when webcam access has been granted
            // show pane with id "pane_2"
            showPanel( "pane_2" );
            // insert the local webcam stream into div#video_container node
            bc.attachStream( stream, q( "#video_container" ), { mirror: true } );
            // then, for every single members present in the room ...
            for ( var i=0, max=members.length; i<max; i++ ) {
                // ... request a call
                bc.call( members[ i ].id, room, { "stream": stream } );
            }
        } );
    } );

    // when an error occurred while trying to join a room
    bc.signaling.bind( "onJoinRoomError", function ( error ) {
        // display an alert message
       alert( error.text + " (" + error.code + ")" );
    } );

    // when the local user has quitted the room
    bc.signaling.bind( "onQuittedRoom", function( room ) {
        // stop the local stream
        bc.stopStream( localStream, function(){
            // remove the stream from the page
            bc.detachStream( localStream );
            // show pane with id "pane_1"
            showPanel( "pane_1" );
        } );
    } );

    // when a new remote stream is received
    bc.streams.bind( "onStreamAdded", function ( remoteStream ) {
        // insert the new remote stream into div#video_container node
        bc.attachStream( remoteStream, q( "#video_container" ) );
    } );

    // when a remote stream has been stopped
    bc.streams.bind( "onStreamClosed", function ( stream ) {
        // remove the stream from the page
        bc.detachStream( stream );
    } );

    // when a local stream cannot be retrieved
    bc.streams.bind( "onStreamError", function( error ){
        switch( error.name ){
            case "PermissionDeniedError":
                alert( "Webcam access has not been allowed" );
                bc.quitRoom( room );
                break
            case "DevicesNotFoundError":
                if( confirm( "No webcam/mic found on this machine. Process call anyway ?" ) ){
                    // show pane with id "pane_2"
                    showPanel( "pane_2" );
                    for ( var i=0, max=members.length; i<max; i++ ) {
                        // ... request a call
                        bc.call( members[ i ].id, room );
                    }
                }
                else{
                    bc.quitRoom( room );
                }
                break
        }
    } );

    //mute button
      //ex frm docs: BistriConference.muteMicrophone( true );


    // bind function "joinConference" to button "Join Conference Room"
    q( "#join" ).addEventListener( "click", joinConference );

    // bind function "quitConference" to button "Quit Conference Room"
    q( "#quit" ).addEventListener( "click", quitConference );

    //bind function "muteMe" to button "Mute"
    q( "#mute" ).addEventListener( "click", muteMe );

        //bind function "unmuteMe" to button "Unmute"
    q( "#unmute" ).addEventListener( "click", unmuteMe );
    //bind function "muteAll" to button "muteAll"
    q( "#muteAll" ).addEventListener( "click", muteAll );
    //bind function "muteVideo" to button "muteVideo"
    q( "#muteVideo" ).addEventListener( "click", muteVideo );
        //bind function "muteVideo" to button "muteVideo"
    q( "#unmuteVideo" ).addEventListener( "click", unmuteVideo );

    // open a new session on the server
    bc.connect();
}

// when button "Join Conference Room" has been clicked
function joinConference(){
    var roomToJoin = q( "#room_field" ).value;
    // if "Conference Name" field is not empty ...
    if( roomToJoin ){
        // ... join the room
        bc.joinRoom( roomToJoin )
    }
    else{
        // otherwise, display an alert
        alert( "you must enter a room name !" )
    }
}

//mute button lgic
//when button "muteAll" has been clicked
function muteAll() {
    var context = this

    console.log(`is audio muted? ${bc.isMicrophoneMuted()}`)
    console.log("muted all")
    // from docs:
    // BistriConference.muteSound( stream, true );
    console.log(localStream, 'is locals');
        bc.muteSound(localStream, true);
    console.log(`is audio muted? ${bc.isMicrophoneMuted()}`)


}

//turn off video
function muteVideo(){
    bc.muteVideo( localStream, true );
    console.log(`video off`)
}
//turn on video
function unmuteVideo(){
    bc.muteVideo( localStream, false );
    console.log(`video on`)
}

//when button "Mute" has been clicked
function muteMe() {
    console.log(`is video muted? ${bc.isVideoMuted()}`)

    console.log("muted")
  bc.muteMicrophone( {status: true} );
    console.log(`is video muted? ${bc.isVideoMuted()}`)

}
//ehrn button "Unmute" has been clicked
function unmuteMe() {
    console.log(`is video muted? ${bc.isVideoMuted()}`)

    console.log("unmuted")

  bc.muteMicrophone( false );
}
// when button "Quit Conference Room" has been clicked
function quitConference(){
    // quit the current conference room
    console.info(` leaving with ${this}`)
    bc.quitRoom( room );
}

function showPanel( id ){
    var panes = document.querySelectorAll( ".pane" );
    // for all nodes matching the query ".pane"
    for( var i=0, max=panes.length; i<max; i++ ){
        // hide all nodes except the one to show
        panes[ i ].style.display = panes[ i ].id == id ? "block" : "none";
    };
}

function q( query ){
    // return the DOM node matching the query
    return document.querySelector( query );
}